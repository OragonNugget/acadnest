import supabase from './_supabase.js';
import { getAuthUser } from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const { action } = req.query;

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('community_templates')
        .select('*')
        .order('downloads', { ascending: false });
      if (error) { console.error('Templates GET error:', error); throw error; }
      return res.status(200).json(data);
    }

    // POST ?action=download — increment download count (no auth needed)
    if (req.method === 'POST' && action === 'download') {
      const { id } = req.body;
      const { data: tmpl, error: getErr } = await supabase
        .from('community_templates').select('downloads').eq('id', id).single();
      if (getErr) throw getErr;
      const { data, error } = await supabase
        .from('community_templates')
        .update({ downloads: (tmpl.downloads || 0) + 1 })
        .eq('id', id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }

    // POST — share a template (premium only)
    if (req.method === 'POST') {
      const { user, error: authError } = await getAuthUser(req.headers.authorization);
      if (authError) { console.error('Templates auth error:', authError); return res.status(401).json({ error: authError }); }

      const { data: settings } = await supabase
        .from('user_settings').select('is_premium').eq('user_id', user.id).maybeSingle();
      if (!settings?.is_premium) {
        return res.status(403).json({ error: 'Premium membership required to share templates.' });
      }

      const { title, subject, professor, components, author } = req.body;
      if (!title || !components || !Array.isArray(components) || components.length === 0) {
        return res.status(400).json({ error: 'Missing required fields: title and at least one component' });
      }
      const { data, error } = await supabase
        .from('community_templates')
        .insert({ title, subject: subject || '', professor: professor || '', components, author: author || 'Anonymous', downloads: 0, rating: 0 })
        .select().single();
      if (error) { console.error('Templates INSERT error:', error); throw error; }
      return res.status(201).json(data);
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;
      const { error } = await supabase.from('community_templates').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Templates API error:', err);
    res.status(500).json({ error: err.message });
  }
}
