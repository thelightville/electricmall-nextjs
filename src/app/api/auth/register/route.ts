import { NextRequest, NextResponse } from 'next/server'

const WP_URL = process.env.WORDPRESS_URL || 'http://172.16.16.117:8019'
const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'https://electricmall.com.ng/graphql'

/**
 * POST /api/auth/register
 * Creates a new WordPress user account via WPGraphQL registerCustomer mutation.
 */
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { username, email, password, first_name, last_name } = body

  if (!username || !email || !password) {
    return NextResponse.json({ message: 'Username, email and password are required' }, { status: 400 })
  }

  const mutation = `
    mutation RegisterCustomer(
      $username: String!
      $email: String!
      $password: String!
      $firstName: String
      $lastName: String
    ) {
      registerCustomer(input: {
        username: $username
        email: $email
        password: $password
        firstName: $firstName
        lastName: $lastName
      }) {
        authToken
        refreshToken
        customer {
          id
          databaseId
          email
          firstName
          lastName
        }
      }
    }
  `

  try {
    const res = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: mutation,
        variables: {
          username,
          email,
          password,
          firstName: first_name || '',
          lastName: last_name || '',
        },
      }),
    })

    const json = await res.json()

    if (json.errors?.length) {
      const msg = json.errors[0]?.message || 'Registration failed'
      return NextResponse.json({ message: msg }, { status: 422 })
    }

    const customer = json.data?.registerCustomer?.customer
    if (!customer) {
      return NextResponse.json({ message: 'Registration failed' }, { status: 500 })
    }

    return NextResponse.json({ success: true, userId: customer.databaseId })
  } catch (err) {
    console.error('[register] error:', err)
    return NextResponse.json({ message: 'Internal error' }, { status: 500 })
  }
}
