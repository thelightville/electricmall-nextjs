import { NextRequest, NextResponse } from 'next/server'

const REVALIDATION_SECRET = process.env.REVALIDATION_SECRET

/**
 * POST /api/revalidate?secret=xxx&tag=products
 * Triggers ISR revalidation from WP webhooks.
 */
export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret')
  if (secret !== REVALIDATION_SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
  }

  const tag = request.nextUrl.searchParams.get('tag') || 'products'

  try {
    const { revalidateTag } = await import('next/cache')
    revalidateTag(tag)
    return NextResponse.json({ revalidated: true, tag, now: Date.now() })
  } catch (err) {
    return NextResponse.json({ error: 'Revalidation failed' }, { status: 500 })
  }
}
