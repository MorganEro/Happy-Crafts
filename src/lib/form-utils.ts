import { z } from 'zod'

// File schema for validation
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB for Pro tier
const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

// Base product schema (used for API)
export const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  company: z.string().min(1, 'Company is required'),
  description: z.string().min(1, 'Description is required'),
  image: z.string().url('Please enter a valid URL'),
  price: z.number().min(0, 'Price must be positive'),
  // For API - array of image URLs and the index of the main image
  additionalImages: z.array(z.string().url()).optional(),
  mainImageIndex: z.number().default(0).optional(),
});

// Helper to check if the value is a FileList
const isFileList = (value: unknown): value is FileList => {
  return typeof FileList !== 'undefined' && value instanceof FileList;
};

// Form product schema (includes file upload)
export const productFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  company: z.string().min(1, 'Company is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().min(0, 'Price must be positive'),
  // For form - files to be uploaded
  images: z.any()
    .refine((val) => {
      // For client-side validation
      if (isFileList(val)) {
        return val.length > 0;
      }
      // For server-side validation (after form submission)
      return Array.isArray(val) && val.length > 0;
    }, 'At least one image is required')
    .refine((val) => {
      if (!isFileList(val)) return true; // Skip size check if not a FileList
      return Array.from(val).every(file => file.size <= MAX_FILE_SIZE);
    }, 'Max file size is 50MB.')
    .refine((val) => {
      if (!isFileList(val)) return true; // Skip type check if not a FileList
      return Array.from(val).every(file => ACCEPTED_IMAGE_TYPES.includes(file.type));
    }, 'Only .jpg, .jpeg, .png and .webp formats are supported.'),
  // Track which image is the main one (0-based index)
  mainImageIndex: z.number().min(0, 'Main image index is required'),
  mainImage: z.string().optional(), // To track the main image
});

// Review form schema
export const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(1, 'Comment is required'),
  authorName: z.string().min(1, 'Author name is required'),
  authorImageUrl: z.string().url('Please enter a valid URL'),
})
