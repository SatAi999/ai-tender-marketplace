import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function generateProposal(
  tenderInfo: {
    title: string
    description: string
    budget?: number
    deadline?: string
    requirements?: string
  },
  userProfile: {
    name?: string
    company?: string
    services?: string
  }
) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = `
      Generate a professional bid proposal for the following tender:
      
      Tender Title: ${tenderInfo.title}
      Description: ${tenderInfo.description}
      Budget: ${tenderInfo.budget ? `$${tenderInfo.budget}` : 'Not specified'}
      Deadline: ${tenderInfo.deadline || 'Not specified'}
      Requirements: ${tenderInfo.requirements || 'Not specified'}
      
      Bidder Information:
      Name: ${userProfile.name || 'Not provided'}
      Company: ${userProfile.company || 'Not provided'}
      Services: ${userProfile.services || 'Not provided'}
      
      Please create a comprehensive proposal that includes:
      1. Executive Summary
      2. Understanding of Requirements
      3. Proposed Solution/Approach
      4. Timeline and Deliverables
      5. Team and Experience
      6. Budget Breakdown (if budget is provided)
      7. Why We Are the Best Choice
      
      Make it professional, detailed, and compelling. Format it with clear sections and bullet points where appropriate.
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    return {
      success: true,
      proposal: text
    }
  } catch (error) {
    console.error('Error generating proposal:', error)
    return {
      success: false,
      error: 'Failed to generate proposal. Please try again.'
    }
  }
}

export async function generateTenderEmbedding(tenderText: string) {
  try {
    const model = genAI.getGenerativeModel({ model: 'text-embedding-004' })
    
    const result = await model.embedContent(tenderText)
    const embedding = result.embedding
    
    return {
      success: true,
      embedding: embedding.values
    }
  } catch (error) {
    console.error('Error generating embedding:', error)
    return {
      success: false,
      embedding: null
    }
  }
}
