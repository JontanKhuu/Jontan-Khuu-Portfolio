import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST as aboutUploadPOST } from '@/app/api/admin/about/upload/route';
import { POST as projectsUploadPOST } from '@/app/api/admin/projects/upload/route';
import { POST as resumeUploadPOST } from '@/app/api/admin/resume/upload/route';
import { createFormDataRequest, createMockRequest, createMockFile, getResponseJson } from '../../helpers';
import { resetMocks } from '../../setup';
import * as auth from '@/app/lib/auth';
import * as security from '@/app/lib/security';
import * as storage from '@/app/lib/storage';
import { createAdminToken } from '@/app/lib/auth';

vi.mock('@/app/lib/auth');
vi.mock('@/app/lib/security');
vi.mock('@/app/lib/storage');

describe('POST /api/admin/about/upload', () => {
  beforeEach(() => {
    resetMocks();
    vi.clearAllMocks();
    vi.mocked(auth.verifyAdmin).mockResolvedValue(true);
    vi.mocked(security.validateImageUpload).mockResolvedValue({ valid: true, error: null });
    vi.mocked(storage.uploadFile).mockResolvedValue('/uploads/about/test.jpg');
    // Mock sanitizeFilename to always return a valid filename
    vi.mocked(security.sanitizeFilename).mockImplementation((filename: string) => {
      return filename || 'test.jpg';
    });
  });

  it('should upload file when authenticated', async () => {
    const file = createMockFile('test.jpg', 'fake image', 'image/jpeg');
    const token = await createAdminToken();
    const request = await createFormDataRequest('POST', file, {}, [`admin-token=${token}`]);

    const response = await aboutUploadPOST(request);
    const data = await getResponseJson(response);

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.path).toContain('/uploads/about/');
    
    // Verify uploadFile was called
    expect(storage.uploadFile).toHaveBeenCalledTimes(1);
    
    // Verify uploadFile was called with correct parameters
    const uploadCall = vi.mocked(storage.uploadFile).mock.calls[0];
    expect(uploadCall[0]).toBeInstanceOf(Buffer); // buffer
    expect(uploadCall[1]).toMatch(/^profile-\d+\.jpg$/); // filename format: profile-timestamp.jpg
    expect(uploadCall[2]).toBe('about'); // folder
    expect(uploadCall[3]).toBe('image/jpeg'); // contentType
    
    // Verify filename in response matches expected format
    expect(data.filename).toMatch(/^profile-\d+\.jpg$/);
    
    // Verify buffer contains the file content
    const buffer = uploadCall[0] as Buffer;
    expect(buffer.toString()).toBe('fake image');
  });

  it('should return 401 when not authenticated', async () => {
    vi.mocked(auth.verifyAdmin).mockResolvedValue(false);

    const request = createMockRequest('POST');
    const response = await aboutUploadPOST(request);
    const data = await getResponseJson(response);

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should return error for invalid file', async () => {
    vi.mocked(security.validateImageUpload).mockResolvedValue({
      valid: false,
      error: new Response(JSON.stringify({ error: 'Invalid file type' }), { status: 400 }),
    });

    const file = createMockFile('test.exe', 'not an image', 'application/x-msdownload');
    const token = await createAdminToken();
    const request = await createFormDataRequest('POST', file, {}, [`admin-token=${token}`]);

    const response = await aboutUploadPOST(request);
    const data = await getResponseJson(response);

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid file type');
  });
});

describe('POST /api/admin/projects/upload', () => {
  beforeEach(() => {
    resetMocks();
    vi.clearAllMocks();
    vi.mocked(auth.verifyAdmin).mockResolvedValue(true);
    vi.mocked(security.validateImageUpload).mockResolvedValue({ valid: true, error: null });
    vi.mocked(storage.uploadFile).mockResolvedValue('/uploads/projects/test.jpg');
    // Mock sanitizeFilename to always return a valid filename
    vi.mocked(security.sanitizeFilename).mockImplementation((filename: string) => {
      return filename || 'project.jpg';
    });
  });

  it('should upload project image when authenticated', async () => {
    const file = createMockFile('project.jpg', 'fake image', 'image/jpeg');
    const token = await createAdminToken();
    const request = await createFormDataRequest('POST', file, {}, [`admin-token=${token}`]);

    const response = await projectsUploadPOST(request);
    const data = await getResponseJson(response);

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.path).toContain('/uploads/projects/');
    
    // Verify uploadFile was called
    expect(storage.uploadFile).toHaveBeenCalledTimes(1);
    
    // Verify uploadFile was called with correct parameters
    const uploadCall = vi.mocked(storage.uploadFile).mock.calls[0];
    expect(uploadCall[0]).toBeInstanceOf(Buffer); // buffer
    expect(uploadCall[1]).toMatch(/^project-\d+\.jpg$/); // filename format: project-timestamp.jpg
    expect(uploadCall[2]).toBe('projects'); // folder
    expect(uploadCall[3]).toBe('image/jpeg'); // contentType
    
    // Verify filename in response matches expected format
    expect(data.filename).toMatch(/^project-\d+\.jpg$/);
    
    // Verify buffer contains the file content
    const buffer = uploadCall[0] as Buffer;
    expect(buffer.toString()).toBe('fake image');
  });
});

describe('POST /api/admin/resume/upload', () => {
  beforeEach(() => {
    resetMocks();
    vi.clearAllMocks();
    vi.mocked(auth.verifyAdmin).mockResolvedValue(true);
    vi.mocked(security.validateImageUpload).mockResolvedValue({ valid: true, error: null });
    vi.mocked(storage.uploadFile).mockResolvedValue('/uploads/resume/resume.pdf');
    // Mock sanitizeFilename to always return a valid filename
    vi.mocked(security.sanitizeFilename).mockImplementation((filename: string) => {
      return filename || 'resume.pdf';
    });
  });

  it('should upload resume when authenticated', async () => {
    const file = createMockFile('resume.pdf', 'fake pdf', 'application/pdf');
    const token = await createAdminToken();
    const request = await createFormDataRequest('POST', file, {}, [`admin-token=${token}`]);

    const response = await resumeUploadPOST(request);
    const data = await getResponseJson(response);

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.path).toContain('/uploads/resume/');
    
    // Verify uploadFile was called
    expect(storage.uploadFile).toHaveBeenCalledTimes(1);
    
    // Verify uploadFile was called with correct parameters
    const uploadCall = vi.mocked(storage.uploadFile).mock.calls[0];
    expect(uploadCall[0]).toBeInstanceOf(Buffer); // buffer
    expect(uploadCall[1]).toMatch(/^resume-\d+\.pdf$/); // filename format: resume-timestamp.pdf
    expect(uploadCall[2]).toBe('resume'); // folder
    expect(uploadCall[3]).toBe('application/pdf'); // contentType
    
    // Verify filename in response matches expected format
    expect(data.filename).toMatch(/^resume-\d+\.pdf$/);
    
    // Verify buffer contains the file content
    const buffer = uploadCall[0] as Buffer;
    expect(buffer.toString()).toBe('fake pdf');
  });
});

