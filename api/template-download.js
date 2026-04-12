import supabase from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'POST') {
      const { id } = req.body;
      const { data: tmpl, error: getErr } = await supabase
        .from('community_templates')
        .select('downloads')
        .eq('id', id)
        .single();
      if (getErr) throw getErr;
      const { data, error } = await supabase
        .from('community_templates')
        .update({ downloads: (tmpl.downloads || 0) + 1 })
        .eq('id', id)
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
