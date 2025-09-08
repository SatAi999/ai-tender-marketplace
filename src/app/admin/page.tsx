'use client'

import { useState } from 'react'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import toast from 'react-hot-toast'

interface ScrapingResult {
  success: boolean
  count?: number
  tenders?: any[]
  message?: string
  error?: string
}

export default function AdminPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [scrapingResult, setScrapingResult] = useState<ScrapingResult | null>(null)
  const [stats, setStats] = useState<any>(null)

  const testScraping = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/scrape-tenders?test=true')
      const data = await response.json()
      
      setScrapingResult(data)
      if (data.success) {
        toast.success(`Test scraping successful! Found ${data.count} mock tenders`)
      } else {
        toast.error(data.error || 'Test scraping failed')
      }
    } catch (error) {
      toast.error('Error testing scraper')
      setScrapingResult({ success: false, error: 'Network error' })
    } finally {
      setIsLoading(false)
    }
  }

  const realScraping = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/scrape-tenders?test=false&maxPages=2')
      const data = await response.json()
      
      setScrapingResult(data)
      if (data.success) {
        toast.success(`Real scraping completed! Found ${data.count} tenders`)
      } else {
        toast.error(data.error || 'Real scraping failed')
      }
    } catch (error) {
      toast.error('Error scraping real data')
      setScrapingResult({ success: false, error: 'Network error' })
    } finally {
      setIsLoading(false)
    }
  }

  const importToDatabase = async () => {
    if (!scrapingResult?.tenders) {
      toast.error('No tender data to import')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/tenders/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'import',
          tenders: scrapingResult.tenders
        })
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success(data.message)
        getStats() // Refresh stats
      } else {
        toast.error(data.error || 'Import failed')
      }
    } catch (error) {
      toast.error('Error importing data')
    } finally {
      setIsLoading(false)
    }
  }

  const refreshDatabase = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/tenders/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'refresh'
        })
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success(data.message)
        getStats() // Refresh stats
      } else {
        toast.error(data.error || 'Refresh failed')
      }
    } catch (error) {
      toast.error('Error refreshing database')
    } finally {
      setIsLoading(false)
    }
  }

  const getStats = async () => {
    try {
      const response = await fetch('/api/tenders/import')
      const data = await response.json()
      
      if (data.success) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error getting stats:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Tender Scraping Admin</h1>
          <p className="text-gray-600">Manage and test tender data scraping from eprocure.gov.in</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Scraping Controls</CardTitle>
              <CardDescription>Test and manage tender data scraping</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={testScraping} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Processing...' : 'Test Scraping (Mock Data)'}
              </Button>
              
              <Button 
                onClick={realScraping} 
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                {isLoading ? 'Processing...' : 'Real Scraping (Live Data)'}
              </Button>
              
              <Button 
                onClick={importToDatabase} 
                disabled={isLoading || !scrapingResult?.tenders}
                className="w-full"
              >
                {isLoading ? 'Processing...' : 'Import to Database'}
              </Button>
              
              <Button 
                onClick={refreshDatabase} 
                disabled={isLoading}
                variant="destructive"
                className="w-full"
              >
                {isLoading ? 'Processing...' : 'Scrape & Import Fresh Data'}
              </Button>

              <Button 
                onClick={getStats} 
                variant="secondary"
                className="w-full"
              >
                Refresh Stats
              </Button>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Database Statistics</CardTitle>
              <CardDescription>Current tender data in database</CardDescription>
            </CardHeader>
            <CardContent>
              {stats ? (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Tenders:</span>
                    <span className="font-bold">{stats.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Scraped Tenders:</span>
                    <span className="font-bold">{stats.scraped}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Manual Tenders:</span>
                    <span className="font-bold">{stats.manual}</span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Click "Refresh Stats" to load data</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        {scrapingResult && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Scraping Results</CardTitle>
              <CardDescription>
                {scrapingResult.success ? 'Success' : 'Error'} - Last operation results
              </CardDescription>
            </CardHeader>
            <CardContent>
              {scrapingResult.success ? (
                <div>
                  <p className="mb-4">
                    <strong>Found {scrapingResult.count} tenders</strong>
                  </p>
                  {scrapingResult.message && (
                    <p className="text-blue-600 mb-4">{scrapingResult.message}</p>
                  )}
                  {scrapingResult.tenders && scrapingResult.tenders.length > 0 && (
                    <div className="max-h-96 overflow-y-auto">
                      <h3 className="font-semibold mb-2">Sample Tenders:</h3>
                      {scrapingResult.tenders.slice(0, 5).map((tender, index) => (
                        <div key={index} className="border p-3 mb-2 rounded">
                          <h4 className="font-medium">{tender.title}</h4>
                          <p className="text-sm text-gray-600">Ref: {tender.ref}</p>
                          <p className="text-sm text-gray-600">Org: {tender.organisation}</p>
                          <p className="text-sm text-gray-600">Closing: {tender.closingDate}</p>
                        </div>
                      ))}
                      {scrapingResult.tenders.length > 5 && (
                        <p className="text-sm text-gray-500">
                          ...and {scrapingResult.tenders.length - 5} more tenders
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-red-600">
                    <strong>Error:</strong> {scrapingResult.error}
                  </p>
                  {scrapingResult.message && (
                    <p className="text-gray-600 mt-2">{scrapingResult.message}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
