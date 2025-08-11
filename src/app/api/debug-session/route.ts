import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session) {
      return NextResponse.json(
        { error: 'No active session' },
        { status: 401 }
      );
    }

    // Get all available session properties
    const sessionData = {
      userId: session.userId,
      sessionId: session.sessionId,
      sessionClaims: session.sessionClaims,
      publicMetadata: (session as any).publicMetadata,
      // Include other relevant session properties
      getToken: typeof (session as any).getToken === 'function' ? 'Function exists' : 'No getToken function',
      tokenType: (session as any).tokenType || 'Not available',
      isAuthenticated: (session as any).isAuthenticated || false
    };

    return NextResponse.json({
      success: true,
      session: sessionData
    });
  } catch (error) {
    console.error('Debug session error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to retrieve session data',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
