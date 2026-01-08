/**
 * Storage abstraction layer for file uploads
 * 
 * This module provides a unified interface for file storage that can work
 * with local filesystem (development) and cloud storage (production).
 * 
 * To switch to cloud storage in the future, implement the StorageProvider
 * interface for your chosen service (S3, Cloudinary, etc.) and update
 * the getStorageProvider function.
 */

import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

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
 * Local filesystem storage provider
 * Stores files in storage/uploads/ directory and serves them via public/uploads/
 */
class LocalStorageProvider implements StorageProvider {
  private storageDir: string;
  private publicDir: string;

  constructor() {
    // Store files outside public directory for better organization
    this.storageDir = join(process.cwd(), 'storage', 'uploads');
    // Public directory for serving files
    this.publicDir = join(process.cwd(), 'public', 'uploads');
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
 * Currently returns LocalStorageProvider. In the future, you can:
 * 1. Check process.env.STORAGE_TYPE === 's3' | 'cloudinary' | etc.
 * 2. Return the appropriate provider
 * 3. Add cloud storage implementations
 */
export function getStorageProvider(): StorageProvider {
  const storageType = process.env.STORAGE_TYPE || 'local';

  switch (storageType) {
    case 'local':
      return new LocalStorageProvider();
    
    // Future implementations:
    // case 's3':
    //   return new S3StorageProvider();
    // case 'cloudinary':
    //   return new CloudinaryStorageProvider();
    
    default:
      console.warn(`Unknown storage type: ${storageType}, falling back to local`);
      return new LocalStorageProvider();
  }
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

