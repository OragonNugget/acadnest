import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'POST') {
      const { student_id, components } = req.body;
      const sid = student_id || 'default';

      if (!components || !Array.isArray(components)) {
        return res.status(400).json({ error: 'components array required' });
      }

      const results = [];

      for (const comp of components) {
        // Create component
        const { data: newComp, error: compErr } = await supabase
          .from('grade_components')
          .insert({
            student_id: sid,
            name: comp.name,
            weight: comp.weight || 0,
            done: comp.done || false,
          })
          .select()
          .single();
        if (compErr) throw compErr;

        // Create entries if any
        if (comp.entries && comp.entries.length > 0) {
          const entryRows = comp.entries.map(e => ({
            component_id: newComp.id,
            score: e.score,
            max_score: e.max_score,
            label: e.label || '',
          }));
          const { error: entryErr } = await supabase
            .from('grade_entries')
            .insert(entryRows);
          if (entryErr) throw entryErr;
        }

        results.push(newComp);
      }

      return res.status(201).json({ ok: true, created: results.length });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
