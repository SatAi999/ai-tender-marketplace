import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateProposal } from '@/lib/ai'

export async function POST(req: NextRequest) {
  try {
    const { tenderId } = await req.json()

    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
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
    if (user.subscriptionType === 'free' && user.proposalsGenerated >= 1) {
      return NextResponse.json({
        error: 'Proposal generation limit reached. Please upgrade to generate more proposals.',
        needsUpgrade: true
      }, { status: 403 })
    }

    // Get tender details
    const tender = await prisma.tender.findUnique({
      where: { id: tenderId }
    })

    if (!tender) {
      return NextResponse.json({ error: 'Tender not found' }, { status: 404 })
    }

    // Generate proposal using AI
    const result = await generateProposal(
      {
        title: tender.title,
        description: tender.description,
        budget: tender.budget || undefined,
        deadline: tender.deadline?.toISOString(),
        requirements: tender.requirements || undefined
      },
      {
        name: user.name || undefined,
        company: user.company || undefined,
        services: user.services || undefined
      }
    )

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    // Save proposal to database
    const proposal = await prisma.proposal.create({
      data: {
        userId: user.id,
        tenderId: tender.id,
        content: result.proposal!,
        status: 'draft'
      }
    })

    // Update user's proposal count for free users
    if (user.subscriptionType === 'free') {
      await prisma.user.update({
        where: { id: user.id },
        data: { proposalsGenerated: user.proposalsGenerated + 1 }
      })
    }

    return NextResponse.json({
      proposal,
      message: 'Proposal generated successfully'
    })
  } catch (error) {
    console.error('Error generating proposal:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
