import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            AI-Powered Tender Marketplace
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Discover relevant tenders, generate winning proposals with AI, and grow your business with our intelligent bidding platform.
          </p>
          
          <div className="flex gap-4 justify-center mb-16">
            <Link href="/auth/signup">
              <Button size="lg" className="px-8 py-3">
                Get Started
              </Button>
            </Link>
            <Link href="/auth/signin">
              <Button variant="outline" size="lg" className="px-8 py-3">
                Sign In
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <Link href="/tenders" className="transform transition-transform hover:scale-105">
              <div className="bg-white p-6 rounded-lg shadow-lg cursor-pointer hover:shadow-xl">
                <div className="text-3xl mb-4">🎯</div>
                <h3 className="text-xl font-semibold mb-2">Smart Tender Discovery</h3>
                <p className="text-gray-600">
                  AI-powered recommendations help you find the most relevant tenders for your business.
                </p>
                <div className="mt-4">
                  <Button variant="outline" className="w-full">
                    Browse Tenders
                  </Button>
                </div>
              </div>
            </Link>
            
            <Link href="/auth/signin" className="transform transition-transform hover:scale-105">
              <div className="bg-white p-6 rounded-lg shadow-lg cursor-pointer hover:shadow-xl">
                <div className="text-3xl mb-4">✨</div>
                <h3 className="text-xl font-semibold mb-2">AI Proposal Generation</h3>
                <p className="text-gray-600">
                  Generate compelling, professional proposals in minutes using advanced AI technology.
                </p>
                <div className="mt-4">
                  <Button variant="outline" className="w-full">
                    Try AI Generation
                  </Button>
                </div>
              </div>
            </Link>
            
            <Link href="/dashboard" className="transform transition-transform hover:scale-105">
              <div className="bg-white p-6 rounded-lg shadow-lg cursor-pointer hover:shadow-xl">
                <div className="text-3xl mb-4">📊</div>
                <h3 className="text-xl font-semibold mb-2">Dashboard Analytics</h3>
                <p className="text-gray-600">
                  Track your proposals, monitor success rates, and manage your bidding pipeline.
                </p>
                <div className="mt-4">
                  <Button variant="outline" className="w-full">
                    View Dashboard
                  </Button>
                </div>
              </div>
            </Link>
          </div>

          <div className="mt-16 bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-3xl font-bold mb-6">Pricing Plans</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="border-2 border-gray-200 p-6 rounded-lg">
                <h3 className="text-2xl font-bold mb-4">Free Plan</h3>
                <p className="text-3xl font-bold text-blue-600 mb-4">$0<span className="text-lg font-normal">/month</span></p>
                <ul className="text-left space-y-2 mb-6">
                  <li>✓ View 3 tenders</li>
                  <li>✓ Generate 1 AI proposal</li>
                  <li>✓ Basic dashboard</li>
                </ul>
                <Link href="/auth/signup">
                  <Button variant="outline" className="w-full">
                    Start Free
                  </Button>
                </Link>
              </div>
              
              <div className="border-2 border-blue-500 p-6 rounded-lg relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm">
                  Popular
                </div>
                <h3 className="text-2xl font-bold mb-4">Pro Plan</h3>
                <p className="text-3xl font-bold text-blue-600 mb-4">$29.99<span className="text-lg font-normal">/month</span></p>
                <ul className="text-left space-y-2 mb-6">
                  <li>✓ Unlimited tender views</li>
                  <li>✓ Unlimited AI proposals</li>
                  <li>✓ PDF downloads</li>
                  <li>✓ Priority support</li>
                  <li>✓ Advanced analytics</li>
                </ul>
                <Link href="/auth/signup">
                  <Button className="w-full">
                    Upgrade to Pro
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
