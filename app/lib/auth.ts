import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { readFile } from 'fs/promises';
import { join } from 'path';

// Require environment variables in production
const JWT_SECRET = process.env.JWT_SECRET;
// Read password hash from environment - Next.js loads .env.local automatically
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH?.trim();
const JWT_EXPIRATION_TIME = process.env.JWT_EXPIRATION_TIME || '24h';

// Only check at runtime, not during build
// NEXT_PHASE is set during build, so we skip validation then
const isBuildTime = process.env.NEXT_PHASE !== undefined;
const isProduction = process.env.NODE_ENV === 'production';

if (!JWT_SECRET && isProduction && !isBuildTime) {
  throw new Error('JWT_SECRET environment variable is required in production');
}

if (!ADMIN_PASSWORD_HASH && isProduction && !isBuildTime) {
  throw new Error('ADMIN_PASSWORD_HASH environment variable is required in production');
}

// Fallback for development only
const FALLBACK_SECRET = 'dev-secret-key-change-in-production';

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
  if (!secret) {
    throw new Error('JWT secret is required');
  }
  // Use callback form to satisfy TypeScript types
  return new Promise<string>((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (jwt.sign as any)(
      { admin: true },
      secret,
      { expiresIn: JWT_EXPIRATION_TIME },
      (err: Error | null, token: string | undefined) => {
        if (err) {
          reject(err);
        } else if (!token) {
          reject(new Error('Failed to create token'));
        } else {
          resolve(token);
        }
      }
    );
  });
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

// Helper function to read hash directly from .env.local file
// This bypasses Next.js's env parsing which truncates at the first "."
async function readHashFromFile(): Promise<string | null> {
  try {
    const envPath = join(process.cwd(), '.env.local');
    const content = await readFile(envPath, 'utf-8');
    const lines = content.split(/\r?\n/); // Handle both \n and \r\n
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Skip comments and empty lines
      if (line.trim().startsWith('#') || !line.trim()) continue;
      
      // Check if this line starts with ADMIN_PASSWORD_HASH
      if (line.trim().startsWith('ADMIN_PASSWORD_HASH=')) {
        // Match ADMIN_PASSWORD_HASH line - handle multi-line values
        let hash = line.substring('ADMIN_PASSWORD_HASH='.length).trim();
        
        // If hash is incomplete (starts with .), check next line
        if (hash.startsWith('.') && i + 1 < lines.length) {
          const nextLine = lines[i + 1].trim();
          if (nextLine.match(/^[a-zA-Z0-9/\.\$]+$/)) {
            hash = hash + nextLine;
          }
        }
        
        // Remove quotes if present
        if ((hash.startsWith('"') && hash.endsWith('"')) || 
            (hash.startsWith("'") && hash.endsWith("'"))) {
          hash = hash.slice(1, -1);
        }
        // Convert $$ back to $ if escaped
        hash = hash.replace(/\$\$/g, '$');
        
        return hash;
      }
    }
  } catch (error) {
    console.error('[AUTH] Error reading .env.local:', error);
  }
  return null;
}

export async function verifyPassword(password: string): Promise<boolean> {
  if (!password || typeof password !== 'string') {
    return false;
  }

  // WORKAROUND: Next.js truncates env vars at the first "." character
  // Read hash directly from .env.local file to bypass this issue
  const hashFromFile = await readHashFromFile();
  
  // Fallback to process.env if file read fails
  let hashFromEnv = process.env.ADMIN_PASSWORD_HASH?.trim();
  if (hashFromEnv) {
    // Remove quotes if present
    if ((hashFromEnv.startsWith('"') && hashFromEnv.endsWith('"')) || 
        (hashFromEnv.startsWith("'") && hashFromEnv.endsWith("'"))) {
      hashFromEnv = hashFromEnv.slice(1, -1);
    }
    // Convert $$ back to $ if escaped
    hashFromEnv = hashFromEnv.replace(/\$\$/g, '$');
  }
  
  // Use file hash first (most reliable), then env, then constant
  const hashToUse = hashFromFile || hashFromEnv || ADMIN_PASSWORD_HASH;

  if (!hashToUse || hashToUse.length === 0) {
    console.error('[AUTH] No hash available from any source');
    return false;
  }

  // Try bcrypt hash
  try {
    const isValid = await bcrypt.compare(password, hashToUse);
    if (isValid) {
      return true;
    }
  } catch (error) {
    console.error('Bcrypt comparison error:', error);
  }
  
  // Production: require hash
  if (process.env.NODE_ENV === 'production') {
    if (!hashToUse) {
      console.error('ERROR: ADMIN_PASSWORD_HASH must be set in production!');
    }
    return false;
  }
  return false;
}

