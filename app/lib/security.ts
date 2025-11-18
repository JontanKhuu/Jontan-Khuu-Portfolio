import { NextRequest, NextResponse } from 'next/server';

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Generic rate limiting function
 */
function rateLimit(
  ip: string,
  prefix: string,
  windowMs: number,
  maxRequests: number
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const key = `${prefix}:${ip}`;
  const record = rateLimitStore.get(key);

  // Clean up old entries periodically
  if (rateLimitStore.size > 1000) {
    for (const [k, v] of rateLimitStore.entries()) {
      if (v.resetTime < now) {
        rateLimitStore.delete(k);
      }
    }
  }

  if (!record || record.resetTime < now) {
    // New window
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: now + windowMs,
    };
  }

  if (record.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime,
    };
  }

  record.count++;
  return {
    allowed: true,
    remaining: maxRequests - record.count,
    resetTime: record.resetTime,
  };
}

/**
 * Rate limiting middleware for login attempts
 */
export function rateLimitLogin(ip: string): { allowed: boolean; remaining: number; resetTime: number } {
  return rateLimit(ip, 'login', 15 * 60 * 1000, 5); // 15 minutes, 5 requests
}

/**
 * Rate limiting middleware for contact form submissions
 */
export function rateLimitContact(ip: string): { allowed: boolean; remaining: number; resetTime: number } {
  return rateLimit(ip, 'contact', 60 * 60 * 1000, 13); // 1 hour, 13 requests
}

/**
 * Get client IP address
 */
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  // Fallback to 'unknown' if no IP headers are present
  // In production, the IP should be available via x-forwarded-for or x-real-ip
  return 'unknown';
}

/**
 * Sanitize filename to prevent path traversal and injection
 */
export function sanitizeFilename(filename: string): string {
  // Remove path separators and dangerous characters
  let sanitized = filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.\./g, '_')
    .replace(/^\.+/, '')
    .replace(/\.+$/, '');
  
  // Limit length
  if (sanitized.length > 100) {
    const ext = sanitized.split('.').pop();
    sanitized = sanitized.substring(0, 100 - (ext?.length || 0) - 1) + '.' + ext;
  }
  
  return sanitized || 'file';
}

/**
 * Validate file extension against allowed list
 */
export function validateFileExtension(filename: string, allowedExtensions: string[]): boolean {
  const ext = filename.toLowerCase().split('.').pop();
  return ext ? allowedExtensions.includes(ext) : false;
}

/**
 * Validate image file by checking magic bytes
 */
export async function validateImageFile(file: File): Promise<boolean> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  
  // Check for image magic bytes
  // PNG: 89 50 4E 47
  // JPEG: FF D8 FF
  // WebP: RIFF ... WEBP
  // GIF: 47 49 46 38
  
  if (bytes.length < 4) return false;
  
  // PNG
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) {
    return true;
  }
  
  // JPEG
  if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) {
    return true;
  }
  
  // GIF
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) {
    return true;
  }
  
  // WebP (check for RIFF header and WEBP in bytes 8-11)
  if (bytes.length >= 12) {
    if (
      bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
      bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
    ) {
      return true;
    }
  }
  
  return false;
}

/**
 * Validate and sanitize string input
 */
export function sanitizeString(input: string, maxLength: number = 1000): string {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[\x00-\x1F\x7F]/g, ''); // Remove control characters
}

/**
 * Validate JSON structure to prevent prototype pollution
 */
export function safeJsonParse<T>(json: string): T | null {
  try {
    const parsed = JSON.parse(json);
    // Check for prototype pollution attempts
    if (parsed && typeof parsed === 'object' && '__proto__' in parsed) {
      return null;
    }
    return parsed as T;
  } catch {
    return null;
  }
}

/**
 * Escape HTML characters to prevent XSS in email templates
 */
export function escapeHtml(text: string): string {
  if (typeof text !== 'string') return '';
  
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * Sanitize email header values to prevent header injection
 */
export function sanitizeEmailHeader(value: string, maxLength: number = 200): string {
  if (typeof value !== 'string') return '';
  
  // Remove newlines, carriage returns, and other control characters that could be used for header injection
  return value
    .replace(/[\r\n]/g, '') // Remove newlines
    .replace(/[<>]/g, '') // Remove angle brackets
    .trim()
    .slice(0, maxLength);
}

/**
 * Create rate limit response headers
 */
export function createRateLimitHeaders(rateLimit: { remaining: number; resetTime: number }, limit: number) {
  return {
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': rateLimit.remaining.toString(),
    'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
    'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
  };
}

/**
 * Check request content length
 */
export function checkContentLength(request: NextRequest, maxSize: number): NextResponse | null {
  const contentLength = request.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > maxSize) {
    return NextResponse.json(
      { error: 'Request too large' },
      { status: 413 }
    );
  }
  return null;
}

/**
 * Validate and parse JSON body
 */
export async function parseJsonBody(request: NextRequest): Promise<{ body: any; error: NextResponse | null }> {
  try {
    const body = await request.json();
    if (!body || typeof body !== 'object') {
      return {
        body: null,
        error: NextResponse.json(
          { error: 'Invalid request' },
          { status: 400 }
        ),
      };
    }
    return { body, error: null };
  } catch (error) {
    return {
      body: null,
      error: NextResponse.json(
        { error: 'Invalid JSON' },
        { status: 400 }
      ),
    };
  }
}

/**
 * Validate image file upload
 */
export async function validateImageUpload(file: File | null): Promise<{ valid: boolean; error: NextResponse | null }> {
  if (!file) {
    return {
      valid: false,
      error: NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      ),
    };
  }

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp', 'gif'];

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      ),
    };
  }

  if (file.size === 0) {
    return {
      valid: false,
      error: NextResponse.json(
        { error: 'File is empty' },
        { status: 400 }
      ),
    };
  }

  const originalFilename = sanitizeFilename(file.name);
  if (!validateFileExtension(originalFilename, ALLOWED_EXTENSIONS)) {
    return {
      valid: false,
      error: NextResponse.json(
        { error: 'Invalid file type. Only PNG, JPG, JPEG, WebP, and GIF are allowed.' },
        { status: 400 }
      ),
    };
  }

  if (!file.type.startsWith('image/')) {
    return {
      valid: false,
      error: NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      ),
    };
  }

  const isValidImage = await validateImageFile(file);
  if (!isValidImage) {
    return {
      valid: false,
      error: NextResponse.json(
        { error: 'Invalid image file' },
        { status: 400 }
      ),
    };
  }

  return { valid: true, error: null };
}

