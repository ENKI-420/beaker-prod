import { NextRequest } from "next/server";

export async function POST(
  req: NextRequest,
  context: { params: { patientId: string } }
) {
  const { patientId } = context.params;
  return new Response(`Analyzed patient ${patientId}`, { status: 200 });
}
