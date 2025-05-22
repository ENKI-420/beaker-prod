export async function GET(
  request: Request,
  { params }: { params: { patientId: string } }
) {
  return new Response(`Result for patient ${params.patientId}`, { status: 200 });
}
