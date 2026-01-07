import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST } from '@/app/api/contact/route';
import { createMockRequest, getResponseJson } from '../helpers';
import { resetMocks } from '../setup';
import * as security from '@/app/lib/security';
import nodemailer from 'nodemailer';

vi.mock('@/app/lib/security');
vi.mock('nodemailer');

describe('POST /api/contact', () => {
  beforeEach(() => {
    resetMocks();
    vi.clearAllMocks();
    
    // Set environment variables for email
    process.env.SMTP_HOST = 'smtp.test.com';
    process.env.SMTP_PORT = '587';
    process.env.SMTP_USER = 'test@test.com';
    process.env.SMTP_PASSWORD = 'test-password';
    process.env.CONTACT_EMAIL = 'contact@test.com';
    
    // Default mocks
    vi.mocked(security.getClientIP).mockReturnValue('127.0.0.1');
    vi.mocked(security.rateLimitContact).mockReturnValue({
      allowed: true,
      remaining: 13,
      resetTime: Date.now() + 3600000,
    });
    vi.mocked(security.createRateLimitHeaders).mockReturnValue({});
    vi.mocked(security.checkContentLength).mockReturnValue(null);
    vi.mocked(security.parseJsonBody).mockImplementation(async (req) => {
      const body = await req.json();
      return { body, error: null };
    });
    vi.mocked(security.sanitizeString).mockImplementation((input) => input);
    vi.mocked(security.sanitizeEmailHeader).mockImplementation((input) => input);
    vi.mocked(security.escapeHtml).mockImplementation((input) => input);

    // Mock nodemailer
    const mockTransporter = {
      sendMail: vi.fn().mockResolvedValue({ messageId: 'test-id' }),
      verify: vi.fn().mockResolvedValue(true),
    };
    vi.mocked(nodemailer.createTransport).mockReturnValue(mockTransporter as any);
  });

  it('should successfully send contact form', async () => {
    const validData = {
      name: 'Test User',
      email: 'test@example.com',
      message: 'Test message',
    };

    const request = createMockRequest('POST', validData);
    const response = await POST(request);
    const data = await getResponseJson(response);

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('should return 400 if name is missing', async () => {
    const invalidData = {
      email: 'test@example.com',
      message: 'Test message',
    };

    const request = createMockRequest('POST', invalidData);
    const response = await POST(request);
    const data = await getResponseJson(response);

    expect(response.status).toBe(400);
    expect(data.error).toBe('Name is required');
  });

  it('should return 400 if email is missing', async () => {
    const invalidData = {
      name: 'Test User',
      message: 'Test message',
    };

    const request = createMockRequest('POST', invalidData);
    const response = await POST(request);
    const data = await getResponseJson(response);

    expect(response.status).toBe(400);
    expect(data.error).toBe('Valid email is required');
  });

  it('should return 400 if email is invalid', async () => {
    const invalidData = {
      name: 'Test User',
      email: 'not-an-email',
      message: 'Test message',
    };

    const request = createMockRequest('POST', invalidData);
    const response = await POST(request);
    const data = await getResponseJson(response);

    expect(response.status).toBe(400);
    expect(data.error).toBe('Valid email is required');
  });

  it('should return 400 if message is missing', async () => {
    const invalidData = {
      name: 'Test User',
      email: 'test@example.com',
    };

    const request = createMockRequest('POST', invalidData);
    const response = await POST(request);
    const data = await getResponseJson(response);

    expect(response.status).toBe(400);
    expect(data.error).toBe('Message is required');
  });

  it('should silently accept honeypot submissions', async () => {
    const honeypotData = {
      name: 'Test User',
      email: 'test@example.com',
      message: 'Test message',
      website: 'bot-filled-this', // Honeypot field
    };

    const request = createMockRequest('POST', honeypotData);
    const response = await POST(request);
    const data = await getResponseJson(response);

    // Should return success but not send email
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('should return 429 if rate limited', async () => {
    vi.mocked(security.rateLimitContact).mockReturnValue({
      allowed: false,
      remaining: 0,
      resetTime: Date.now() + 3600000,
    });

    const validData = {
      name: 'Test User',
      email: 'test@example.com',
      message: 'Test message',
    };

    const request = createMockRequest('POST', validData);
    const response = await POST(request);
    const data = await getResponseJson(response);

    expect(response.status).toBe(429);
    expect(data.error).toContain('Too many contact form submissions');
  });

  it('should sanitize input', async () => {
    const dataWithXSS = {
      name: '<script>alert("xss")</script>Test User',
      email: 'test@example.com',
      message: 'Test message',
    };

    const request = createMockRequest('POST', dataWithXSS);
    const response = await POST(request);
    const data = await getResponseJson(response);

    expect(response.status).toBe(200);
    expect(security.sanitizeString).toHaveBeenCalled();
    expect(security.escapeHtml).toHaveBeenCalled();
  });

  it('should return 413 for request too large', async () => {
    vi.mocked(security.checkContentLength).mockReturnValue(
      new Response(JSON.stringify({ error: 'Request too large' }), { status: 413 })
    );

    const validData = {
      name: 'Test User',
      email: 'test@example.com',
      message: 'Test message',
    };

    const request = createMockRequest('POST', validData);
    const response = await POST(request);

    expect(response.status).toBe(413);
  });
});

