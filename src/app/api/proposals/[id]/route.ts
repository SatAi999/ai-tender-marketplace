import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const proposal = await prisma.proposal.findFirst({
      where: { 
        id,
        userId: session.user.id
      },
      include: {
        tender: {
          select: {
            title: true,
            budget: true,
            deadline: true
          }
        }
      }
    })

    if (!proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
    }

    return NextResponse.json({ proposal })
  } catch (error) {
    console.error('Error fetching proposal:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { content } = await req.json()

    const proposal = await prisma.proposal.findFirst({
      where: { 
        id,
        userId: session.user.id
      }
    })

    if (!proposal) {
      return NextResponse.json({ error: 'Proposal not found' }, { status: 404 })
    }

    if (proposal.status !== 'draft') {
      return NextResponse.json({ error: 'Cannot edit submitted proposal' }, { status: 400 })
    }

    const updatedProposal = await prisma.proposal.update({
      where: { id },
      data: { content },
      include: {
        tender: {
          select: {
            title: true,
            budget: true,
            deadline: true
          }
        }
      }
    })

    return NextResponse.json({ proposal: updatedProposal })
  } catch (error) {
    console.error('Error updating proposal:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
