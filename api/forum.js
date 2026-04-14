import supabase from './_supabase.js';
import { getAuthUser } from './_supabase.js';

const likeCooldowns = new Map();
const COOLDOWN_MS = 60 * 1000;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const { action } = req.query;

  try {
    // GET /api/forum — list posts
    // GET /api/forum?action=replies&post_id=X — list replies for a post
    if (req.method === 'GET') {
      if (action === 'replies') {
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

    // POST /api/forum?action=like — toggle like on a post
    if (req.method === 'POST' && action === 'like') {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: 'Post id is required' });
      const key = `${user.id}:${id}`;
      const now = Date.now();
      if (now - (likeCooldowns.get(key) || 0) < COOLDOWN_MS) {
        return res.status(429).json({ error: 'Too many requests. Please wait.' });
      }
      likeCooldowns.set(key, now);
      const { data: post, error: getErr } = await supabase
        .from('forum_posts').select('likes, liked_by').eq('id', id).single();
      if (getErr) throw getErr;
      const likedBy = post.liked_by || [];
      const alreadyLiked = likedBy.includes(user.id);
      const newLikedBy = alreadyLiked
        ? likedBy.filter((uid) => uid !== user.id)
        : [...likedBy, user.id];
      const newLikes = Math.max(0, (post.likes || 0) + (alreadyLiked ? -1 : 1));
      const { data, error } = await supabase
        .from('forum_posts')
        .update({ likes: newLikes, liked_by: newLikedBy })
        .eq('id', id).select().single();
      if (error) throw error;
      return res.status(200).json({ ...data, userLiked: !alreadyLiked });
    }

    // POST /api/forum?action=reply — add a reply (premium only)
    if (req.method === 'POST' && action === 'reply') {
      const { data: settings } = await supabase
        .from('user_settings').select('is_premium').eq('user_id', user.id).maybeSingle();
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
        .select().single();
      if (error) { console.error('Insert reply error:', error); throw error; }
      return res.status(201).json(data);
    }

    // POST /api/forum — create a post (premium only)
    if (req.method === 'POST') {
      const { author, title, body, category } = req.body;
      if (!title || !body || !author) {
        return res.status(400).json({ error: 'Missing required fields: author, title, body' });
      }
      const { data: settings } = await supabase
        .from('user_settings').select('is_premium').eq('user_id', user.id).maybeSingle();
      const is_premium_author = settings?.is_premium ?? false;
      if (!is_premium_author) {
        return res.status(403).json({ error: 'Premium membership required to post in the forum.' });
      }
      const { data, error } = await supabase
        .from('forum_posts')
        .insert({ author, title, body, category: category || 'general', is_premium_author, likes: 0, pinned: false })
        .select().single();
      if (error) { console.error('Insert forum post error:', error); throw error; }
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
