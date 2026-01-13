import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/app/lib/auth';
import { readDataFile, writeDataFile } from '@/app/lib/data-storage';
import type { SkillsData } from '@/app/lib/data-types';

export async function GET() {
  try {
    const data = await readDataFile<SkillsData>('skills.json');
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

    const body = await request.json() as SkillsData;
    
    if (!body.sections || !Array.isArray(body.sections)) {
      return NextResponse.json(
        { error: 'Invalid data structure' },
        { status: 400 }
      );
    }

    for (const section of body.sections) {
      if (!section.title || !Array.isArray(section.items)) {
        return NextResponse.json(
          { error: 'Invalid section structure' },
          { status: 400 }
        );
      }
    }

    await writeDataFile('skills.json', body);

    return NextResponse.json({ success: true, data: body });
  } catch (error) {
    console.error('Error updating skills data:', error);
    return NextResponse.json(
      { error: 'Failed to update skills data' },
      { status: 500 }
    );
  }
}

