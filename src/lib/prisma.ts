import { PrismaClient } from '@prisma/client';
import { auth } from '@clerk/nextjs/server';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Create a function to get the Prisma client with RLS context
export async function getPrismaClient() {
  const session = await auth();
  
  // Create a new Prisma client for each request in development to avoid caching issues
  const prisma = global.prisma || new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
  });

  // Set the user ID for RLS in the Prisma client context
  if (session?.userId) {
    // Use SQL template literal with Prisma's parameter binding
    await prisma.$executeRaw`SELECT set_config('app.current_user_id', ${session.userId}, true)`;
  }

  if (process.env.NODE_ENV !== 'production') {
    global.prisma = prisma;
  }

  return prisma;
}

// Export a direct Prisma client instance for non-RLS operations
export const prisma = global.prisma || new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

// Add any Prisma middleware or extensions here if needed

// Handle Prisma connection cleanup
process.on('beforeExit', async () => {
  if (global.prisma) {
    await global.prisma.$disconnect();
  }
});
