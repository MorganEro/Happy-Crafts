import { prisma } from '../lib/prisma'

// In products.ts
export type Review = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date | string;
  userId: string;
  productId: string;
  user?: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    profileImageUrl: string | null;
  };
};

export type ProductImage = {
  id: string;
  url: string;
  altText: string | null;
  isPrimary: boolean;
  productId: string;
  createdAt: Date | string;
  updatedAt: Date | string | null;
};

export type Product = {
  id: string;
  name: string;
  company: string;
  description: string;
  image: string;
  price: number;
  createdAt: Date;
  updatedAt: Date;
  customerId: string;
  _count: {
    likes: number;
    reviews: number;
  };
  reviews: Review[];
  images: ProductImage[];
  averageRating?: number;
};

// Base product type without relations
type BaseProduct = Omit<Product, 'reviews' | 'likes' | 'createdAt' | 'updatedAt'>;

export interface ProductWithRelations extends BaseProduct {
  createdAt: string;
  updatedAt: string;
  images: ProductImage[];
  reviews: Array<{
    id: string;
    rating: number;
    comment: string | null;
    authorName: string | null;
    authorImageUrl: string | null;
    createdAt: string | Date;
    updatedAt: string | Date;
    customerId: string;
    productId: string;
  }>;
  likes: Array<{
    id: string;
    customerId: string;
    productId: string;
    createdAt: string | Date;
  }>;
  averageRating: number;
  likeCount: number;
  hasLiked?: boolean;
}

export async function getProducts(): Promise<ProductWithRelations[]> {
  const response = await fetch('/api/products')
  
  if (!response.ok) {
    throw new Error('Failed to fetch products')
  }
  
  return response.json()
}

export async function getProductById(id: string): Promise<ProductWithRelations | null> {
  try {
    console.log(`Fetching product with ID: ${id}`);
    const response = await fetch(`/api/products/${id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Prevent caching issues
    });
    
    if (!response.ok) {
      console.error(`Failed to fetch product: ${response.status} ${response.statusText}`);
      if (response.status === 404) {
        return null;
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch product');
    }
    
    const data = await response.json();
    console.log('Received product data:', data);
    
    // Ensure all required fields are present
    return {
      ...data,
      reviews: data.reviews || [],
      likes: data.likes || [],
      averageRating: data.averageRating || 0,
      likeCount: data.likeCount || 0,
      hasLiked: data.hasLiked || false,
    };
  } catch (error) {
    console.error('Error in getProductById:', error);
    throw error;
  }
}

export async function createProduct(data: FormData): Promise<ProductWithRelations> {
  const response = await fetch('/api/products', {
    method: 'POST',
    body: JSON.stringify(Object.fromEntries(data)),
    headers: {
      'Content-Type': 'application/json',
    },
  })
  
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to create product')
  }
  
  return response.json()
}

export async function deleteProduct(id: string): Promise<void> {
  const response = await fetch(`/api/products/${id}`, {
    method: 'DELETE',
  })
  
  if (!response.ok) {
    throw new Error('Failed to delete product')
  }
}
