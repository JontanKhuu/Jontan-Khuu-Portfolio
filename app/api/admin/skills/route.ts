import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/app/lib/auth';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const SKILLS_FILE = join(process.cwd(), 'app', 'data', 'skills.json');

export async function GET() {
  try {
    const fileContents = await readFile(SKILLS_FILE, 'utf8');
    const data = JSON.parse(fileContents);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reading skills data:', error);
    return NextResponse.json(
      { error: 'Failed to read skills data' },
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
    if (!body.sections || !Array.isArray(body.sections)) {
      return NextResponse.json(
        { error: 'Invalid data structure' },
        { status: 400 }
      );
    }

    // Validate each section
    for (const section of body.sections) {
      if (!section.title || !Array.isArray(section.items)) {
        return NextResponse.json(
          { error: 'Invalid section structure' },
          { status: 400 }
        );
      }
    }

    // Write to file
    await writeFile(SKILLS_FILE, JSON.stringify(body, null, 2), 'utf8');

    return NextResponse.json({ success: true, data: body });
  } catch (error) {
    console.error('Error updating skills data:', error);
    return NextResponse.json(
      { error: 'Failed to update skills data' },
      { status: 500 }
    );
  }
}

