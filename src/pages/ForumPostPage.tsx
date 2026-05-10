import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Send, Loader2, MessageSquare } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';

interface ForumPost {
  id: number;
  author: string;
  title: string;
  body: string;
  category: string;
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
    session: Session | null;
}

const categoryColors: Record<string, string> = {
  'general': 'themed-surface-raised themed-text/40',
  'study-tips': 'bg-blue-500/10 text-blue-400',
  'exam-prep': 'bg-red-500/10 text-red-400',
  'time-management': 'bg-emerald-500/10 text-emerald-400',
  'motivation': 'bg-yellow-400/10 themed-accent',
  'resources': 'bg-purple-500/10 text-purple-400',
};

export default function ForumPostPage({ postId, onBack, session }: Props) {
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
      <div className="min-h-screen themed-bg themed-text flex items-center justify-center">
        <p className="text-sm themed-text/30">Loading...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen themed-bg themed-text flex flex-col items-center justify-center gap-4">
        <p className="text-sm themed-text/30">Post not found.</p>
        <button onClick={onBack} className="themed-accent-soft/60 text-sm cursor-pointer hover:themed-accent-soft">
          ← Go back
        </button>
      </div>
    );
  }

  const userLiked = post.liked_by?.includes(userId);

  return (
    <div className="min-h-screen themed-bg themed-text">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/3 w-96 h-96 bg-blue-500/[0.02] rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b themed-border themed-bg/80 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-1.5 themed-text/40 hover:themed-text/60 text-sm cursor-pointer">
            <ArrowLeft className="w-4 h-4" /> Back to Forum
          </button>
        </div>
      </header>

      <main className="relative max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Post */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl themed-surface border themed-border-subtle p-6 mb-6"
        >
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {post.pinned && (
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-yellow-400/15 themed-accent">📌 Pinned</span>
            )}
            <span className={`text-[9px] px-1.5 py-0.5 rounded capitalize ${categoryColors[post.category] || categoryColors.general}`}>
              {post.category.replace('-', ' ')}
            </span>
          </div>

          <h1 className="text-lg font-bold themed-text/90 mb-3">{post.title}</h1>
          <p className="text-sm themed-text/45 leading-relaxed whitespace-pre-wrap mb-6">{post.body}</p>

          <div className="flex items-center gap-4 pt-4 border-t themed-border">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] themed-text/40">{post.author}</span>
              
            </div>
            <span className="text-[10px] themed-text/20">
              {new Date(post.created_at).toLocaleDateString()}
            </span>
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 ml-auto transition-colors cursor-pointer ${
                userLiked ? 'text-red-400 hover:text-red-300' : 'themed-text/25 hover:text-red-400'
              }`}
            >
              <Heart className={`w-4 h-4 ${userLiked ? 'fill-red-400' : ''}`} />
              <span className="text-xs">{post.likes}</span>
            </button>
          </div>
        </motion.div>

        {/* Replies */}
        <div className="mb-6">
          <h2 className="text-xs font-semibold themed-text/30 uppercase tracking-wider mb-4 flex items-center gap-2">
            <MessageSquare className="w-3.5 h-3.5" />
            {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
          </h2>

          {replies.length === 0 ? (
            <p className="text-[11px] themed-text/20 text-center py-6">
              No replies yet.' Be the first to reply below.'
            </p>
          ) : null}
      </main>
    </div>
  );
}
