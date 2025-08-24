// lib/images.ts
export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function assertValidImages(files: File[]) {
  if (!files?.length) throw new Error('At least one image is required.');
  for (const f of files) {
    if (f.size > MAX_FILE_SIZE) throw new Error('Max file size is 50MB.');
    if (!ACCEPTED_IMAGE_TYPES.includes(f.type)) {
      throw new Error(
        'Only .jpg, .jpeg, .png and .webp formats are supported.'
      );
    }
  }
}

export function safeFilename(original: string) {
  const base = original.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9.\-_]/g, '');
  const uid = crypto.randomUUID();
  const parts = base.split('.');
  const ext = parts.length > 1 ? '.' + parts.pop() : '';
  const name = parts.join('.');
  return `${name}-${uid}${ext}`;
}
