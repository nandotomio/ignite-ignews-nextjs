import { Client, query as q } from 'faunadb'

export type SubscriptionData = {
  id: string
  userId: string
  status: string
  price_id: string
}

type Subscription = {
  ref: {
    id: string
  },
  data: SubscriptionData
}

export class SubscriptionRepository {
  private readonly fauna = new Client({
    secret: process.env.FAUNADB_SECRET_KEY,
    domain: 'db.us.fauna.com'
  })

  async saveSubscription(data: SubscriptionData): Promise<void> {
    await this.fauna.query(
      q.Create(
        q.Collection('subscriptions'),
        { data }
      )
    )
  }

  async replaceSubscription(data: SubscriptionData): Promise<void> {
    const subscription = await this.fauna.query<Subscription>(
      q.Get(
        q.Match(
          q.Index('subscriptions_by_id'),
          data.id
        )
      )
    )
    await this.fauna.query(
      q.Replace(
        q.Ref(q.Collection('subscriptions'), subscription.ref.id),
        { data }
      )
    )
  }
}