import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/app/lib/auth';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const ABOUT_FILE = join(process.cwd(), 'app', 'data', 'about.json');

export async function GET() {
  try {
    const fileContents = await readFile(ABOUT_FILE, 'utf8');
    const data = JSON.parse(fileContents);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reading about data:', error);
    return NextResponse.json(
      { error: 'Failed to read about data' },
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
    
    // Validate the structure (imageUrl is optional)
    if (!body.title || !body.intro || !Array.isArray(body.details)) {
      return NextResponse.json(
        { error: 'Invalid data structure' },
        { status: 400 }
      );
    }

    // Write to file
    await writeFile(ABOUT_FILE, JSON.stringify(body, null, 2), 'utf8');

    return NextResponse.json({ success: true, data: body });
  } catch (error) {
    console.error('Error updating about data:', error);
    return NextResponse.json(
      { error: 'Failed to update about data' },
      { status: 500 }
    );
  }
}

