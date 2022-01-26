import { Client, query as q } from 'faunadb'
import { SaveUser } from '../interfaces/User'

export class UserRepository implements SaveUser {
  private readonly fauna = new Client({
    secret: process.env.FAUNADB_SECRET_KEY,
    domain: 'db.us.fauna.com'
  })

  async saveUser (email: string): Promise<void> {
    await this.fauna.query(
      q.If(
        q.Not(
          q.Exists(
            q.Match(
              q.Index('user_by_email'),
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
            q.Index('user_by_email'),
            q.Casefold(email)
          )
        )
      )
    )
  }
}