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
  'general': 'bg-surface border border-border text-muted',
  'study-tips': 'bg-blue-500/10 text-blue-400',
  'exam-prep': 'bg-red-500/10 text-red-400',
  'time-management': 'bg-emerald-500/10 text-emerald-400',
  'motivation': 'bg-amber-500/10 text-amber-400',
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
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center font-sans tracking-tight">
        <p className="text-sm font-medium text-muted">Loading...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-4 font-sans tracking-tight">
        <p className="text-sm font-medium text-muted">Post not found.</p>
        <button onClick={onBack} className="text-primary text-sm font-semibold cursor-pointer hover:text-primary-hover transition-colors">
          ← Go back
        </button>
      </div>
    );
  }

  const userLiked = post.liked_by?.includes(userId);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <div className="fixed inset-0 pointer-events-none z-[-1]">
        <div className="absolute top-0 right-1/3 w-96 h-96 bg-primary/5 rounded-full blur-[150px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-1.5 text-muted hover:text-foreground text-sm font-medium cursor-pointer transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Forum
          </button>
        </div>
      </header>

      <main className="relative max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Post */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-surface border border-border p-8 mb-8 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {post.pinned && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm bg-accent/20 text-accent uppercase tracking-wider">📌 Pinned</span>
            )}
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider ${
              post.category === 'general' ? 'bg-background border border-border text-muted font-bold' : 
              post.category === 'study-tips' ? 'bg-blue-500/10 text-blue-500' : 
              post.category === 'exam-prep' ? 'bg-red-500/10 text-red-500' : 
              post.category === 'time-management' ? 'bg-emerald-500/10 text-emerald-500' : 
              post.category === 'motivation' ? 'bg-amber-500/10 text-amber-500' : 
              'bg-purple-500/10 text-purple-500'
            }`}>
              {post.category.replace('-', ' ')}
            </span>
          </div>

          <h1 className="text-xl font-black text-foreground mb-4 leading-tight">{post.title}</h1>
          <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap mb-8 font-medium">{post.body}</p>

          <div className="flex items-center gap-4 pt-5 border-t border-border">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-muted">{post.author}</span>
              {post.is_premium_author && <Crown className="w-4 h-4 text-accent" />}
            </div>
            <span className="text-[11px] font-semibold text-muted/60">
              {new Date(post.created_at).toLocaleDateString()}
            </span>
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 ml-auto transition-colors cursor-pointer px-3 py-1.5 rounded-md hover:bg-surface-hover border border-transparent hover:border-border shadow-sm ${
                userLiked ? 'text-destructive hover:text-destructive/80' : 'text-muted hover:text-destructive'
              }`}
            >
              <Heart className={`w-4 h-4 ${userLiked ? 'fill-destructive' : ''}`} />
              <span className="text-xs font-bold font-mono">{post.likes}</span>
            </button>
          </div>
        </motion.div>

        {/* Replies */}
        <div className="mb-8">
          <h2 className="text-[11px] font-bold text-muted uppercase tracking-widest mb-5 flex items-center gap-2 border-b border-border pb-2">
            <MessageSquare className="w-3.5 h-3.5" />
            {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
          </h2>

          {replies.length === 0 ? (
            <p className="text-xs font-semibold text-muted text-center py-8 border border-dashed border-border rounded-xl bg-surface">
              No replies yet.{isPremium ? ' Be the first to reply below.' : ''}
            </p>
          ) : (
            <div className="space-y-4">
              {replies.map((reply, i) => (
                <motion.div
                  key={reply.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex gap-4 pl-4 border-l-2 border-primary/20"
                >
                  <div className="flex-1 bg-surface border border-border rounded-xl px-5 py-4 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-foreground">{reply.author}</span>
                      <span className="text-[10px] font-semibold text-muted/60">
                        {new Date(reply.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-muted leading-relaxed whitespace-pre-wrap">{reply.body}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Reply form */}
        {isPremium ? (
          <div className="rounded-xl bg-surface border border-border p-6 shadow-sm">
            <h3 className="text-sm font-bold text-foreground mb-4">Write a Reply</h3>
            <div className="space-y-4">
              <input
                value={replyAuthor}
                onChange={e => setReplyAuthor(e.target.value)}
                placeholder="Your name"
                className="w-full bg-background border border-border rounded-md px-4 py-2.5 text-sm font-medium text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors shadow-sm"
              />
              <textarea
                value={replyBody}
                onChange={e => setReplyBody(e.target.value)}
                placeholder="Share your thoughts..."
                rows={4}
                className="w-full bg-background border border-border rounded-md px-4 py-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors shadow-sm resize-none"
              />
              {replyError && (
                <p className="text-[11px] font-semibold text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
                  {replyError}
                </p>
              )}
              <div className="flex justify-end">
                <button
                  onClick={handleReply}
                  disabled={replySending || !replyBody.trim() || !replyAuthor.trim()}
                  className="flex items-center gap-2 px-6 py-3 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary-hover transition-colors cursor-pointer shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {replySending
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                    : <><Send className="w-4 h-4" /> Send Reply</>
                  }
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl bg-surface border border-border p-5 flex items-center gap-4 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-background border border-border flex flex-shrink-0 items-center justify-center">
              <Lock className="w-4 h-4 text-muted/50" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Premium members can reply to posts.</p>
              <p className="text-[11px] font-semibold text-muted mt-0.5">Upgrade to join the discussion.</p>
            </div>
            <Crown className="w-6 h-6 text-accent ml-auto flex-shrink-0" />
          </div>
        )}
      </main>
    </div>
  );
}
