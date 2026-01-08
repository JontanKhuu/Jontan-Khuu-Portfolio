import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET, PUT } from '@/app/api/admin/skills/route';
import { createAuthenticatedRequest, createMockRequest, getResponseJson } from '../../helpers';
import { resetMocks } from '../../setup';
import * as auth from '@/app/lib/auth';
import { readFile, writeFile } from 'fs/promises';

vi.mock('@/app/lib/auth');
vi.mock('fs/promises');

const mockSkillsData = {
  sections: [
    {
      title: 'Languages',
      items: ['JavaScript', 'TypeScript', 'Python'],
    },
    {
      title: 'Frameworks',
      items: ['React', 'Next.js'],
    },
  ],
};

describe('GET /api/admin/skills', () => {
  beforeEach(() => {
    resetMocks();
    vi.clearAllMocks();
  });

  it('should return skills data', async () => {
    vi.mocked(readFile).mockResolvedValue(JSON.stringify(mockSkillsData));

    const response = await GET();
    const data = await getResponseJson(response);

    expect(response.status).toBe(200);
    expect(data.sections).toBeDefined();
    expect(data.sections.length).toBe(2);
  });

  it('should return 500 on file read error', async () => {
    vi.mocked(readFile).mockRejectedValue(new Error('File not found'));

    const response = await GET();
    const data = await getResponseJson(response);

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to read skills data');
  });
});

describe('PUT /api/admin/skills', () => {
  beforeEach(() => {
    resetMocks();
    vi.clearAllMocks();
    vi.mocked(auth.verifyAdmin).mockResolvedValue(true);
    vi.mocked(writeFile).mockResolvedValue(undefined);
  });

  it('should update skills data when authenticated', async () => {
    const request = await createAuthenticatedRequest('PUT', mockSkillsData);
    const response = await PUT(request);
    const data = await getResponseJson(response);

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(writeFile).toHaveBeenCalled();
  });

  it('should return 401 when not authenticated', async () => {
    vi.mocked(auth.verifyAdmin).mockResolvedValue(false);

    const request = createMockRequest('PUT', mockSkillsData);
    const response = await PUT(request);
    const data = await getResponseJson(response);

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should return 400 for invalid data structure', async () => {
    const invalidData = {
      // Missing sections
    };

    const request = await createAuthenticatedRequest('PUT', invalidData);
    const response = await PUT(request);
    const data = await getResponseJson(response);

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid data structure');
  });

  it('should return 400 for invalid section structure', async () => {
    const invalidData = {
      sections: [
        {
          // Missing title
          items: ['Test'],
        },
      ],
    };

    const request = await createAuthenticatedRequest('PUT', invalidData);
    const response = await PUT(request);
    const data = await getResponseJson(response);

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid section structure');
  });
});

