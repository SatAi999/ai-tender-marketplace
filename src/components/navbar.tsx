'use client'

import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function Navbar() {
  const { data: session } = useSession()

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            TenderMarket
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            {session ? (
              <>
                <Link href="/dashboard" className="text-gray-700 hover:text-blue-600">
                  Dashboard
                </Link>
                <Link href="/tenders" className="text-gray-700 hover:text-blue-600">
                  Tenders
                </Link>
                <Link href="/proposals" className="text-gray-700 hover:text-blue-600">
                  My Proposals
                </Link>
                <Link href="/admin" className="text-gray-700 hover:text-blue-600">
                  Admin
                </Link>
              </>
            ) : (
              <>
                <Link href="/features" className="text-gray-700 hover:text-blue-600">
                  Features
                </Link>
                <Link href="/pricing" className="text-gray-700 hover:text-blue-600">
                  Pricing
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {session ? (
              <>
                <span className="text-sm text-gray-600">
                  {session.user.name || session.user.email}
                </span>
                <Button
                  variant="outline"
                  onClick={() => signOut({ callbackUrl: '/' })}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/signin">
                  <Button variant="outline">Sign In</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button>Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
