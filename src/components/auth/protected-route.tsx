'use client'

import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode
}) {
  const { isLoaded, userId } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && !userId) {
      // Redirect to sign-in page if user is not authenticated
      router.push('/sign-in?redirectUrl=' + encodeURIComponent(window.location.pathname))
    }
  }, [isLoaded, userId, router])

  if (!isLoaded || !userId) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    )
  }

  return <>{children}</>
}
