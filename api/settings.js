import { getUserClient, getAuthUser } from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const { user, error: authError } = await getAuthUser(req.headers.authorization);
  if (authError) return res.status(401).json({ error: authError });
  const db = getUserClient(req.headers.authorization);

  try {
    if (req.method === 'GET') {
      const { data, error } = await db
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      return res.status(200).json(data || { user_id: user.id, target_grade: 80, is_premium: false });
    }
    if (req.method === 'POST' || req.method === 'PUT') {
      // is_premium is intentionally excluded — only settable via Supabase dashboard
      const { target_grade } = req.body;
      const { data: existing } = await db
        .from('user_settings')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      if (existing) {
        const updates = {};
        if (target_grade !== undefined) updates.target_grade = target_grade;
        const { data, error } = await db
          .from('user_settings')
          .update(updates)
          .eq('user_id', user.id)
          .select()
          .single();
        if (error) throw error;
        return res.status(200).json(data);
      } else {
        const { data, error } = await db
          .from('user_settings')
          .insert({ user_id: user.id, target_grade: target_grade || 80, is_premium: false })
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
