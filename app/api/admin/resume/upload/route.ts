import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/app/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { sanitizeFilename, validateFileExtension, validateImageFile } from '@/app/lib/security';

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads', 'resume');
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB for images
const ALLOWED_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp', 'gif'];

// Ensure upload directory exists
async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

export async function POST(request: NextRequest) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await ensureUploadDir();

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file size first (before processing)
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        { error: 'File is empty' },
        { status: 400 }
      );
    }

    // Validate file extension
    const originalFilename = sanitizeFilename(file.name);
    if (!validateFileExtension(originalFilename, ALLOWED_EXTENSIONS)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PNG, JPG, JPEG, WebP, and GIF are allowed.' },
        { status: 400 }
      );
    }

    // Validate MIME type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Validate file content (magic bytes)
    const isValidImage = await validateImageFile(file);
    if (!isValidImage) {
      return NextResponse.json(
        { error: 'Invalid image file' },
        { status: 400 }
      );
    }

    // Generate safe filename
    const timestamp = Date.now();
    const extension = originalFilename.split('.').pop()?.toLowerCase() || 'png';
    const filename = `resume-${timestamp}.${extension}`;
    const filepath = join(UPLOAD_DIR, filename);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Return the public URL path
    const publicPath = `/uploads/resume/${filename}`;

    return NextResponse.json({ 
      success: true, 
      path: publicPath,
      filename: filename
    });
  } catch (error) {
    console.error('Error uploading resume:', error);
    return NextResponse.json(
      { error: 'Failed to upload resume' },
      { status: 500 }
    );
  }
}

