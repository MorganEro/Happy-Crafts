'use client';

import { Button } from '@/components/ui/button';
import { useSidebar } from '@/context/sidebar-context';
import { useIsAdmin } from '@/lib/hooks/useAdmin';
import { UserButton, useAuth, useUser } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import { LuMenu } from 'react-icons/lu';
import Container from '../Container';

export function MainNav() {
  const { userId, isLoaded: isAuthLoaded } = useAuth();
  const isAdmin = useIsAdmin();
  const { user } = useUser();
  const { open, setOpen, isMobile } = useSidebar();

  return (
    <header className="sticky top-0 z-40 flex items-center border-b border-hc-cream bg-hc-offwhite/80 backdrop-blur px-2 h-15">
      <Container className="w-full flex items-center">
        {!open && (
          <div className="mr-2">
            <Link href="/">
              <Image
                src="/logo.svg"
                alt="Logo"
                width={48}
                height={48}
              />
            </Link>
          </div>
        )}

        <div className="flex items-center ml-auto">
          {isAuthLoaded && (
            <>
              {userId ? (
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="font-bold capitalize">
                      Welcome, {user?.username || user?.firstName || 'User'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isAdmin && (
                      <span className="rounded-full border border-primary/20 bg-primary/10 p-1.5 text-xs font-bold text-primary flex items-center gap-2">
                        <UserButton
                          appearance={{
                            elements: {
                              avatarBox: 'h-12 w-12 border-3 border-white/30', // user avatar
                              userButtonPopoverCard: 'rounded-lg shadow-xl', // dropdown menu card
                              userButtonPopoverFooter: 'bg-gray-50', // footer
                            },
                          }}
                        />
                        Admin
                      </span>
                    )}
                    {!isAdmin && (
                      <UserButton
                        appearance={{
                          elements: {
                            avatarBox: 'h-10 w-10 border-2 border-white', // user avatar
                            userButtonPopoverCard: 'rounded-lg shadow-xl', // dropdown menu card
                            userButtonPopoverFooter: 'bg-gray-50', // footer
                          },
                        }}
                      />
                    )}
                    {/* MOBILE: open sidebar button */}
                    {isMobile && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setOpen(true)}
                        className="hover:bg-hc-cream"
                        aria-label="Open sidebar">
                        <LuMenu className="h-10 w-10" />
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <Link href="/sign-in">
                  <Button
                    variant="default"
                    className="font-semibold">
                    Sign In
                  </Button>
                </Link>
              )}
            </>
          )}
        </div>
      </Container>
    </header>
  );
}
