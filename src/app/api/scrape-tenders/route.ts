import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import * as cheerio from 'cheerio'

interface TenderData {
  title: string
  ref: string
  closingDate: string
  organisation: string
  link: string
}

// Helper function to format date
function formatDate(dateStr: string): string {
  try {
    // Handle various date formats from the site
    const cleanDate = dateStr.trim().replace(/\s+/g, ' ')
    
    // Try parsing different date formats
    const formats = [
      /(\d{2})\/(\d{2})\/(\d{4})/,  // dd/mm/yyyy
      /(\d{2})-(\d{2})-(\d{4})/,   // dd-mm-yyyy
      /(\d{4})-(\d{2})-(\d{2})/    // yyyy-mm-dd
    ]
    
    for (const format of formats) {
      const match = cleanDate.match(format)
      if (match) {
        if (format === formats[2]) { // yyyy-mm-dd
          return `${match[1]}-${match[2]}-${match[3]}`
        } else { // dd/mm/yyyy or dd-mm-yyyy
          return `${match[3]}-${match[2]}-${match[1]}`
        }
      }
    }
    
    return cleanDate
  } catch (error) {
    return dateStr
  }
}

// Helper function to clean text
function cleanText(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

async function scrapeTenderPage(url: string, page: number = 1): Promise<TenderData[]> {
  try {
    console.log(`Scraping page ${page}: ${url}`)
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      timeout: 30000
    })

    const $ = cheerio.load(response.data)
    const tenders: TenderData[] = []

    // Look for tender data in various possible table structures
    const tenderSelectors = [
      'table tr:has(td)',
      '.table tr:has(td)',
      'tbody tr:has(td)',
      '[class*="tender"] tr:has(td)',
      '[id*="tender"] tr:has(td)'
    ]

    let foundTenders = false

    for (const selector of tenderSelectors) {
      const rows = $(selector)
      
      if (rows.length > 0) {
        console.log(`Found ${rows.length} rows with selector: ${selector}`)
        
        rows.each((index, element) => {
          try {
            const $row = $(element)
            const cells = $row.find('td')
            
            if (cells.length >= 4) { // Ensure we have enough columns
              let title = ''
              let ref = ''
              let closingDate = ''
              let organisation = ''
              let link = ''

              // Extract data from cells - adapt based on actual structure
              cells.each((cellIndex, cell) => {
                const $cell = $(cell)
                const cellText = cleanText($cell.text())
                
                // Look for links in any cell
                const cellLink = $cell.find('a').attr('href')
                if (cellLink) {
                  link = cellLink.startsWith('http') ? cellLink : `https://eprocure.gov.in${cellLink}`
                }

                // Heuristic matching based on content patterns
                if (cellIndex === 0 || cellText.toLowerCase().includes('tender') || cellText.length > 50) {
                  if (!title && cellText.length > 10) title = cellText
                }
                
                if (cellText.match(/^[A-Z0-9\/\-_]{8,}$/)) {
                  if (!ref) ref = cellText
                }
                
                if (cellText.match(/\d{2}[\/-]\d{2}[\/-]\d{4}/) || cellText.toLowerCase().includes('2025')) {
                  if (!closingDate) closingDate = formatDate(cellText)
                }
                
                if ((cellText.includes('Ministry') || cellText.includes('Department') || 
                     cellText.includes('Corporation') || cellText.includes('Ltd') ||
                     cellText.includes('Authority') || cellText.includes('Board')) && !organisation) {
                  organisation = cellText
                }
              })

              // Fallback: assign based on position if heuristics didn't work
              if (!title && cells.length > 0) title = cleanText($(cells[0]).text())
              if (!ref && cells.length > 1) ref = cleanText($(cells[1]).text())
              if (!closingDate && cells.length > 2) {
                const dateText = cleanText($(cells[2]).text())
                if (dateText.match(/\d{2}[\/-]\d{2}[\/-]\d{4}/)) {
                  closingDate = formatDate(dateText)
                }
              }
              if (!organisation && cells.length > 3) organisation = cleanText($(cells[3]).text())

              // Only add if we have meaningful data
              if (title && title.length > 5 && ref && ref.length > 3) {
                tenders.push({
                  title: title.substring(0, 200), // Limit title length
                  ref,
                  closingDate: closingDate || 'Not specified',
                  organisation: organisation || 'Not specified',
                  link: link || ''
                })
                foundTenders = true
              }
            }
          } catch (error) {
            console.error('Error parsing row:', error)
          }
        })

        if (foundTenders) break // Stop if we found tenders with this selector
      }
    }

    // If no structured data found, try alternative approaches
    if (!foundTenders) {
      // Look for any text patterns that might contain tender information
      const bodyText = $('body').text()
      const tenderMatches = bodyText.match(/tender[^.]*?(\d{4})/gi)
      
      if (tenderMatches && tenderMatches.length > 0) {
        tenderMatches.slice(0, 5).forEach((match, index) => {
          tenders.push({
            title: cleanText(match.substring(0, 100)),
            ref: `REF-${Date.now()}-${index}`,
            closingDate: 'Not specified',
            organisation: 'Government of India',
            link: url
          })
        })
      }
    }

    console.log(`Extracted ${tenders.length} tenders from page ${page}`)
    return tenders

  } catch (error) {
    console.error(`Error scraping page ${page}:`, error)
    throw error
  }
}

async function getAllTenders(baseUrl: string, maxPages: number = 3): Promise<TenderData[]> {
  const allTenders: TenderData[] = []
  
  for (let page = 1; page <= maxPages; page++) {
    try {
      // Try different pagination URL patterns
      const urls = [
        page === 1 ? baseUrl : `${baseUrl}?page=${page}`,
        page === 1 ? baseUrl : `${baseUrl}&page=${page}`,
        page === 1 ? baseUrl : `${baseUrl}/page/${page}`
      ]

      let pageTenders: TenderData[] = []
      
      for (const url of urls) {
        try {
          pageTenders = await scrapeTenderPage(url, page)
          if (pageTenders.length > 0) break
        } catch (error) {
          console.log(`Failed with URL pattern: ${url}`)
          continue
        }
      }

      if (pageTenders.length === 0) {
        console.log(`No tenders found on page ${page}, stopping pagination`)
        break
      }

      allTenders.push(...pageTenders)
      
      // Add delay between requests to be respectful
      if (page < maxPages) {
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
      
    } catch (error) {
      console.error(`Error on page ${page}:`, error)
      break
    }
  }

  return allTenders
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const maxPages = parseInt(searchParams.get('maxPages') || '3')
    const testMode = searchParams.get('test') === 'true'

    let baseUrl = 'https://eprocure.gov.in/epublish/app'
    
    // In test mode, return mock data
    if (testMode) {
      const mockTenders: TenderData[] = [
        {
          title: "Supply of Computer Equipment for Government Offices",
          ref: "TENDER/2025/COMP/001",
          closingDate: "2025-10-15",
          organisation: "Ministry of Electronics and Information Technology",
          link: "https://eprocure.gov.in/epublish/app/tender/001"
        },
        {
          title: "Construction of Road Infrastructure Project",
          ref: "TENDER/2025/INFRA/002",
          closingDate: "2025-11-20",
          organisation: "Ministry of Road Transport and Highways",
          link: "https://eprocure.gov.in/epublish/app/tender/002"
        },
        {
          title: "Medical Equipment Procurement for Hospitals",
          ref: "TENDER/2025/MED/003",
          closingDate: "2025-10-30",
          organisation: "Ministry of Health and Family Welfare",
          link: "https://eprocure.gov.in/epublish/app/tender/003"
        }
      ]

      return NextResponse.json({
        success: true,
        count: mockTenders.length,
        tenders: mockTenders,
        message: 'Test mode - returning mock data'
      })
    }

    console.log('Starting tender scraping...')
    const tenders = await getAllTenders(baseUrl, maxPages)

    // Remove duplicates based on reference number
    const uniqueTenders = tenders.filter((tender, index, self) =>
      index === self.findIndex(t => t.ref === tender.ref)
    )

    console.log(`Scraping completed. Found ${uniqueTenders.length} unique tenders`)

    return NextResponse.json({
      success: true,
      count: uniqueTenders.length,
      tenders: uniqueTenders,
      scrapedAt: new Date().toISOString(),
      source: 'eprocure.gov.in'
    })

  } catch (error) {
    console.error('Scraping error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to scrape tender data',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, maxPages = 3 } = body

    if (!url) {
      return NextResponse.json({
        success: false,
        error: 'URL is required'
      }, { status: 400 })
    }

    console.log(`Custom URL scraping: ${url}`)
    const tenders = await getAllTenders(url, maxPages)

    const uniqueTenders = tenders.filter((tender, index, self) =>
      index === self.findIndex(t => t.ref === tender.ref)
    )

    return NextResponse.json({
      success: true,
      count: uniqueTenders.length,
      tenders: uniqueTenders,
      scrapedAt: new Date().toISOString(),
      source: url
    })

  } catch (error) {
    console.error('Custom scraping error:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to scrape tender data from custom URL',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
