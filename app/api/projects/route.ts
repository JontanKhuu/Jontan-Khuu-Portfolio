import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

const PROJECTS_FILE = join(process.cwd(), 'app', 'data', 'projects.json');

export async function GET() {
  try {
    const fileContents = await readFile(PROJECTS_FILE, 'utf8');
    const data = JSON.parse(fileContents);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reading projects data:', error);
    return NextResponse.json(
      { error: 'Failed to read projects data' },
      { status: 500 }
    );
  }
}

