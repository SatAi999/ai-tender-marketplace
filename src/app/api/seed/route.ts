import { NextRequest, NextResponse } from 'next/server'
import { seedTenders } from '@/lib/seed'

export async function POST(req: NextRequest) {
  try {
    await seedTenders()
    return NextResponse.json({ message: 'Sample tenders seeded successfully!' })
  } catch (error) {
    console.error('Error seeding data:', error)
    return NextResponse.json(
      { error: 'Failed to seed data' },
      { status: 500 }
    )
  }
}
