import { getSessionUser } from '@/lib/session';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const user = await getSessionUser(request);
    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('[Auth Me API Error]:', error);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
