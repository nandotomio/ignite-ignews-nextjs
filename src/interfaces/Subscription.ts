export interface GetSubscriptionPrice {
  getSubscriptionPrice (): Promise<SubscriptionPrice>
}

export type SubscriptionPrice = {
  priceId: string
  amount: string
}