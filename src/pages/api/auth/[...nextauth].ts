import NextAuth from 'next-auth'
import GithubProvider from 'next-auth/providers/github'

import { UserRepository } from '../../../services/UserRepository'

export default NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      authorization: {
        params: {
          scope: 'read:user'
        }
      }
    }),
  ],
  secret: process.env.NEXT_AUTH_SECRET,
  callbacks: {
    async signIn({ user }) {
      try {
        const userRepo = new UserRepository()
        await userRepo.saveUser(user.email)
        return true
      } catch (error) {
        return false
      }
    },
  }
})