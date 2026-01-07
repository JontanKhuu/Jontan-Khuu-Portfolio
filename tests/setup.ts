import { vi } from 'vitest';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';

// Mock Next.js cookies
const mockCookies = new Map<string, string>();

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({
    get: (name: string) => {
      const value = mockCookies.get(name);
      return value ? { value } : undefined;
    },
    set: (name: string, value: string, options?: any) => {
      mockCookies.set(name, value);
    },
    delete: (name: string) => {
      mockCookies.delete(name);
    },
  })),
}));

// Mock file system operations - these will be mocked per test file
// We don't globally mock them here to allow individual test control

// Helper to reset mocks between tests
export function resetMocks() {
  mockCookies.clear();
  vi.clearAllMocks();
}

// Helper to set a cookie for testing
export function setMockCookie(name: string, value: string) {
  mockCookies.set(name, value);
}

// Helper to get a cookie for testing
export function getMockCookie(name: string) {
  return mockCookies.get(name);
}

