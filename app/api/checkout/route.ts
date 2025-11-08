import { NextRequest, NextResponse } from 'next/server'

// Clean and validate Stripe API key
function cleanStripeKey(rawKey: string): string {
  if (!rawKey) {
    throw new Error('STRIPE_SECRET_KEY is not set')
  }
  
  // Clean the API key: Stripe keys only contain: letters, numbers, underscores, hyphens
  // Remove EVERYTHING else (quotes, whitespace, newlines, special chars, etc.)
  let cleanedKey = rawKey
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
  
  return cleanedKey
}

// We're using fetch API directly, not the Stripe SDK, to avoid HTTP client issues

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

    // Get raw key and clean it IMMEDIATELY - before any Stripe code runs
    const rawKey = process.env.STRIPE_SECRET_KEY || ''
    
    // Log raw key info for debugging (safe - only first 10 chars)
    const hasNewlines = rawKey.includes('\n') || rawKey.includes('\r')
    const hasQuotes = rawKey.includes('"') || rawKey.includes("'")
    const hasSpaces = rawKey.includes(' ')
    const hasInvalidChars = /[^a-zA-Z0-9_-]/.test(rawKey.replace(/^["']+|["']+$/g, '').replace(/[\s\r\n\t]/g, ''))
    
    console.log('=== STRIPE KEY DEBUG ===')
    console.log('Raw key prefix:', rawKey.substring(0, 10))
    console.log('Raw key length:', rawKey.length)
    console.log('Has newlines:', hasNewlines)
    console.log('Has quotes:', hasQuotes)
    console.log('Has spaces:', hasSpaces)
    console.log('Has invalid chars:', hasInvalidChars)
    
    // Clean and validate the key IMMEDIATELY
    const cleanedKey = cleanStripeKey(rawKey)
    console.log('Cleaned key prefix:', cleanedKey.substring(0, 12))
    console.log('Cleaned key length:', cleanedKey.length)
    console.log('Cleaned key is valid:', cleanedKey.startsWith('sk_test_') || cleanedKey.startsWith('sk_live_'))
    
    // CRITICAL: Override environment variable with cleaned key IMMEDIATELY
    // This must happen before ANY Stripe SDK code runs
    process.env.STRIPE_SECRET_KEY = cleanedKey
    
    // Additional validation: check for any control characters or invalid HTTP header chars
    const invalidChars = cleanedKey.match(/[\x00-\x1F\x7F]/)
    if (invalidChars) {
      console.error('Found invalid characters in cleaned key:', invalidChars)
      throw new Error('Cleaned Stripe key contains invalid characters for HTTP headers')
    }
    
    // Verify cleaned key has no invalid characters for HTTP headers
    const hasInvalidHeaderChars = /[\r\n\t\x00-\x1F\x7F]/.test(cleanedKey)
    console.log('Cleaned key has invalid header chars:', hasInvalidHeaderChars)
    console.log('Key character codes (first 20):', Array.from(cleanedKey.substring(0, 20)).map(c => c.charCodeAt(0)).join(','))
    console.log('Key matches pattern [a-zA-Z0-9_-]+:', /^[a-zA-Z0-9_-]+$/.test(cleanedKey))
    console.log('========================')
    
    if (hasInvalidHeaderChars) {
      throw new Error('Cleaned Stripe key still contains invalid characters for HTTP headers')
    }
    
    // NOTE: We're using fetch API directly, not Stripe SDK, to avoid HTTP client issues
    // The Stripe client creation is removed since we make direct API calls

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

    // Create Stripe Checkout Session directly using fetch API to avoid SDK HTTP client issues
    // This ensures we have full control over the Authorization header
    console.log('Creating Stripe checkout session with', lineItems.length, 'items')
    console.log('Origin:', origin)
    
    const checkoutSessionData = {
      payment_method_types: ['card', 'boleto'],
      line_items: lineItems,
      mode: 'payment',
      currency: currency.toLowerCase(),
      success_url: `${origin}/?success=true`,
      cancel_url: `${origin}/?canceled=true`,
      metadata: {
        items: JSON.stringify(items),
        userId: userId || '',
      },
      payment_method_options: {
        boleto: {
          expires_after_days: 3,
        },
      },
    }
    
    // Make direct API call to Stripe using fetch
    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cleanedKey}`, // Use cleaned key directly
        'Content-Type': 'application/x-www-form-urlencoded',
        'Stripe-Version': '2025-10-29.clover',
      },
      body: new URLSearchParams({
        ...Object.entries(checkoutSessionData).reduce((acc, [key, value]) => {
          if (value === null || value === undefined) return acc
          if (typeof value === 'object' && !Array.isArray(value)) {
            // Handle nested objects like metadata and payment_method_options
            if (key === 'metadata') {
              Object.entries(value as Record<string, string>).forEach(([k, v]) => {
                acc[`metadata[${k}]`] = v
              })
            } else if (key === 'payment_method_options') {
              Object.entries(value as Record<string, any>).forEach(([k, v]) => {
                if (typeof v === 'object') {
                  Object.entries(v).forEach(([k2, v2]) => {
                    acc[`payment_method_options[${k}][${k2}]`] = String(v2)
                  })
                }
              })
            }
          } else if (Array.isArray(value)) {
            // Handle arrays like payment_method_types and line_items
            if (key === 'payment_method_types') {
              value.forEach((v, i) => {
                acc[`payment_method_types[${i}]`] = v
              })
            } else if (key === 'line_items') {
              value.forEach((item: any, i: number) => {
                Object.entries(item).forEach(([k, v]) => {
                  if (typeof v === 'object' && v !== null) {
                    Object.entries(v).forEach(([k2, v2]) => {
                      if (typeof v2 === 'object' && v2 !== null) {
                        Object.entries(v2).forEach(([k3, v3]) => {
                          acc[`line_items[${i}][${k}][${k2}][${k3}]`] = String(v3)
                        })
                      } else {
                        acc[`line_items[${i}][${k}][${k2}]`] = String(v2)
                      }
                    })
                  } else {
                    acc[`line_items[${i}][${k}]`] = String(v)
                  }
                })
              })
            }
          } else {
            acc[key] = String(value)
          }
          return acc
        }, {} as Record<string, string>),
      }),
    })
    
    if (!stripeResponse.ok) {
      const errorText = await stripeResponse.text()
      console.error('Stripe API error:', errorText)
      throw new Error(`Stripe API error: ${stripeResponse.status} ${stripeResponse.statusText}`)
    }
    
    const session = await stripeResponse.json()
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

