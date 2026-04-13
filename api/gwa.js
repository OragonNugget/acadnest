import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { student_id } = req.query;
      let query = supabase.from('gwa_records').select('*').order('created_at', { ascending: false });
      if (student_id) query = query.eq('student_id', student_id);
      const { data, error } = await query;
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'POST') {
      const { student_id, name, semester, courses, gwa } = req.body;
      if (!name) return res.status(400).json({ error: 'Name is required' });
      const { data, error } = await supabase
        .from('gwa_records')
        .insert({
          student_id: student_id || 'default',
          name,
          semester: semester || '',
          courses: courses || [],
          gwa: gwa || 0,
        })
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
      const { data, error } = await supabase
        .from('gwa_records')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'DELETE') {
      const { id } = req.body;
      const { error } = await supabase.from('gwa_records').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
