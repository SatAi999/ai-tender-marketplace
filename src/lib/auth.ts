import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        })

        if (!user) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name || undefined,
          company: user.company || undefined,
          services: user.services || undefined,
          subscriptionType: user.subscriptionType,
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id
        const userWithExtras = user as { subscriptionType?: string; company?: string; services?: string }
        token.subscriptionType = userWithExtras.subscriptionType || 'free'
        token.company = userWithExtras.company || ''
        token.services = userWithExtras.services || ''
      }
      return token
    },
    session: async ({ session, token }) => {
      if (token) {
        session.user.id = token.id as string
        session.user.subscriptionType = token.subscriptionType as string
        session.user.company = token.company as string
        session.user.services = token.services as string
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin'
  }
}
