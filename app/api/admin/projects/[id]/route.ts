import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/app/lib/auth';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const PROJECTS_FILE = join(process.cwd(), 'app', 'data', 'projects.json');

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const fileContents = await readFile(PROJECTS_FILE, 'utf8');
    const data = JSON.parse(fileContents);

    // Remove project from projectItems
    data.projectItems = data.projectItems.filter((item: any) => item.id !== id);

    await writeFile(PROJECTS_FILE, JSON.stringify(data, null, 2), 'utf8');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}

