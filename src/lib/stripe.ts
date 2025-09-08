import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
})

export const SUBSCRIPTION_PLANS = {
  free: {
    name: 'Free Plan',
    price: 0,
    tendersLimit: 3,
    proposalsLimit: 1,
    features: ['View 3 tenders', 'Generate 1 AI proposal']
  },
  paid: {
    name: 'Pro Plan',
    price: 2999, // $29.99 in cents
    tendersLimit: null, // unlimited
    proposalsLimit: null, // unlimited
    features: ['Unlimited tender views', 'Unlimited AI proposals', 'PDF downloads', 'Priority support']
  }
}

export async function createCheckoutSession(customerId: string, successUrl: string, cancelUrl: string) {
  try {
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: SUBSCRIPTION_PLANS.paid.name,
              description: 'Unlimited access to tender marketplace and AI proposal generation'
            },
            unit_amount: SUBSCRIPTION_PLANS.paid.price,
            recurring: {
              interval: 'month'
            }
          },
          quantity: 1
        }
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl
    })

    return { success: true, url: session.url }
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return { success: false, error: 'Failed to create checkout session' }
  }
}

export async function createCustomer(email: string, name?: string) {
  try {
    const customer = await stripe.customers.create({
      email,
      name
    })

    return { success: true, customer }
  } catch (error) {
    console.error('Error creating customer:', error)
    return { success: false, error: 'Failed to create customer' }
  }
}
