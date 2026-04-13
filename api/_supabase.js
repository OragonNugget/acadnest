import { createClient } from '@supabase/supabase-js';

// Admin client (server-side only)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default supabase;

// User-scoped client (important for RLS)
export function getUserClient(authHeader) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: {
        headers: authHeader ? { Authorization: authHeader } : {}
      }
    }
  );
}

// Verify user from JWT
export async function getAuthUser(authHeader) {
  if (!authHeader) return { user: null, error: 'Missing Authorization header' };

  const client = getUserClient(authHeader);
  const { data: { user }, error } = await client.auth.getUser();

  if (error || !user) {
    return { user: null, error: error?.message || 'Unauthenticated' };
  }

  return { user, error: null };
}
