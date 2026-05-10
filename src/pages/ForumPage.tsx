import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, MessageSquare, Send, Plus, X, Loader2 } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import ForumPostPage from './ForumPostPage';

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

interface Props {
  onBack: () => void;
    session: Session | null;
}

const categories = ['general', 'study-tips', 'exam-prep', 'time-management', 'motivation', 'resources'];
const categoryColors: Record<string, string> = {
  'general': 'themed-surface-raised themed-text/40',
  'study-tips': 'bg-blue-500/10 text-blue-400',
  'exam-prep': 'bg-red-500/10 text-red-400',
  'time-management': 'bg-emerald-500/10 text-emerald-400',
  'motivation': 'bg-yellow-400/10 themed-accent',
  'resources': 'bg-purple-500/10 text-purple-400',
};

export default function ForumPage({ onBack, session }: Props) {
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
                session={session}
      />
    );

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
    <div className="min-h-screen themed-bg themed-text">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/3 w-96 h-96 bg-blue-500/[0.02] rounded-full blur-[120px]" />
      </div>

      <header className="sticky top-0 z-50 border-b themed-border themed-bg/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-1.5 themed-text/40 hover:themed-text/60 text-sm cursor-pointer">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold themed-text">Community Forum</h1>
            <p className="text-[11px] themed-text/30">Tips, strategies & discussion from fellow students</p>
          </div>
          { true ? (
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-300/15 themed-accent-soft text-xs font-medium hover:bg-yellow-300/25 cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> New Post
            </button>
        ) : null}
        </div>
      </header>

      <main className="relative max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-wrap gap-2 mb-6">
          <button onClick={() => setFilter('all')} className={`px-3 py-1 rounded-full text-[11px] cursor-pointer transition-colors ${filter === 'all' ? 'themed-surface-raised themed-text/70' : 'themed-surface themed-text/30 hover:themed-surface-raised'}`}>
            All
          </button>
          {categories.map(cat => (
            <button key={cat} onClick={() => setFilter(cat)} className={`px-3 py-1 rounded-full text-[11px] cursor-pointer transition-colors capitalize ${filter === cat ? 'themed-surface-raised themed-text/70' : 'themed-surface themed-text/30 hover:themed-surface-raised'}`}>
              {cat.replace('-', ' ')}
            </button>
          ))}
        </div>

        <AnimatePresence>
          {showCreate && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="rounded-xl themed-surface border themed-border-subtle p-5 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold themed-text/60">Create Post</h3>
                <button onClick={() => setShowCreate(false)} className="themed-text/20 hover:themed-text/40 cursor-pointer"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-3">
                <input value={newAuthor} onChange={e => setNewAuthor(e.target.value)} placeholder="Your name" className="w-full themed-surface-h border themed-border-subtle rounded-lg px-3 py-2 text-sm themed-text placeholder:themed-text/20 focus:outline-none focus:border-yellow-300/40" />
                <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Post title" className="w-full themed-surface-h border themed-border-subtle rounded-lg px-3 py-2 text-sm themed-text placeholder:themed-text/20 focus:outline-none focus:border-yellow-300/40" />
                <textarea value={newBody} onChange={e => setNewBody(e.target.value)} placeholder="What's on your mind? Tips, questions, rants — all welcome." rows={4} className="w-full themed-surface-h border themed-border-subtle rounded-lg px-3 py-2 text-sm themed-text placeholder:themed-text/20 focus:outline-none focus:border-yellow-300/40 resize-none" />
                <div className="flex items-center gap-3 flex-wrap">
                  <select value={newCategory} onChange={e => setNewCategory(e.target.value)} className="themed-surface-h border themed-border-subtle rounded-lg px-3 py-2 text-sm themed-text/60 focus:outline-none focus:border-yellow-300/40">
                    {categories.map(cat => <option key={cat} value={cat} className="bg-[#12121f] capitalize">{cat.replace('-', ' ')}</option>)}
                  </select>
                  {postError && <p className="text-[11px] text-red-400/80 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 flex-1">{postError}</p>}
                  <button onClick={handleCreate} disabled={posting} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-yellow-300/20 themed-accent-soft text-sm font-medium hover:bg-yellow-300/30 transition-colors cursor-pointer ml-auto disabled:opacity-50">
                    {posting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    {posting ? 'Posting...' : 'Post'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="text-center py-12"><p className="text-sm themed-text/30">Loading posts...</p></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-8 h-8 themed-text/10 mx-auto mb-3" />
            <p className="text-sm themed-text/30">'No posts yet. Be the first to share!'</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((post, i) => {
              const userLiked = post.liked_by?.includes(userId);
              return (
                <div key={post.id} className="relative group/post">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setSelectedPostId(post.id)}
                    className={`rounded-xl themed-surface border transition-colors cursor-pointer ${post.pinned ? 'border-yellow-400/20' : 'themed-border hover:themed-border-subtle'} p-5`}
                  >
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {post.pinned && <span className="text-[9px] px-1.5 py-0.5 rounded bg-yellow-400/15 themed-accent">📌 Pinned</span>}
                      <span className={`text-[9px] px-1.5 py-0.5 rounded capitalize ${categoryColors[post.category] || categoryColors.general}`}>
                        {post.category.replace('-', ' ')}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold themed-text/80 mb-1">{post.title}</h3>
                    <p className="text-xs themed-text/35 leading-relaxed mb-3 line-clamp-2">{post.body}</p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] themed-text/40">{post.author}</span>
                        
                      </div>
                      <span className="text-[10px] themed-text/20">{new Date(post.created_at).toLocaleDateString()}</span>
                      <span className="text-[10px] themed-text/20 flex items-center gap-1 ml-auto">
                        <MessageSquare className="w-3 h-3" /> View replies
                      </span>
                      <button
                        onClick={e => handleLike(e, post.id)}
                        className={`flex items-center gap-1 transition-colors cursor-pointer ${userLiked ? 'text-red-400 hover:text-red-300' : 'themed-text/20 hover:text-red-400'}`}
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
