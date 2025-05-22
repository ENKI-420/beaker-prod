import { NextRequest } from 'next/server';

export async function POST(request: NextRequest, { params }: { params: { patientId: string } }) {
  const { patientId } = params;
  return new Response(`Analyzed patient ${patientId}`, { status: 200 });
}
