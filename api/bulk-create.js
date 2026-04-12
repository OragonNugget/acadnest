import supabase, { getUserIdFromRequest } from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const userId = await getUserIdFromRequest(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    if (req.method === 'POST') {
      const { components } = req.body;
      if (!Array.isArray(components)) return res.status(400).json({ error: 'components must be array' });

      for (const comp of components) {
        const { data: newComp, error: compErr } = await supabase
          .from('grade_components')
          .insert({ student_id: userId, name: comp.name, weight: comp.weight || 0, done: comp.done || false })
          .select()
          .single();
        if (compErr) throw compErr;

        if (Array.isArray(comp.entries) && comp.entries.length > 0) {
          const entries = comp.entries.map((e: any) => ({
            component_id: newComp.id,
            score: e.score,
            max_score: e.max_score,
            label: e.label || '',
          }));
          const { error: entriesErr } = await supabase.from('grade_entries').insert(entries);
          if (entriesErr) throw entriesErr;
        }
      }
      return res.status(201).json({ ok: true });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
