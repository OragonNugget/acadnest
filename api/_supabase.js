import { createClient } from '@supabase/supabase-js';

// Server-side client uses service role key (bypasses RLS).
// We enforce per-user isolation manually via student_id checks.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default supabase;

/**
 * Extracts and verifies the Supabase JWT from the Authorization header.
 * Returns the user id if valid, or null if missing/invalid.
 */
export async function getUserIdFromRequest(req) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) return null;

  // Verify the JWT with the anon client (uses ANON key to validate)
  const anonClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  const { data: { user }, error } = await anonClient.auth.getUser(token);
  if (error || !user) return null;
  return user.id;
}
