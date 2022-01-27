import { NextApiHandler } from 'next'
import { Readable } from 'stream'
import Stripe from 'stripe'
import { PaymentService } from '../../services/PaymentService'
import { saveSubscription } from './_lib/ManageSubscription'

async function streamBuffer(readable: Readable): Promise<Buffer> {
  const chunks = []

  for await (const chunk of readable) {
    chunks.push(
      typeof chunk === 'string' ? Buffer.from(chunk) : chunk
    )
  }
  return Buffer.concat(chunks)
}

export const config = {
  api: {
    bodyParser: false
  }
}

const relevantEvents = new Set([
  'checkout.session.completed',
  'customer.subscription.updated',
  'customer.subscription.deleted'
])

const apiHandler: NextApiHandler = async (req, res) => {
  if (req.method === 'POST') {
    const buffer = await streamBuffer(req)
    const secret = req.headers['stripe-signature'] as string

    let event: Stripe.Event

    try {
      const paymentService = new PaymentService()
      event = paymentService.createStripeEvent(buffer, secret)
    } catch (error) {
      res.status(400).send(`Webhook error: ${error.message}`)
    }

    const { type } = event

    if (relevantEvents.has(type)) {
      try {
        switch (type) {
          case 'customer.subscription.updated':
          case 'customer.subscription.deleted':
            const subscription = event.data.object as Stripe.Subscription

            await saveSubscription(
              subscription.id,
              subscription.customer.toString()
            )

            break
          case 'checkout.session.completed':

            const checkoutSession = event.data.object as Stripe.Checkout.Session

            await saveSubscription(
              checkoutSession.subscription.toString(),
              checkoutSession.customer.toString(),
              true
            )

            break
          default:
            throw new Error('Unhandled event.')
        }
      } catch (error) {
        return res.json({ error: 'Webhook handler failed.' })
      }
    }


    res.json({ received: true })
  } else {
    res.setHeader('Allow', 'POST')
    res.status(405).end('Method not allowed')
  }
}

export default apiHandler