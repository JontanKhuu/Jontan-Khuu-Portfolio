# Security Test Suite

Automated tests to verify the security measures of the contact form.

## Prerequisites

1. Make sure your development server is running:
   ```bash
   npm run dev
   ```

2. The server should be accessible at `http://localhost:3000`

3. **IMPORTANT**: The rate limit is 13 requests/hour per IP. You'll need to restart your dev server between test runs to reset the rate limit.

## Running Automated Tests

### Option 1: Command Line Tests (Recommended)

Run the comprehensive test suite:

```bash
npm run test:security
```

This will run all 11 security tests:
- ✅ HTML/XSS Injection
- ✅ Email Header Injection
- ✅ Honeypot Field Detection
- ✅ Empty Name Validation
- ✅ Invalid Email Validation
- ✅ Empty Message Validation
- ✅ Control Character Handling
- ✅ SQL Injection Attempt
- ✅ Large Payload Rejection
- ✅ Valid Submission
- ✅ Rate Limiting

### Option 2: Browser Console Tests

For quick manual testing in the browser:

1. Open your portfolio in the browser
2. Open Developer Tools (F12)
3. Go to the Console tab
4. Copy and paste the contents of `browser-test.js`
5. Press Enter to run

## Test Results

The automated test suite will show:
- ✅ Passed tests
- ❌ Failed tests
- 📊 Summary with pass/fail counts

## What Each Test Verifies

### 1. HTML/XSS Injection
- **Test**: Sends HTML/JavaScript in the message field
- **Expected**: Form accepts but content is escaped in email
- **Security**: Prevents XSS attacks in email content

### 2. Email Header Injection
- **Test**: Sends newlines and BCC headers in name field
- **Expected**: Newlines removed, no unauthorized recipients
- **Security**: Prevents email header injection attacks

### 3. Honeypot Field
- **Test**: Fills the hidden "website" field (simulating a bot)
- **Expected**: Form accepts but no email is sent
- **Security**: Silently blocks bot submissions

### 4-6. Input Validation
- **Test**: Empty fields and invalid email formats
- **Expected**: Proper validation errors returned
- **Security**: Ensures data integrity

### 7. Control Characters
- **Test**: Sends null bytes and control characters
- **Expected**: Characters removed from output
- **Security**: Prevents encoding attacks

### 8. SQL Injection
- **Test**: Sends SQL injection attempts
- **Expected**: Content sanitized (defense in depth)
- **Security**: Multiple layers of protection

### 9. Large Payload
- **Test**: Sends request larger than 10KB
- **Expected**: Request rejected with 413 status
- **Security**: Prevents DoS attacks

### 10. Valid Submission
- **Test**: Normal, valid form submission
- **Expected**: Successfully accepted
- **Security**: Ensures legitimate users aren't blocked

### 11. Rate Limiting
- **Test**: Makes 4 requests quickly
- **Expected**: First 3 succeed, 4th is rate limited
- **Security**: Prevents spam and abuse

## Troubleshooting

### Tests Fail with Connection Error
- Make sure your dev server is running: `npm run dev`
- Check that the server is on `http://localhost:3000`

### Many Tests Fail with "Rate Limited" Error
- **This is expected!** The rate limit is 13 requests/hour
- The test suite makes 11+ requests, so you may hit the limit
- **Solution**: Restart your dev server to reset the rate limit, then run tests again
- The test script will check if you're already rate limited and warn you

### Rate Limiting Test Fails
- Rate limits reset when you restart the server
- If you've already made 13+ requests, restart the server and try again
- The rate limiting test itself makes 4 requests (3 valid + 1 to test the limit)

### Honeypot Test Shows Email Sent
- Check server logs to verify no email was actually sent
- The honeypot returns success but doesn't send email

### Running All Tests
- With 13 requests/hour, you should be able to run all 11 tests in one go
- If you hit the limit, restart your server and run again
- This actually demonstrates that rate limiting is working correctly!

## Manual Testing

You can also test manually by:
1. Opening the contact form on your portfolio
2. Trying the attack vectors mentioned in the main README
3. Verifying the results in your email inbox

## Notes

- The automated tests don't verify email content (you'd need to check your inbox)
- Rate limiting uses in-memory storage (resets on server restart)
- Some tests may need server restart between runs (rate limiting)

