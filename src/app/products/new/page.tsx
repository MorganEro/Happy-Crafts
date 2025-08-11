'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { useAdmin } from '@/hooks/use-admin'
import { DevTools } from '@/components/dev-tools/DevTools'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { productSchema, productFormSchema } from '@/lib/form-utils'
import { uploadFile, generateUniqueFilename, deleteFile } from '@/lib/supabase/storage'
import { UploadCloud, Trash2, Star } from 'lucide-react'
import { useAuth } from '@clerk/nextjs'

type FormData = z.infer<typeof productFormSchema>

export default function AddProductPage() {
  const router = useRouter()
  const { getToken } = useAuth()
  const [jwt, setJwt] = useState<string | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<{url: string, isNew: boolean}[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [mainImageIndex, setMainImageIndex] = useState(0)
  const [isFormSubmitting, setIsFormSubmitting] = useState(false)
  const { isAdmin } = useAdmin()
  
  // Get the JWT token when the component mounts
  useEffect(() => {
    const fetchToken = async () => {
      const token = await getToken()
      setJwt(token)
    }
    fetchToken()
  }, [getToken])
  
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    trigger,
    getValues,
    getFieldState,
    reset,
  } = useForm<FormData & { images: FileList | null }>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: '',
      company: '',
      description: '',
      price: 0,
      images: [], 
      mainImageIndex: 0, // Add default value for mainImageIndex
    },
  })

  // Generate a unique filename for uploads
  const generateUniqueFilename = (originalName: string): string => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    return `${timestamp}-${randomString}-${originalName}`;
  };

  // Handle file selection
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      console.log('No files selected');
      return;
    }
    
    const files = Array.from(e.target.files);
    console.log('Selected files:', files);
    
    // Filter out any files that exceed the size limit or have invalid types
    const validFiles = files.filter(file => 
      file.size <= 50 * 1024 * 1024 && // 50MB
      ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)
    );
    
    if (validFiles.length === 0) {
      toast.error('Please select valid image files (JPEG, JPG, PNG, or WebP) under 50MB');
      return;
    }
    
    const newPreviewUrls = validFiles.map(file => ({
      url: URL.createObjectURL(file),
      isNew: true,
      file // Store the file object for later use
    }));
    
    console.log('New preview URLs:', newPreviewUrls);
    
    // Update the state with new files
    setSelectedFiles(prev => {
      const updated = [...prev, ...validFiles];
      console.log('Updated selected files:', updated);
      return updated;
    });
    
    setPreviewUrls(prev => {
      const updated = [...prev, ...newPreviewUrls];
      console.log('Updated preview URLs:', updated);
      return updated;
    });
    
    // Update the form's images field with the FileList
    const dataTransfer = new DataTransfer();
    const allFiles = [...selectedFiles, ...validFiles];
    allFiles.forEach(file => dataTransfer.items.add(file));
    
    const fileList = dataTransfer.files;
    console.log('Setting form images value:', fileList);
    
    // Use register to properly handle the file input
    const { onChange } = register('images');
    onChange({
      target: {
        name: 'images',
        value: fileList
      }
    });
    
    // Also update the form value
    setValue('images', fileList as unknown as FileList, { 
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true
    });
    
    // Clear the input to allow selecting the same file again if needed
    e.target.value = '';
  }, [previewUrls, selectedFiles, setValue, register]);

  // Handle file upload to Supabase
  const uploadFile = async (file: File, path: string, token: string) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`/api/upload?path=${encodeURIComponent(path)}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to upload file');
    }

    return await response.json();
  };

  // Handle image uploads
  const handleImageUploads = async (files: File[]): Promise<Array<{url: string, isPrimary: boolean}>> => {
    if (!jwt) {
      throw new Error('No authentication token found');
    }

    if (!files || files.length === 0) {
      return [];
    }

    try {
      setIsUploading(true);
      const results = [];
      
      for (const file of files) {
        try {
          // Generate a unique filename
          const filename = generateUniqueFilename(file.name);
          const uploadResult = await uploadFile(
            file,
            `products/${filename}`,
            jwt
          );

          if (!uploadResult || !uploadResult.path) {
            console.error('Error uploading file: No path returned');
            continue;
          }

          // Construct the public URL directly since we're using Supabase
          // Remove any protocol from the URL to prevent double https://
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/^https?:\/\//, '');
          const publicUrl = `https://${supabaseUrl}/storage/v1/object/public/products/${uploadResult.path}`;
          
          results.push({
            url: publicUrl,
            isPrimary: false // Will be set based on mainImageIndex
          });
        } catch (error) {
          console.error('Error uploading image:', error);
          // Continue with other files if one fails
          continue;
        }
      }

      return results;
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload one or more images. Please try again.');
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const updatedPreviews = [...previewUrls];
    const removed = updatedPreviews.splice(index, 1)[0];
    
    // If it's a new image, revoke the object URL
    if (removed.isNew) {
      URL.revokeObjectURL(removed.url);
    }
    
    // Update the selected files to match the remaining previews
    const updatedSelectedFiles = updatedPreviews
      .map((_, i) => selectedFiles[i])
      .filter(Boolean);
    
    setSelectedFiles(updatedSelectedFiles);
    setPreviewUrls(updatedPreviews);
    
    // Update the form's images field
    const dataTransfer = new DataTransfer();
    updatedSelectedFiles.forEach(file => dataTransfer.items.add(file));
    setValue('images', dataTransfer.files as unknown as FileList);
    
    // If the removed image was the main one, update the main image
    if (index === mainImageIndex) {
      const newMainIndex = Math.min(mainImageIndex, updatedPreviews.length - 1);
      setMainImageIndex(newMainIndex);
    }
  };
  
  const setAsMainImage = (index: number) => {
    setMainImageIndex(index);
  };

  // Handle form submission
  const onSubmit = async (formValues: FormData) => {
    try {
      console.log('onSubmit called with form values:', formValues);
      console.log('Current state - previewUrls:', previewUrls);
      console.log('Current state - selectedFiles:', selectedFiles);
      console.log('Current state - mainImageIndex:', mainImageIndex);
      
      setIsFormSubmitting(true);
      
      // Get the JWT token
      const token = await getToken();
      if (!token) {
        toast.error('Authentication required. Please log in again.');
        return;
      }
      
      // Check if we have any images
      if (previewUrls.length === 0) {
        console.error('No preview URLs available');
        toast.error('Please add at least one image');
        return;
      }
      
      if (selectedFiles.length === 0) {
        console.error('No files selected for upload');
        toast.error('Please select at least one image to upload');
        return;
      }

      // Upload images if there are any new ones
      const uploadedImages = selectedFiles.length > 0
        ? await handleImageUploads(selectedFiles)
        : [];

      if (uploadedImages.length === 0 && previewUrls.length === 0) {
        throw new Error('At least one image is required');
      }

      // Combine existing preview URLs with newly uploaded images
      const allImages = [
        ...previewUrls
          .filter(img => !img.isNew) // Keep only existing images
          .map(img => ({
            url: img.url,
            isPrimary: img.url === previewUrls[mainImageIndex]?.url
          })),
        ...uploadedImages
      ];

      if (allImages.length === 0) {
        throw new Error('At least one image is required');
      }

      // Get the main image URL (use the selected main image or first image)
      const mainImageUrl = allImages[mainImageIndex]?.url || allImages[0]?.url || '';
      
      if (!mainImageUrl) {
        throw new Error('Could not determine main image URL');
      }
      
      // Get additional images (all except the main image)
      const additionalImages = allImages
        .filter((_, index) => index !== mainImageIndex && allImages[index]?.url)
        .map(img => img.url)
        .filter(Boolean);

      // Prepare the data in the exact format expected by the API
      const productData = {
        name: formValues.name,
        company: formValues.company,
        description: formValues.description,
        price: Number(formValues.price),
        image: mainImageUrl,
        additionalImages: additionalImages.length > 0 ? additionalImages : undefined,
        mainImageIndex: 0 // Always 0 since we're sending the main image separately
      };

      console.log('Sending request to /api/products with data:', productData);

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData),
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response text:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { message: errorText };
        }
        throw new Error(errorData.message || 'Failed to create product');
      }

      const result = await response.json();
      toast.success('Product created successfully!');
      
      // Reset form and state
      reset();
      setSelectedFiles([]);
      setPreviewUrls([]);
      setMainImageIndex(0);
      
      // Navigate to the new product's page
      router.push(`/products/${result.id}`);
      router.refresh();
    } catch (error) {
      console.error('Error creating product:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to add product. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsFormSubmitting(false);
    }
  };

  useEffect(() => {
    return () => {
      previewUrls.forEach(preview => {
        if (preview.isNew) {
          URL.revokeObjectURL(preview.url);
        }
      });
    };
  }, [previewUrls]);

  if (!isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="mt-2">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  // Watch form values for debugging
  const formValues = watch();
  console.log('Form values:', formValues);
  
  return (
    <div className="container mx-auto py-12">
      <h1 className="mb-8 text-3xl font-bold">Add New Product</h1>
      
      <form 
        onSubmit={async (e) => {
          e.preventDefault();
          console.log('Form submit event triggered');
          
          try {
            const result = await trigger(undefined, { shouldFocus: true });
            console.log('Form validation result:', result);
            
            if (!result) {
              console.log('Form validation errors:', {
                name: getFieldState('name').error,
                company: getFieldState('company').error,
                description: getFieldState('description').error,
                price: getFieldState('price').error,
                images: getFieldState('images').error,
              });
              console.log('Form validation failed');
              return;
            }
            
            const formData = getValues();
            console.log('Form data to submit:', formData);
            await onSubmit(formData);
          } catch (error) {
            console.error('Error in form submission:', error);
          }
        }} 
        className="space-y-6"
      >
        <div className="grid gap-6 md:grid-cols-2">
          {/* Form fields */}
          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-medium">
                Product Name
              </label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Enter product name"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="company" className="mb-2 block text-sm font-medium">
                Company
              </label>
              <Input
                id="company"
                {...register('company')}
                placeholder="Enter company name"
                className={errors.company ? 'border-red-500' : ''}
              />
              {errors.company && (
                <p className="mt-1 text-sm text-red-500">{errors.company.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="price" className="mb-2 block text-sm font-medium">
                Price
              </label>
              <Input
                id="price"
                type="number"
                step="0.01"
                {...register('price', { valueAsNumber: true })}
                placeholder="Enter price"
                className={errors.price ? 'border-red-500' : ''}
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-500">{errors.price.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="mb-2 block text-sm font-medium">
                Description
              </label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Enter product description"
                rows={4}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>
          </div>

          {/* Image Upload Section */}
          <div>
            <h2 className="mb-4 text-xl font-semibold">Product Images</h2>
            
            {/* Drag and drop area */}
            <div 
              className="mb-6 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-primary dark:border-gray-700"
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.currentTarget.classList.add('border-primary', 'bg-primary/5');
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                e.currentTarget.classList.remove('border-primary', 'bg-primary/5');
              }}
              onDrop={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                e.currentTarget.classList.remove('border-primary', 'bg-primary/5');
                
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                  const files = Array.from(e.dataTransfer.files);
                  
                  // Filter out any files that exceed the size limit or have invalid types
                  const validFiles = files.filter(file => 
                    file.size <= 50 * 1024 * 1024 && // 50MB
                    ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)
                  );
                  
                  const newPreviews = validFiles.map(file => ({
                    url: URL.createObjectURL(file),
                    isNew: true
                  }));
                  
                  // Update both local state and form state
                  const updatedSelectedFiles = [...selectedFiles, ...validFiles];
                  const updatedPreviewUrls = [...previewUrls, ...newPreviews];
                  
                  setSelectedFiles(updatedSelectedFiles);
                  setPreviewUrls(updatedPreviewUrls);
                  
                  // Update the form's images field with the FileList
                  const dataTransfer = new DataTransfer();
                  updatedSelectedFiles.forEach(file => dataTransfer.items.add(file));
                  setValue('images', dataTransfer.files as unknown as FileList);
                }
              }}
            >
              <UploadCloud className="mb-2 h-12 w-12 text-gray-400" />
              <p className="mb-2 text-sm text-gray-600 dark:text-gray-400">
                Drag and drop images here, or click to select
              </p>
              <input
                {...register('images', {
                  validate: {
                    atLeastOneImage: (files) => {
                      if (!files || files.length === 0) {
                        return 'At least one image is required';
                      }
                      return true;
                    },
                    maxFiles: (files) => {
                      if (files && files.length > 10) {
                        return 'Maximum 10 images allowed';
                      }
                      return true;
                    }
                  }
                })}
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
              {errors.images && (
                <p className="mt-2 text-sm text-red-500">{errors.images.message as string}</p>
              )}
            </div>

            {/* Image Previews */}
            {previewUrls.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Selected Images ({previewUrls.length})</h3>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {previewUrls.map((preview, index) => (
                    <div key={index} className="group relative overflow-hidden rounded-lg border">
                      <img
                        src={preview.url}
                        alt={`Preview ${index + 1}`}
                        className="h-32 w-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                        <div className="flex space-x-2">
                          <Button
                            type="button"
                            variant={mainImageIndex === index ? 'default' : 'outline'}
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() => setAsMainImage(index)}
                            title="Set as main image"
                          >
                            <Star className={`h-4 w-4 ${mainImageIndex === index ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() => removeImage(index)}
                            title="Remove image"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {mainImageIndex === index && (
                        <div className="absolute top-1 right-1 rounded-full bg-yellow-400 p-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-700" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isFormSubmitting || isUploading}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isFormSubmitting || isUploading}
            onClick={(e) => {
              console.log('Submit button clicked');
              e.stopPropagation();
            }}
          >
            {isUploading ? 'Uploading...' : isFormSubmitting ? 'Adding...' : 'Add Product'}
          </Button>
        </div>
      </form>
      <DevTools control={control} />
    </div>
  )
}
