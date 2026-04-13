import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'POST') {
      const { student_id } = req.body;
      const sid = student_id || 'default';

      // Get all component IDs for this student
      const { data: comps, error: fetchErr } = await supabase
        .from('grade_components')
        .select('id')
        .eq('student_id', sid);
      if (fetchErr) throw fetchErr;

      if (comps && comps.length > 0) {
        const compIds = comps.map(c => c.id);

        // Delete all entries for these components
        const { error: entryErr } = await supabase
          .from('grade_entries')
          .delete()
          .in('component_id', compIds);
        if (entryErr) throw entryErr;

        // Delete all components
        const { error: compErr } = await supabase
          .from('grade_components')
          .delete()
          .eq('student_id', sid);
        if (compErr) throw compErr;
      }

      return res.status(200).json({ ok: true, deleted: comps ? comps.length : 0 });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
