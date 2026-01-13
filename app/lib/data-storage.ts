/**
 * Data storage abstraction for JSON data files
 * Handles serverless environments where filesystem is read-only
 * Uses Vercel KV for persistent storage in serverless environments
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { existsSync } from 'fs';
import { kv } from '@vercel/kv';
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
 * Get the KV key for a data file
 */
function getKVKey(filename: string): string {
  return `data:${filename}`;
}

/**
 * Read data from Vercel KV
 */
async function readFromKV(filename: string): Promise<string | null> {
  try {
    const key = getKVKey(filename);
    const data = await kv.get(key);
    
    // Handle both string and object cases
    if (data === null || data === undefined) {
      return null;
    }
    
    // If it's already a string, return it
    if (typeof data === 'string') {
      return data;
    }
    
    // If it's an object, stringify it (this handles cases where KV auto-parsed JSON)
    if (typeof data === 'object') {
      return JSON.stringify(data);
    }
    
    // Fallback: convert to string
    return String(data);
  } catch (error) {
    console.error(`Error reading from KV for ${filename}:`, error);
    return null;
  }
}

/**
 * Write data to Vercel KV
 */
async function writeToKV(filename: string, content: string): Promise<void> {
  const key = getKVKey(filename);
  await kv.set(key, content);
}

/**
 * Normalize image URLs to fix path separator issues
 */
function normalizeImageUrls(data: unknown): unknown {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(normalizeImageUrls);
  }

  const normalized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (key === 'imageUrl' || key === 'fileUrl' || (key === 'url' && typeof value === 'string')) {
      // Normalize path separators and ensure proper URL format
      normalized[key] = typeof value === 'string' ? value.replace(/\\/g, '/') : value;
    } else if (key === 'images' && Array.isArray(value)) {
      // Handle project images array
      normalized[key] = value.map((img: unknown) => {
        if (typeof img === 'object' && img !== null && 'url' in img) {
          return {
            ...img,
            url: typeof img.url === 'string' ? img.url.replace(/\\/g, '/') : img.url,
          };
        }
        return img;
      });
    } else {
      normalized[key] = normalizeImageUrls(value);
    }
  }
  return normalized;
}

/**
 * Read a data file
 * In serverless: reads from Vercel KV (persistent) if available, falls back to local files
 * In local dev: reads from local filesystem
 */
export async function readDataFile<T = AboutData | SkillsData | ProjectsData | ResumeData>(
  filename: string
): Promise<T> {
  try {
    let content: string;
    
    if (isServerless()) {
      // Try to read from KV first
      const kvData = await readFromKV(filename);
      if (kvData) {
        content = kvData;
      } else {
        // Fall back to reading from git files (initial state)
        const path = join(process.cwd(), 'app', 'data', filename);
        content = await readFile(path, 'utf8');
      }
    } else {
      const path = join(process.cwd(), 'app', 'data', filename);
      content = await readFile(path, 'utf8');
    }
    
    const parsed = JSON.parse(content) as T;
    // Normalize any image URLs to fix path separator issues
    return normalizeImageUrls(parsed) as T;
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    throw error;
  }
}

/**
 * Write a data file
 * In serverless: writes to Vercel KV (persistent)
 * In local dev: writes to local filesystem
 */
export async function writeDataFile(
  filename: string,
  data: AboutData | SkillsData | ProjectsData | ResumeData
): Promise<void> {
  try {
    const content = JSON.stringify(data, null, 2);
    
    if (isServerless()) {
      await writeToKV(filename, content);
    } else {
      const path = join(process.cwd(), 'app', 'data', filename);
      const dir = dirname(path);
      
      if (!existsSync(dir)) {
        await mkdir(dir, { recursive: true });
      }
      
      await writeFile(path, content, 'utf8');
    }
  } catch (error) {
    console.error(`Error writing ${filename}:`, error);
    throw error;
  }
}

