import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { component_id } = req.query;
      let query = supabase.from('grade_entries').select('*').order('created_at', { ascending: true });
      if (component_id) query = query.eq('component_id', component_id);
      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'POST') {
      const { component_id, score, max_score, label } = req.body;
      const { data, error } = await supabase
        .from('grade_entries')
        .insert({ component_id, score, max_score, label: label || '' })
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json(data);
    }
    if (req.method === 'PUT') {
      const { id, score, max_score, label } = req.body;
      const updates = {};
      if (score !== undefined) updates.score = score;
      if (max_score !== undefined) updates.max_score = max_score;
      if (label !== undefined) updates.label = label;
      const { data, error } = await supabase
        .from('grade_entries')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'DELETE') {
      const { id } = req.body;
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
