import { createClient } from '@supabase/supabase-js';

// Service role client — used ONLY for admin operations on the server.
// Never expose SUPABASE_SERVICE_ROLE_KEY to the browser.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default supabase;

/**
 * Returns a Supabase client scoped to the authenticated user by forwarding
 * their JWT via the Authorization header. RLS policies will evaluate as that
 * user, so each person can only access their own rows.
 *
 * Usage in an API handler:
 *   const client = getUserClient(req.headers.authorization);
 */
export function getUserClient(authHeader) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: {
        headers: authHeader ? { Authorization: authHeader } : {},
      },
    }
  );
}

/**
 * Extracts and verifies the user from the Authorization header.
 * Returns { user, error }.
 */
export async function getAuthUser(authHeader) {
  if (!authHeader) return { user: null, error: 'Missing Authorization header' };
  const client = getUserClient(authHeader);
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) return { user: null, error: error?.message || 'Unauthenticated' };
  return { user, error: null };
}
