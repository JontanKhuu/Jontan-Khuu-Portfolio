import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '@/app/lib/auth';
import { readDataFile, writeDataFile } from '@/app/lib/data-storage';
import type { ProjectsData, ProjectItem } from '@/app/lib/data-types';

export async function POST(request: NextRequest) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json() as Partial<ProjectItem>;
    const data = await readDataFile<ProjectsData>('projects.json');

    if (!body.title) {
      return NextResponse.json(
        { error: 'Invalid project data' },
        { status: 400 }
      );
    }

    const projectId = body.id || `project-${Date.now()}`;
    const newProject: ProjectItem = {
      id: projectId,
      type: body.type || 'project',
      title: body.title,
      summary: body.summary || '',
      href: body.href,
      tags: body.tags || [],
      images: body.images || [],
      details: body.details || '',
    };

    data.projectItems.push(newProject);

    await writeDataFile('projects.json', data);

    return NextResponse.json({ success: true, data: newProject });
  } catch (error) {
    console.error('Error adding project:', error);
    return NextResponse.json(
      { error: 'Failed to add project' },
      { status: 500 }
    );
  }
}

