export async function POST(
  request: Request,
  { params }: { params: { patientId: string } }
) {
  return new Response(`Analyzed patient ${params.patientId}`, { status: 200 });
}
