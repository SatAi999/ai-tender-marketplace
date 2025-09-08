import { prisma } from '@/lib/prisma'

const sampleTenders = [
  {
    title: "Website Development for E-commerce Platform",
    description: "We need a modern, responsive e-commerce website with payment integration, inventory management, and customer support features. The platform should handle 1000+ products and support multiple payment methods.",
    budget: 15000,
    deadline: new Date('2025-12-01'),
    category: "Web Development",
    location: "Remote",
    requirements: "React.js, Node.js, PostgreSQL, Stripe integration, responsive design, SEO optimization"
  },
  {
    title: "Mobile App Development for Food Delivery",
    description: "Looking for experienced mobile app developers to create a food delivery application similar to UberEats. Features include real-time tracking, payment processing, restaurant management, and customer reviews.",
    budget: 25000,
    deadline: new Date('2026-02-15'),
    category: "Mobile Development",
    location: "New York, NY",
    requirements: "React Native or Flutter, real-time GPS tracking, payment gateway integration, push notifications"
  },
  {
    title: "Digital Marketing Campaign for Tech Startup",
    description: "Seeking a digital marketing agency to develop and execute a comprehensive marketing strategy for our AI-powered SaaS platform. Campaign should focus on lead generation and brand awareness.",
    budget: 8000,
    deadline: new Date('2025-11-30'),
    category: "Digital Marketing",
    location: "San Francisco, CA",
    requirements: "SEO, SEM, social media marketing, content creation, analytics reporting, B2B experience"
  },
  {
    title: "Data Analytics Platform Development",
    description: "Build a comprehensive data analytics platform that can process large datasets, create interactive dashboards, and provide real-time insights. The platform should support multiple data sources and export capabilities.",
    budget: 35000,
    deadline: new Date('2026-03-01'),
    category: "Data Science",
    location: "Remote",
    requirements: "Python, R, SQL, data visualization, machine learning, cloud deployment (AWS/Azure)"
  },
  {
    title: "Cybersecurity Audit and Implementation",
    description: "Comprehensive cybersecurity assessment and implementation of security measures for a financial services company. Includes penetration testing, security policy development, and staff training.",
    budget: 20000,
    deadline: new Date('2025-12-15'),
    category: "Cybersecurity",
    location: "Chicago, IL",
    requirements: "CISSP certification, penetration testing experience, compliance knowledge (SOX, PCI-DSS), security frameworks"
  },
  {
    title: "AI Chatbot Development for Customer Service",
    description: "Develop an intelligent chatbot system that can handle customer inquiries, provide product information, and escalate complex issues to human agents. Integration with existing CRM system required.",
    budget: 12000,
    deadline: new Date('2026-01-20'),
    category: "AI/ML",
    location: "Remote",
    requirements: "Natural Language Processing, machine learning, API integration, multi-language support"
  }
]

export async function seedTenders() {
  try {
    for (const tender of sampleTenders) {
      await prisma.tender.create({
        data: tender
      })
    }
    console.log('Sample tenders seeded successfully!')
  } catch (error) {
    console.error('Error seeding tenders:', error)
  }
}
