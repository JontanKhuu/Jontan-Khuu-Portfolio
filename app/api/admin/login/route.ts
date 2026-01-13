import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, createAdminToken, setAdminCookie } from '@/app/lib/auth';
import { rateLimitLogin, getClientIP, createRateLimitHeaders, checkContentLength, parseJsonBody } from '@/app/lib/security';

const MAX_BODY_SIZE = 1024; // 1KB max for login request
const RATE_LIMIT = 5; // Max requests per 15 minutes

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request);
    const rateLimit = rateLimitLogin(clientIP);
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { 
          status: 429,
          headers: createRateLimitHeaders(rateLimit, RATE_LIMIT)
        }
      );
    }

    // Check content length
    const contentLengthError = checkContentLength(request, MAX_BODY_SIZE);
    if (contentLengthError) return contentLengthError;

    // Parse and validate JSON body
    const { body, error: bodyError } = await parseJsonBody<{ password: string }>(request);
    if (bodyError) return bodyError;

    const { password } = body || {};

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    // Prevent extremely long passwords (DoS protection)
    if (password.length > 200) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password);
    
    if (!isValid) {
      // Log for debugging (remove in production if needed)
      console.log('Login attempt failed for password length:', password.length);
      return NextResponse.json(
        { error: 'Invalid password' },
        { 
          status: 401,
          headers: createRateLimitHeaders(rateLimit, RATE_LIMIT)
        }
      );
    }

    const token = await createAdminToken();
    await setAdminCookie(token);

    return NextResponse.json({ success: true });
  } catch (error) {
    // Don't leak error details
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

