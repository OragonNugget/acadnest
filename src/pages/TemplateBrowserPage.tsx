import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, User, BookOpen, Search, X, Upload, Lock } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';

interface CommunityTemplate {
  id: number;
  title: string;
  subject: string;
  professor: string;
  components: { name: string; weight: number }[];
  author: string;
  downloads: number;
  rating: number;
  created_at: string;
}

interface Props {
  onBack: () => void;
  isPremium: boolean;
  onApplyTemplate: (components: { name: string; weight: number }[]) => void;
  session: Session | null;
}
}

export default function TemplateBrowserPage({ onBack, isPremium, onApplyTemplate, session }: Props) {
  const [templates, setTemplates] = useState<CommunityTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadSubject, setUploadSubject] = useState('');
  const [uploadProf, setUploadProf] = useState('');
  const [uploadAuthor, setUploadAuthor] = useState('');
  const [uploadComponents, setUploadComponents] = useState<{ name: string; weight: string }[]>([{ name: '', weight: '' }]);

  const fetchTemplates = async () => {
    try {
      const res = await fetch('/api/templates');
      const data = await res.json();
      setTemplates(data || []);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTemplates(); }, []);

  const handleApply = async (tmpl: CommunityTemplate) => {
    // Increment download count
    await fetch('/api/template-download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: tmpl.id }),
    });
    onApplyTemplate(tmpl.components);
    onBack();
  };

  const handleUpload = async () => {
    if (!uploadTitle.trim()) return;
    const comps = uploadComponents
      .filter(c => c.name.trim() && c.weight)
      .map(c => ({ name: c.name.trim(), weight: parseFloat(c.weight) || 0 }));
    if (comps.length === 0) return;

    await fetch('/api/templates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
      },
      body: JSON.stringify({
        title: uploadTitle.trim(),
        subject: uploadSubject.trim(),
        professor: uploadProf.trim(),
        components: comps,
        author: uploadAuthor.trim() || 'Anonymous',
      }),
    });
    setUploadTitle('');
    setUploadSubject('');
    setUploadProf('');
    setUploadAuthor('');
    setUploadComponents([{ name: '', weight: '' }]);
    setShowUpload(false);
    await fetchTemplates();
  };

  const addUploadRow = () => {
    setUploadComponents([...uploadComponents, { name: '', weight: '' }]);
  };

  const updateUploadRow = (index: number, field: 'name' | 'weight', value: string) => {
    const updated = [...uploadComponents];
    updated[index][field] = value;
    setUploadComponents(updated);
  };

  const removeUploadRow = (index: number) => {
    if (uploadComponents.length <= 1) return;
    setUploadComponents(uploadComponents.filter((_, i) => i !== index));
  };

  const filtered = search
    ? templates.filter(t =>
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.subject.toLowerCase().includes(search.toLowerCase()) ||
        t.professor.toLowerCase().includes(search.toLowerCase())
      )
    : templates;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-emerald-500/[0.02] rounded-full blur-[120px]" />
      </div>

      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-1.5 text-white/40 hover:text-white/60 text-sm cursor-pointer">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-white">Template Library</h1>
            <p className="text-[11px] text-white/30">Pre-made grading systems from teachers & students</p>
          </div>
          {isPremium ? (
            <button
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-400/15 text-emerald-300 text-xs font-medium hover:bg-emerald-400/25 cursor-pointer transition-colors"
            >
              <Upload className="w-3.5 h-3.5" /> Share Template
            </button>
          ) : (
            <div className="relative group">
              <button disabled className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.02] text-white/20 text-xs cursor-not-allowed">
                <Lock className="w-3 h-3" /> Share
              </button>
              <div className="absolute bottom-full right-0 mb-1 px-2 py-1 bg-[#1a1a2e] border border-white/[0.1] rounded text-[10px] text-white/50 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                Premium members can share templates
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="relative max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by title, subject, or professor..."
            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-amber-400/40"
          />
        </div>

        {/* Upload form */}
        {showUpload && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl bg-white/[0.03] border border-white/[0.08] p-5 mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white/60">Share Your Grading System</h3>
              <button onClick={() => setShowUpload(false)} className="text-white/20 hover:text-white/40 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-[10px] text-white/30 block mb-1">Title *</label>
                <input value={uploadTitle} onChange={e => setUploadTitle(e.target.value)} placeholder="e.g. Intro to Psychology" className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-amber-400/40" />
              </div>
              <div>
                <label className="text-[10px] text-white/30 block mb-1">Subject / Course</label>
                <input value={uploadSubject} onChange={e => setUploadSubject(e.target.value)} placeholder="e.g. PSY 101" className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-amber-400/40" />
              </div>
              <div>
                <label className="text-[10px] text-white/30 block mb-1">Professor</label>
                <input value={uploadProf} onChange={e => setUploadProf(e.target.value)} placeholder="e.g. Dr. Smith" className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-amber-400/40" />
              </div>
              <div>
                <label className="text-[10px] text-white/30 block mb-1">Your Name</label>
                <input value={uploadAuthor} onChange={e => setUploadAuthor(e.target.value)} placeholder="Anonymous" className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-amber-400/40" />
              </div>
            </div>
            <p className="text-[10px] text-white/30 mb-2">Components</p>
            <div className="space-y-2 mb-3">
              {uploadComponents.map((comp, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input value={comp.name} onChange={e => updateUploadRow(i, 'name', e.target.value)} placeholder="Component name" className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded px-2 py-1.5 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-amber-400/40" />
                  <input value={comp.weight} onChange={e => updateUploadRow(i, 'weight', e.target.value)} placeholder="%" type="number" className="w-16 bg-white/[0.04] border border-white/[0.08] rounded px-2 py-1.5 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-amber-400/40" />
                  {uploadComponents.length > 1 && (
                    <button onClick={() => removeUploadRow(i)} className="text-white/15 hover:text-red-400 cursor-pointer"><X className="w-3 h-3" /></button>
                  )}
                </div>
              ))}
              <button onClick={addUploadRow} className="text-[10px] text-white/25 hover:text-white/40 cursor-pointer">+ Add component</button>
            </div>
            <button onClick={handleUpload} className="px-4 py-2 rounded-lg bg-emerald-400/20 text-emerald-300 text-sm font-medium hover:bg-emerald-400/30 transition-colors cursor-pointer">Share Template</button>
          </motion.div>
        )}

        {/* Templates grid */}
        {loading ? (
          <div className="text-center py-12"><p className="text-sm text-white/30">Loading templates...</p></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-8 h-8 text-white/10 mx-auto mb-3" />
            <p className="text-sm text-white/30">{search ? 'No templates match your search.' : 'No templates available yet.'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((tmpl, i) => (
              <motion.div
                key={tmpl.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.1] transition-colors p-5"
              >
                <div className="mb-3">
                  <h3 className="text-sm font-semibold text-white/80">{tmpl.title}</h3>
                  {(tmpl.subject || tmpl.professor) && (
                    <p className="text-[11px] text-white/30 mt-0.5">
                      {tmpl.subject}{tmpl.subject && tmpl.professor ? ' · ' : ''}{tmpl.professor}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {tmpl.components.map((comp, j) => (
                    <span key={j} className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] text-white/35">
                      {comp.name} ({comp.weight}%)
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3 text-white/20" />
                      <span className="text-[10px] text-white/25">{tmpl.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="w-3 h-3 text-white/20" />
                      <span className="text-[10px] text-white/25">{tmpl.downloads}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleApply(tmpl)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-400/15 text-amber-300 text-[11px] font-medium hover:bg-amber-400/25 transition-colors cursor-pointer"
                  >
                    <Download className="w-3 h-3" /> Use Template
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
