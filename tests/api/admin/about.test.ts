import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET, PUT } from '@/app/api/admin/about/route';
import { createAuthenticatedRequest, createMockRequest, getResponseJson } from '../../helpers';
import { resetMocks } from '../../setup';
import * as auth from '@/app/lib/auth';
import { readFile, writeFile } from 'fs/promises';

vi.mock('@/app/lib/auth');
vi.mock('fs/promises');

const mockAboutData = {
  title: 'About Me',
  intro: 'Test introduction',
  details: ['Detail 1', 'Detail 2'],
  imageUrl: '/uploads/about/test.jpg',
};

describe('GET /api/admin/about', () => {
  beforeEach(() => {
    resetMocks();
    vi.clearAllMocks();
  });

  it('should return about data', async () => {
    vi.mocked(readFile).mockResolvedValue(JSON.stringify(mockAboutData));

    const response = await GET();
    const data = await getResponseJson(response);

    expect(response.status).toBe(200);
    expect(data.title).toBe('About Me');
    expect(data.intro).toBe('Test introduction');
  });

  it('should return 500 on file read error', async () => {
    vi.mocked(readFile).mockRejectedValue(new Error('File not found'));

    const response = await GET();
    const data = await getResponseJson(response);

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to read about data');
  });
});

describe('PUT /api/admin/about', () => {
  beforeEach(() => {
    resetMocks();
    vi.clearAllMocks();
    vi.mocked(auth.verifyAdmin).mockResolvedValue(true);
    vi.mocked(writeFile).mockResolvedValue(undefined);
  });

  it('should update about data when authenticated', async () => {
    const newData = {
      title: 'Updated Title',
      intro: 'Updated intro',
      details: ['New detail'],
    };

    const request = await createAuthenticatedRequest('PUT', newData);
    const response = await PUT(request);
    const data = await getResponseJson(response);

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(writeFile).toHaveBeenCalled();
  });

  it('should return 401 when not authenticated', async () => {
    vi.mocked(auth.verifyAdmin).mockResolvedValue(false);

    const request = createMockRequest('PUT', mockAboutData);
    const response = await PUT(request);
    const data = await getResponseJson(response);

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should return 400 for invalid data structure', async () => {
    const invalidData = {
      title: 'Test',
      // Missing intro and details
    };

    const request = await createAuthenticatedRequest('PUT', invalidData);
    const response = await PUT(request);
    const data = await getResponseJson(response);

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid data structure');
  });

  it('should return 500 on write error', async () => {
    vi.mocked(writeFile).mockRejectedValue(new Error('Write failed'));

    const request = await createAuthenticatedRequest('PUT', mockAboutData);
    const response = await PUT(request);
    const data = await getResponseJson(response);

    expect(response.status).toBe(500);
    expect(data.error).toBe('Failed to update about data');
  });
});

