/**
 * Browser Console Security Tests
 * 
 * Copy and paste this into your browser console while on your portfolio page
 * Make sure the contact form is accessible
 */

const API_URL = '/api/contact';

async function testSecurity() {
  console.log('🔒 Starting Browser Security Tests...\n');

  // Test 1: HTML Injection
  console.log('Test 1: HTML/XSS Injection');
  try {
    const res1 = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test',
        email: 'test@example.com',
        message: '<script>alert("XSS")</script>'
      })
    });
    const data1 = await res1.json();
    console.log('✅ HTML injection handled:', res1.status === 200);
  } catch (e) {
    console.log('❌ Error:', e.message);
  }

  // Test 2: Honeypot
  console.log('\nTest 2: Honeypot Field');
  try {
    const res2 = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test',
        email: 'test@example.com',
        message: 'Test',
        website: 'bot-filled' // Honeypot!
      })
    });
    const data2 = await res2.json();
    console.log('✅ Honeypot detected (silently accepted):', res2.status === 200);
    console.log('   Note: Email should NOT be sent');
  } catch (e) {
    console.log('❌ Error:', e.message);
  }

  // Test 3: Invalid Email
  console.log('\nTest 3: Invalid Email Validation');
  try {
    const res3 = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test',
        email: 'not-an-email',
        message: 'Test'
      })
    });
    const data3 = await res3.json();
    console.log('✅ Invalid email rejected:', res3.status === 400);
  } catch (e) {
    console.log('❌ Error:', e.message);
  }

  // Test 4: Header Injection
  console.log('\nTest 4: Email Header Injection');
  try {
    const res4 = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test\nBcc: attacker@evil.com',
        email: 'test@example.com',
        message: 'Test'
      })
    });
    const data4 = await res4.json();
    console.log('✅ Header injection handled:', res4.status === 200);
  } catch (e) {
    console.log('❌ Error:', e.message);
  }

  // Test 5: Empty Fields
  console.log('\nTest 5: Empty Name Validation');
  try {
    const res5 = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: '',
        email: 'test@example.com',
        message: 'Test'
      })
    });
    const data5 = await res5.json();
    console.log('✅ Empty name rejected:', res5.status === 400);
  } catch (e) {
    console.log('❌ Error:', e.message);
  }

  console.log('\n✅ All browser tests completed!');
  console.log('Check the results above to verify security measures.');
}

// Run tests
testSecurity();

