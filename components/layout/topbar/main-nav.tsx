'use client';

import { Button } from '@/components/ui/button';
import { useSidebar } from '@/context/sidebar-context';
import { useIsAdmin } from '@/lib/hooks/useAdmin';
import { UserButton, useAuth, useUser } from '@clerk/nextjs';
import Image from 'next/image';
import Link from 'next/link';
import { LuMenu } from 'react-icons/lu';
import Container from '../Container';
import { useTheme } from 'next-themes';
import { Moon, Sun } from 'lucide-react';

export function MainNav() {
  const { userId, isLoaded: isAuthLoaded } = useAuth();
  const isAdmin = useIsAdmin();
  const { user } = useUser();
  const { open, setOpen, isMobile } = useSidebar();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const isDark = (theme ?? resolvedTheme) === 'dark';

  return (
    <header className="sticky top-0 z-40 flex items-center border-b backdrop-blur px-2 h-15 bg-sidebar">
      <Container className="w-full flex items-center">
        {!open && (
          <div className="mr-2 bg-hc-asphalt/30 rounded-sm p-1.5 border">
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
                    <p className="text-sm font-bold capitalize text-hc-orange/80">
                      Welcome, {user?.username || user?.firstName || 'User'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isAdmin && (
                      <span className="rounded-full border border-hc-orange/20 bg-hc-orange/10 p-1.5 text-xs font-semibold text-hc-orange/80 flex items-center gap-2">
                        <UserButton
                          appearance={{
                            elements: {
                              avatarBox:
                                'h-12 w-12 border-3 border-foreground/30', // user avatar
                              userButtonPopoverCard: 'rounded-lg shadow-xl', // dropdown menu card
                              userButtonPopoverFooter: 'bg-gray-50', // footer
                            },
                          }}>
                          <UserButton.MenuItems>
                            <UserButton.Action
                              label={isDark ? 'Light mode' : 'Dark mode'}
                              labelIcon={
                                isDark ? (
                                  <Sun className="h-4 w-4" />
                                ) : (
                                  <Moon className="h-4 w-4" />
                                )
                              }
                              onClick={() =>
                                setTheme(isDark ? 'light' : 'dark')
                              }
                            />
                            {/* You can add more items here, links, separators, etc. */}
                            {/* <UserButton.Link label="Settings" href="/settings" labelIcon={<Settings />} /> */}
                          </UserButton.MenuItems>
                        </UserButton>
                        Admin
                      </span>
                    )}
                    {!isAdmin && (
                      <UserButton
                        appearance={{
                          elements: {
                            avatarBox:
                              'h-12 w-12 border-3 border-foreground/30', // user avatar
                            userButtonPopoverCard: 'rounded-lg shadow-xl', // dropdown menu card
                            userButtonPopoverFooter: 'bg-gray-50', // footer
                          },
                        }}>
                        <UserButton.MenuItems>
                          <UserButton.Action
                            label={isDark ? 'Light mode' : 'Dark mode'}
                            labelIcon={
                              isDark ? (
                                <Sun className="h-4 w-4" />
                              ) : (
                                <Moon className="h-4 w-4" />
                              )
                            }
                            onClick={() => setTheme(isDark ? 'light' : 'dark')}
                          />
                          {/* You can add more items here, links, separators, etc. */}
                          {/* <UserButton.Link label="Settings" href="/settings" labelIcon={<Settings />} /> */}
                        </UserButton.MenuItems>
                      </UserButton>
                    )}
                    {/* MOBILE: open sidebar button */}
                    {isMobile && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setOpen(true)}
                        className="hover:bg-hc-cream border"
                        aria-label="Open sidebar">
                        <LuMenu className="h-14 w-14 " />
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
