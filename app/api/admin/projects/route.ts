import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/app/lib/auth';
import { readDataFile, writeDataFile } from '@/app/lib/data-storage';

export async function GET() {
  try {
    const data = await readDataFile('projects.json');
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reading projects data:', error);
    return NextResponse.json(
      { error: 'Failed to read projects data' },
      { status: 500 }
    );
  }
}

const MAX_BODY_SIZE = 10 * 1024 * 1024; // 10MB max for JSON data

export async function PUT(request: NextRequest) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check content length
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > MAX_BODY_SIZE) {
      return NextResponse.json(
        { error: 'Request too large' },
        { status: 413 }
      );
    }

    const body = await request.json();
    
    // Validate the structure
    if (!body.initialFiles || !Array.isArray(body.initialFiles) ||
        !body.projectItems || !Array.isArray(body.projectItems)) {
      return NextResponse.json(
        { error: 'Invalid data structure' },
        { status: 400 }
      );
    }

    // Validate each file item
    const validateFileItem = (item: any, isProject: boolean) => {
      if (!item.id || !item.type || !item.title) {
        return false;
      }
      // initialFiles need x and y coordinates for positioning on the board
      if (!isProject && (typeof item.x !== 'number' || typeof item.y !== 'number')) {
        return false;
      }
      // projectItems don't need x and y (they're displayed in a grid)
      if (isProject && item.type !== 'project') {
        return false;
      }
      return true;
    };

    for (const file of body.initialFiles) {
      if (!validateFileItem(file, false)) {
        return NextResponse.json(
          { error: 'Invalid file item structure' },
          { status: 400 }
        );
      }
    }

    for (const project of body.projectItems) {
      if (!validateFileItem(project, true)) {
        return NextResponse.json(
          { error: 'Invalid project item structure' },
          { status: 400 }
        );
      }
    }

    // Write to file
    await writeDataFile('projects.json', body);

    return NextResponse.json({ success: true, data: body });
  } catch (error) {
    console.error('Error updating projects data:', error);
    return NextResponse.json(
      { error: 'Failed to update projects data' },
      { status: 500 }
    );
  }
}

