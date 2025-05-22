export async function POST(request: Request, { params }: { params: { patientId: string } }) {
  const { patientId } = params;
  return new Response(`Analyzed patient ${patientId}`, { status: 200 });
}
