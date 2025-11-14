import { NextRequest, NextResponse } from 'next/server';

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 5; // Max 5 login attempts per window

/**
 * Rate limiting middleware for login attempts
 */
export function rateLimitLogin(ip: string): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const key = `login:${ip}`;
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
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return {
      allowed: true,
      remaining: MAX_REQUESTS - 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    };
  }

  if (record.count >= MAX_REQUESTS) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime,
    };
  }

  record.count++;
  return {
    allowed: true,
    remaining: MAX_REQUESTS - record.count,
    resetTime: record.resetTime,
  };
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
  
  return request.ip || 'unknown';
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

