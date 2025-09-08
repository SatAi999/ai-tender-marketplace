'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, FileText, Eye } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface Proposal {
  id: string
  content: string
  status: string
  createdAt: string
  tender: {
    id: string
    title: string
    budget?: number
    deadline?: string
  }
}

export default function Proposals() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      fetchProposals()
    }
  }, [status, router])

  const fetchProposals = async () => {
    try {
      const response = await fetch('/api/proposals')
      
      if (response.ok) {
        const data = await response.json()
        setProposals(data.proposals)
      } else {
        toast.error('Failed to fetch proposals')
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'submitted':
        return 'bg-blue-100 text-blue-800'
      case 'accepted':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Proposals</h1>
            <p className="text-gray-600 mt-2">
              Manage and track your AI-generated proposals
            </p>
          </div>
          <Link href="/tenders">
            <Button>
              <FileText className="w-4 h-4 mr-2" />
              Create New Proposal
            </Button>
          </Link>
        </div>

        {proposals.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No proposals yet
              </h3>
              <p className="text-gray-600 mb-4">
                Start by browsing tenders and generating your first AI proposal
              </p>
              <Link href="/tenders">
                <Button>Browse Tenders</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {proposals.map((proposal) => (
              <Card key={proposal.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">
                        {proposal.tender.title}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            Created: {formatDate(proposal.createdAt)}
                          </span>
                          {proposal.tender.budget && (
                            <span>Budget: ${proposal.tender.budget.toLocaleString()}</span>
                          )}
                          {proposal.tender.deadline && (
                            <span>Deadline: {formatDate(proposal.tender.deadline)}</span>
                          )}
                        </div>
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(proposal.status)}>
                      {proposal.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <p className="text-gray-600">
                      {proposal.content.substring(0, 150)}...
                    </p>
                    <Link href={`/proposals/${proposal.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
