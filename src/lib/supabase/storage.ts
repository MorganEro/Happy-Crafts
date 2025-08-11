import { createSupabaseClient } from '@/lib/supabase/client';

/**
 * Uploads a file to Supabase Storage
 * @param file The file to upload
 * @param bucket The storage bucket name
 * @param path The path where to store the file (including filename)
 * @param jwt Optional JWT for authenticated requests
 * @returns The public URL of the uploaded file
 */
export async function uploadFile(
  file: File,
  bucket: string,
  path: string,
  jwt?: string
): Promise<{ data: { publicUrl: string } | null; error: Error | null }> {
  
  try {
    // Create authenticated Supabase client
    const supabase = createSupabaseClient(jwt);

    // Verify file exists and is valid
    if (!file || !(file instanceof File)) {
      throw new Error('Invalid file provided');
    }

    // Upload the file with content type
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || 'application/octet-stream',
      });

    if (uploadError) {
      console.error('Detailed upload error:', {
        message: uploadError.message,
        name: uploadError.name,
        stack: uploadError.stack,
        statusCode: (uploadError as any).statusCode,
        error: uploadError,
        bucket,
        path,
        fileInfo: {
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified
        },
        timestamp: new Date().toISOString()
      });
      return { data: null, error: new Error(`Upload failed: ${uploadError.message}`) };
    }

    if (!uploadData?.path) {
      throw new Error('No path returned after upload');
    }

    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(uploadData.path);

    if (!publicUrlData?.publicUrl) {
      throw new Error('Failed to generate public URL');
    }

    return { 
      data: { 
        publicUrl: publicUrlData.publicUrl 
      }, 
      error: null 
    };
  } catch (error) {
    console.error('Error in uploadFile:', {
      error,
      bucket,
      path,
      file: file ? { name: file.name, size: file.size, type: file.type } : null,
    });
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Unknown error during file upload') 
    };
  }
}

/**
 * Deletes a file from Supabase Storage
 * @param bucket The storage bucket name
 * @param path The path to the file to delete
 * @param jwt Optional JWT for authenticated requests
 */
export async function deleteFile(
  bucket: string,
  path: string,
  jwt?: string
): Promise<{ error: Error | null }> {
  try {
    const supabase = createSupabaseClient(jwt);
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      console.error('Error deleting file:', error);
      return { error: new Error(error.message) };
    }

    return { error: null };
  } catch (error) {
    console.error('Error in deleteFile:', error);
    return { error: error instanceof Error ? error : new Error('Unknown error') };
  }
}

/**
 * Generates a unique filename with timestamp and random string
 * @param originalFilename The original filename
 * @returns A unique filename
 */
export function generateUniqueFilename(originalFilename: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const fileExtension = originalFilename.split('.').pop();
  return `${timestamp}-${randomString}.${fileExtension}`;
}
