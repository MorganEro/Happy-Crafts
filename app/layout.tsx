import {
  fetchAllProducts,
  fetchUserFavorites,
} from '@/actions/product-actions';
import { fetchAllReviews, fetchMyReview } from '@/actions/review-actions';
import Sidebar from '@/components/layout/sidebar/Sidebar';
import { MainNav } from '@/components/layout/topbar/main-nav';
import { SidebarProvider } from '@/components/providers/sidebar-provider';
import { ClerkProvider } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import { dehydrate, QueryClient } from '@tanstack/react-query';
import type { Metadata } from 'next';
import {
  Faculty_Glyphic,
  Molle,
  Mr_Bedfort,
  Plaster,
  Raleway,
} from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

// Load Kranky for decorative elements
const molle = Molle({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-molle',
});

// Load Just Another Hand for decorative elements
const raleway = Raleway({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-raleway',
});

// Load Rum Raisin for decorative elements
const faculty_glyphic = Faculty_Glyphic({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-faculty_glyphic',
});

// Load Plaster for decorative elements
const plaster = Plaster({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-plaster',
});

// Load Mr Bedfort for decorative elements
const mr_bedfort = Mr_Bedfort({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mr_bedfort',
});

// Combine font variables for the body
const fontVariables = [
  molle.variable,
  raleway.variable,
  faculty_glyphic.variable,
  plaster.variable,
  mr_bedfort.variable,
].join(' ');

export const metadata: Metadata = {
  title: 'Happy Crafts',
  description: 'Happy Crafts by Leslie',
  icons: {
    icon: [{ url: '/favicon.png', sizes: 'any', type: 'image/png' }],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { userId } = await auth();
  const queryClient = new QueryClient();
  if (userId) {
    await queryClient.prefetchQuery({
      queryKey: ['review', 'user', userId],
      queryFn: fetchMyReview,
    });

    await queryClient.prefetchQuery({
      queryKey: ['favorites', userId],
      queryFn: fetchUserFavorites,
    });
  }
  await queryClient.prefetchQuery({
    queryKey: ['reviews', 'all'],
    queryFn: fetchAllReviews,
  });

  await queryClient.prefetchQuery({
    queryKey: ['products'],
    queryFn: fetchAllProducts,
  });

  const dehydratedState = dehydrate(queryClient);

  return (
    <ClerkProvider>
      <SidebarProvider>
        <html
          lang="en"
          className="h-full"
          suppressHydrationWarning>
          <body
            className={`${fontVariables} antialiased h-full overflow-x-hidden`}>
            <Providers state={dehydratedState}>
              <div className="flex min-h-screen max-w-[100vw]">
                <Sidebar />
                <div className="flex-1 min-w-0">
                  <MainNav />
                  <main>{children}</main>
                </div>
              </div>
            </Providers>
          </body>
        </html>
      </SidebarProvider>
    </ClerkProvider>
  );
}
