import supabase from './_supabase.js';
import { getAuthUser } from './_supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET') {
      const { post_id } = req.query;
      if (!post_id) return res.status(400).json({ error: 'post_id is required' });
      const { data, error } = await supabase
        .from('forum_replies')
        .select('*')
        .eq('post_id', post_id)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const { user, error: authError } = await getAuthUser(req.headers.authorization);
      if (authError) {
        console.error('Reply auth error:', authError);
        return res.status(401).json({ error: authError });
      }

      // Only premium users can reply
      const { data: settings } = await supabase
        .from('user_settings')
        .select('is_premium')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!settings?.is_premium) {
        return res.status(403).json({ error: 'Premium membership required to reply.' });
      }

      const { post_id, author, body } = req.body;
      if (!post_id || !author || !body) {
        return res.status(400).json({ error: 'Missing required fields: post_id, author, body' });
      }

      const { data, error } = await supabase
        .from('forum_replies')
        .insert({ post_id, author, body })
        .select()
        .single();
      if (error) {
        console.error('Insert reply error:', error);
        throw error;
      }
      return res.status(201).json(data);
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('Forum replies API error:', err);
    res.status(500).json({ error: err.message });
  }
}
