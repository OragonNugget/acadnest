import { getUserClient, getAuthUser } from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const { user, error: authError } = await getAuthUser(req.headers.authorization);
  if (authError) return res.status(401).json({ error: authError });
  const db = getUserClient(req.headers.authorization);

  try {
    if (req.method === 'POST') {
      const { data: comps } = await db
        .from('grade_components')
        .select('id')
        .eq('user_id', user.id);

      if (comps?.length) {
        await db.from('grade_entries').delete().in('component_id', comps.map(c => c.id)).eq('user_id', user.id);
        await db.from('grade_components').delete().eq('user_id', user.id);
      }
      return res.status(200).json({ ok: true, deleted: comps?.length ?? 0 });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
