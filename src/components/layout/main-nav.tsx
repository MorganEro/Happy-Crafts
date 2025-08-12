'use client'

import { Button } from '@/components/ui/button'
import { useAdmin } from '@/hooks/use-admin'
import { useCurrentUser } from '@/hooks/use-current-user'
import { UserButton, useAuth } from '@clerk/nextjs'
import { ShoppingCart } from 'lucide-react'
import Link from 'next/link'

export function MainNav() {
  const { userId, isLoaded: isAuthLoaded } = useAuth()
  const { data: user } = useCurrentUser()
  const { isAdmin } = useAdmin()

  return (
    <header className="border-b fixed top-0 left-0 right-0 z-50 bg-blue-300">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-8">
          <Link href="/" className="text-2xl font-logo">
            HappyCrafts
          </Link>
        </div>

        <div className="flex items-center space-x-4">


          <Button variant="ghost" size="icon" className="relative">
            <ShoppingCart className="h-5 w-5" />
            <span className="sr-only">Cart</span>
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs text-white">
              0
            </span>
          </Button>

          {isAuthLoaded && (
            <>
              {userId ? (
                <div className="flex items-center gap-4">
                  <div className="hidden md:block">
                    <p className="text-sm">Welcome,</p>
                    <p className="font-bold capitalize">{user?.username || user?.firstName || 'User'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isAdmin && (
                      <span className="rounded-full border border-primary/20 bg-primary/10 p-1.5 text-xs font-bold text-primary flex items-center gap-2">
                        <UserButton />
                        Admin
                      </span>
                    )}
                    {!isAdmin && (
                      <UserButton />
                    )}
                  </div>
                </div>
              ) : (
                <Button asChild variant="ghost">
                  <Link href="/sign-in">Sign In</Link>
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  )
}
