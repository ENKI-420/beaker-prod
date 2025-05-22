import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const patientId = url.pathname.split('/').at(-2);
  return new Response(JSON.stringify({ success: true, patientId }), { status: 200 });
}
