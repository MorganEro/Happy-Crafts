'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAdmin } from '@/hooks/use-admin';
import { generateUniqueFilename, uploadFile } from '@/lib/supabase/storage';
import { getProductById } from '@/services/products';
import { useAuth } from '@clerk/nextjs';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, UploadCloud } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const productFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  company: z.string().min(1, 'Company is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.string().min(1, 'Price is required').regex(/^\d+(\.\d{1,2})?$/, 'Invalid price format'),
  images: z.array(
    z.union([
      z.string().url('Invalid URL'),
      z.object({
        url: z.string(),
        isPrimary: z.boolean().optional(),
        id: z.string().optional()
      })
    ])
  ).min(1, 'At least one image is required'),
  mainImage: z.string().optional(), // To track the main image
});

type ProductFormValues = z.infer<typeof productFormSchema>;

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  
  if (!id) {
    return <div>Loading...</div>;
  }
  
  const router = useRouter();
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  const { isAdmin, isLoading: isAuthLoading } = useAdmin();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [jwt, setJwt] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<{url: string, isNew: boolean}[]>([]);
  const [mainImageIndex, setMainImageIndex] = useState(0);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    
    const files = Array.from(e.target.files);
    const newFiles = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    
    setSelectedFiles(prev => [...prev, ...files]);
    setPreviewUrls(prev => [...prev, ...newFiles.map(f => ({url: f.preview, isNew: true}))]);
  };

  // Get the JWT token when the component mounts
  useEffect(() => {
    const fetchToken = async () => {
      const token = await getToken();
      setJwt(token);
    };
    fetchToken();
  }, [getToken]);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => getProductById(id),
    enabled: !!id,
  });

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: product?.name || '',
      company: product?.company || '',
      description: product?.description || '',
      price: product?.price.toString() || '',
      images: product?.images?.length ? product.images : product?.image ? [product.image] : [],
      mainImage: product?.image || (product?.images?.[0]?.url || '')
    },
  });
  
  const currentImages = watch('images') || [];

  // Update form default values when product data is loaded
  useEffect(() => {
    if (product) {
      const images = product.images?.length 
        ? product.images 
        : product.image 
          ? [{ url: product.image, isPrimary: true }] 
          : [];
          
      reset({
        name: product.name,
        company: product.company,
        description: product.description,
        price: product.price.toString(),
        images: images,
        mainImage: product.image || (images[0]?.url || '')
      });
      
      setPreviewUrls(images.map(img => ({
        url: typeof img === 'string' ? img : img.url,
        isNew: false
      })));
      
      const mainIndex = images.findIndex(img => 
        typeof img === 'string' 
          ? img === product.image 
          : img.isPrimary || img.url === product.image
      );
      setMainImageIndex(mainIndex >= 0 ? mainIndex : 0);
    }

    // Clean up object URLs to avoid memory leaks
    return () => {
      previewUrls.forEach(preview => {
        if (preview.isNew) {
          URL.revokeObjectURL(preview.url);
        }
      });
    };
  }, [product, reset]);

  const handleImageUploads = async (files: File[]): Promise<Array<{url: string, isPrimary: boolean}>> => {
    if (!files.length || !jwt) return [];

    try {
      setIsUploading(true);
      const uploadPromises = files.map(async (file) => {
        const filename = generateUniqueFilename(file.name);
        const { data: uploadData, error: uploadError } = await uploadFile(
          file, 
          'products', 
          filename, 
          jwt as string
        );

        if (uploadError || !uploadData?.publicUrl) {
          throw uploadError || new Error('Failed to upload image: No public URL returned');
        }

        return {
          url: uploadData.publicUrl,
          isPrimary: false
        };
      });

      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload one or more images. Please try again.');
      throw error;
    } finally {
      setIsUploading(false);
    }
  };
  
  const removeImage = async (index: number) => {
    const updatedPreviews = [...previewUrls];
    const removed = updatedPreviews.splice(index, 1)[0];
    
    // If it's a new image, revoke the object URL
    if (removed.isNew) {
      URL.revokeObjectURL(removed.url);
    }
    
    setPreviewUrls(updatedPreviews);
    
    // Update form values
    const currentImages = [...(watch('images') || [])];
    currentImages.splice(index, 1);
    setValue('images', currentImages);
    
    // If the removed image was the main one, update the main image
    if (index === mainImageIndex) {
      const newMainIndex = Math.min(mainImageIndex, updatedPreviews.length - 1);
      setMainImageIndex(newMainIndex);
      setValue('mainImage', updatedPreviews[newMainIndex]?.url || '');
    }
  };
  
  const setAsMainImage = (index: number) => {
    setMainImageIndex(index);
    setValue('mainImage', previewUrls[index]?.url || '');
  };

  const onSubmit = async (data: ProductFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Upload any new images
      let uploadedImages: Array<{url: string, isPrimary: boolean}> = [];
      
      if (selectedFiles.length > 0) {
        const newImages = await handleImageUploads(selectedFiles);
        uploadedImages = [...uploadedImages, ...newImages];
      }
      
      // Combine existing images with newly uploaded ones
      const existingImages = Array.isArray(data.images) 
        ? data.images.filter(img => typeof img === 'object' && 'url' in img) 
        : [];
      
      const allImages = [...existingImages, ...uploadedImages];
      
      // Mark the main image
      const mainImage = data.mainImage || (allImages[0]?.url || '');
      const updatedImages = allImages.map(img => ({
        ...(typeof img === 'string' ? { url: img } : img),
        isPrimary: img.url === mainImage
      }));

      const response = await fetch(`/api/products/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          images: updatedImages,
          image: mainImage, // Keep the main image for backward compatibility
          price: parseFloat(data.price),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update product');
      }

      // Invalidate queries to update the UI
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['product', id] }),
        queryClient.invalidateQueries({ queryKey: ['products'] }),
      ]);

      toast.success('Product updated successfully');
      router.push(`/products/${id}`);
    } catch (error: any) {
      console.error('Error updating product:', error);
      const errorMessage = error?.message || 'Failed to update product';
      toast.error(typeof errorMessage === 'string' ? errorMessage : 'Failed to update product');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Redirect non-admin users
  if (!isAuthLoading && !isAdmin) {
    router.push(`/products/${id}`);
    return null;
  }

  if (isLoading || isAuthLoading) {
    return (
      <div className="container mx-auto py-12">
        <div className="flex justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto py-12">
        <p>Product not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12">
      <Button
        variant="ghost"
        className="mb-6"
        onClick={() => router.back()}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to product
      </Button>

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-12 md:grid-cols-2">
        {/* Image Upload */}
        <div className="space-y-4">
          <h2 className="mb-4 text-2xl font-bold">Product Images</h2>
          
          {/* Drag and drop area */}
          <div 
            className="mb-4 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-primary dark:border-gray-700"
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const target = e.currentTarget as HTMLElement;
              target.classList.add('border-primary', 'bg-primary/5');
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const target = e.currentTarget as HTMLElement;
              target.classList.remove('border-primary', 'bg-primary/5');
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const target = e.currentTarget as HTMLElement;
              target.classList.remove('border-primary', 'bg-primary/5');
              
              if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
                const files = Array.from(e.dataTransfer.files);
                const newFiles = files.map(file => ({
                  file,
                  preview: URL.createObjectURL(file)
                }));
                
                setSelectedFiles(prev => [...prev, ...files]);
                setPreviewUrls(prev => [...prev, ...newFiles.map(f => ({url: f.preview, isNew: true}))]);
              }
            }}
          >
            <UploadCloud className="mb-2 h-12 w-12 text-gray-400" />
            <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
              Drag and drop images here, or click to select
            </p>
            <Input
              id="images"
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              disabled={isUploading}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => document.getElementById('images')?.click()}
              disabled={isUploading}
            >
              Select Images
            </Button>
          </div>

          <div>
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              {...register('price')}
              className="mt-1"
              disabled={isSubmitting}
            />
            {errors.price && (
              <p className="mt-1 text-sm text-red-500">{errors.price.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="image">Product Image</Label>
            <div className="mt-1 flex items-center gap-4">

              {(previewUrls.length > 0 || (product?.images && product.images.length > 0)) && (
                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border">
                  <img
                    src={previewUrls[0]?.url || (product?.images?.[0] as { url: string })?.url}
                    alt={product?.name || 'Product preview'}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                  disabled={isSubmitting || isUploading}
                />
                <p className="mt-1 text-sm text-gray-500">
                  {selectedFiles.length === 0 && 'Leave empty to keep the current image'}
                </p>
                {isUploading && (
                  <p className="mt-1 text-sm text-blue-500">Uploading image...</p>
                )}
                {errors.images && (
                  <p className="mt-1 text-sm text-red-500">
                    {Array.isArray(errors.images) 
                      ? errors.images[0]?.message 
                      : errors.images?.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
          </div>
        </form>
    </div>
  );
}
