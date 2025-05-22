import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type UserRole = {
  id: string;
  role: string;
};

export async function getUserRoles(userId: string): Promise<UserRole[]> {
  const { data, error } = await supabase
    .from('user_roles')
    .select('id, role')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching user roles:', error);
    return [];
  }

  return data as UserRole[];
}

export async function assignRoleToUser(userId: string, role: string) {
  const { error } = await supabase.from('user_roles').insert({ user_id: userId, role });

  if (error) {
    console.error('Error assigning role:', error);
    throw error;
  }
}

export async function removeRoleFromUser(userId: string, role: string) {
  const { error } = await supabase
    .from('user_roles')
    .delete()
    .match({ user_id: userId, role });

  if (error) {
    console.error('Error removing role:', error);
    throw error;
  }
}
