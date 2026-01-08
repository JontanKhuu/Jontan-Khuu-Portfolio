import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST } from '@/app/api/admin/login/route';
import { createMockRequest, getResponseJson } from '../../helpers';
import { resetMocks, setMockCookie } from '../../setup';
import * as auth from '@/app/lib/auth';
import * as security from '@/app/lib/security';

// Mock dependencies
vi.mock('@/app/lib/auth');
vi.mock('@/app/lib/security');

describe('POST /api/admin/login', () => {
  beforeEach(() => {
    resetMocks();
    vi.clearAllMocks();
    
    // Default mocks
    vi.mocked(security.getClientIP).mockReturnValue('127.0.0.1');
    vi.mocked(security.rateLimitLogin).mockReturnValue({
      allowed: true,
      remaining: 5,
      resetTime: Date.now() + 900000,
    });
    vi.mocked(security.createRateLimitHeaders).mockReturnValue({});
    vi.mocked(security.checkContentLength).mockReturnValue(null);
    vi.mocked(security.parseJsonBody).mockImplementation(async (req) => {
      const body = await req.json();
      return { body, error: null };
    });
  });

  it('should return 400 if password is missing', async () => {
    const request = createMockRequest('POST', {});
    const response = await POST(request);
    const data = await getResponseJson(response);

    expect(response.status).toBe(400);
    expect(data.error).toBe('Password is required');
  });

  it('should return 400 if password is not a string', async () => {
    const request = createMockRequest('POST', { password: 123 });
    const response = await POST(request);
    const data = await getResponseJson(response);

    expect(response.status).toBe(400);
    expect(data.error).toBe('Password is required');
  });

  it('should return 401 if password is invalid', async () => {
    vi.mocked(auth.verifyPassword).mockResolvedValue(false);

    const request = createMockRequest('POST', { password: 'wrong-password' });
    const response = await POST(request);
    const data = await getResponseJson(response);

    expect(response.status).toBe(401);
    expect(data.error).toBe('Invalid password');
    expect(auth.verifyPassword).toHaveBeenCalledWith('wrong-password');
  });

  it('should return 401 if password is too long', async () => {
    const longPassword = 'a'.repeat(201);
    const request = createMockRequest('POST', { password: longPassword });
    const response = await POST(request);
    const data = await getResponseJson(response);

    expect(response.status).toBe(401);
    expect(data.error).toBe('Invalid password');
  });

  it('should return 429 if rate limited', async () => {
    vi.mocked(security.rateLimitLogin).mockReturnValue({
      allowed: false,
      remaining: 0,
      resetTime: Date.now() + 900000,
    });

    const request = createMockRequest('POST', { password: 'test' });
    const response = await POST(request);
    const data = await getResponseJson(response);

    expect(response.status).toBe(429);
    expect(data.error).toContain('Too many login attempts');
  });

  it('should successfully login with valid password', async () => {
    vi.mocked(auth.verifyPassword).mockResolvedValue(true);
    vi.mocked(auth.createAdminToken).mockResolvedValue('mock-token');
    vi.mocked(auth.setAdminCookie).mockResolvedValue(undefined);

    const request = createMockRequest('POST', { password: 'correct-password' });
    const response = await POST(request);
    const data = await getResponseJson(response);

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(auth.verifyPassword).toHaveBeenCalledWith('correct-password');
    expect(auth.createAdminToken).toHaveBeenCalled();
    expect(auth.setAdminCookie).toHaveBeenCalledWith('mock-token');
  });

  it('should handle errors gracefully', async () => {
    vi.mocked(security.parseJsonBody).mockRejectedValue(new Error('Parse error'));

    const request = createMockRequest('POST', { password: 'test' });
    const response = await POST(request);
    const data = await getResponseJson(response);

    expect(response.status).toBe(500);
    expect(data.error).toBe('Authentication failed');
  });
});

