import Stripe from 'stripe'
import projectPkg from '../../package.json'
import { SubscriptionPrice, GetSubscriptionPrice } from '../interfaces/Subscription'

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
}