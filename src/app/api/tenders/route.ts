import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const budgetMin = searchParams.get('budgetMin')
    const budgetMax = searchParams.get('budgetMax')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check user's subscription limits
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Apply limits for free users
    if (user.subscriptionType === 'free' && user.tendersViewed >= 3) {
      return NextResponse.json({
        error: 'Tender viewing limit reached. Please upgrade to view more tenders.',
        needsUpgrade: true
      }, { status: 403 })
    }

    const skip = (page - 1) * limit

    const where: any = {}

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (category) {
      where.category = category
    }

    if (budgetMin || budgetMax) {
      where.budget = {}
      if (budgetMin) where.budget.gte = parseFloat(budgetMin)
      if (budgetMax) where.budget.lte = parseFloat(budgetMax)
    }

    const [tenders, total] = await Promise.all([
      prisma.tender.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { proposals: true }
          }
        }
      }),
      prisma.tender.count({ where })
    ])

    // Update user's tender view count for free users
    if (user.subscriptionType === 'free') {
      await prisma.user.update({
        where: { id: user.id },
        data: { tendersViewed: user.tendersViewed + 1 }
      })
    }

    return NextResponse.json({
      tenders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching tenders:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
