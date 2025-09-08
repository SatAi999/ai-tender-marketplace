# AI-Powered Tender Marketplace

A modern, AI-enabled bidder marketplace website where users can discover relevant tenders, generate professional proposals using AI, and manage their bidding pipeline with integrated payment processing.

## 🚀 Features

### Core Functionality
- **User Authentication**: Secure sign-up/login with email and password
- **User Profiles**: Customizable profiles with company information and services
- **Tender Discovery**: Browse and search through available tenders with advanced filters
- **AI Proposal Generation**: Generate professional proposals using Google Gemini AI
- **Dashboard Analytics**: Track saved tenders, proposals, and subscription status
- **Payment Integration**: Subscription-based access with Stripe payment processing

### AI-Powered Features
- **Smart Recommendations**: AI-powered tender recommendations based on user profile
- **Proposal Generation**: Automated proposal creation using Google Gemini AI
- **Vector Search**: Advanced search capabilities using embeddings (optional Pinecone integration)

### Subscription Plans
- **Free Plan**: 
  - View 3 tenders
  - Generate 1 AI proposal
  - Basic dashboard
- **Pro Plan ($29.99/month)**:
  - Unlimited tender views
  - Unlimited AI proposals
  - PDF downloads
  - Priority support
  - Advanced analytics

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes (serverless functions)
- **Database**: SQLite with Prisma ORM
- **Authentication**: NextAuth.js
- **AI Integration**: Google Gemini API
- **Payments**: Stripe
- **Vector Search**: Pinecone (optional)
- **UI Components**: Shadcn/ui
- **Notifications**: React Hot Toast

## 📋 Prerequisites

Before running this application, make sure you have:

- Node.js 18+ installed
- npm or yarn package manager
- Google Gemini API key
- Stripe account and API keys
- (Optional) Pinecone account for vector search

## 🔧 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd ai-tender-marketplace
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `.env.local` and fill in your API keys:
   ```env
   # Database
   DATABASE_URL="file:./dev.db"

   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-nextauth-secret-here"

   # Google Gemini AI
   GEMINI_API_KEY="your-gemini-api-key-here"

   # Stripe
   STRIPE_PUBLISHABLE_KEY="your-stripe-publishable-key-here"
   STRIPE_SECRET_KEY="your-stripe-secret-key-here"
   STRIPE_WEBHOOK_SECRET="your-stripe-webhook-secret-here"

   # Pinecone (Optional)
   PINECONE_API_KEY="your-pinecone-api-key-here"
   PINECONE_ENVIRONMENT="your-pinecone-environment-here"
   PINECONE_INDEX="tender-recommendations"
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Seed sample data (optional)**
   ```bash
   # Run the application first, then call:
   curl -X POST http://localhost:3000/api/seed
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🚀 Deployment

### Deploy to Vercel

1. **Connect your repository to Vercel**
   - Push your code to GitHub
   - Import the repository in Vercel dashboard

2. **Configure environment variables**
   - Add all environment variables in Vercel dashboard
   - Make sure to update `NEXTAUTH_URL` to your production domain

3. **Deploy**
   - Vercel will automatically deploy your application
   - The database will be created automatically on first run

## 📚 API Documentation

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/[...nextauth]` - NextAuth.js authentication

### Tenders
- `GET /api/tenders` - List tenders with search and filters
- `GET /api/tenders/[id]` - Get tender details

### Proposals
- `GET /api/proposals` - List user's proposals
- `POST /api/proposals/generate` - Generate AI proposal
- `GET /api/proposals/[id]` - Get proposal details
- `PUT /api/proposals/[id]` - Update proposal

### Payments
- `POST /api/checkout` - Create Stripe checkout session

### Utilities
- `POST /api/seed` - Seed sample tender data

## 🏗 Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard page
│   ├── tenders/           # Tender listing and details
│   ├── proposals/         # Proposal management
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # UI components (shadcn/ui)
│   └── navbar.tsx        # Navigation component
├── lib/                  # Utility libraries
│   ├── auth.ts           # NextAuth configuration
│   ├── ai.ts             # AI/Gemini integration
│   ├── stripe.ts         # Stripe integration
│   ├── prisma.ts         # Prisma client
│   └── seed.ts           # Sample data seeding
├── types/                # TypeScript type definitions
└── generated/            # Generated Prisma client
```

This project is a complete AI-powered tender marketplace with all the features outlined in the PRD!
