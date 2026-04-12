import supabase, { getUserIdFromRequest } from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const userId = await getUserIdFromRequest(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    if (req.method === 'GET') {
      // Join with grade_components to enforce ownership
      const { data: comps } = await supabase
        .from('grade_components')
        .select('id')
        .eq('student_id', userId);
      const compIds = (comps || []).map(c => c.id);
      if (compIds.length === 0) return res.status(200).json([]);

      const { data, error } = await supabase
        .from('grade_entries')
        .select('*')
        .in('component_id', compIds)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'POST') {
      const { component_id, score, max_score, label } = req.body;
      // Verify ownership of parent component
      const { data: comp } = await supabase.from('grade_components').select('id').eq('id', component_id).eq('student_id', userId).single();
      if (!comp) return res.status(403).json({ error: 'Forbidden' });

      const { data, error } = await supabase
        .from('grade_entries')
        .insert({ component_id, score, max_score, label })
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json(data);
    }
    if (req.method === 'DELETE') {
      const { id } = req.body;
      // Verify ownership via join
      const { data: entry } = await supabase.from('grade_entries').select('component_id').eq('id', id).single();
      if (!entry) return res.status(404).json({ error: 'Not found' });
      const { data: comp } = await supabase.from('grade_components').select('id').eq('id', entry.component_id).eq('student_id', userId).single();
      if (!comp) return res.status(403).json({ error: 'Forbidden' });

      const { error } = await supabase.from('grade_entries').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
