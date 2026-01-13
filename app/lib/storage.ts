/**
 * Storage abstraction layer for file uploads
 * 
 * This module provides a unified interface for file storage that can work
 * with local filesystem (development) and cloud storage (production).
 * 
 * Supports:
 * - Local filesystem storage (development)
 * - Vercel Blob storage (production/serverless)
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

    // Create path with folder structure: uploads/folder/filename
    const path = `uploads/${folder}/${filename}`;

    try {
      const blob = await put(path, buffer, {
        access: 'public',
        token: this.token,
        contentType: contentType || 'application/octet-stream',
      });

      // Return the public URL
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
      // Vercel Blob requires the full URL for deletion
      // Uploads return full URLs, which should be stored and used here
      if (!urlOrPath.startsWith('http')) {
        console.warn(
          `[STORAGE] Cannot delete Vercel Blob file with path only: ${urlOrPath}. ` +
          `Full URL is required. The file may not be deleted.`
        );
        return;
      }

      // Delete using the full URL
      await del(urlOrPath, { token: this.token });
    } catch (error) {
      console.error(`Error deleting from Vercel Blob: ${urlOrPath}`, error);
      // Don't throw - file might not exist or already be deleted
    }
  }

  getPublicUrl(path: string): string {
    // For Vercel Blob, if it's already a full URL, return it
    if (path.startsWith('http')) {
      return path;
    }
    
    // Otherwise, return the path as-is (it will be a full URL from upload)
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
      // In serverless, use /tmp for writable storage
      // NOTE: Files in /tmp won't be accessible via web URLs
      // You need cloud storage (S3, Cloudinary, etc.) for production
      this.storageDir = '/tmp/storage/uploads';
      this.publicDir = '/tmp/public/uploads';
    } else {
      // Store files outside public directory for better organization
      this.storageDir = join(process.cwd(), 'storage', 'uploads');
      // Public directory for serving files
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

    // Write to both storage and public directories
    // In production with cloud storage, we'd only write to cloud
    await writeFile(storagePath, buffer);
    await writeFile(publicPath, buffer);

    // In serverless, warn that files won't be accessible via web
    if (isServerless()) {
      console.warn(
        `[SERVERLESS] File uploaded to ${publicPath} but won't be accessible via web URLs. ` +
        `Consider using cloud storage (S3, Cloudinary, Vercel Blob) for production.`
      );
    }

    // Return the public URL path
    return this.getPublicUrl(join(folder, filename));
  }

  async delete(urlOrPath: string): Promise<void> {
    // Extract the path from URL if needed
    const path = urlOrPath.startsWith('/') 
      ? urlOrPath.replace('/uploads/', '')
      : urlOrPath;

    const storagePath = join(this.storageDir, path);
    const publicPath = join(this.publicDir, path);

    // Delete from both locations
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
    // Remove leading slash if present, then add /uploads/ prefix
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    if (cleanPath.startsWith('uploads/')) {
      return `/${cleanPath}`;
    }
    return `/uploads/${cleanPath}`;
  }
}

/**
 * Get the storage provider based on environment configuration
 * 
 * Automatically uses Vercel Blob if:
 * - STORAGE_TYPE is set to 'vercel-blob', OR
 * - In serverless environment (VERCEL env var set) AND BLOB_READ_WRITE_TOKEN is available
 * 
 * Otherwise falls back to LocalStorageProvider
 */
export function getStorageProvider(): StorageProvider {
  const storageType = process.env.STORAGE_TYPE || 'auto';
  const hasBlobToken = !!process.env.BLOB_READ_WRITE_TOKEN;
  const isVercel = process.env.VERCEL !== undefined;

  // Auto-detect: use Vercel Blob in serverless if token is available
  if (storageType === 'auto' || storageType === 'vercel-blob') {
    if (hasBlobToken && (isVercel || isServerless())) {
      return new VercelBlobStorageProvider();
    }
    if (storageType === 'vercel-blob' && !hasBlobToken) {
      console.warn('[STORAGE] STORAGE_TYPE is "vercel-blob" but BLOB_READ_WRITE_TOKEN is not set. Falling back to local storage.');
    }
  }

  // Use local storage for development or when explicitly requested
  if (storageType === 'local' || !hasBlobToken || (!isVercel && !isServerless())) {
    return new LocalStorageProvider();
  }

  // Default fallback
  return new LocalStorageProvider();
}

/**
 * Convenience function to upload a file
 */
export async function uploadFile(
  buffer: Buffer,
  filename: string,
  folder: string,
  contentType?: string
): Promise<string> {
  const storage = getStorageProvider();
  return storage.upload(buffer, filename, folder, contentType);
}

/**
 * Convenience function to delete a file
 */
export async function deleteFile(urlOrPath: string): Promise<void> {
  const storage = getStorageProvider();
  return storage.delete(urlOrPath);
}

/**
 * Get public URL for a file path
 */
export function getFileUrl(path: string): string {
  const storage = getStorageProvider();
  return storage.getPublicUrl(path);
}

