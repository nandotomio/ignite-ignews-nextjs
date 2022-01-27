import { Client, query as q } from 'faunadb'
import { SaveUser } from '../interfaces/User'

type User = {
  ref: {
    id: string
  },
  data: {
    email: string
    stripe_customer_id: string
  }
}

export class UserRepository implements SaveUser {
  private readonly fauna = new Client({
    secret: process.env.FAUNADB_SECRET_KEY,
    domain: 'db.us.fauna.com'
  })

  async getUser(email: string): Promise<User> {
    return await this.fauna.query<User>(
      q.Get(
        q.Match(
          q.Index('users_by_email'),
          q.Casefold(email)
        )
      )
    )
  }

  async getUserByStripeCustomerId(stripeCustomerId: string): Promise<User> {
    return await this.fauna.query<User>(
      q.Get(
        q.Match(
          q.Index('users_by_stripe_customer_id'),
          stripeCustomerId
        )
      )
    )
  }

  async saveUserStripeCustomerId(userId: string, stripeCustomerId: string): Promise<void> {
    await this.fauna.query(
      q.Update(
        q.Ref(q.Collection('users'), userId),
        { data: { stripe_customer_id: stripeCustomerId } }
      )
    )
  }

  async saveUser (email: string): Promise<void> {
    await this.fauna.query(
      q.If(
        q.Not(
          q.Exists(
            q.Match(
              q.Index('users_by_email'),
              q.Casefold(email)
            )
          )
        ),
        q.Create(
          q.Collection('users'),
          { data: { email } }
        ),
        q.Get(
          q.Match(
            q.Index('users_by_email'),
            q.Casefold(email)
          )
        )
      )
    )
  }
}