import { put, list, del } from '@vercel/blob';

/**
 * Vercel Blob Storage utilities for JSON files
 */

// Upload JSON to Vercel Blob (with auto-overwrite)
export async function uploadToBlob(
  path: string,
  data: any,
  token: string
): Promise<string> {
  try {
    // First, try to delete if exists (ignore errors)
    try {
      const { blobs } = await list({ prefix: path, token });
      if (blobs.length > 0) {
        await del(blobs[0].url, { token });
        console.log('Deleted existing blob:', path);
      }
    } catch (deleteError) {
      // Ignore delete errors
    }

    // Upload new version
    const blob = await put(path, JSON.stringify(data, null, 2), {
      access: 'public',
      token,
      contentType: 'application/json',
      addRandomSuffix: false,
    });
    
    console.log('Blob uploaded successfully:', blob.url);
    return blob.url;
  } catch (error) {
    console.error('Error uploading to Blob:', error);
    throw error;
  }
}

// List all JSON files in Blob
export async function listBlobFiles(
  prefix: string,
  token: string
): Promise<any[]> {
  try {
    const { blobs } = await list({
      prefix,
      token,
    });
    return blobs;
  } catch (error) {
    console.error('Error listing Blob files:', error);
    throw error;
  }
}

// Delete from Blob
export async function deleteFromBlob(
  url: string,
  token: string
): Promise<void> {
  try {
    await del(url, { token });
  } catch (error) {
    console.error('Error deleting from Blob:', error);
    throw error;
  }
}

// Fetch JSON from Blob URL
export async function fetchFromBlob(url: string): Promise<any> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching from Blob:', error);
    throw error;
  }
}
