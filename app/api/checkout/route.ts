import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

// Initialize Stripe client inside the function to avoid module-level issues
function getStripeClient() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is not set')
  }
  
  // Clean the API key: Stripe keys only contain: letters, numbers, underscores, hyphens
  // Remove EVERYTHING else (quotes, whitespace, newlines, special chars, etc.)
  let cleanedKey = process.env.STRIPE_SECRET_KEY
    .trim()
    .replace(/^["']+|["']+$/g, '') // Remove surrounding quotes (single or double)
    .replace(/[\s\r\n\t]/g, '') // Remove ALL whitespace, newlines, carriage returns, tabs
    .replace(/[^a-zA-Z0-9_-]/g, '') // ONLY keep: letters, numbers, underscores, hyphens
  
  // Additional validation
  if (cleanedKey.length < 20) {
    throw new Error(`Stripe API key appears to be too short (${cleanedKey.length} chars). Please check your environment variable.`)
  }
  
  // Validate key format
  if (!cleanedKey.startsWith('sk_test_') && !cleanedKey.startsWith('sk_live_')) {
    console.error('Invalid Stripe key format. Key starts with:', cleanedKey.substring(0, 10))
    throw new Error('Invalid Stripe API key format. Key must start with sk_test_ or sk_live_')
  }
  
  // Log cleaned key info (safe - only first 10 chars)
  console.log('Cleaned Stripe key prefix:', cleanedKey.substring(0, 10), 'Length:', cleanedKey.length)
  
  return new Stripe(cleanedKey, {
    apiVersion: '2025-10-29.clover',
    timeout: 30000, // 30 second timeout
    maxNetworkRetries: 2,
    httpClient: Stripe.createFetchHttpClient(), // Use fetch for better Vercel compatibility
  })
}

export async function POST(request: NextRequest) {
  try {
    // Verify Stripe secret key is set
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not set')
      return NextResponse.json(
        { error: 'Stripe configuration error: Secret key is missing' },
        { status: 500 }
      )
    }

    // Log raw key info for debugging (safe - only first 10 chars)
    const rawKey = process.env.STRIPE_SECRET_KEY || ''
    console.log('Raw Stripe key prefix:', rawKey.substring(0, 10), 'Raw length:', rawKey.length, 'Has newlines:', rawKey.includes('\n'), 'Has quotes:', rawKey.includes('"') || rawKey.includes("'"))

    const stripe = getStripeClient()

    const body = await request.json()
    const { items, currency = 'brl', userId } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Items are required' },
        { status: 400 }
      )
    }

    // Calculate price for an item (1 dollar per letter)
    const calculatePrice = (item: string): number => {
      const letterCount = item.replace(/[^a-zA-Z]/g, '').length
      return letterCount
    }

    // Create line items for Stripe
    const lineItems = items.map((item: string) => {
      const priceInCents = Math.round(calculatePrice(item) * 100) // Convert to cents
      return {
        price_data: {
          currency: currency.toLowerCase(),
          product_data: {
            name: item,
            description: `Item: ${item}`,
          },
          unit_amount: priceInCents,
        },
        quantity: 1,
      }
    })

    // Get the origin from request headers or use environment variable
    const origin = request.headers.get('origin') || 
                   request.headers.get('host') ? 
                     `https://${request.headers.get('host')}` : 
                     process.env.NEXT_PUBLIC_APP_URL || 
                     process.env.VERCEL_URL ? 
                       `https://${process.env.VERCEL_URL}` : 
                       'https://shopaholic-mbcjdvn09-juan-de-souzas-projects-51f7e08a.vercel.app'

    // Create Stripe Checkout Session with Cards and Boleto payment methods
    // Note: Link is removed due to account/region limitations
    console.log('Creating Stripe checkout session with', lineItems.length, 'items')
    console.log('Origin:', origin)
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'boleto'],
      line_items: lineItems,
      mode: 'payment',
      currency: currency.toLowerCase(),
      success_url: `${origin}/?success=true`,
      cancel_url: `${origin}/?canceled=true`,
      metadata: {
        items: JSON.stringify(items),
        userId: userId || '', // Store user ID for clearing cart after payment
      },
      // For Boleto: allow delayed payment confirmation
      payment_method_options: {
        boleto: {
          expires_after_days: 3, // Boleto expires after 3 days
        },
      },
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    
    // Provide more detailed error messages
    let errorMessage = 'Failed to create checkout session'
    if (error instanceof Error) {
      errorMessage = error.message
      // Check for specific Stripe errors
      if (error.message.includes('No such API key')) {
        errorMessage = 'Stripe API key is invalid. Please check your STRIPE_SECRET_KEY environment variable.'
      } else if (error.message.includes('Invalid API Key')) {
        errorMessage = 'Stripe API key is invalid or expired.'
      } else if (error.message.includes('rate_limit')) {
        errorMessage = 'Stripe API rate limit exceeded. Please try again in a moment.'
      } else if (error.message.includes('network') || error.message.includes('ECONNREFUSED')) {
        errorMessage = 'Unable to connect to Stripe. Please check your internet connection and try again.'
      }
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

