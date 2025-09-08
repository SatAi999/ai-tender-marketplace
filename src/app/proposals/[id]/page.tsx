'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Navbar } from '@/components/navbar'
import { Download, Edit, Save, X } from 'lucide-react'
import toast from 'react-hot-toast'

interface Proposal {
  id: string
  content: string
  status: string
  createdAt: string
  tender: {
    title: string
    budget?: number
    deadline?: string
  }
}

export default function ProposalDetail() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const [proposal, setProposal] = useState<Proposal | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editedContent, setEditedContent] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      fetchProposal()
    }
  }, [status, router, params.id])

  const fetchProposal = async () => {
    try {
      const response = await fetch(`/api/proposals/${params.id}`)
      
      if (response.ok) {
        const data = await response.json()
        setProposal(data.proposal)
        setEditedContent(data.proposal.content)
      } else {
        toast.error('Proposal not found')
        router.push('/dashboard')
      }
    } catch (error) {
      toast.error('Failed to fetch proposal')
    } finally {
      setLoading(false)
    }
  }

  const saveProposal = async () => {
    try {
      const response = await fetch(`/api/proposals/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: editedContent }),
      })

      if (response.ok) {
        const data = await response.json()
        setProposal(data.proposal)
        setEditing(false)
        toast.success('Proposal updated successfully!')
      } else {
        toast.error('Failed to update proposal')
      }
    } catch (error) {
      toast.error('Something went wrong')
    }
  }

  const downloadPDF = async () => {
    try {
      const response = await fetch(`/api/proposals/${params.id}/pdf`)
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `proposal-${proposal?.tender.title}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success('PDF downloaded successfully!')
      } else {
        toast.error('Failed to download PDF')
      }
    } catch (error) {
      toast.error('Something went wrong')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4">Loading proposal...</p>
        </div>
      </div>
    )
  }

  if (!session || !proposal) {
    return null
  }

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
              ← Back
            </Button>
            
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">Proposal for: {proposal.tender.title}</h1>
                <div className="flex items-center gap-4 mb-4">
                  <Badge variant={proposal.status === 'draft' ? 'secondary' : 'default'}>
                    {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                  </Badge>
                  <span className="text-sm text-gray-600">
                    Created: {formatDate(proposal.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tender Info */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Tender Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {proposal.tender.budget && (
                  <div>
                    <p className="text-sm text-gray-600">Budget</p>
                    <p className="font-semibold">${proposal.tender.budget.toLocaleString()}</p>
                  </div>
                )}
                {proposal.tender.deadline && (
                  <div>
                    <p className="text-sm text-gray-600">Deadline</p>
                    <p className="font-semibold">{formatDate(proposal.tender.deadline)}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Proposal Content */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Proposal Content</CardTitle>
                <div className="flex gap-2">
                  {!editing ? (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => setEditing(true)}
                        disabled={proposal.status !== 'draft'}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        onClick={downloadPDF}
                        disabled={session.user.subscriptionType === 'free'}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button onClick={saveProposal}>
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditing(false)
                          setEditedContent(proposal.content)
                        }}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              </div>
              {proposal.status !== 'draft' && (
                <CardDescription>
                  This proposal has been submitted and cannot be edited.
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {editing ? (
                <Textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="min-h-[400px] font-mono text-sm"
                  placeholder="Edit your proposal content..."
                />
              ) : (
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap font-sans">{proposal.content}</pre>
                </div>
              )}
            </CardContent>
          </Card>

          {session.user.subscriptionType === 'free' && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-blue-800 mb-4">
                    Upgrade to Pro to download your proposals as PDF documents!
                  </p>
                  <Button onClick={() => router.push('/upgrade')}>
                    Upgrade Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
