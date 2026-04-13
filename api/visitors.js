import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { user_id, email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const { error } = await supabase
      .from('visitors')
      .upsert(
        { user_id: user_id || null, email, last_seen: new Date().toISOString() },
        { onConflict: 'email' }
      );

    if (error) throw error;
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Visitor log error:', err);
    return res.status(500).json({ error: err.message });
  }
}
