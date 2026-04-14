import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, MessageSquare, Crown, Send, Lock, Plus, X, Loader2 } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import ForumPostPage from './ForumPostPage';

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

interface Props {
  onBack: () => void;
  isPremium: boolean;
  session: Session | null;
}

const categories = ['general', 'study-tips', 'exam-prep', 'time-management', 'motivation', 'resources'];
const categoryColors: Record<string, string> = {
  'general': 'bg-white/[0.06] text-white/40',
  'study-tips': 'bg-blue-500/10 text-blue-400',
  'exam-prep': 'bg-red-500/10 text-red-400',
  'time-management': 'bg-emerald-500/10 text-emerald-400',
  'motivation': 'bg-amber-500/10 text-amber-400',
  'resources': 'bg-purple-500/10 text-purple-400',
};

export default function ForumPage({ onBack, isPremium, session }: Props) {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newCategory, setNewCategory] = useState('general');
  const [newAuthor, setNewAuthor] = useState('');
  const [postError, setPostError] = useState('');
  const [posting, setPosting] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);

  const authHeader: Record<string, string> = session
    ? { Authorization: `Bearer ${session.access_token}` }
    : {};
  const userId = session?.user?.id ?? '';

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/forum');
      const data = await res.json();
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  if (selectedPostId !== null) {
    return (
      <ForumPostPage
        postId={selectedPostId}
        onBack={() => { setSelectedPostId(null); fetchPosts(); }}
        isPremium={isPremium}
        session={session}
      />
    );
  }

  const handleCreate = async () => {
    if (!newTitle.trim() || !newBody.trim() || !newAuthor.trim()) return;
    setPosting(true);
    setPostError('');
    try {
      const res = await fetch('/api/forum', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({
          author: newAuthor.trim(),
          title: newTitle.trim(),
          body: newBody.trim(),
          category: newCategory,
          is_premium_author: isPremium,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setPostError(err.error || `Error ${res.status}`);
        return;
      }
      setNewTitle(''); setNewBody(''); setNewAuthor('');
      setShowCreate(false);
      await fetchPosts();
    } catch (err: any) {
      setPostError(err.message || 'Failed to post');
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setPosts(prev => prev.map(p => {
      if (p.id !== id) return p;
      const liked = p.liked_by?.includes(userId);
      return {
        ...p,
        likes: Math.max(0, p.likes + (liked ? -1 : 1)),
        liked_by: liked
          ? (p.liked_by || []).filter(u => u !== userId)
          : [...(p.liked_by || []), userId],
      };
    }));
    try {
      const res = await fetch('/api/forum?action=like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) await fetchPosts();
    } catch {
      await fetchPosts();
    }
  };

  const filtered = filter === 'all' ? posts : posts.filter(p => p.category === filter);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/3 w-96 h-96 bg-blue-500/[0.02] rounded-full blur-[120px]" />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-1.5 text-white/40 hover:text-white/60 text-sm cursor-pointer">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-white">Community Forum</h1>
            <p className="text-[11px] text-white/30">Tips, strategies & discussion from fellow students</p>
          </div>
          {isPremium ? (
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400/15 text-amber-300 text-xs font-medium hover:bg-amber-400/25 cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> New Post
            </button>
          ) : (
            <div className="relative group">
              <button disabled className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.02] text-white/20 text-xs cursor-not-allowed border border-white/[0.06]">
                <Lock className="w-3 h-3" /> New Post
              </button>
              <div className="absolute bottom-full right-0 mb-2 w-48 px-3 py-2 bg-[#1a1a2e] border border-amber-400/20 rounded-lg text-[10px] text-white/50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-center">
                <Crown className="w-3 h-3 text-amber-400/50 mx-auto mb-1" />
                Only Premium members can post. Upgrade to join the discussion.
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="relative max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-wrap gap-2 mb-6">
          <button onClick={() => setFilter('all')} className={`px-3 py-1 rounded-full text-[11px] cursor-pointer transition-colors ${filter === 'all' ? 'bg-white/[0.1] text-white/70' : 'bg-white/[0.03] text-white/30 hover:bg-white/[0.06]'}`}>
            All
          </button>
          {categories.map(cat => (
            <button key={cat} onClick={() => setFilter(cat)} className={`px-3 py-1 rounded-full text-[11px] cursor-pointer transition-colors capitalize ${filter === cat ? 'bg-white/[0.1] text-white/70' : 'bg-white/[0.03] text-white/30 hover:bg-white/[0.06]'}`}>
              {cat.replace('-', ' ')}
            </button>
          ))}
        </div>

        <AnimatePresence>
          {showCreate && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="rounded-xl bg-white/[0.03] border border-white/[0.08] p-5 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white/60">Create Post</h3>
                <button onClick={() => setShowCreate(false)} className="text-white/20 hover:text-white/40 cursor-pointer"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-3">
                <input value={newAuthor} onChange={e => setNewAuthor(e.target.value)} placeholder="Your name" className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-amber-400/40" />
                <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Post title" className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-amber-400/40" />
                <textarea value={newBody} onChange={e => setNewBody(e.target.value)} placeholder="Share your tips, ask questions, or discuss strategies..." rows={4} className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-amber-400/40 resize-none" />
                <div className="flex items-center gap-3 flex-wrap">
                  <select value={newCategory} onChange={e => setNewCategory(e.target.value)} className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/60 focus:outline-none focus:border-amber-400/40">
                    {categories.map(cat => <option key={cat} value={cat} className="bg-[#12121f] capitalize">{cat.replace('-', ' ')}</option>)}
                  </select>
                  {postError && <p className="text-[11px] text-red-400/80 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 flex-1">{postError}</p>}
                  <button onClick={handleCreate} disabled={posting} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-400/20 text-amber-300 text-sm font-medium hover:bg-amber-400/30 transition-colors cursor-pointer ml-auto disabled:opacity-50">
                    {posting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    {posting ? 'Posting...' : 'Post'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="text-center py-12"><p className="text-sm text-white/30">Loading posts...</p></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-8 h-8 text-white/10 mx-auto mb-3" />
            <p className="text-sm text-white/30">{isPremium ? 'No posts yet. Be the first to share!' : 'No posts yet. Upgrade to Premium to start a discussion.'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((post, i) => {
              const userLiked = post.liked_by?.includes(userId);
              return (
                <div key={post.id} className="relative group/post">
                  {!isPremium && (
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-20 px-3 py-1.5 bg-[#1a1a2e] border border-amber-400/20 rounded-lg text-[10px] text-white/50 whitespace-nowrap opacity-0 group-hover/post:opacity-100 transition-opacity pointer-events-none flex items-center gap-1.5">
                      <Crown className="w-3 h-3 text-amber-400/50" />
                      Upgrade to Premium to post & reply
                    </div>
                  )}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setSelectedPostId(post.id)}
                    className={`rounded-xl bg-white/[0.02] border transition-colors cursor-pointer ${post.pinned ? 'border-amber-500/20' : 'border-white/[0.06] hover:border-white/[0.1]'} p-5`}
                  >
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {post.pinned && <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400">📌 Pinned</span>}
                      <span className={`text-[9px] px-1.5 py-0.5 rounded capitalize ${categoryColors[post.category] || categoryColors.general}`}>
                        {post.category.replace('-', ' ')}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-white/80 mb-1">{post.title}</h3>
                    <p className="text-xs text-white/35 leading-relaxed mb-3 line-clamp-2">{post.body}</p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-white/40">{post.author}</span>
                        {post.is_premium_author && <Crown className="w-3 h-3 text-amber-400/50" />}
                      </div>
                      <span className="text-[10px] text-white/20">{new Date(post.created_at).toLocaleDateString()}</span>
                      <span className="text-[10px] text-white/20 flex items-center gap-1 ml-auto">
                        <MessageSquare className="w-3 h-3" /> View replies
                      </span>
                      <button
                        onClick={e => handleLike(e, post.id)}
                        className={`flex items-center gap-1 transition-colors cursor-pointer ${userLiked ? 'text-red-400 hover:text-red-300' : 'text-white/20 hover:text-red-400'}`}
                      >
                        <Heart className={`w-3 h-3 ${userLiked ? 'fill-red-400' : ''}`} />
                        <span className="text-[10px]">{post.likes}</span>
                      </button>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
