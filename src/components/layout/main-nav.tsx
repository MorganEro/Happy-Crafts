'use client'

import { Button } from '@/components/ui/button'
import { useAdmin } from '@/hooks/use-admin'
import { useCurrentUser } from '@/hooks/use-current-user'
import { UserButton, useAuth } from '@clerk/nextjs'
import { Plus, ShoppingCart } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const routes = [
  { name: 'Home', path: '/' },
  { name: 'Products', path: '/products' },
]

export function MainNav() {
  const pathname = usePathname()
  const { userId, isLoaded: isAuthLoaded } = useAuth()
  const { data: user, isLoading: isUserLoading } = useCurrentUser()
  const { isAdmin, isLoading: isAuthLoading } = useAdmin()
  const router = useRouter()

  return (
    <header className="border-b fixed top-0 left-0 right-0 z-50 bg-blue-300">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-8">
          <Link href="/" className="text-2xl font-logo">
            HappyCrafts
          </Link>
          {/* <nav className="hidden space-x-6 md:flex">
            {routes.map((route) => (
              <Link
                key={route.path}
                href={route.path}
                className={`text-sm font-semibold transition-colors hover:text-primary ${
                  pathname === route.path ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {route.name}
              </Link>
            ))}
          </nav> */}
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
