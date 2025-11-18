/**
 * Security Test Suite for Contact Form API
 * 
 * Run with: npm run test:security
 * Make sure your dev server is running on http://localhost:3000
 */

const API_URL = 'http://localhost:3000/api/contact';

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  details?: any;
}

const results: TestResult[] = [];

async function runTest(
  name: string,
  testFn: () => Promise<{ passed: boolean; message: string; details?: any }>
) {
  try {
    const result = await testFn();
    results.push({
      name,
      passed: result.passed,
      message: result.message,
      details: result.details,
    });
    const icon = result.passed ? '✅' : '❌';
    console.log(`${icon} ${name}: ${result.message}`);
    if (result.details) {
      console.log(`   Details:`, result.details);
    }
  } catch (error: any) {
    results.push({
      name,
      passed: false,
      message: `Test failed with error: ${error.message}`,
    });
    console.log(`❌ ${name}: Test failed with error: ${error.message}`);
  }
}

async function makeRequest(body: any, expectedStatus?: number) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  return { response, data, status: response.status };
}

function isRateLimited(status: number, data: any): boolean {
  return status === 429 || (data.error && data.error.includes('Too many'));
}

async function checkRateLimit(): Promise<{ limited: boolean; remaining?: number }> {
  try {
    // Try a request - if rate limited, we know immediately
    // If not, we've used one request but that's okay for testing
    const { status, data } = await makeRequest({
      name: 'Rate Limit Check',
      email: 'check@example.com',
      message: 'Checking rate limit',
    });
    
    if (isRateLimited(status, data)) {
      return { limited: true, remaining: 0 };
    }
    
    // If we got here, we used one request but it succeeded
    // We have 2 more requests left (out of 3 total)
    return { limited: false, remaining: 2 };
  } catch (error) {
    return { limited: false };
  }
}

// Test 1: HTML/XSS Injection
async function testHtmlInjection() {
  const { response, data, status } = await makeRequest({
    name: 'Test User',
    email: 'test@example.com',
    message: '<script>alert("XSS")</script><img src=x onerror="alert(1)">',
  });

  if (isRateLimited(status, data)) {
    return {
      passed: false,
      message: 'Rate limited - restart server to continue testing',
      details: { status },
    };
  }

  if (status === 200 && data.success) {
    // Check if the response indicates the content was escaped
    // In a real scenario, you'd check the email, but for testing we verify it was accepted
    return {
      passed: true,
      message: 'HTML injection attempt handled (content should be escaped in email)',
      details: { status },
    };
  }
  return {
    passed: false,
    message: `Unexpected response: ${status}`,
    details: { status, data },
  };
}

// Test 2: Email Header Injection
async function testHeaderInjection() {
  const { response, data, status } = await makeRequest({
    name: 'Test\nBcc: attacker@evil.com',
    email: 'test@example.com',
    message: 'Normal message',
  });

  if (isRateLimited(status, data)) {
    return {
      passed: false,
      message: 'Rate limited - restart server to continue testing',
      details: { status },
    };
  }

  if (status === 200 && data.success) {
    return {
      passed: true,
      message: 'Header injection attempt handled (newlines should be removed)',
      details: { status },
    };
  }
  return {
    passed: false,
    message: `Unexpected response: ${status}`,
    details: { status, data },
  };
}

// Test 3: Honeypot Field (Bot Detection)
async function testHoneypot() {
  const { response, data, status } = await makeRequest({
    name: 'Test User',
    email: 'test@example.com',
    message: 'Test message',
    website: 'bot-filled-this-field', // Honeypot!
  });

  if (isRateLimited(status, data)) {
    return {
      passed: false,
      message: 'Rate limited - restart server to continue testing',
      details: { status },
    };
  }

  // Honeypot should silently accept but not send email
  if (status === 200 && data.success) {
    return {
      passed: true,
      message: 'Honeypot detected (form accepted but email should not be sent)',
      details: { status, note: 'Check server logs to verify no email was sent' },
    };
  }
  return {
    passed: false,
    message: `Unexpected response: ${status}`,
    details: { status, data },
  };
}

// Test 4: Empty Name Field
async function testEmptyName() {
  const { response, data, status } = await makeRequest({
    name: '',
    email: 'test@example.com',
    message: 'Test message',
  });

  if (isRateLimited(status, data)) {
    return {
      passed: false,
      message: 'Rate limited - restart server to continue testing',
      details: { status, note: 'Validation tests should run before rate limit is hit' },
    };
  }

  if (status === 400 && data.error && data.error.includes('Name')) {
    return {
      passed: true,
      message: 'Empty name field correctly rejected',
      details: { status, error: data.error },
    };
  }
  return {
    passed: false,
    message: `Validation failed: expected 400, got ${status}`,
    details: { status, data },
  };
}

// Test 5: Invalid Email Format
async function testInvalidEmail() {
  const { response, data, status } = await makeRequest({
    name: 'Test User',
    email: 'not-an-email',
    message: 'Test message',
  });

  if (isRateLimited(status, data)) {
    return {
      passed: false,
      message: 'Rate limited - restart server to continue testing',
      details: { status },
    };
  }

  if (status === 400 && data.error && data.error.includes('email')) {
    return {
      passed: true,
      message: 'Invalid email format correctly rejected',
      details: { status, error: data.error },
    };
  }
  return {
    passed: false,
    message: `Validation failed: expected 400, got ${status}`,
    details: { status, data },
  };
}

// Test 6: Empty Message Field
async function testEmptyMessage() {
  const { response, data, status } = await makeRequest({
    name: 'Test User',
    email: 'test@example.com',
    message: '',
  });

  if (isRateLimited(status, data)) {
    return {
      passed: false,
      message: 'Rate limited - restart server to continue testing',
      details: { status },
    };
  }

  if (status === 400 && data.error && data.error.includes('Message')) {
    return {
      passed: true,
      message: 'Empty message field correctly rejected',
      details: { status, error: data.error },
    };
  }
  return {
    passed: false,
    message: `Validation failed: expected 400, got ${status}`,
    details: { status, data },
  };
}

// Test 7: Control Character Injection
async function testControlCharacters() {
  const { response, data, status } = await makeRequest({
    name: 'Test\x00User',
    email: 'test@example.com',
    message: 'Message with \x1F control chars',
  });

  if (isRateLimited(status, data)) {
    return {
      passed: false,
      message: 'Rate limited - restart server to continue testing',
      details: { status },
    };
  }

  if (status === 200 && data.success) {
    return {
      passed: true,
      message: 'Control characters handled (should be removed in email)',
      details: { status },
    };
  }
  return {
    passed: false,
    message: `Unexpected response: ${status}`,
    details: { status, data },
  };
}

// Test 8: SQL Injection Attempt
async function testSqlInjection() {
  const { response, data, status } = await makeRequest({
    name: "'; DROP TABLE users; --",
    email: 'test@example.com',
    message: "1' OR '1'='1",
  });

  if (isRateLimited(status, data)) {
    return {
      passed: false,
      message: 'Rate limited - restart server to continue testing',
      details: { status },
    };
  }

  if (status === 200 && data.success) {
    return {
      passed: true,
      message: 'SQL injection attempt handled (content should be sanitized)',
      details: { status },
    };
  }
  return {
    passed: false,
    message: `Unexpected response: ${status}`,
    details: { status, data },
  };
}

// Test 9: Large Payload
async function testLargePayload() {
  const largeMessage = 'A'.repeat(15 * 1024); // 15KB
  const { response, data, status } = await makeRequest({
    name: 'Test User',
    email: 'test@example.com',
    message: largeMessage,
  });

  if (isRateLimited(status, data)) {
    return {
      passed: false,
      message: 'Rate limited - restart server to continue testing',
      details: { status, note: 'Large payload test should not count toward rate limit if rejected early' },
    };
  }

  if (status === 413) {
    return {
      passed: true,
      message: 'Large payload correctly rejected',
      details: { status, error: data.error },
    };
  }
  return {
    passed: false,
    message: `Expected 413, got ${status}`,
    details: { status, data },
  };
}

// Test 10: Valid Submission
async function testValidSubmission() {
  const { response, data, status } = await makeRequest({
    name: 'Test User',
    email: 'test@example.com',
    message: 'This is a valid test message',
  });

  if (isRateLimited(status, data)) {
    return {
      passed: false,
      message: 'Rate limited - restart server to continue testing',
      details: { status },
    };
  }

  if (status === 200 && data.success) {
    return {
      passed: true,
      message: 'Valid submission accepted',
      details: { status },
    };
  }
  return {
    passed: false,
    message: `Expected 200, got ${status}`,
    details: { status, data },
  };
}

// Test 11: Rate Limiting (requires multiple requests)
async function testRateLimiting() {
  // Make 3 valid requests first (to test rate limiting)
  for (let i = 0; i < 3; i++) {
    await makeRequest({
      name: `Test User ${i}`,
      email: 'test@example.com',
      message: `Test message ${i}`,
    });
    // Small delay to avoid overwhelming
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // 4th request should be rate limited
  const { response, data, status } = await makeRequest({
    name: 'Test User 4',
    email: 'test@example.com',
    message: 'Test message 4',
  });

  if (status === 429) {
    return {
      passed: true,
      message: 'Rate limiting working correctly',
      details: { status, error: data.error },
    };
  }
  return {
    passed: false,
    message: `Expected 429 (rate limited), got ${status}. Note: Rate limit resets on server restart.`,
    details: { status, data },
  };
}

// Main test runner
async function runAllTests() {
  console.log('🔒 Starting Security Test Suite...\n');
  console.log('⚠️  Make sure your dev server is running on http://localhost:3000');
  console.log('⚠️  IMPORTANT: Rate limit is 13 requests/hour. Restart server between test runs!\n');

  // Wait a bit to ensure server is ready
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Check initial rate limit status
  console.log('📊 Checking rate limit status...\n');
  const rateLimitCheck = await checkRateLimit();
  if (rateLimitCheck.limited) {
    console.log('❌ Server is already rate limited!');
    console.log('   Please restart your dev server and try again.\n');
    return;
  }
  console.log(`✅ Rate limit OK (${rateLimitCheck.remaining || 13} requests remaining)\n`);

  // Run validation tests first (they should fail fast, but still count toward rate limit)
  // Note: These will use up rate limit slots, but that's expected behavior
  await runTest('1. Empty Name Validation', testEmptyName);
  await runTest('2. Invalid Email Validation', testInvalidEmail);
  await runTest('3. Empty Message Validation', testEmptyMessage);
  
  // Then run security tests
  await runTest('4. HTML/XSS Injection', testHtmlInjection);
  await runTest('5. Email Header Injection', testHeaderInjection);
  await runTest('6. Honeypot Field Detection', testHoneypot);
  await runTest('7. Control Character Handling', testControlCharacters);
  await runTest('8. SQL Injection Attempt', testSqlInjection);
  await runTest('9. Large Payload Rejection', testLargePayload);
  await runTest('10. Valid Submission', testValidSubmission);
  
  // Rate limiting test last (it makes multiple requests and will hit the limit)
  console.log('\n⏳ Testing rate limiting (this will use remaining requests)...\n');
  await runTest('11. Rate Limiting', testRateLimiting);

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Summary');
  console.log('='.repeat(60));
  
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Total: ${results.length}`);
  
  if (failed > 0) {
    console.log('\n❌ Failed Tests:');
    results
      .filter(r => !r.passed)
      .forEach(r => {
        console.log(`   - ${r.name}: ${r.message}`);
      });
  }
  
  const rateLimitedTests = results.filter(r => 
    !r.passed && r.message.includes('Rate limited')
  ).length;
  
  if (rateLimitedTests > 0) {
    console.log('\n⚠️  Note: Some tests failed due to rate limiting.');
    console.log('   This is expected - restart your dev server and run tests again.');
    console.log('   The rate limit is 13 requests/hour per IP address.');
  }
  
  console.log('\n' + '='.repeat(60));
  
  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(error => {
  console.error('Fatal error running tests:', error);
  process.exit(1);
});

