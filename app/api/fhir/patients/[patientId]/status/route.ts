export async function GET(
  request: Request,
  { params }: { params: { patientId: string } }
) {
  return new Response(`Status for patient ${params.patientId}`, { status: 200 });
}
