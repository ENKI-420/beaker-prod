import { NextRequest } from 'next/server';

export async function POST(req: NextRequest, { params }: { params: { patientId: string } }) {
  const { patientId } = params;
  return new Response(JSON.stringify({ analyzed: true, patientId }), { status: 200 });
}
