import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET, PUT } from '@/app/api/admin/resume/route';
import { createAuthenticatedRequest, createMockRequest, getResponseJson } from '../../helpers';
import { resetMocks } from '../../setup';
import * as auth from '@/app/lib/auth';
import { readFile, writeFile } from 'fs/promises';

vi.mock('@/app/lib/auth');
vi.mock('fs/promises');

const mockResumeData = {
  fileUrl: '/uploads/resume/resume-123.png',
  title: 'My Resume',
};

describe('GET /api/admin/resume', () => {
  beforeEach(() => {
    resetMocks();
    vi.clearAllMocks();
  });

  it('should return resume data', async () => {
    vi.mocked(readFile).mockResolvedValue(JSON.stringify(mockResumeData));

    const response = await GET();
    const data = await getResponseJson(response);

    expect(response.status).toBe(200);
    expect(data.fileUrl).toBe('/uploads/resume/resume-123.png');
    expect(data.title).toBe('My Resume');
  });

  it('should return default data when file does not exist', async () => {
    vi.mocked(readFile).mockRejectedValue(new Error('ENOENT'));

    const response = await GET();
    const data = await getResponseJson(response);

    expect(response.status).toBe(200);
    expect(data.fileUrl).toBe(null);
    expect(data.title).toBe('Resume');
  });
});

describe('PUT /api/admin/resume', () => {
  beforeEach(() => {
    resetMocks();
    vi.clearAllMocks();
    vi.mocked(auth.verifyAdmin).mockResolvedValue(true);
    vi.mocked(writeFile).mockResolvedValue(undefined);
  });

  it('should update resume data when authenticated', async () => {
    const newData = {
      fileUrl: '/uploads/resume/new-resume.pdf',
      title: 'Updated Resume',
    };

    const request = await createAuthenticatedRequest('PUT', newData);
    const response = await PUT(request);
    const data = await getResponseJson(response);

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(writeFile).toHaveBeenCalled();
  });

  it('should allow null fileUrl', async () => {
    const newData = {
      fileUrl: null,
      title: 'Resume',
    };

    const request = await createAuthenticatedRequest('PUT', newData);
    const response = await PUT(request);
    const data = await getResponseJson(response);

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('should return 401 when not authenticated', async () => {
    vi.mocked(auth.verifyAdmin).mockResolvedValue(false);

    const request = createMockRequest('PUT', mockResumeData);
    const response = await PUT(request);
    const data = await getResponseJson(response);

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should return 400 for invalid data structure', async () => {
    const invalidData = {
      fileUrl: 123, // Should be string or null
      title: 'Resume',
    };

    const request = await createAuthenticatedRequest('PUT', invalidData);
    const response = await PUT(request);
    const data = await getResponseJson(response);

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid data structure');
  });
});

