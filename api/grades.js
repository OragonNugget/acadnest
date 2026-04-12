import supabase, { getUserIdFromRequest } from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const userId = await getUserIdFromRequest(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('saved_grades')
        .select('*')
        .eq('student_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'POST') {
      const { name, components_snapshot, current_grade } = req.body;
      const { data, error } = await supabase
        .from('saved_grades')
        .insert({ student_id: userId, name, components_snapshot, current_grade })
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json(data);
    }
    if (req.method === 'PUT') {
      const { id, components_snapshot, current_grade } = req.body;
      const { data, error } = await supabase
        .from('saved_grades')
        .update({ components_snapshot, current_grade })
        .eq('id', id)
        .eq('student_id', userId)
        .select()
        .single();
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'DELETE') {
      const { id } = req.body;
      const { error } = await supabase
        .from('saved_grades')
        .delete()
        .eq('id', id)
        .eq('student_id', userId);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
