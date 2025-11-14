import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Require environment variables in production
const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;
const JWT_EXPIRATION_TIME = process.env.JWT_EXPIRATION_TIME || '24h';

if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('JWT_SECRET environment variable is required in production');
}

if (!ADMIN_PASSWORD_HASH && process.env.NODE_ENV === 'production') {
  throw new Error('ADMIN_PASSWORD_HASH environment variable is required in production');
}

// Fallback for development only
const FALLBACK_SECRET = 'dev-secret-key-change-in-production';
const FALLBACK_PASSWORD = 'admin123';

// Helper function to convert expiration time string to seconds
// Supports formats like "24h", "7d", "30m", "3600s", etc.
function parseExpirationToSeconds(expiration: string): number {
  const match = expiration.match(/^(\d+)([smhd])$/);
  if (!match) {
    // Default to 24 hours if format is invalid
    return 60 * 60 * 24;
  }
  
  const value = parseInt(match[1], 10);
  const unit = match[2];
  
  switch (unit) {
    case 's':
      return value;
    case 'm':
      return value * 60;
    case 'h':
      return value * 60 * 60;
    case 'd':
      return value * 60 * 60 * 24;
    default:
      return 60 * 60 * 24; // Default to 24 hours
  }
}

export interface AuthToken {
  admin: boolean;
  iat: number;
  exp: number;
}

export async function verifyAdmin(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin-token')?.value;
    
    if (!token || typeof token !== 'string') {
      return false;
    }

    const secret = JWT_SECRET || FALLBACK_SECRET;
    const decoded = jwt.verify(token, secret) as AuthToken;
    return decoded.admin === true;
  } catch {
    return false;
  }
}

export async function createAdminToken(): Promise<string> {
  const secret = JWT_SECRET || FALLBACK_SECRET;
  return jwt.sign(
    { admin: true },
    secret,
    { expiresIn: JWT_EXPIRATION_TIME }
  );
}

export async function setAdminCookie(token: string) {
  const cookieStore = await cookies();
  const maxAge = parseExpirationToSeconds(JWT_EXPIRATION_TIME);
  
  cookieStore.set('admin-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: maxAge,
    path: '/',
  });
}

export async function removeAdminCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('admin-token');
}

export async function verifyPassword(password: string): Promise<boolean> {
  if (!password || typeof password !== 'string') {
    return false;
  }
  
  // In production, use hashed password
  if (ADMIN_PASSWORD_HASH) {
    try {
      return await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
    } catch {
      return false;
    }
  }
  
  // Development fallback (warn if used in production)
  if (process.env.NODE_ENV === 'production') {
    console.warn('WARNING: Using plain text password in production!');
  }
  
  return password === FALLBACK_PASSWORD;
}

/**
 * Hash a password (use this to generate ADMIN_PASSWORD_HASH)
 * Run this once: node -e "const bcrypt=require('bcryptjs');bcrypt.hash('your-password',10).then(console.log)"
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

