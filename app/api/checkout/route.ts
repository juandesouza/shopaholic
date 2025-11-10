import { NextRequest, NextResponse } from 'next/server'

// Validate and clean Stripe API key following Stripe's instructions
function getStripeSecretKey(): string {
  // Step 1: Check if environment variable is set
  const rawKey = process.env.STRIPE_SECRET_KEY
  
  if (!rawKey) {
    throw new Error('STRIPE_SECRET_KEY environment variable is not set in Vercel. Please add it in Settings → Environment Variables.')
  }
  
  // Step 2: Clean the key - remove any whitespace, quotes, or invalid characters
  // Stripe keys should only contain: letters, numbers, underscores, hyphens
  let cleanedKey = rawKey
    .trim() // Remove leading/trailing whitespace
    .replace(/^["']+|["']+$/g, '') // Remove surrounding quotes
    .replace(/[\s\r\n\t]/g, '') // Remove all whitespace, newlines, tabs
  
  // Step 3: Validate key format - must start with sk_test_ or sk_live_
  if (!cleanedKey.startsWith('sk_test_') && !cleanedKey.startsWith('sk_live_')) {
    console.error('Invalid Stripe key format. Expected key starting with sk_test_ or sk_live_')
    console.error('Key prefix received:', cleanedKey.substring(0, 15))
    throw new Error('Invalid Stripe API key format. The key must start with sk_test_ or sk_live_. Please check your STRIPE_SECRET_KEY in Vercel environment variables.')
  }
  
  // Step 4: Validate key contains only valid characters for HTTP headers
  // Valid characters: a-z, A-Z, 0-9, _, -
  const validKeyPattern = /^[a-zA-Z0-9_-]+$/
  if (!validKeyPattern.test(cleanedKey)) {
    const invalidChars = cleanedKey.split('').filter(c => !/[a-zA-Z0-9_-]/.test(c))
    console.error('Invalid characters found in Stripe key:', invalidChars.map(c => `'${c}' (code: ${c.charCodeAt(0)})`).join(', '))
    throw new Error(`STRIPE_SECRET_KEY contains invalid characters that cannot be used in HTTP headers. Please check your Vercel environment variable and ensure it contains only letters, numbers, underscores, and hyphens.`)
  }
  
  // Step 5: Validate key length (Stripe keys are typically 100+ characters)
  if (cleanedKey.length < 50) {
    throw new Error(`STRIPE_SECRET_KEY appears to be too short (${cleanedKey.length} characters). Please verify you copied the complete key from Stripe Dashboard.`)
  }
  
  // Log validation success (safe - only first 12 chars)
  console.log('Stripe key validated successfully. Prefix:', cleanedKey.substring(0, 12), 'Length:', cleanedKey.length)
  
  return cleanedKey
}

export async function POST(request: NextRequest) {
  try {
    // Get and validate Stripe secret key following Stripe's instructions
    // Reference: https://stripe.com/docs/keys
    const stripeSecretKey = getStripeSecretKey()

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
    // Determine protocol: use http for localhost, https for production
    const getOrigin = (): string => {
      // Check if we have an origin header (includes protocol)
      const originHeader = request.headers.get('origin')
      if (originHeader) {
        return originHeader
      }
      
      // Get host from headers
      const host = request.headers.get('host')
      if (host) {
        // Check if it's localhost or 127.0.0.1 - use http for local development
        const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1') || host.includes('0.0.0.0')
        const protocol = isLocalhost ? 'http' : 'https'
        return `${protocol}://${host}`
      }
      
      // Check environment variables
      if (process.env.NEXT_PUBLIC_APP_URL) {
        return process.env.NEXT_PUBLIC_APP_URL
      }
      
      if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`
      }
      
      // Fallback to production URL
      return 'https://shopaholic-mbcjdvn09-juan-de-souzas-projects-51f7e08a.vercel.app'
    }
    
    const origin = getOrigin()

    // Create Stripe Checkout Session using direct API call
    // Using fetch API to have full control over the Authorization header
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
    
    // Final validation: Test that the key can be used in an HTTP Authorization header
    // This catches any remaining invalid characters before making the request
    try {
      // Test header construction - if this throws, the key has invalid characters
      const testHeader = `Bearer ${stripeSecretKey}`
      // Check for any characters that would cause ERR_INVALID_CHAR
      if (/[\r\n\t\x00-\x1F\x7F]/.test(testHeader)) {
        throw new Error('Stripe key contains invalid characters for HTTP headers')
      }
    } catch (headerError) {
      console.error('Failed to construct Authorization header:', headerError)
      return NextResponse.json(
        { 
          error: 'Invalid Stripe API key format in Vercel environment variable. Please check your STRIPE_SECRET_KEY in Vercel Settings → Environment Variables. The key must contain only letters, numbers, underscores, and hyphens with no spaces, quotes, or special characters.',
          details: 'The key cannot be used in HTTP headers due to invalid characters.'
        },
        { status: 500 }
      )
    }
    
    // Make direct API call to Stripe using fetch
    // The Authorization header uses the validated and cleaned key
    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`, // Use validated key
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
    
    // Provide detailed error messages following Stripe's troubleshooting guide
    let errorMessage = 'Failed to create checkout session'
    let errorDetails = ''
    
    if (error instanceof Error) {
      errorMessage = error.message
      
      // Check for specific error types
      if (error.message.includes('STRIPE_SECRET_KEY') || error.message.includes('environment variable')) {
        errorDetails = 'Please check your Vercel Settings → Environment Variables and ensure STRIPE_SECRET_KEY is set correctly. The key should start with sk_test_ or sk_live_ and contain no spaces, quotes, or special characters.'
      } else if (error.message.includes('Invalid character') || error.message.includes('ERR_INVALID_CHAR')) {
        errorMessage = 'Invalid Stripe API key format in Vercel environment variable'
        errorDetails = 'The STRIPE_SECRET_KEY in Vercel contains invalid characters that cannot be used in HTTP headers. Please: 1) Go to Vercel Dashboard → Your Project → Settings → Environment Variables, 2) Delete the existing STRIPE_SECRET_KEY, 3) Add it again by copying the key directly from Stripe Dashboard (https://dashboard.stripe.com/test/apikeys), ensuring no extra spaces or characters are included, 4) Redeploy your project.'
      } else if (error.message.includes('No such API key') || error.message.includes('Invalid API Key')) {
        errorMessage = 'Stripe API key is invalid or expired'
        errorDetails = 'Please verify your STRIPE_SECRET_KEY in Vercel matches the key in your Stripe Dashboard (https://dashboard.stripe.com/test/apikeys). Make sure you\'re using the Secret key (starts with sk_test_), not the Publishable key.'
      } else if (error.message.includes('rate_limit')) {
        errorMessage = 'Stripe API rate limit exceeded'
        errorDetails = 'Please try again in a moment.'
      } else if (error.message.includes('network') || error.message.includes('ECONNREFUSED')) {
        errorMessage = 'Unable to connect to Stripe'
        errorDetails = 'This may be a temporary network issue. Please try again.'
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        ...(errorDetails && { details: errorDetails })
      },
      { status: 500 }
    )
  }
}

