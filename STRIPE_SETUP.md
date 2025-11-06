# Stripe Payment Integration Setup

This project uses Stripe with Cards and Boleto payment methods for Brazilian customers.

> **Note:** Link payment method was removed due to account/region limitations. If you need Link, contact Stripe support to enable it for your account.

## Environment Variables

The `.env.local` file should contain the following variables:

```env
# Stripe Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here

# Required for production: Webhook secret for verifying webhook events
# STRIPE_WEBHOOK_SECRET=whsec_...
```

## Features

- **Payment Methods**: Cards, Link, and Boleto payment methods
- **Shopping Cart Checkout**: The "Checkout" button in the Shopping Cart component processes all items
- **Price Calculation**: Each item's price is calculated as $1 per letter (converted to BRL)
- **Webhook Support**: Payment success/failure events are handled via webhook endpoint
- **Boleto Support**: Properly handles delayed payment notifications for Boleto payments

## Payment Methods

1. **Cards**: Credit and debit cards (immediate payment)
2. **Boleto**: Brazilian bank slip payment (delayed payment - requires webhook setup)

### Important: Boleto Payment Handling

Boleto is a delayed notification payment method. Funds are not immediately available. The webhook handler properly handles:
- `checkout.session.completed` - For immediate payment methods (Cards)
- `checkout.session.async_payment_succeeded` - **Critical for Boleto** - Fires when payment is confirmed
- `checkout.session.async_payment_failed` - Handles failed Boleto payments

**Always use webhooks to fulfill orders for Boleto payments** - do not fulfill orders on the success page redirect.

## API Routes

- `/api/checkout` - Creates a Stripe Checkout session with Cards and Boleto payment methods
- `/api/webhooks/stripe` - Handles Stripe webhook events (payment success, failure, async payments, etc.)

## Usage

1. Add items to your shopping cart
2. Click the "Checkout" button at the bottom of the cart
3. You'll be redirected to Stripe Checkout with available payment options
4. Complete the payment using your preferred method:
   - **Cards**: Immediate payment confirmation
   - **Boleto**: Bank slip that must be paid within 3 days

## Webhook Setup (Required for Production)

1. Go to your Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events to listen for:
   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded` (critical for Boleto)
   - `checkout.session.async_payment_failed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
4. Copy the webhook signing secret and add it to `.env.local` as `STRIPE_WEBHOOK_SECRET`

## Testing

These are test keys. For production:
1. Replace test keys with live keys
2. Set up webhook endpoint in Stripe Dashboard
3. Add `STRIPE_WEBHOOK_SECRET` to environment variables
4. Enable Cards and Boleto in your Stripe Dashboard (Settings > Payment methods)
