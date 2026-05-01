import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Crown, Send, Lock, Loader2, MessageSquare } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';

interface ForumPost {
  id: number;
  author: string;
  title: string;
  body: string;
  category: string;
  is_premium_author: boolean;
  likes: number;
  liked_by: string[];
  pinned: boolean;
  created_at: string;
}

interface ForumReply {
  id: number;
  post_id: number;
  author: string;
  body: string;
  created_at: string;
}

interface Props {
  postId: number;
  onBack: () => void;
  isPremium: boolean;
  session: Session | null;
}

const categoryColors: Record<string, string> = {
  'general': 'bg-white/[0.06] text-white/40',
  'study-tips': 'bg-blue-500/10 text-blue-400',
  'exam-prep': 'bg-red-500/10 text-red-400',
  'time-management': 'bg-emerald-500/10 text-emerald-400',
  'motivation': 'bg-yellow-400/10 text-yellow-300',
  'resources': 'bg-purple-500/10 text-purple-400',
};

export default function ForumPostPage({ postId, onBack, isPremium, session }: Props) {
  const [post, setPost] = useState<ForumPost | null>(null);
  const [replies, setReplies] = useState<ForumReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyAuthor, setReplyAuthor] = useState('');
  const [replyBody, setReplyBody] = useState('');
  const [replySending, setReplySending] = useState(false);
  const [replyError, setReplyError] = useState('');

  const authHeader: Record<string, string> = session
    ? { Authorization: `Bearer ${session.access_token}` }
    : {};

  const userId = session?.user?.id ?? '';

  const fetchPost = async () => {
    try {
      const [postsRes, repliesRes] = await Promise.all([
        fetch('/api/forum'),
        fetch(`/api/forum?action=replies&post_id=${postId}`),
      ]);
      const posts: ForumPost[] = await postsRes.json();
      const repliesData: ForumReply[] = await repliesRes.json();
      const found = posts.find(p => p.id === postId) ?? null;
      setPost(found);
      setReplies(Array.isArray(repliesData) ? repliesData : []);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPost(); }, [postId]);

  const handleLike = async () => {
    if (!post) return;
    const liked = post.liked_by?.includes(userId);
    // Optimistic update
    setPost(p => p ? {
      ...p,
      likes: Math.max(0, p.likes + (liked ? -1 : 1)),
      liked_by: liked
        ? (p.liked_by || []).filter(u => u !== userId)
        : [...(p.liked_by || []), userId],
    } : p);

    try {
      const res = await fetch('/api/forum?action=like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({ id: post.id }),
      });
      if (!res.ok) {
        // Revert on failure
        await fetchPost();
      }
    } catch {
      await fetchPost();
    }
  };

  const handleReply = async () => {
    if (!replyBody.trim() || !replyAuthor.trim()) return;
    setReplySending(true);
    setReplyError('');
    try {
      const res = await fetch('/api/forum?action=reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({
          post_id: postId,
          author: replyAuthor.trim(),
          body: replyBody.trim(),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setReplyError(err.error || `Error ${res.status}`);
        return;
      }
      setReplyBody('');
      // Refresh replies
      const repliesRes = await fetch(`/api/forum?action=replies&post_id=${postId}`);
      const data = await repliesRes.json();
      setReplies(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setReplyError(err.message || 'Failed to send reply');
    } finally {
      setReplySending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <p className="text-sm text-white/30">Loading...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col items-center justify-center gap-4">
        <p className="text-sm text-white/30">Post not found.</p>
        <button onClick={onBack} className="text-yellow-200/60 text-sm cursor-pointer hover:text-yellow-200">
          ← Go back
        </button>
      </div>
    );
  }

  const userLiked = post.liked_by?.includes(userId);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/3 w-96 h-96 bg-blue-500/[0.02] rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-1.5 text-white/40 hover:text-white/60 text-sm cursor-pointer">
            <ArrowLeft className="w-4 h-4" /> Back to Forum
          </button>
        </div>
      </header>

      <main className="relative max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Post */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-white/[0.02] border border-white/[0.08] p-6 mb-6"
        >
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {post.pinned && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-yellow-400/15 text-yellow-300">📌 Pinned</span>
            )}
            <span className={`text-[9px] px-1.5 py-0.5 rounded capitalize ${categoryColors[post.category] || categoryColors.general}`}>
              {post.category.replace('-', ' ')}
            </span>
          </div>

          <h1 className="text-lg font-bold text-white/90 mb-3">{post.title}</h1>
          <p className="text-sm text-white/45 leading-relaxed whitespace-pre-wrap mb-6">{post.body}</p>

          <div className="flex items-center gap-4 pt-4 border-t border-white/[0.05]">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-white/40">{post.author}</span>
              {post.is_premium_author && <Crown className="w-3 h-3 text-yellow-300/50" />}
            </div>
            <span className="text-[10px] text-white/20">
              {new Date(post.created_at).toLocaleDateString()}
            </span>
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 ml-auto transition-colors cursor-pointer ${
                userLiked ? 'text-red-400 hover:text-red-300' : 'text-white/25 hover:text-red-400'
              }`}
            >
              <Heart className={`w-4 h-4 ${userLiked ? 'fill-red-400' : ''}`} />
              <span className="text-xs">{post.likes}</span>
            </button>
          </div>
        </motion.div>

        {/* Replies */}
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-4 flex items-center gap-2">
            <MessageSquare className="w-3.5 h-3.5" />
            {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
          </h2>

          {replies.length === 0 ? (
            <p className="text-[11px] text-white/20 text-center py-6">
              No replies yet.{isPremium ? ' Be the first to reply below.' : ''}
            </p>
          ) : (
            <div className="space-y-3">
              {replies.map((reply, i) => (
                <motion.div
                  key={reply.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex gap-3 pl-4 border-l-2 border-white/[0.06]"
                >
                  <div className="flex-1 bg-white/[0.02] rounded-lg px-4 py-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[11px] font-semibold text-white/50">{reply.author}</span>
                      <span className="text-[9px] text-white/15">
                        {new Date(reply.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-[11px] text-white/35 leading-relaxed whitespace-pre-wrap">{reply.body}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Reply form */}
        {isPremium ? (
          <div className="rounded-xl bg-white/[0.02] border border-white/[0.07] p-5">
            <h3 className="text-xs font-semibold text-white/40 mb-3">Write a Reply</h3>
            <div className="space-y-3">
              <input
                value={replyAuthor}
                onChange={e => setReplyAuthor(e.target.value)}
                placeholder="Your name"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-yellow-300/40"
              />
              <textarea
                value={replyBody}
                onChange={e => setReplyBody(e.target.value)}
                placeholder="Share your thoughts..."
                rows={4}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-yellow-300/40 resize-none"
              />
              {replyError && (
                <p className="text-[11px] text-red-400/80 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  {replyError}
                </p>
              )}
              <div className="flex justify-end">
                <button
                  onClick={handleReply}
                  disabled={replySending || !replyBody.trim() || !replyAuthor.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-yellow-300/20 text-yellow-200 text-sm font-medium hover:bg-yellow-300/30 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {replySending
                    ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending...</>
                    : <><Send className="w-3.5 h-3.5" /> Send Reply</>
                  }
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-5 flex items-center gap-3">
            <Lock className="w-4 h-4 text-white/20 flex-shrink-0" />
            <div>
              <p className="text-xs text-white/30">Premium members can reply to posts.</p>
              <p className="text-[10px] text-white/15 mt-0.5">Upgrade to join the discussion.</p>
            </div>
            <Crown className="w-4 h-4 text-yellow-300/30 ml-auto flex-shrink-0" />
          </div>
        )}
      </main>
    </div>
  );
}
