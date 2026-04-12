import supabase, { getUserIdFromRequest } from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  // Authenticate
  const userId = await getUserIdFromRequest(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('grade_components')
        .select('*')
        .eq('student_id', userId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'POST') {
      const { name, weight, done } = req.body;
      const { data, error } = await supabase
        .from('grade_components')
        .insert({ student_id: userId, name, weight: weight || 0, done: done || false })
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json(data);
    }
    if (req.method === 'PUT') {
      const { id, name, weight, done } = req.body;
      const updates = {};
      if (name !== undefined) updates.name = name;
      if (weight !== undefined) updates.weight = weight;
      if (done !== undefined) updates.done = done;
      // Ensure user owns this row
      const { data, error } = await supabase
        .from('grade_components')
        .update(updates)
        .eq('id', id)
        .eq('student_id', userId)
        .select()
        .single();
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'DELETE') {
      const { id } = req.body;
      // Ensure user owns this component before deleting entries
      const { data: comp } = await supabase.from('grade_components').select('id').eq('id', id).eq('student_id', userId).single();
      if (!comp) return res.status(403).json({ error: 'Forbidden' });
      await supabase.from('grade_entries').delete().eq('component_id', id);
      const { error } = await supabase.from('grade_components').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
