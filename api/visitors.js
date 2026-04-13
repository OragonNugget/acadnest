import supabase from './_supabase.js';
import { getAuthUser } from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Require a valid session — pull email from the token, not the request body
  const { user, error: authError } = await getAuthUser(req.headers.authorization);
  if (authError) return res.status(401).json({ error: authError });

  try {
    const { error } = await supabase
      .from('visitors')
      .upsert(
        { user_id: user.id, email: user.email, last_seen: new Date().toISOString() },
        { onConflict: 'email' }
      );
    if (error) throw error;
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Visitor log error:', err);
    return res.status(500).json({ error: err.message });
  }
}
