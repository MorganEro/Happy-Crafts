import { auth } from '@clerk/nextjs/server';

// Extend the Clerk session type to include our custom metadata
// Type for the authenticated session with Clerk
type ClerkSession = Awaited<ReturnType<typeof auth>> & {
  publicMetadata?: {
    role?: string;
    [key: string]: unknown;
  };
  sessionClaims?: {
    metadata?: {
      role?: string;
      [key: string]: unknown;
    };
  };
};

export async function isAdmin(): Promise<boolean> {
  try {
    const session = await auth();
    
    if (!session) {
      console.log('No active session');
      return false;
    }
    
    // Check if user has the admin role using Clerk's RBAC
    // The has() method can check for either role or permission, not both
    const hasAdminRole = await session.has({
      role: 'admin'
    });
    
    // For debugging: Get the full session data
    const sessionData = {
      userId: session.userId,
      sessionId: session.sessionId,
      hasAdminRole,
      // These are for debugging purposes only
      sessionClaims: session.sessionClaims,
      getToken: await session.getToken()
    };
    
    console.log('Admin check:', sessionData);
    
    return hasAdminRole;
  } catch (error) {
    console.error('Error in isAdmin check:', error);
    return false;
  }
}

export async function ensureAdmin(): Promise<void> {
  const isUserAdmin = await isAdmin();
  if (!isUserAdmin) {
    console.error('Admin access denied - user is not an admin');
    throw new Error('Forbidden: Admin access required');
  }
  console.log('Admin access granted');
}

export async function getUserId(): Promise<string | null> {
  const session = await auth();
  return session.userId;
}
