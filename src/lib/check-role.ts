import { Roles } from '@/types/globals';
import { auth } from '@clerk/nextjs/server';

export const checkRole = async (role: Roles): Promise<boolean> => {
  try {
    const { sessionClaims } = await auth();
    console.log('Session claims in checkRole:', JSON.stringify(sessionClaims, null, 2));
    
    const hasRole = sessionClaims?.metadata?.role === role;
    console.log(`Role check for '${role}':`, hasRole);
    
    return hasRole;
  } catch (error) {
    console.error('Error in checkRole:', error);
    return false;
  }
};

export const isAdmin = async (): Promise<boolean> => {
  console.log('Checking if user is admin...');
  const isAdminUser = await checkRole('admin');
  console.log('isAdmin result:', isAdminUser);
  return isAdminUser;
};

export const ensureAdmin = async (): Promise<void> => {
  console.log('Ensuring user is admin...');
  const hasAdminRole = await isAdmin();
  
  if (!hasAdminRole) {
    console.error('Admin access denied - user does not have admin role');
    throw new Error('Forbidden: Admin access required');
  }
  
  console.log('Admin access granted');
};
