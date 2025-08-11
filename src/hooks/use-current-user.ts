'use client';

import { useQuery } from '@tanstack/react-query';
import { useUser, useAuth } from '@clerk/nextjs';

export interface UserData {
  id: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string;
  imageUrl: string;
  publicMetadata?: {
    role?: string;
    [key: string]: unknown;
  };
}

// Singleton pattern for user data
let userDataPromise: Promise<UserData | null> | null = null;

async function fetchUserData(userId: string, getToken: () => Promise<string | null>): Promise<UserData | null> {
  if (!userId) return null;
  
  try {
    const token = await getToken();
    if (!token) return null;
    
    const response = await fetch('/api/users/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      credentials: 'same-origin'
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user data: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in fetchUserData:', error);
    throw error;
  }
}

export function useCurrentUser() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  
  return useQuery<UserData | null>({
    queryKey: ['currentUser'],
    queryFn: async () => {
      if (!user) return null;
      
      // If we already have a pending request, return it
      if (userDataPromise) {
        return userDataPromise;
      }
      
      // Otherwise, create a new request
      userDataPromise = fetchUserData(user.id, getToken);
      
      try {
        const data = await userDataPromise;
        return data;
      } finally {
        // Clear the promise when done
        userDataPromise = null;
      }
    },
    enabled: isLoaded && !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });
}
