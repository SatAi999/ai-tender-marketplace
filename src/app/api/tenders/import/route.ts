import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { importScrapedTenders, refreshTenderData } from '@/lib/tender-scraper'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, tenders } = body

    if (action === 'import' && tenders) {
      // Import provided tender data
      const result = await importScrapedTenders(tenders)
      
      return NextResponse.json({
        success: true,
        message: `Successfully imported ${result.imported} out of ${result.total} tenders`,
        imported: result.imported,
        total: result.total,
        tenders: result.tenders
      })
    } else if (action === 'refresh') {
      // Scrape and import fresh data
      const result = await refreshTenderData()
      
      return NextResponse.json({
        success: true,
        message: `Successfully refreshed tender data. Imported ${result.imported} new tenders`,
        imported: result.imported,
        total: result.total,
        tenders: result.tenders
      })
    } else {
      return NextResponse.json({
        success: false,
        error: 'Invalid action. Use "import" with tenders data or "refresh" to scrape new data'
      }, { status: 400 })
    }

  } catch (error) {
    console.error('Import/refresh error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to process tender data',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get status of scraped tenders
    const { prisma } = await import('@/lib/prisma')
    
    const stats = await prisma.tender.groupBy({
      by: ['isScraped'],
      _count: {
        id: true
      }
    })

    const scrapedCount = stats.find(s => s.isScraped)?._count.id || 0
    const manualCount = stats.find(s => !s.isScraped)?._count.id || 0
    
    return NextResponse.json({
      success: true,
      stats: {
        total: scrapedCount + manualCount,
        scraped: scrapedCount,
        manual: manualCount
      }
    })

  } catch (error) {
    console.error('Stats error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to get tender statistics'
    }, { status: 500 })
  }
}
