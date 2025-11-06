import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { headers } from 'next/headers'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-10-29.clover',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

// Helper function to handle successful payments
async function handlePaymentSuccess(session: Stripe.Checkout.Session) {
  // Here you can:
  // - Update order status in your database
  // - Send confirmation emails
  // - Update inventory
  // - Fulfill the order
  // - Clear shopping cart
  // etc.
  
  if (session.metadata?.items) {
    const items = JSON.parse(session.metadata.items)
    console.log('Items purchased:', items)
    console.log('Payment amount:', session.amount_total, 'Currency:', session.currency)
  }
  
  // Clear shopping cart after successful payment
  const userId = session.metadata?.userId
  console.log('Payment success - userId from metadata:', userId)
  
  if (userId) {
    try {
      // Create a direct Supabase client for webhooks (no cookies available)
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (!supabaseUrl || !supabaseAnonKey) {
        console.error('Missing Supabase environment variables')
        return
      }
      
      console.log('Attempting to delete shopping lists for user:', userId)
      const supabase = createClient(supabaseUrl, supabaseAnonKey)
      
      // First, check if lists exist
      const { data: existingLists, error: fetchError } = await supabase
        .from('shopping_lists')
        .select('id')
        .eq('user_id', userId)
      
      if (fetchError) {
        console.error('Error fetching shopping lists:', fetchError)
      } else {
        console.log(`Found ${existingLists?.length || 0} shopping lists to delete`)
      }
      
      // Delete all shopping lists for this user
      const { data: deletedData, error: deleteError } = await supabase
        .from('shopping_lists')
        .delete()
        .eq('user_id', userId)
        .select()
      
      if (deleteError) {
        console.error('Error clearing shopping cart:', deleteError)
        console.error('Delete error details:', JSON.stringify(deleteError, null, 2))
      } else {
        console.log(`Successfully deleted ${deletedData?.length || 0} shopping lists for user:`, userId)
      }
    } catch (error) {
      console.error('Error clearing shopping cart:', error)
      if (error instanceof Error) {
        console.error('Error message:', error.message)
        console.error('Error stack:', error.stack)
      }
    }
  } else {
    console.warn('No userId found in session metadata. Cannot clear shopping cart.')
  }
  
  // TODO: Add your order fulfillment logic here
  // Example:
  // - Update order status in database
  // - Send confirmation email
  // - Update inventory levels
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      )
    }

    if (!webhookSecret) {
      console.warn('STRIPE_WEBHOOK_SECRET is not set. Webhook verification skipped.')
      // In development, you might want to skip verification
      // In production, you should always verify webhooks
    }

    let event: Stripe.Event

    try {
      event = webhookSecret
        ? stripe.webhooks.constructEvent(body, signature, webhookSecret)
        : (JSON.parse(body) as Stripe.Event)
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Unknown error'
      console.error('Webhook signature verification failed:', error)
      return NextResponse.json(
        { error: `Webhook Error: ${error}` },
        { status: 400 }
      )
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const paymentStatus = session.payment_status
        
        // For immediate payment methods (card, link), payment is already confirmed
        if (paymentStatus === 'paid') {
          console.log('Payment confirmed for session:', session.id)
          await handlePaymentSuccess(session)
        } else {
          // For delayed payment methods like Boleto, wait for async_payment_succeeded
          console.log('Payment pending for session:', session.id, 'Status:', paymentStatus)
        }
        break
      }
      
      // Critical for Boleto: This event fires when the payment is confirmed after initial checkout
      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object as Stripe.Checkout.Session
        console.log('Boleto payment confirmed for session:', session.id)
        await handlePaymentSuccess(session)
        break
      }
      
      // Handle failed Boleto payments
      case 'checkout.session.async_payment_failed': {
        const session = event.data.object as Stripe.Checkout.Session
        console.error('Boleto payment failed for session:', session.id)
        
        // Here you can:
        // - Update order status to failed
        // - Notify the customer
        // - Release reserved inventory
        // etc.
        
        if (session.metadata?.items) {
          const items = JSON.parse(session.metadata.items)
          console.log('Failed payment for items:', items)
        }
        break
      }
      
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log('PaymentIntent succeeded:', paymentIntent.id)
        break
      }
      
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.error('PaymentIntent failed:', paymentIntent.id)
        break
      }
      
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

