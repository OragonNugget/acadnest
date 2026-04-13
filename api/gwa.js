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
        .from('gwa_records')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'POST') {
      const { name, semester, courses, gwa } = req.body;
      if (!name) return res.status(400).json({ error: 'Name is required' });
      const { data, error } = await db
        .from('gwa_records')
        .insert({ user_id: user.id, name, semester: semester || '', courses: courses || [], gwa: gwa || 0 })
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json(data);
    }
    if (req.method === 'PUT') {
      const { id, name, semester, courses, gwa } = req.body;
      const updates = {};
      if (name !== undefined) updates.name = name;
      if (semester !== undefined) updates.semester = semester;
      if (courses !== undefined) updates.courses = courses;
      if (gwa !== undefined) updates.gwa = gwa;
      const { data, error } = await db
        .from('gwa_records')
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
      const { error } = await db.from('gwa_records').delete().eq('id', id).eq('user_id', user.id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
