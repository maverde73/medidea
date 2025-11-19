/**
 * Storage utilities and helpers for Cloudflare R2
 */

import { Env } from "./env";

/**
 * Storage client wrapper for R2
 */
export class StorageClient {
  constructor(private bucket: R2Bucket) {}

  /**
   * Upload a file to R2
   * @param key Unique key for the file (path)
   * @param data File data (Buffer, string, or ReadableStream)
   * @param metadata Optional metadata
   */
  async upload(
    key: string,
    data: ArrayBuffer | string | ReadableStream,
    metadata?: {
      contentType?: string;
      customMetadata?: Record<string, string>;
    }
  ): Promise<R2Object | null> {
    const options: R2PutOptions = {};

    if (metadata?.contentType) {
      options.httpMetadata = {
        contentType: metadata.contentType,
      };
    }

    if (metadata?.customMetadata) {
      options.customMetadata = metadata.customMetadata;
    }

    return await this.bucket.put(key, data, options);
  }

  /**
   * Download a file from R2
   * @param key File key (path)
   */
  async download(key: string): Promise<R2ObjectBody | null> {
    return await this.bucket.get(key);
  }

  /**
   * Get file metadata without downloading
   * @param key File key (path)
   */
  async head(key: string): Promise<R2Object | null> {
    return await this.bucket.head(key);
  }

  /**
   * Delete a file from R2
   * @param key File key (path)
   */
  async delete(key: string): Promise<void> {
    await this.bucket.delete(key);
  }

  /**
   * Delete multiple files from R2
   * @param keys Array of file keys to delete
   */
  async deleteMultiple(keys: string[]): Promise<void> {
    await this.bucket.delete(keys);
  }

  /**
   * List files in R2 with optional prefix
   * @param options List options
   */
  async list(options?: {
    prefix?: string;
    limit?: number;
    cursor?: string;
  }): Promise<R2Objects> {
    return await this.bucket.list(options);
  }

  /**
   * Check if a file exists
   * @param key File key (path)
   */
  async exists(key: string): Promise<boolean> {
    const obj = await this.bucket.head(key);
    return obj !== null;
  }

  /**
   * Generate a unique file key with timestamp and random string
   * @param filename Original filename
   * @param prefix Optional prefix (folder path)
   */
  generateKey(filename: string, prefix?: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");

    const key = `${timestamp}_${random}_${sanitizedFilename}`;
    return prefix ? `${prefix}/${key}` : key;
  }

  /**
   * Get the underlying R2Bucket instance
   */
  getRaw(): R2Bucket {
    return this.bucket;
  }
}

/**
 * Create a storage client from environment
 */
export function createStorageClient(env: Env): StorageClient {
  return new StorageClient(env.STORAGE);
}

/**
 * File type detection from extension
 */
export function getContentType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();

  const mimeTypes: Record<string, string> = {
    // Documents
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

    // Images
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",

    // Text
    txt: "text/plain",
    csv: "text/csv",
    html: "text/html",
    css: "text/css",
    js: "application/javascript",
    json: "application/json",
  };

  return mimeTypes[ext || ""] || "application/octet-stream";
}

/**
 * Validate file size
 * @param size File size in bytes
 * @param maxSize Maximum allowed size in bytes (default 10MB)
 */
export function validateFileSize(size: number, maxSize: number = 10 * 1024 * 1024): boolean {
  return size <= maxSize;
}

/**
 * Validate file type
 * @param filename Filename to check
 * @param allowedExtensions Array of allowed extensions (e.g., ['pdf', 'jpg'])
 */
export function validateFileType(filename: string, allowedExtensions: string[]): boolean {
  const ext = filename.split(".").pop()?.toLowerCase();
  return ext ? allowedExtensions.includes(ext) : false;
}
