import { loadStripe } from '@stripe/stripe-js'

export async function redirectToStripeCheckout(sessionId: string): Promise<void> {
  const stripeJs = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY)
  stripeJs.redirectToCheckout({ sessionId })
}