# API Route Tests

This directory contains comprehensive tests for all API routes in the application.

## Test Structure

```
tests/
├── setup.ts              # Test setup and global mocks
├── helpers.ts            # Test utility functions
├── api/
│   ├── admin/
│   │   ├── login.test.ts
│   │   ├── logout.test.ts
│   │   ├── verify.test.ts
│   │   ├── about.test.ts
│   │   ├── projects.test.ts
│   │   ├── skills.test.ts
│   │   ├── resume.test.ts
│   │   └── upload.test.ts
│   └── contact.test.ts
└── README.md
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with UI
```bash
npm run test:ui
```

### Run tests with coverage
```bash
npm run test:coverage
```

### Run a specific test file
```bash
npm test tests/api/admin/login.test.ts
```

## Test Coverage

### Admin Authentication Routes
- ✅ Login (`/api/admin/login`)
  - Valid password authentication
  - Invalid password rejection
  - Rate limiting
  - Input validation
  - Error handling

- ✅ Logout (`/api/admin/logout`)
  - Cookie removal

- ✅ Verify (`/api/admin/verify`)
  - Authentication status check

### Data CRUD Routes
- ✅ About (`/api/admin/about`)
  - GET and PUT operations
  - Authentication checks
  - Data validation
  - Error handling

- ✅ Projects (`/api/admin/projects`)
  - GET and PUT operations
  - Authentication checks
  - Data structure validation
  - File item validation
  - Request size limits

- ✅ Skills (`/api/admin/skills`)
  - GET and PUT operations
  - Authentication checks
  - Section structure validation

- ✅ Resume (`/api/admin/resume`)
  - GET and PUT operations
  - Authentication checks
  - Default data handling
  - File URL validation

### File Upload Routes
- ✅ About Upload (`/api/admin/about/upload`)
- ✅ Projects Upload (`/api/admin/projects/upload`)
- ✅ Resume Upload (`/api/admin/resume/upload`)
  - Authentication checks
  - File validation
  - Upload success

### Public Routes
- ✅ Contact Form (`/api/contact`)
  - Valid submissions
  - Input validation
  - Honeypot detection
  - Rate limiting
  - XSS prevention
  - Request size limits

## Writing New Tests

### Example Test Structure

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET, POST } from '@/app/api/your-route/route';
import { createMockRequest, getResponseJson } from '../helpers';
import { resetMocks } from '../setup';

describe('Your Route', () => {
  beforeEach(() => {
    resetMocks();
    vi.clearAllMocks();
  });

  it('should do something', async () => {
    const request = createMockRequest('GET');
    const response = await GET(request);
    const data = await getResponseJson(response);

    expect(response.status).toBe(200);
    expect(data).toBeDefined();
  });
});
```

### Test Helpers

- `createMockRequest()` - Create a mock NextRequest
- `createAuthenticatedRequest()` - Create an authenticated request
- `createMockFile()` - Create a mock File object
- `getResponseJson()` - Parse response JSON
- `resetMocks()` - Reset all mocks between tests

## Mocking

Tests use Vitest's mocking capabilities to:
- Mock Next.js cookies
- Mock file system operations
- Mock authentication
- Mock security functions
- Mock storage operations

## Notes

- Tests are isolated and don't require a running server
- All file operations are mocked
- Authentication is mocked per test
- Rate limiting is mocked per test

