import { type NextRequest } from 'next/server'

export async function GET(req: NextRequest, { params }: any) {
  const { taskId } = params
  return new Response(JSON.stringify({ status: 'OK', taskId }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  })
}
