import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET } from '@/app/api/admin/verify/route';
import { createAuthenticatedRequest, createMockRequest, getResponseJson } from '../../helpers';
import { resetMocks } from '../../setup';
import * as auth from '@/app/lib/auth';

vi.mock('@/app/lib/auth');

describe('GET /api/admin/verify', () => {
  beforeEach(() => {
    resetMocks();
    vi.clearAllMocks();
  });

  it('should return authenticated: false when no token', async () => {
    vi.mocked(auth.verifyAdmin).mockResolvedValue(false);

    const request = createMockRequest('GET');
    const response = await GET();
    const data = await getResponseJson(response);

    expect(response.status).toBe(200);
    expect(data.authenticated).toBe(false);
  });

  it('should return authenticated: true when token is valid', async () => {
    vi.mocked(auth.verifyAdmin).mockResolvedValue(true);

    const request = await createAuthenticatedRequest('GET');
    const response = await GET();
    const data = await getResponseJson(response);

    expect(response.status).toBe(200);
    expect(data.authenticated).toBe(true);
  });
});

