import { NextRequest, NextResponse } from 'next/server';
import { verifyPassword, createAdminToken, setAdminCookie } from '@/app/lib/auth';
import { rateLimitLogin, getClientIP } from '@/app/lib/security';

const MAX_BODY_SIZE = 1024; // 1KB max for login request

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
          headers: {
            'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
          }
        }
      );
    }

    // Check content length
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > MAX_BODY_SIZE) {
      return NextResponse.json(
        { error: 'Request too large' },
        { status: 413 }
      );
    }

    const body = await request.json();
    
    // Validate input
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      );
    }

    const { password } = body;

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
      return NextResponse.json(
        { error: 'Invalid password' },
        { 
          status: 401,
          headers: {
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
          }
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

