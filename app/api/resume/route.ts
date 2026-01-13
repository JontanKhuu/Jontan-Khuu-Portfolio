import { NextResponse } from 'next/server';
import { readDataFile } from '@/app/lib/data-storage';
import type { ResumeData } from '@/app/lib/data-types';

export async function GET() {
  try {
    try {
      const data = await readDataFile<ResumeData>('resume.json');
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

