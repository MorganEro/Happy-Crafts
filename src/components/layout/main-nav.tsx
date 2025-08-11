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
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-8">
          <Link href="/" className="text-xl font-bold">
            Happy Crafts
          </Link>
          <nav className="hidden space-x-6 md:flex">
            {routes.map((route) => (
              <Link
                key={route.path}
                href={route.path}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === route.path ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {route.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="relative">
            <ShoppingCart className="h-5 w-5" />
            <span className="sr-only">Cart</span>
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs text-white">
              0
            </span>
          </Button>

          {!isAuthLoading && isAdmin && (
            <Button variant="outline" size="sm" asChild>
              <Link href="/products/new" title="Add Product">
                <Plus className="h-4 w-4" aria-label="Add Product" />
              </Link>
            </Button>
          )}

          {isAuthLoaded && (
            <>
              {userId ? (
                <div className="flex items-center gap-4">
                  <div className="hidden md:block">
                    <p className="text-sm text-muted-foreground">Welcome,</p>
                    <p className="font-medium">{user?.username || user?.firstName || 'User'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <UserButton />
                    {isAdmin && (
                      <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                        Admin
                      </span>
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
