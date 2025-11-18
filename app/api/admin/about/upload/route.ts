import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/app/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { sanitizeFilename, validateImageUpload } from '@/app/lib/security';

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads', 'about');

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

    // Validate image upload
    const { valid, error: validationError } = await validateImageUpload(file);
    if (!valid) return validationError!;

    const originalFilename = sanitizeFilename(file.name);

    // Generate safe filename
    const timestamp = Date.now();
    const extension = originalFilename.split('.').pop()?.toLowerCase() || 'png';
    const filename = `profile-${timestamp}.${extension}`;
    const filepath = join(UPLOAD_DIR, filename);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Return the public URL path
    const publicPath = `/uploads/about/${filename}`;

    return NextResponse.json({ 
      success: true, 
      path: publicPath,
      filename: filename
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

