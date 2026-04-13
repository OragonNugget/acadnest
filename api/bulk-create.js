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
      const { components } = req.body;
      if (!Array.isArray(components)) return res.status(400).json({ error: 'components array required' });

      const results = [];
      for (const comp of components) {
        const { data: newComp, error: compErr } = await db
          .from('grade_components')
          .insert({ user_id: user.id, name: comp.name, weight: comp.weight || 0, done: comp.done || false })
          .select().single();
        if (compErr) throw compErr;

        if (comp.entries?.length > 0) {
          const rows = comp.entries.map(e => ({
            user_id: user.id,
            component_id: newComp.id,
            score: e.score,
            max_score: e.max_score,
            label: e.label || '',
          }));
          const { error: entryErr } = await db.from('grade_entries').insert(rows);
          if (entryErr) throw entryErr;
        }
        results.push(newComp);
      }
      return res.status(201).json({ ok: true, created: results.length });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
