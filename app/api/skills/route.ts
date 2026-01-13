import { NextResponse } from 'next/server';
import { readDataFile } from '@/app/lib/data-storage';
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

