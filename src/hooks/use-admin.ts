'use client';

import { useCurrentUser } from './use-current-user';

export function useAdmin() {
  const { data: user, isLoading, isError } = useCurrentUser();
  
  // If we're still loading, return loading state
  if (isLoading) {
    return { isAdmin: false, isLoading: true };
  }
  
  // If there was an error or no user, return not admin
  if (isError || !user) {
    return { isAdmin: false, isLoading: false };
  }
  
  // Check if user has admin role in public metadata
  const isAdmin = user.publicMetadata?.role === 'admin';
  
  return { 
    isAdmin, 
    isLoading: false 
  };
}
