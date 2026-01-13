/**
 * Data storage abstraction for JSON data files
 * Handles serverless environments where filesystem is read-only
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { existsSync } from 'fs';
import type { AboutData, SkillsData, ProjectsData, ResumeData } from './data-types';

/**
 * Detect if we're running in a serverless environment
 */
function isServerless(): boolean {
  return process.cwd().startsWith('/var/task') || 
         process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined ||
         process.env.VERCEL !== undefined;
}

/**
 * Get the path for reading data files
 * In serverless, we read from the original location (read-only)
 */
function getReadPath(filename: string): string {
  return join(process.cwd(), 'app', 'data', filename);
}

/**
 * Get the path for writing data files
 * In serverless, we write to /tmp (writable)
 * In local dev, we write to the original location
 */
function getWritePath(filename: string): string {
  if (isServerless()) {
    const tmpDir = '/tmp/app/data';
    if (!existsSync(tmpDir)) {
      mkdir(tmpDir, { recursive: true }).catch(console.error);
    }
    return join(tmpDir, filename);
  }
  return join(process.cwd(), 'app', 'data', filename);
}

/**
 * Read a data file
 */
export async function readDataFile<T = AboutData | SkillsData | ProjectsData | ResumeData>(
  filename: string
): Promise<T> {
  try {
    const path = getReadPath(filename);
    const content = await readFile(path, 'utf8');
    return JSON.parse(content) as T;
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    throw error;
  }
}

/**
 * Write a data file
 * In serverless, writes to /tmp (won't persist between invocations)
 * In local dev, writes to original location
 */
export async function writeDataFile(
  filename: string,
  data: AboutData | SkillsData | ProjectsData | ResumeData
): Promise<void> {
  try {
    const path = getWritePath(filename);
    const dir = dirname(path);
    
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true });
    }
    
    await writeFile(path, JSON.stringify(data, null, 2), 'utf8');
    
    if (isServerless()) {
      console.warn(
        `[SERVERLESS] Data written to ${path} but won't persist. ` +
        `Consider using a database or external storage.`
      );
    }
  } catch (error) {
    console.error(`Error writing ${filename}:`, error);
    throw error;
  }
}

