import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { createCustomer } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, company, services } = await req.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create Stripe customer (optional - skip if not configured)
    let stripeCustomerId = null
    if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('your-stripe')) {
      const stripeCustomer = await createCustomer(email, name)
      if (stripeCustomer.success) {
        stripeCustomerId = stripeCustomer.customer!.id
      }
      // Continue even if Stripe customer creation fails
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        company,
        services,
        stripeCustomerId
      }
    })

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      message: 'User created successfully',
      user: userWithoutPassword
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
