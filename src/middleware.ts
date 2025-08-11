import { clerkMiddleware } from '@clerk/nextjs/server';

// Define public routes that don't require authentication
const publicRoutes = [
  '/',
  '/products(.*)',
  '/products/[id]',
  '/api/uploadthing(.*)',
  '/api/webhook/clerk(.*)',
  '/api/webhooks/clerk(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/debug-session(.*)',
];

// Create a function to check if a route is public
const isPublicRoute = (path: string): boolean => {
  return publicRoutes.some(route => {
    const regex = new RegExp(`^${route.replace(/\*/g, '.*')}$`);
    return regex.test(path);
  });
};

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;
  
  // Skip authentication for public routes
  if (isPublicRoute(pathname)) {
    return;
  }
  
  // For all other routes, require authentication
  const session = await auth();
  if (!session) {
    // Redirect to sign-in if not authenticated
    return Response.redirect(new URL(`/sign-in?redirect_url=${encodeURIComponent(pathname)}`, req.url));
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
