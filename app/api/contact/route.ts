import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { 
  rateLimitContact, 
  getClientIP, 
  sanitizeString, 
  escapeHtml, 
  sanitizeEmailHeader,
  createRateLimitHeaders,
  checkContentLength,
  parseJsonBody
} from '@/app/lib/security';

const MAX_BODY_SIZE = 10 * 1024; // 10KB max for contact form
const RATE_LIMIT = 13; // Max requests per hour

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request);
    const rateLimit = rateLimitContact(clientIP);
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many contact form submissions. Please try again later.' },
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
    const { body, error: bodyError } = await parseJsonBody<{
      name: string;
      email: string;
      message: string;
      website?: string;
    }>(request);
    if (bodyError) return bodyError;

    const { name, email, message, website } = body || {};

    // Honeypot check - if this field is filled, it's likely a bot
    if (website && typeof website === 'string' && website.trim().length > 0) {
      // Silently reject - don't let bots know the honeypot worked
      return NextResponse.json(
        { success: true, message: 'Message sent successfully!' },
        { status: 200 }
      );
    }

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Sanitize and validate lengths
    const sanitizedName = sanitizeString(name, 100);
    const sanitizedEmail = sanitizeString(email, 200);
    const sanitizedMessage = sanitizeString(message, 5000);

    if (sanitizedName.length === 0 || sanitizedEmail.length === 0 || sanitizedMessage.length === 0) {
      return NextResponse.json(
        { error: 'Invalid input' },
        { status: 400 }
      );
    }

    // Sanitize email headers to prevent header injection
    const safeName = sanitizeEmailHeader(sanitizedName, 100);
    const safeEmail = sanitizeEmailHeader(sanitizedEmail, 200);
    
    // Escape HTML for email template to prevent XSS
    const escapedName = escapeHtml(safeName);
    const escapedEmail = escapeHtml(safeEmail);
    const escapedMessage = escapeHtml(sanitizedMessage);

    // Get email configuration from environment variables
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = parseInt(process.env.SMTP_PORT || '587');
    const smtpUser = process.env.SMTP_USER;
    const smtpPassword = process.env.SMTP_PASSWORD;
    const recipientEmail = process.env.CONTACT_EMAIL || smtpUser;

    if (!smtpHost || !smtpUser || !smtpPassword) {
      console.error('Email configuration missing. Please set SMTP_HOST, SMTP_USER, and SMTP_PASSWORD environment variables.');
      return NextResponse.json(
        { error: 'Email service is not configured. Please contact the administrator.' },
        { status: 500 }
      );
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
    });

    // Verify transporter configuration
    try {
      await transporter.verify();
    } catch (error) {
      console.error('SMTP verification failed:', error);
      return NextResponse.json(
        { error: 'Email service configuration error. Please try again later.' },
        { status: 500 }
      );
    }

    // Send email
    const mailOptions = {
      from: `"${safeName}" <${smtpUser}>`,
      replyTo: safeEmail,
      to: recipientEmail,
      subject: `Contact Form: ${safeName}`,
      text: `Name: ${safeName}\nEmail: ${safeEmail}\n\nMessage:\n${sanitizedMessage}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Contact Form Submission</h2>
          <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${escapedName}</p>
            <p><strong>Email:</strong> <a href="mailto:${escapedEmail}">${escapedEmail}</a></p>
          </div>
          <div style="background: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
            <h3 style="color: #333; margin-top: 0;">Message:</h3>
            <p style="white-space: pre-wrap; color: #555; line-height: 1.6;">${escapedMessage.replace(/\n/g, '<br>')}</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { success: true, message: 'Message sent successfully!' },
      {
        status: 200,
        headers: createRateLimitHeaders(rateLimit, RATE_LIMIT)
      }
    );
  } catch (error) {
    // Don't leak error details to client
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to send message. Please try again later.' },
      { status: 500 }
    );
  }
}

