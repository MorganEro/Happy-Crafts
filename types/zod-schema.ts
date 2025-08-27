import { PRODUCT_CATEGORIES, PRODUCT_TAGS } from '@/lib/constants';
import { z } from 'zod';

// Helper to check if the value is a FileList
export const isFileList = (value: unknown): value is FileList => {
  return typeof FileList !== 'undefined' && value instanceof FileList;
};

export const fileSchema = z.custom<File>(
  v => typeof File !== 'undefined' && v instanceof File,
  { message: 'Invalid file' }
);

export const CategoryUnion = z.union(
  PRODUCT_CATEGORIES.map(c => z.literal(c)) as [
    z.ZodLiteral<(typeof PRODUCT_CATEGORIES)[number]>,
    ...z.ZodLiteral<(typeof PRODUCT_CATEGORIES)[number]>[]
  ]
);

export const SearchSchema = z.object({
  q: z.string().trim().min(1),
  limit: z.number().int().min(1).max(50).default(24),
});

export type SearchResult = {
  id: string;
  name: string;
  image: string;
  price: number;
  category: string;
  tags: string[];
  description: string;
};

export const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  company: z.string().min(1, 'Company is required'),
  category: z.string().min(1, 'Category is required'),
  options: z.array(z.string()).default([]),
  tags: z
    .array(z.string().min(1, 'Tag cannot be empty'))
    .min(1, 'At least one tag is required'),
  description: z.string().min(1, 'Description is required'),
  image: z.string().url('Please enter a valid URL'),
  price: z.number().min(0, 'Price must be positive'),
  // For API - array of image URLs and the index of the main image
  additionalImages: z.array(z.string().url()).optional(),
  mainImageIndex: z.number().default(0).optional(),
});

export const productFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  company: z.string().min(1, 'Company is required'),
  category: CategoryUnion,
  options: z.array(z.string()).default([]),
  tags: z.array(z.enum(PRODUCT_TAGS)).min(1, 'At least one tag is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().min(0, 'Price must be positive'),
  // For form - files to be uploaded
  images: z.array(z.string().url()).min(1, 'At least one image is required'),
  // Track which image is the main one (0-based index)
  mainImageIndex: z.number().min(0, 'Main image index is required'),
  // mainImage: z.string().optional(), // To track the main image
});

export const productUpdateSchema = productFormSchema.extend({
  id: z.string().min(1),
});

export const reviewSchema = z.object({
  authorName: z.string().refine(value => value !== '', {
    message: 'Cannot be empty',
  }),
  authorImageUrl: z.string().refine(value => value !== '', {
    message: 'Cannot be empty',
  }),
  rating: z.coerce
    .number()
    .int()
    .min(1, { message: 'Must be at least 1' })
    .max(5, { message: 'Must be at most 5' }),
  comment: z
    .string()
    .min(10, { message: 'Minimum 10 characters long' })
    .max(1000, { message: 'Maximum 1000 characters long' }),
});

/** Server-side validation (no coercion) */
export const reviewCreateSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(10).max(1000),
  // Optional: will fill from Clerk on server if not provided
  authorName: z.string().min(1).optional(),
  authorImageUrl: z.string().url().optional(),
});

export function validateWithZodSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(result.error.message);
  }
  return result.data;
}

// export const clientFormSchema = productFormSchema.extend({
//   images: z.array(fileSchema).min(1, 'At least one image is required'),
// }) satisfies z.ZodType<LocalFormValues>;
export const clientFormSchema = productFormSchema.extend({
  options: z.array(z.string()),
  images: z.array(fileSchema).min(1, 'At least one image is required'),
});

export const reviewClientSchema = reviewCreateSchema; // input is rating: number

export const clientEditFormSchema = productFormSchema
  .omit({ images: true })
  .extend({
    // Force options to be required on the client
    options: z.array(z.string()),
    existingUrls: z.array(z.string().url()),
    // Make newImages required (can be empty []); avoids optional in resolver input
    newImages: z.array(fileSchema),
    mainImageIndex: z.number().min(0),
  })
  .refine(v => v.existingUrls.length + v.newImages.length > 0, {
    message: 'At least one image is required',
    path: ['existingUrls'],
  });

export type LocalFormValues = z.infer<typeof clientFormSchema>;
// Local form (edit): split images into existing URLs + new File[]
export type LocalEditFormValues = z.infer<typeof clientEditFormSchema>;
export type ProductData = z.infer<typeof productSchema>;
export type ProductFormValues = z.infer<typeof productFormSchema>;
// export type ProductEditFormData = z.infer<typeof productEditFormSchema>;
export type UpdateFormValues = z.infer<typeof productUpdateSchema>; // server update

export type ReviewCreateValues = z.infer<typeof reviewCreateSchema>;
export type ReviewClientValues = z.infer<typeof reviewClientSchema>;
