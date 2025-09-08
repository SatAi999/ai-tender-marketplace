'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Navbar } from '@/components/navbar'
import toast from 'react-hot-toast'

interface Tender {
  id: string
  title: string
  description: string
  budget?: number
  deadline?: string
  category?: string
  location?: string
  _count: {
    proposals: number
  }
}

interface Proposal {
  id: string
  content: string
  status: string
  createdAt: string
  tender: {
    title: string
  }
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tenders, setTenders] = useState<Tender[]>([])
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      fetchData()
    }
  }, [status, router])

  const fetchData = async () => {
    try {
      const [tendersRes, proposalsRes] = await Promise.all([
        fetch('/api/tenders?limit=5'),
        fetch('/api/proposals')
      ])

      if (tendersRes.ok) {
        const tendersData = await tendersRes.json()
        setTenders(tendersData.tenders || [])
      }

      if (proposalsRes.ok) {
        const proposalsData = await proposalsRes.json()
        setProposals(proposalsData.proposals || [])
      }
    } catch (error) {
      toast.error('Failed to fetch data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpgrade = async () => {
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
      })

      const data = await response.json()

      if (response.ok && data.url) {
        window.location.href = data.url
      } else {
        toast.error('Failed to create checkout session')
      }
    } catch (error) {
      toast.error('Something went wrong')
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {session.user.name || session.user.email}!</p>
        </div>

        {/* Subscription Status */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Subscription Status
                <Badge variant={session.user.subscriptionType === 'paid' ? 'default' : 'secondary'}>
                  {session.user.subscriptionType === 'paid' ? 'Pro Plan' : 'Free Plan'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {session.user.subscriptionType === 'free' ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      You're on the free plan. Upgrade for unlimited access!
                    </p>
                  </div>
                  <Button onClick={handleUpgrade}>
                    Upgrade to Pro
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-gray-600">
                  You have unlimited access to all features!
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Tenders */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Tenders</CardTitle>
              <CardDescription>Latest tender opportunities</CardDescription>
            </CardHeader>
            <CardContent>
              {tenders.length === 0 ? (
                <p className="text-gray-500">No tenders available</p>
              ) : (
                <div className="space-y-4">
                  {tenders.map((tender) => (
                    <div key={tender.id} className="border rounded-lg p-4">
                      <h3 className="font-semibold">{tender.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {tender.description.substring(0, 100)}...
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <div className="text-sm text-gray-500">
                          {tender.budget && `Budget: $${tender.budget.toLocaleString()}`}
                        </div>
                        <Link href={`/tenders/${tender.id}`}>
                          <Button size="sm">View Details</Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4">
                <Link href="/tenders">
                  <Button variant="outline" className="w-full">
                    View All Tenders
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* My Proposals */}
          <Card>
            <CardHeader>
              <CardTitle>My Proposals</CardTitle>
              <CardDescription>Your recent proposal submissions</CardDescription>
            </CardHeader>
            <CardContent>
              {proposals.length === 0 ? (
                <p className="text-gray-500">No proposals yet</p>
              ) : (
                <div className="space-y-4">
                  {proposals.map((proposal) => (
                    <div key={proposal.id} className="border rounded-lg p-4">
                      <h3 className="font-semibold">{proposal.tender.title}</h3>
                      <div className="flex justify-between items-center mt-2">
                        <Badge variant={proposal.status === 'draft' ? 'secondary' : 'default'}>
                          {proposal.status}
                        </Badge>
                        <Link href={`/proposals/${proposal.id}`}>
                          <Button size="sm" variant="outline">View</Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
