'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Navbar } from '@/components/navbar'
import { Search, Calendar, DollarSign, MapPin } from 'lucide-react'
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
  referenceNumber?: string
  sourceUrl?: string
  organisation?: string
  isScraped?: boolean
  createdAt: string
  _count: {
    proposals: number
  }
}

export default function Tenders() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tenders, setTenders] = useState<Tender[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated') {
      fetchTenders()
    }
  }, [status, router])

  const fetchTenders = async () => {
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (categoryFilter) params.append('category', categoryFilter)

      const response = await fetch(`/api/tenders?${params}`)
      
      if (response.ok) {
        const data = await response.json()
        setTenders(data.tenders)
      } else {
        const data = await response.json()
        if (data.needsUpgrade) {
          toast.error(data.error)
        } else {
          toast.error('Failed to fetch tenders')
        }
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setLoading(true)
    fetchTenders()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4">Loading tenders...</p>
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
          <h1 className="text-3xl font-bold mb-4">Browse Tenders</h1>
          
          {/* Search and Filters */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search tenders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="">All Categories</option>
              <option value="Construction">Construction</option>
              <option value="Procurement">Procurement</option>
              <option value="Services">Services</option>
              <option value="Technology">Technology</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Web Development">Web Development</option>
              <option value="Mobile Development">Mobile Development</option>
              <option value="Digital Marketing">Digital Marketing</option>
              <option value="Data Science">Data Science</option>
              <option value="Cybersecurity">Cybersecurity</option>
              <option value="AI/ML">AI/ML</option>
              <option value="Other">Other</option>
            </select>
            <Button onClick={handleSearch}>Search</Button>
          </div>
        </div>

        {/* Tenders Grid */}
        {tenders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <p className="text-gray-500 mb-4">No tenders found</p>
              <Button onClick={() => {
                setSearchTerm('')
                setCategoryFilter('')
                fetchTenders()
              }}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {tenders.map((tender) => (
              <Card key={tender.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-xl">{tender.title}</CardTitle>
                        {tender.isScraped && (
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                            Live Data
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="text-gray-600">
                        {tender.description.length > 200 
                          ? `${tender.description.substring(0, 200)}...` 
                          : tender.description}
                      </CardDescription>
                      {tender.organisation && (
                        <p className="text-sm text-blue-600 mt-1">
                          {tender.organisation}
                        </p>
                      )}
                    </div>
                    <div className="ml-4 flex flex-col gap-2">
                      {tender.category && (
                        <Badge variant="secondary">
                          {tender.category}
                        </Badge>
                      )}
                      {tender.referenceNumber && (
                        <Badge variant="outline" className="text-xs">
                          {tender.referenceNumber}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    {tender.budget && (
                      <div className="flex items-center text-sm text-gray-600">
                        <DollarSign className="h-4 w-4 mr-2" />
                        Budget: ${tender.budget.toLocaleString()}
                      </div>
                    )}
                    {tender.deadline && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        Deadline: {formatDate(tender.deadline)}
                      </div>
                    )}
                    {tender.location && (
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        {tender.location}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      {tender._count.proposals} proposals submitted
                    </span>
                    <Link href={`/tenders/${tender.id}`}>
                      <Button>View Details</Button>
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
