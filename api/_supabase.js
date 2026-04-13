import { createClient } from '@supabase/supabase-js';

// Service role — server-side admin only, never sent to browser
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
export default supabase;

/** User-scoped client — RLS evaluates as the authenticated user */
export function getUserClient(authHeader) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { global: { headers: authHeader ? { Authorization: authHeader } : {} } }
  );
}

/** Verify the JWT and return the user */
export async function getAuthUser(authHeader) {
  if (!authHeader) return { user: null, error: 'Missing Authorization header' };
  const client = getUserClient(authHeader);
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) return { user: null, error: error?.message || 'Unauthenticated' };
  return { user, error: null };
}
