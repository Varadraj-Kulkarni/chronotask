import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { internalServerErrorResponse } from '@/lib/errors';

export async function GET() {
  try {
    await db.user.count();
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
    });
  } catch (err) {
    console.error('Health probe error:', err);
    return internalServerErrorResponse('/api/health');
  }
}
