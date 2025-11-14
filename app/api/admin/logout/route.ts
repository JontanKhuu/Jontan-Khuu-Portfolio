import { NextResponse } from 'next/server';
import { removeAdminCookie } from '@/app/lib/auth';

export async function POST() {
  await removeAdminCookie();
  return NextResponse.json({ success: true });
}

