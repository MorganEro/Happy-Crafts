import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.userId;
    
    if (!userId) {
      return NextResponse.json({ isAdmin: false }, { status: 200 });
    }

    // Check for admin role in public metadata
    const sessionWithClaims = session as any;
    const isUserAdmin = sessionWithClaims?.publicMetadata?.role === 'admin';
    
    return NextResponse.json({ isAdmin: isUserAdmin });
  } catch (error) {
    console.error('Error checking admin status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
