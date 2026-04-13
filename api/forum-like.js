import supabase from './_supabase.js';
import { getAuthUser } from './_supabase.js';

// Simple in-memory rate limiter: userId -> [timestamps]
const likeCooldowns = new Map();
const COOLDOWN_MS = 60 * 1000; // 1 like per post per minute per user

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Require auth to like
  const { user, error: authError } = await getAuthUser(req.headers.authorization);
  if (authError) return res.status(401).json({ error: authError });

  const { id } = req.body;
  if (!id) return res.status(400).json({ error: 'Post id is required' });

  // Rate limit: one like per post per user per minute
  const key = `${user.id}:${id}`;
  const now = Date.now();
  const last = likeCooldowns.get(key) || 0;
  if (now - last < COOLDOWN_MS) {
    return res.status(429).json({ error: 'Too many likes. Please wait before liking again.' });
  }
  likeCooldowns.set(key, now);

  try {
    const { data: post, error: getErr } = await supabase
      .from('forum_posts')
      .select('likes')
      .eq('id', id)
      .single();
    if (getErr) throw getErr;

    const { data, error } = await supabase
      .from('forum_posts')
      .update({ likes: (post.likes || 0) + 1 })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return res.status(200).json(data);
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: err.message });
  }
}
