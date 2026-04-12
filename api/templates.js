import supabase, { getUserIdFromRequest } from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    // Public: anyone can browse templates
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('community_templates')
        .select('*')
        .order('downloads', { ascending: false });
      if (error) throw error;
      return res.status(200).json(data);
    }

    // Write operations require auth
    const userId = await getUserIdFromRequest(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    if (req.method === 'POST') {
      const { title, subject, professor, components, author } = req.body;
      if (!title || !components) {
        return res.status(400).json({ error: 'Missing required fields' });
      }
      const { data, error } = await supabase
        .from('community_templates')
        .insert({
          title,
          subject: subject || '',
          professor: professor || '',
          components,
          author: author || 'Anonymous',
          author_id: userId,
          downloads: 0,
          rating: 0,
        })
        .select()
        .single();
      if (error) throw error;
      return res.status(201).json(data);
    }
    if (req.method === 'DELETE') {
      const { id } = req.body;
      const { error } = await supabase
        .from('community_templates')
        .delete()
        .eq('id', id)
        .eq('author_id', userId);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }
    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
