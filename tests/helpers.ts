import { NextRequest } from 'next/server';
import { createAdminToken } from '@/app/lib/auth';

/**
 * Create a mock NextRequest for testing
 */
export function createMockRequest(
  method: string = 'GET',
  body?: any,
  headers?: Record<string, string>,
  cookies?: string[]
): NextRequest {
  const url = 'http://localhost:3000/api/test';
  
  // Create headers with content-length if body exists
  const allHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };
  
  if (body !== undefined) {
    allHeaders['content-length'] = String(JSON.stringify(body).length);
  }

  const requestInit: RequestInit = {
    method,
    headers: allHeaders,
  };

  if (body !== undefined) {
    requestInit.body = JSON.stringify(body);
  }

  const request = new NextRequest(url, requestInit);

  // Add cookies if provided
  if (cookies) {
    cookies.forEach(cookie => {
      request.headers.append('Cookie', cookie);
    });
  }

  // Override json() method to return the body directly
  // Use Object.defineProperty to ensure it's properly attached
  Object.defineProperty(request, 'json', {
    value: async () => (body !== undefined ? body : {}),
    writable: false,
    configurable: true,
    enumerable: false,
  });

  return request;
}

/**
 * Create a mock authenticated request with admin token
 */
export async function createAuthenticatedRequest(
  method: string = 'GET',
  body?: any,
  headers?: Record<string, string>
): Promise<NextRequest> {
  const token = await createAdminToken();
  return createMockRequest(method, body, headers, [`admin-token=${token}`]);
}

/**
 * Create a mock file for upload testing
 */
export function createMockFile(
  name: string = 'test.jpg',
  content: string = 'fake image content',
  type: string = 'image/jpeg'
): File {
  const blob = new Blob([content], { type });
  const file = new File([blob], name, { type });
  
  // Ensure name property is explicitly set (some environments may not set it properly)
  Object.defineProperty(file, 'name', {
    value: name,
    writable: false,
    configurable: true,
    enumerable: true,
  });
  
  return file;
}

/**
 * Create a mock request with FormData for file uploads
 */
export async function createFormDataRequest(
  method: string = 'POST',
  file: File,
  headers?: Record<string, string>,
  cookies?: string[]
): Promise<NextRequest> {
  // Store the file name and type to ensure they're preserved
  const fileName = file.name || 'test.jpg';
  const fileType = file.type || 'image/jpeg';
  
  const formData = new FormData();
  formData.append('file', file);
  
  // Create a custom FormData that ensures the File has name property
  const mockFormData = {
    get: (key: string) => {
      if (key === 'file') {
        // Get the file from the actual FormData
        let retrievedFile = formData.get('file') as File;
        // If FormData doesn't return the file, use the original
        if (!retrievedFile) {
          retrievedFile = file;
        }
        // Always ensure name and type are set, even if they were lost
        Object.defineProperty(retrievedFile, 'name', {
          value: fileName,
          writable: false,
          configurable: true,
          enumerable: true,
        });
        Object.defineProperty(retrievedFile, 'type', {
          value: fileType,
          writable: false,
          configurable: true,
          enumerable: true,
        });
        return retrievedFile;
      }
      return formData.get(key);
    },
    append: formData.append.bind(formData),
    delete: formData.delete.bind(formData),
    getAll: formData.getAll.bind(formData),
    has: formData.has.bind(formData),
    set: formData.set.bind(formData),
    entries: formData.entries.bind(formData),
    keys: formData.keys.bind(formData),
    values: formData.values.bind(formData),
    forEach: formData.forEach.bind(formData),
  };
  
  const url = 'http://localhost:3000/api/test';
  const requestInit: RequestInit = {
    method,
    headers: headers || {},
  };

  const request = new NextRequest(url, requestInit);
  
  // Mock formData method to return our custom FormData
  Object.defineProperty(request, 'formData', {
    value: async () => mockFormData as FormData,
    writable: false,
    configurable: true,
    enumerable: false,
  });

  // Add cookies if provided
  if (cookies) {
    cookies.forEach(cookie => {
      request.headers.append('Cookie', cookie);
    });
  }

  return request;
}

/**
 * Read response JSON
 */
export async function getResponseJson(response: Response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

