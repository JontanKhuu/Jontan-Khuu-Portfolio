/**
 * Storage abstraction layer for file uploads
 * 
 * Uses Vercel Blob storage if BLOB_READ_WRITE_TOKEN is set.
 * Falls back to local filesystem storage if token is not available (for local development).
 */

import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { put, del } from '@vercel/blob';

export interface StorageProvider {
  /**
   * Upload a file and return its public URL
   */
  upload(
    buffer: Buffer,
    filename: string,
    folder: string,
    contentType?: string
  ): Promise<string>;

  /**
   * Delete a file by its URL or path
   */
  delete(urlOrPath: string): Promise<void>;

  /**
   * Get the public URL for a stored file
   */
  getPublicUrl(path: string): string;
}

/**
 * Detect if we're running in a serverless environment
 * Used by LocalStorageProvider to determine if /tmp should be used
 */
function isServerless(): boolean {
  return process.cwd().startsWith('/var/task') || 
         process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined ||
         process.env.VERCEL !== undefined;
}

/**
 * Vercel Blob storage provider
 * Stores files in Vercel Blob storage for serverless environments
 */
class VercelBlobStorageProvider implements StorageProvider {
  private token: string | undefined;

  constructor() {
    this.token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!this.token) {
      console.warn('[STORAGE] BLOB_READ_WRITE_TOKEN not set. Vercel Blob storage will not work.');
    }
  }

  async upload(
    buffer: Buffer,
    filename: string,
    folder: string,
    contentType?: string
  ): Promise<string> {
    if (!this.token) {
      throw new Error('BLOB_READ_WRITE_TOKEN is required for Vercel Blob storage');
    }

    const path = `uploads/${folder}/${filename}`;

    try {
      const blob = await put(path, buffer, {
        access: 'public',
        token: this.token,
        contentType: contentType || 'application/octet-stream',
      });

      return blob.url;
    } catch (error) {
      console.error('Error uploading to Vercel Blob:', error);
      throw error;
    }
  }

  async delete(urlOrPath: string): Promise<void> {
    if (!this.token) {
      console.warn('[STORAGE] Cannot delete: BLOB_READ_WRITE_TOKEN not set');
      return;
    }

    try {
      if (!urlOrPath.startsWith('http')) {
        console.warn(
          `[STORAGE] Cannot delete Vercel Blob file with path only: ${urlOrPath}. ` +
          `Full URL is required. The file may not be deleted.`
        );
        return;
      }

      await del(urlOrPath, { token: this.token });
    } catch (error) {
      console.error(`Error deleting from Vercel Blob: ${urlOrPath}`, error);
      // Don't throw - file might not exist or already be deleted
    }
  }

  getPublicUrl(path: string): string {
    if (path.startsWith('http')) {
      return path;
    }
    return path;
  }
}

/**
 * Local filesystem storage provider
 * Stores files in storage/uploads/ directory and serves them via public/uploads/
 */
class LocalStorageProvider implements StorageProvider {
  private storageDir: string;
  private publicDir: string;

  constructor() {
    if (isServerless()) {
      this.storageDir = '/tmp/storage/uploads';
      this.publicDir = '/tmp/public/uploads';
    } else {
      this.storageDir = join(process.cwd(), 'storage', 'uploads');
      this.publicDir = join(process.cwd(), 'public', 'uploads');
    }
  }

  async ensureDirectories(folder: string): Promise<void> {
    const storageFolder = join(this.storageDir, folder);
    const publicFolder = join(this.publicDir, folder);

    if (!existsSync(storageFolder)) {
      await mkdir(storageFolder, { recursive: true });
    }
    if (!existsSync(publicFolder)) {
      await mkdir(publicFolder, { recursive: true });
    }
  }

  async upload(
    buffer: Buffer,
    filename: string,
    folder: string,
    contentType?: string
  ): Promise<string> {
    await this.ensureDirectories(folder);

    const storagePath = join(this.storageDir, folder, filename);
    const publicPath = join(this.publicDir, folder, filename);

    await writeFile(storagePath, buffer);
    await writeFile(publicPath, buffer);

    if (isServerless()) {
      console.warn(
        `[SERVERLESS] File uploaded to ${publicPath} but won't be accessible via web URLs. ` +
        `Consider using cloud storage (S3, Cloudinary, Vercel Blob) for production.`
      );
    }

    return this.getPublicUrl(join(folder, filename));
  }

  async delete(urlOrPath: string): Promise<void> {
    const path = urlOrPath.startsWith('/') 
      ? urlOrPath.replace('/uploads/', '')
      : urlOrPath;

    const storagePath = join(this.storageDir, path);
    const publicPath = join(this.publicDir, path);

    try {
      if (existsSync(storagePath)) {
        const { unlink } = await import('fs/promises');
        await unlink(storagePath);
      }
      if (existsSync(publicPath)) {
        const { unlink } = await import('fs/promises');
        await unlink(publicPath);
      }
    } catch (error) {
      console.error(`Error deleting file ${path}:`, error);
      // Don't throw - file might not exist
    }
  }

  getPublicUrl(path: string): string {
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    if (cleanPath.startsWith('uploads/')) {
      return `/${cleanPath}`;
    }
    return `/uploads/${cleanPath}`;
  }
}

/**
 * Get the storage provider based on BLOB_READ_WRITE_TOKEN availability
 * 
 * Uses Vercel Blob if BLOB_READ_WRITE_TOKEN is set, otherwise falls back to local storage
 */
export function getStorageProvider(): StorageProvider {
  const hasBlobToken = !!process.env.BLOB_READ_WRITE_TOKEN;

  if (hasBlobToken) {
    console.log('[STORAGE] Using Vercel Blob storage');
    return new VercelBlobStorageProvider();
  }

  console.warn('[STORAGE] BLOB_READ_WRITE_TOKEN not set. Using local storage (files won\'t persist in production).');
  return new LocalStorageProvider();
}

export async function uploadFile(
  buffer: Buffer,
  filename: string,
  folder: string,
  contentType?: string
): Promise<string> {
  const storage = getStorageProvider();
  return storage.upload(buffer, filename, folder, contentType);
}

export async function deleteFile(urlOrPath: string): Promise<void> {
  const storage = getStorageProvider();
  return storage.delete(urlOrPath);
}

export function getFileUrl(path: string): string {
  const storage = getStorageProvider();
  return storage.getPublicUrl(path);
}

