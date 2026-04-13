import supabase, { getUserIdFromRequest } from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const userId = await getUserIdFromRequest(req);
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    if (req.method === 'POST') {
      // Get all components owned by this user
      const { data: comps } = await supabase
        .from('grade_components')
        .select('id')
        .eq('student_id', userId);
      const compIds = (comps || []).map(c => c.id);
      if (compIds.length > 0) {
        await supabase.from('grade_entries').delete().in('component_id', compIds);
        await supabase.from('grade_components').delete().eq('student_id', userId);
      }
      return res.status(200).json({ ok: true });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
