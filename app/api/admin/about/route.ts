import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/app/lib/auth';
import { readDataFile, writeDataFile } from '@/app/lib/data-storage';
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

export async function PUT(request: NextRequest) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json() as AboutData;
    
    if (!body.title || !body.intro || !Array.isArray(body.details)) {
      return NextResponse.json(
        { error: 'Invalid data structure' },
        { status: 400 }
      );
    }

    await writeDataFile('about.json', body);

    return NextResponse.json({ success: true, data: body });
  } catch (error) {
    console.error('Error updating about data:', error);
    return NextResponse.json(
      { error: 'Failed to update about data' },
      { status: 500 }
    );
  }
}

