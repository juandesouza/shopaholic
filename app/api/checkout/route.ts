import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
})

export async function POST(request: NextRequest) {
  try {
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

    // Create Stripe Checkout Session with Cards and Boleto payment methods
    // Note: Link is removed due to account/region limitations
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'boleto'],
      line_items: lineItems,
      mode: 'payment',
      currency: currency.toLowerCase(),
      success_url: `${request.headers.get('origin') || 'http://localhost:3000'}/?success=true`,
      cancel_url: `${request.headers.get('origin') || 'http://localhost:3000'}/?canceled=true`,
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
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}

