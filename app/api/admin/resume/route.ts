import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/app/lib/auth';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const RESUME_FILE = join(process.cwd(), 'app', 'data', 'resume.json');

export async function GET() {
  try {
    // Try to read the resume file, if it doesn't exist, return default
    try {
      const fileContents = await readFile(RESUME_FILE, 'utf8');
      const data = JSON.parse(fileContents);
      return NextResponse.json(data);
    } catch (error) {
      // File doesn't exist, return default structure
      return NextResponse.json({
        fileUrl: null,
        title: 'Resume'
      });
    }
  } catch (error) {
    console.error('Error reading resume data:', error);
    return NextResponse.json(
      { error: 'Failed to read resume data' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate the structure
    if (typeof body.fileUrl !== 'string' && body.fileUrl !== null) {
      return NextResponse.json(
        { error: 'Invalid data structure' },
        { status: 400 }
      );
    }

    // Write to file
    await writeFile(RESUME_FILE, JSON.stringify(body, null, 2), 'utf8');

    return NextResponse.json({ success: true, data: body });
  } catch (error) {
    console.error('Error updating resume data:', error);
    return NextResponse.json(
      { error: 'Failed to update resume data' },
      { status: 500 }
    );
  }
}

