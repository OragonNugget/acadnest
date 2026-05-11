import supabase, { getAuthUser } from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { user, error: authError } = await getAuthUser(req.headers.authorization);
  if (authError || !user) return res.status(401).json({ error: authError || 'Unauthorized' });

  const username = user.user_metadata?.username || user.user_metadata?.full_name || null;

  const { error } = await supabase
    .from('visitors')
    .upsert(
      {
        user_id: user.id,
        email: user.email,
        username,
        last_seen_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );

  if (error) {
    console.error('Visitors upsert error:', error);
    // Don't fail hard — visitor logging is non-critical
    return res.status(200).json({ ok: true, warning: error.message });
  }

  return res.status(200).json({ ok: true });
}
