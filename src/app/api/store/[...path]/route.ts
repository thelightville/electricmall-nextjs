import { NextRequest, NextResponse } from 'next/server'

const WP_URL = process.env.WORDPRESS_URL || 'http://172.16.16.117:8019'
const STORE_API_BASE = `${WP_URL}/wp-json/wc/store/v1`

/**
 * Proxy for WooCommerce Store API.
 * Forwards all /api/store/* requests to the WP backend while
 * preserving the Nonce, Cart-Token, and Authorization headers.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path, 'GET')
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path, 'POST')
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path, 'PUT')
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path, 'DELETE')
}

async function proxyRequest(
  request: NextRequest,
  pathSegments: string[],
  method: string
): Promise<NextResponse> {
  const path = pathSegments.join('/')
  const searchParams = request.nextUrl.searchParams.toString()
  const upstreamUrl = `${STORE_API_BASE}/${path}${searchParams ? `?${searchParams}` : ''}`

  // Forward cart-token and auth headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }

  const cartToken = request.headers.get('cart-token')
  if (cartToken) headers['Cart-Token'] = cartToken

  const nonce = request.headers.get('nonce')
  if (nonce) headers['Nonce'] = nonce

  const auth = request.headers.get('authorization')
  if (auth) headers['Authorization'] = auth

  // Only forward X-WP-Nonce if a nonce is actually present.
  // Sending an empty value causes WooCommerce to return 401.
  if (nonce) headers['X-WP-Nonce'] = nonce

  let body: string | undefined
  if (!['GET', 'HEAD'].includes(method)) {
    try {
      body = await request.text()
    } catch {
      // no body
    }
  }

  console.log(`[store-proxy] ${method} /${path} | token:${cartToken ? cartToken.slice(0,10) : 'NONE'} | body:${body?.slice(0,80) ?? 'none'}`)

  try {
    const upstream = await fetch(upstreamUrl, {
      method,
      headers,
      body,
      // Do not cache store API responses
      cache: 'no-store',
    })

    const responseBody = await upstream.text()
    console.log(`[store-proxy] upstream responded: ${upstream.status} | path:${path} | body:${responseBody.slice(0,120)}`)

    const response = new NextResponse(responseBody, {
      status: upstream.status,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Forward Cart-Token from upstream response
    const newCartToken = upstream.headers.get('Cart-Token')
    if (newCartToken) {
      response.headers.set('Cart-Token', newCartToken)
    }

    const newNonce = upstream.headers.get('Nonce') || upstream.headers.get('X-WC-Store-API-Nonce')
    if (newNonce) {
      response.headers.set('Nonce', newNonce)
    }

    return response
  } catch (err) {
    console.error('[store-proxy] error:', err)
    return NextResponse.json({ message: 'Store API unavailable' }, { status: 502 })
  }
}
