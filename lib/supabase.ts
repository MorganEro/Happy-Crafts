import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

export const Buckets = {
  PRODUCTS: 'products',
} as const;

export type BucketName = keyof typeof Buckets;

/**
 * Upload an image to a specified Supabase storage bucket
 * @param image The file to upload
 * @param bucketName The name of the bucket to upload to
 * @returns The public URL of the uploaded image
 */
export const uploadImage = async (image: File, bucketName: BucketName) => {
  const timestamp = Date.now();
  const newName = `${timestamp}-${image.name}`;
  const { data } = await supabase.storage
    .from(Buckets[bucketName])
    .upload(newName, image);

  if (!data) throw new Error('Image upload failed');

  return supabase.storage.from(Buckets[bucketName]).getPublicUrl(newName).data
    .publicUrl;
};

/**
 * Delete an image from a specified Supabase storage bucket
 * @param url The public URL of the image to delete
 * @param bucketName The name of the bucket to delete from
 */
export const deleteImage = (url: string, bucketName: BucketName) => {
  const imageName = url.split('/').pop();
  if (!imageName) throw new Error('Invalid image URL');

  return supabase.storage.from(Buckets[bucketName]).remove([imageName]);
};
