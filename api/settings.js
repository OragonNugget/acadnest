import supabase, { getUserIdFromRequest } from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const userId = await getUserIdFromRequest(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('student_settings')
        .select('*')
        .eq('student_id', userId)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return res.status(200).json(data || { target_grade: 80, is_premium: false });
    }
    if (req.method === 'PUT') {
      const { target_grade, is_premium } = req.body;
      const updates = { student_id: userId };
      if (target_grade !== undefined) updates.target_grade = target_grade;
      if (is_premium !== undefined) updates.is_premium = is_premium;

      const { data, error } = await supabase
        .from('student_settings')
        .upsert(updates, { onConflict: 'student_id' })
        .select()
        .single();
      if (error) throw error;
      return res.status(200).json(data);
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
