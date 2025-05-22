import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function verifyRbacSetup() {
  const { data, error } = await supabase.rpc('check_rbac_setup')
  if (error) {
    console.error('[RBAC ERROR]', error)
    return false
  }
  return data?.is_rbac_configured || false
}
