import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

const ABOUT_FILE = join(process.cwd(), 'app', 'data', 'about.json');

export async function GET() {
  try {
    const fileContents = await readFile(ABOUT_FILE, 'utf8');
    const data = JSON.parse(fileContents);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reading about data:', error);
    return NextResponse.json(
      { error: 'Failed to read about data' },
      { status: 500 }
    );
  }
}

