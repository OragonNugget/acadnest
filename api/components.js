import { getUserClient, getAuthUser } from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const { user, error: authError } = await getAuthUser(req.headers.authorization);
  if (authError) return res.status(401).json({ error: authError });
  const db = getUserClient(req.headers.authorization);

  try {
    if (req.method === 'GET') {
      const { data, error } = await db
        .from('grade_components')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'POST') {
      const { name, weight, done } = req.body;
      const { data, error } = await db
        .from('grade_components')
        .insert({ user_id: user.id, name, weight: weight || 0, done: done || false })
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
      const { data, error } = await db
        .from('grade_components')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'DELETE') {
      const { id } = req.body;
      await db.from('grade_entries').delete().eq('component_id', id).eq('user_id', user.id);
      const { error } = await db.from('grade_components').delete().eq('id', id).eq('user_id', user.id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
