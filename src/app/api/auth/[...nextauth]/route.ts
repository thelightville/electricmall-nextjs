import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import type { NextAuthOptions } from 'next-auth'

const WP_URL = process.env.WORDPRESS_URL || 'http://172.16.16.117:8019'
const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'https://electricmall.com.ng/graphql'

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'WooCommerce',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null

        try {
          const res = await fetch(GRAPHQL_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              query: `
                mutation Login($username: String!, $password: String!) {
                  login(input: { username: $username, password: $password }) {
                    authToken
                    refreshToken
                    user {
                      id
                      databaseId
                      name
                      email
                    }
                  }
                }
              `,
              variables: {
                username: credentials.username,
                password: credentials.password,
              },
            }),
          })

          const json = await res.json()

          if (json.errors?.length) {
            console.error('[NextAuth] GraphQL errors:', json.errors)
            return null
          }

          const { authToken, refreshToken, user } = json.data?.login || {}
          if (!authToken || !user) return null

          return {
            id: String(user.databaseId),
            name: user.name,
            email: user.email,
            authToken,
            refreshToken,
          }
        } catch (err) {
          console.error('[NextAuth] authorize error:', err)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.authToken = (user as { authToken?: string }).authToken
        token.refreshToken = (user as { refreshToken?: string }).refreshToken
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          ...session.user,
          id: token.id as string,
        } as typeof session.user & { id: string }
        ;(session as typeof session & { authToken?: string }).authToken = token.authToken as string
      }
      return session
    },
  },
  pages: {
    signIn: '/my-account',
    error: '/my-account',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
