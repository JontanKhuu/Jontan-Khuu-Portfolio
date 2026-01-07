import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/app/lib/auth';
import { sanitizeFilename, validateImageUpload } from '@/app/lib/security';
import { uploadFile } from '@/app/lib/storage';

export async function POST(request: NextRequest) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    // Validate image upload
    const { valid, error: validationError } = await validateImageUpload(file);
    if (!valid) return validationError!;

    const originalFilename = sanitizeFilename(file.name) || 'file.jpg';

    // Generate safe filename
    const timestamp = Date.now();
    const extension = originalFilename.split('.').pop()?.toLowerCase() || 'png';
    const filename = `project-${timestamp}.${extension}`;

    // Convert file to buffer and upload using storage abstraction
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const publicPath = await uploadFile(buffer, filename, 'projects', file.type);

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

