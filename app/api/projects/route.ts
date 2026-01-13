import { NextResponse } from 'next/server';
import { readDataFile } from '@/app/lib/data-storage';
import type { ProjectsData } from '@/app/lib/data-types';

export async function GET() {
  try {
    const data = await readDataFile<ProjectsData>('projects.json');
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reading projects data:', error);
    return NextResponse.json(
      { error: 'Failed to read projects data' },
      { status: 500 }
    );
  }
}

