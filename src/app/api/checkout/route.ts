import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createCheckoutSession } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user || !user.stripeCustomerId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const baseUrl = req.headers.get('origin') || 'http://localhost:3000'
    const successUrl = `${baseUrl}/dashboard?payment=success`
    const cancelUrl = `${baseUrl}/dashboard?payment=cancelled`

    const result = await createCheckoutSession(
      user.stripeCustomerId,
      successUrl,
      cancelUrl
    )

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({ url: result.url })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
