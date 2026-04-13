import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { student_id } = req.query;
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('student_id', student_id || 'default')
        .maybeSingle();
      if (error) throw error;
      return res.status(200).json(data || { student_id: 'default', target_grade: 80, is_premium: false });
    }
    if (req.method === 'POST' || req.method === 'PUT') {
      const { student_id, target_grade, is_premium } = req.body;
      const sid = student_id || 'default';
      const { data: existing } = await supabase
        .from('user_settings')
        .select('id')
        .eq('student_id', sid)
        .maybeSingle();
      if (existing) {
        const updates = {};
        if (target_grade !== undefined) updates.target_grade = target_grade;
        if (is_premium !== undefined) updates.is_premium = is_premium;
        const { data, error } = await supabase
          .from('user_settings')
          .update(updates)
          .eq('student_id', sid)
          .select()
          .single();
        if (error) throw error;
        return res.status(200).json(data);
      } else {
        const { data, error } = await supabase
          .from('user_settings')
          .insert({ student_id: sid, target_grade: target_grade || 80, is_premium: is_premium || false })
          .select()
          .single();
        if (error) throw error;
        return res.status(201).json(data);
      }
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
