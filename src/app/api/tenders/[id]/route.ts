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

    const tender = await prisma.tender.findUnique({
      where: { id },
      include: {
        _count: {
          select: { proposals: true }
        }
      }
    })

    if (!tender) {
      return NextResponse.json({ error: 'Tender not found' }, { status: 404 })
    }

    return NextResponse.json({ tender })
  } catch (error) {
    console.error('Error fetching tender:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
