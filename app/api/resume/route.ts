import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
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

