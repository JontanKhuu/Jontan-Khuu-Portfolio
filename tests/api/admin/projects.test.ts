import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET, PUT } from '@/app/api/admin/projects/route';
import { createAuthenticatedRequest, createMockRequest, getResponseJson } from '../../helpers';
import { resetMocks } from '../../setup';
import * as auth from '@/app/lib/auth';
import { readFile, writeFile } from 'fs/promises';

vi.mock('@/app/lib/auth');
vi.mock('fs/promises');

const mockProjectsData = {
  initialFiles: [
    {
      id: 'about',
      type: 'about',
      title: 'About Me',
      x: 0,
      y: 0,
    },
  ],
  projectItems: [
    {
      id: 'project-1',
      type: 'project',
      title: 'Test Project',
      summary: 'A test project',
      tags: ['React', 'TypeScript'],
    },
  ],
};

describe('GET /api/admin/projects', () => {
  beforeEach(() => {
    resetMocks();
    vi.clearAllMocks();
  });

  it('should return projects data', async () => {
    vi.mocked(readFile).mockResolvedValue(JSON.stringify(mockProjectsData));

    const response = await GET();
    const data = await getResponseJson(response);

    expect(response.status).toBe(200);
    expect(data.initialFiles).toBeDefined();
    expect(data.projectItems).toBeDefined();
  });

  it('should return 500 on file read error', async () => {
    vi.mocked(readFile).mockRejectedValue(new Error('File not found'));

    const response = await GET();
    const data = await getResponseJson(response);

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to read projects data');
  });
});

describe('PUT /api/admin/projects', () => {
  beforeEach(() => {
    resetMocks();
    vi.clearAllMocks();
    vi.mocked(auth.verifyAdmin).mockResolvedValue(true);
    vi.mocked(writeFile).mockResolvedValue(undefined);
  });

  it('should update projects data when authenticated', async () => {
    const request = await createAuthenticatedRequest('PUT', mockProjectsData);
    const response = await PUT(request);
    const data = await getResponseJson(response);

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(writeFile).toHaveBeenCalled();
  });

  it('should return 401 when not authenticated', async () => {
    vi.mocked(auth.verifyAdmin).mockResolvedValue(false);

    const request = createMockRequest('PUT', mockProjectsData);
    const response = await PUT(request);
    const data = await getResponseJson(response);

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should return 400 for invalid data structure', async () => {
    const invalidData = {
      initialFiles: [],
      // Missing projectItems
    };

    const request = await createAuthenticatedRequest('PUT', invalidData);
    const response = await PUT(request);
    const data = await getResponseJson(response);

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid data structure');
  });

  it('should return 400 for invalid file item structure', async () => {
    const invalidData = {
      initialFiles: [
        {
          // Missing required fields
          id: 'test',
        },
      ],
      projectItems: [],
    };

    const request = await createAuthenticatedRequest('PUT', invalidData);
    const response = await PUT(request);
    const data = await getResponseJson(response);

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid file item structure');
  });

  it('should return 413 for request too large', async () => {
    const largeData = {
      initialFiles: [],
      projectItems: Array(10000).fill({ id: 'test', type: 'project', title: 'Test' }),
    };

    const request = await createAuthenticatedRequest('PUT', largeData, { 'content-length': '11000000' }); // 11MB
    
    // Ensure the header is actually set on the request object
    request.headers.set('content-length', '11000000');

    const response = await PUT(request);
    const data = await getResponseJson(response);

    expect(response.status).toBe(413);
    expect(data.error).toBe('Request too large');
  });
});

