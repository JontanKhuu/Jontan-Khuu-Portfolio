import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

const SKILLS_FILE = join(process.cwd(), 'app', 'data', 'skills.json');

export async function GET() {
  try {
    const fileContents = await readFile(SKILLS_FILE, 'utf8');
    const data = JSON.parse(fileContents);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reading skills data:', error);
    return NextResponse.json(
      { error: 'Failed to read skills data' },
      { status: 500 }
    );
  }
}

