import type { Metadata } from "next";
import { Life_Savers, Molle, Rum_Raisin } from "next/font/google";
import { Toaster } from 'sonner';
import { Providers } from "./providers";
import { MainNav } from "@/components/layout/main-nav";
import { DevTools } from "@/components/dev-tools/DevTools";
import "./globals.css";





// Load Kranky for decorative elements
const molle = Molle({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-molle',
});

// Load Just Another Hand for decorative elements
const life_savers = Life_Savers({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-life_savers',
});

// Load Rum Raisin for decorative elements
const rum_raisin = Rum_Raisin({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-rum_raisin',
});

// Combine font variables for the body
const fontVariables = [
  molle.variable,
  life_savers.variable,
  rum_raisin.variable,
].join(' ');

export const metadata: Metadata = {
  title: "Leslie's Happy Crafts",
  description: "Leslie's Happy Crafts",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className={`${fontVariables} antialiased min-h-screen bg-background text-foreground`}>
        <Providers>
            <div className="relative flex min-h-screen flex-col px-6 sm:px-4 lg:px-8">
              <MainNav />
              <main className="flex-1 sm:w-10/12 mx-auto mt-16">
                {children}
              </main>
            </div>
            <Toaster position="top-center" richColors />
            <DevTools />
          </Providers>
      </body>
    </html>
  );
}
