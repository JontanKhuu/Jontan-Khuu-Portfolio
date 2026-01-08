import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST } from '@/app/api/admin/logout/route';
import { createMockRequest, getResponseJson } from '../../helpers';
import { resetMocks } from '../../setup';
import * as auth from '@/app/lib/auth';

vi.mock('@/app/lib/auth');

describe('POST /api/admin/logout', () => {
  beforeEach(() => {
    resetMocks();
    vi.clearAllMocks();
    vi.mocked(auth.removeAdminCookie).mockResolvedValue(undefined);
  });

  it('should successfully logout', async () => {
    const request = createMockRequest('POST');
    const response = await POST(request);
    const data = await getResponseJson(response);

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(auth.removeAdminCookie).toHaveBeenCalled();
  });
});

