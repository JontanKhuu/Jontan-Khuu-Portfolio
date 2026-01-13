import { NextResponse } from 'next/server';
import { readDataFile } from '@/app/lib/data-storage';
import type { AboutData } from '@/app/lib/data-types';

export async function GET() {
  try {
    const data = await readDataFile<AboutData>('about.json');
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reading about data:', error);
    return NextResponse.json(
      { error: 'Failed to read about data' },
      { status: 500 }
    );
  }
}

