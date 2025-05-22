export async function POST(
  request: Request,
  context: { params: { patientId: string } }
) {
  const { patientId } = context.params;
  return new Response(`Analyzed patient ${patientId}`, { status: 200 });
}
