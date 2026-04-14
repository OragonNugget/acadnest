import supabase from './_supabase.js';
import { getAuthUser } from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('forum_posts')
        .select('*')
        .order('pinned', { ascending: false })
        .order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json(data);
    }

    // All write operations require auth
    const { user, error: authError } = await getAuthUser(req.headers.authorization);
    if (authError) {
      console.error('Forum auth error:', authError);
      return res.status(401).json({ error: authError });
    }

    if (req.method === 'POST') {
      const { author, title, body, category } = req.body;
      if (!title || !body || !author) {
        return res.status(400).json({ error: 'Missing required fields: author, title, body' });
      }

      // Look up is_premium server-side — never trust the client
      const { data: settings, error: settingsError } = await supabase
        .from('user_settings')
        .select('is_premium')
        .eq('user_id', user.id)
        .maybeSingle();

      if (settingsError) console.error('Settings lookup error:', settingsError);

      const is_premium_author = settings?.is_premium ?? false;

      // Only premium users can post
      if (!is_premium_author) {
        return res.status(403).json({ error: 'Premium membership required to post in the forum.' });
      }

      const { data, error } = await supabase
        .from('forum_posts')
        .insert({
          author,
          title,
          body,
          category: category || 'general',
          is_premium_author,
          likes: 0,
          pinned: false,
        })
        .select()
        .single();
      if (error) {
        console.error('Insert forum post error:', error);
        throw error;
      }
      return res.status(201).json(data);
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;
      const { error } = await supabase.from('forum_posts').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Forum API error:', err);
    res.status(500).json({ error: err.message });
  }
}
