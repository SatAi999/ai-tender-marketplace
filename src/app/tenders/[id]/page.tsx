'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Navbar } from '@/components/navbar'
import { Calendar, DollarSign, MapPin, Users, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

interface Tender {
  id: string
  title: string
  description: string
  budget?: number
  deadline?: string
  category?: string
  location?: string
  requirements?: string
  createdAt: string
  _count: {
    proposals: number
  }
}

export default function TenderDetail() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const [tender, setTender] = useState<Tender | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      fetchTender()
    }
  }, [status, router, params.id])

  const fetchTender = async () => {
    try {
      const response = await fetch(`/api/tenders/${params.id}`)
      
      if (response.ok) {
        const data = await response.json()
        setTender(data.tender)
      } else {
        toast.error('Tender not found')
        router.push('/tenders')
      }
    } catch (error) {
      toast.error('Failed to fetch tender details')
    } finally {
      setLoading(false)
    }
  }

  const generateProposal = async () => {
    setGenerating(true)
    
    try {
      const response = await fetch('/api/proposals/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tenderId: tender?.id }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Proposal generated successfully!')
        router.push(`/proposals/${data.proposal.id}`)
      } else {
        if (data.needsUpgrade) {
          toast.error(data.error)
          // Optionally redirect to upgrade page
        } else {
          toast.error(data.error || 'Failed to generate proposal')
        }
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setGenerating(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getDaysUntilDeadline = (deadline: string) => {
    const today = new Date()
    const deadlineDate = new Date(deadline)
    const diffTime = deadlineDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4">Loading tender...</p>
        </div>
      </div>
    )
  }

  if (!session || !tender) {
    return null
  }

  const daysLeft = tender.deadline ? getDaysUntilDeadline(tender.deadline) : null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button 
              variant="outline" 
              onClick={() => router.back()}
              className="mb-4"
            >
              ← Back to Tenders
            </Button>
            
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{tender.title}</h1>
                {tender.category && (
                  <Badge variant="secondary" className="mb-4">
                    {tender.category}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Key Information */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Tender Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {tender.budget && (
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 text-green-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Budget</p>
                      <p className="font-semibold">${tender.budget.toLocaleString()}</p>
                    </div>
                  </div>
                )}
                
                {tender.deadline && (
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-blue-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Deadline</p>
                      <p className="font-semibold">{formatDate(tender.deadline)}</p>
                      {daysLeft !== null && (
                        <p className={`text-xs ${daysLeft <= 7 ? 'text-red-600' : 'text-gray-500'}`}>
                          {daysLeft > 0 ? `${daysLeft} days left` : 'Deadline passed'}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                
                {tender.location && (
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-purple-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Location</p>
                      <p className="font-semibold">{tender.location}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-orange-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Proposals</p>
                    <p className="font-semibold">{tender._count.proposals}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p className="whitespace-pre-line">{tender.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Requirements */}
          {tender.requirements && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="whitespace-pre-line">{tender.requirements}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center">
            <Button
              onClick={generateProposal}
              disabled={generating || (daysLeft !== null && daysLeft <= 0)}
              size="lg"
              className="px-8"
            >
              {generating ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Generating Proposal...
                </>
              ) : (
                '✨ Generate AI Proposal'
              )}
            </Button>
            
            {session.user.subscriptionType === 'free' && (
              <Button
                variant="outline"
                onClick={() => router.push('/upgrade')}
                size="lg"
              >
                Upgrade for Unlimited Access
              </Button>
            )}
          </div>

          {daysLeft !== null && daysLeft <= 0 && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-center">
              <p className="text-red-600 font-medium">
                This tender deadline has passed. You can no longer submit proposals.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
