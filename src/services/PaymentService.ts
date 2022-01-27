import Stripe from 'stripe'
import projectPkg from '../../package.json'
import { SubscriptionPrice, GetSubscriptionPrice } from '../interfaces/Subscription'
import { UserRepository } from '../services/UserRepository'

export class PaymentService implements GetSubscriptionPrice {
  private readonly stripe = new Stripe(process.env.STRIPE_API_KEY, {
    apiVersion: '2020-08-27',
    appInfo: {
      name: 'IgNews',
      version: projectPkg.version
    }
  })

  async getSubscriptionPrice(): Promise<SubscriptionPrice> {
    const { id, unit_amount } = await this.stripe.prices.retrieve(process.env.STRIPE_SUBSCRIPTION_PRICE_ID)
    const getFormattedAmount = (amount: number): string => new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
    return {
      priceId: id,
      amount: getFormattedAmount(unit_amount / 100)
    }
  }

  private async saveStripeCustomer(email: string): Promise<string> {
    const userRepo = new UserRepository()
    const user = await userRepo.getUser(email)
    let stripeCustomerId = user.data.stripe_customer_id
    if (!stripeCustomerId) {
      const stripeCustomer = await this.stripe.customers.create({
        email,
      })
      stripeCustomerId = stripeCustomer.id
      await userRepo.saveUserStripeCustomerId(user.ref.id, stripeCustomerId)
    }
    return stripeCustomerId
  }

  async createCheckoutSession(email: string): Promise<string> {
    const customerId = await this.saveStripeCustomer(email)
    const { priceId } = await this.getSubscriptionPrice()
    const checkoutSession = await this.stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      billing_address_collection: 'required',
      line_items: [
        { price: priceId, quantity: 1 }
      ],
      mode: 'subscription',
      allow_promotion_codes: true,
      success_url: process.env.STRIPE_SUCCESS_URL,
      cancel_url: process.env.STRIPE_CANCEL_URL
    })
    return checkoutSession.id
  }
}