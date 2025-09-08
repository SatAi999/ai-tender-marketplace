import { prisma } from './prisma'

interface ScrapedTender {
  title: string
  ref: string
  closingDate: string
  organisation: string
  link: string
}

export async function importScrapedTenders(scrapedTenders: ScrapedTender[]) {
  try {
    const importedTenders = []

    for (const tender of scrapedTenders) {
      try {
        // Check if tender already exists by reference number
        const existingTender = await prisma.tender.findUnique({
          where: { referenceNumber: tender.ref }
        })

        if (!existingTender) {
          // Parse closing date
          let deadline: Date | undefined
          try {
            if (tender.closingDate !== 'Not specified') {
              deadline = new Date(tender.closingDate)
              if (isNaN(deadline.getTime())) {
                deadline = undefined
              }
            }
          } catch (error) {
            console.log(`Could not parse date: ${tender.closingDate}`)
            deadline = undefined
          }

          // Determine category based on title keywords
          const title = tender.title.toLowerCase()
          let category = 'Other'
          
          if (title.includes('construction') || title.includes('building') || title.includes('infrastructure')) {
            category = 'Construction'
          } else if (title.includes('supply') || title.includes('procurement') || title.includes('equipment')) {
            category = 'Procurement'
          } else if (title.includes('service') || title.includes('maintenance') || title.includes('consulting')) {
            category = 'Services'
          } else if (title.includes('software') || title.includes('technology') || title.includes('computer') || title.includes('IT')) {
            category = 'Technology'
          } else if (title.includes('medical') || title.includes('health') || title.includes('hospital')) {
            category = 'Healthcare'
          }

          // Generate a reasonable budget estimate based on category and keywords
          let estimatedBudget: number | undefined
          if (title.includes('crore')) {
            const croreMatch = title.match(/(\d+(?:\.\d+)?)\s*crore/i)
            if (croreMatch) {
              estimatedBudget = parseFloat(croreMatch[1]) * 10000000 // Convert crores to rupees
            }
          } else if (title.includes('lakh')) {
            const lakhMatch = title.match(/(\d+(?:\.\d+)?)\s*lakh/i)
            if (lakhMatch) {
              estimatedBudget = parseFloat(lakhMatch[1]) * 100000 // Convert lakhs to rupees
            }
          } else {
            // Default budget estimates based on category
            const budgetRanges = {
              'Construction': { min: 5000000, max: 100000000 },
              'Procurement': { min: 500000, max: 50000000 },
              'Services': { min: 100000, max: 10000000 },
              'Technology': { min: 1000000, max: 25000000 },
              'Healthcare': { min: 2000000, max: 75000000 },
              'Other': { min: 500000, max: 20000000 }
            }
            
            const range = budgetRanges[category as keyof typeof budgetRanges] || budgetRanges.Other
            estimatedBudget = Math.floor(Math.random() * (range.max - range.min)) + range.min
          }

          const newTender = await prisma.tender.create({
            data: {
              title: tender.title,
              description: `${tender.title}\n\nOrganisation: ${tender.organisation}\n\nThis tender has been imported from eprocure.gov.in. For complete details and application, please visit the official tender portal.`,
              budget: estimatedBudget,
              deadline: deadline,
              category: category,
              location: tender.organisation.includes('Ministry') ? 'New Delhi' : 'India',
              requirements: `Please refer to the official tender document for detailed requirements and specifications.`,
              referenceNumber: tender.ref,
              sourceUrl: tender.link || 'https://eprocure.gov.in',
              organisation: tender.organisation,
              isScraped: true
            }
          })

          importedTenders.push(newTender)
        }
      } catch (error) {
        console.error(`Error importing tender ${tender.ref}:`, error)
      }
    }

    return {
      success: true,
      imported: importedTenders.length,
      total: scrapedTenders.length,
      tenders: importedTenders
    }

  } catch (error) {
    console.error('Error importing scraped tenders:', error)
    throw error
  }
}

export async function refreshTenderData() {
  try {
    // Call the scraping API
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/scrape-tenders?test=false`, {
      method: 'GET'
    })

    if (!response.ok) {
      throw new Error('Failed to scrape tender data')
    }

    const data = await response.json()

    if (data.success && data.tenders) {
      const result = await importScrapedTenders(data.tenders)
      return result
    } else {
      throw new Error(data.message || 'No tender data received')
    }

  } catch (error) {
    console.error('Error refreshing tender data:', error)
    throw error
  }
}
