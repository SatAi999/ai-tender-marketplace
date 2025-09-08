import { NextResponse } from 'next/server'
import { generateProposal } from '@/lib/ai'

export async function GET() {
  try {
    console.log('Testing AI proposal generation...')
    
    const testTender = {
      title: 'Test Website Development Project',
      description: 'We need a modern website built with Next.js and TypeScript',
      budget: 5000,
      deadline: '2025-12-31',
      requirements: 'Responsive design, SEO optimized, fast loading'
    }

    const testProfile = {
      name: 'Test Developer',
      company: 'Test Company',
      services: 'Web development, UI/UX design'
    }

    console.log('Calling generateProposal...')
    const result = await generateProposal(testTender, testProfile)
    console.log('AI generation result:', result)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Test error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
