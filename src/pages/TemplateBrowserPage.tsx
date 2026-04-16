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
  const [uploadError, setUploadError] = useState('');
  const [uploading, setUploading] = useState(false);

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
    await fetch('/api/templates?action=download', {
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

    // Validate total weight adds up to 100%
    const totalWeight = comps.reduce((sum, c) => sum + c.weight, 0);
    if (Math.abs(totalWeight - 100) > 0.01) {
      setUploadError(`Component weights must add up to 100%. Currently: ${totalWeight.toFixed(1)}%`);
      return;
    }

    setUploading(true);
    setUploadError('');
    try {
      const res = await fetch('/api/templates', {
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
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setUploadError(err.error || `Error ${res.status}`);
        return;
      }
      setUploadTitle('');
      setUploadSubject('');
      setUploadProf('');
      setUploadAuthor('');
      setUploadComponents([{ name: '', weight: '' }]);
      setShowUpload(false);
      await fetchTemplates();
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload template');
    } finally {
      setUploading(false);
    }
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
    <div className="min-h-screen bg-background text-foreground font-sans">
      <div className="fixed inset-0 pointer-events-none z-[-1]">
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-primary/5 rounded-full blur-[150px]" />
      </div>

      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-1.5 text-muted hover:text-foreground text-sm cursor-pointer font-medium transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex-1 border-l border-border pl-4">
            <h1 className="text-lg font-bold text-foreground">Template Library</h1>
            <p className="text-[11px] text-muted font-medium mt-0.5">Pre-made grading systems from teachers & students</p>
          </div>
          {isPremium ? (
            <button
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-success border border-success/20 text-success-foreground text-xs font-semibold hover:opacity-90 cursor-pointer transition-opacity shadow-sm"
            >
              <Upload className="w-3.5 h-3.5" /> Share Template
            </button>
          ) : (
            <div className="relative group">
              <button disabled className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-surface border border-border text-muted text-xs cursor-not-allowed shadow-sm font-semibold">
                <Lock className="w-3 h-3 text-muted/50" /> Share
              </button>
              <div className="absolute bottom-full right-0 mb-2 px-2.5 py-1.5 bg-background border border-border rounded-md text-[10px] font-semibold text-muted whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                Premium members can share templates
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="relative max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted/50" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by title, subject, or professor..."
            className="w-full bg-surface border border-border rounded-xl pl-11 pr-4 py-3 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 shadow-sm transition-colors"
          />
        </div>

        {/* Upload form */}
        {showUpload && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl bg-surface border border-border p-6 mb-8 shadow-sm"
          >
            <div className="flex items-center justify-between mb-5 border-b border-border pb-3">
              <h3 className="text-sm font-bold text-foreground">Share Your Grading System</h3>
              <button onClick={() => setShowUpload(false)} className="text-muted hover:text-foreground cursor-pointer transition-colors p-1 bg-background border border-border rounded-md shadow-sm">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider text-muted block mb-1">Title *</label>
                <input value={uploadTitle} onChange={e => setUploadTitle(e.target.value)} placeholder="e.g. Intro to Psychology" className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors shadow-sm" />
              </div>
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider text-muted block mb-1">Subject / Course</label>
                <input value={uploadSubject} onChange={e => setUploadSubject(e.target.value)} placeholder="e.g. PSY 101" className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors shadow-sm" />
              </div>
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider text-muted block mb-1">Professor</label>
                <input value={uploadProf} onChange={e => setUploadProf(e.target.value)} placeholder="e.g. Dr. Smith" className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors shadow-sm" />
              </div>
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider text-muted block mb-1">Your Name</label>
                <input value={uploadAuthor} onChange={e => setUploadAuthor(e.target.value)} placeholder="Anonymous" className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors shadow-sm" />
              </div>
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted mb-2">Components</p>
            <div className="space-y-3 mb-5 p-4 rounded-lg border border-dashed border-border bg-background">
              {uploadComponents.map((comp, i) => (
                <div key={i} className="flex gap-3 items-center">
                  <input value={comp.name} onChange={e => updateUploadRow(i, 'name', e.target.value)} placeholder="Component name" className="flex-1 bg-surface border border-border rounded-md px-3 py-2 text-xs text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors shadow-sm font-medium" />
                  <input value={comp.weight} onChange={e => updateUploadRow(i, 'weight', e.target.value)} placeholder="%" type="number" className="w-20 bg-surface border border-border rounded-md px-3 py-2 text-xs text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors shadow-sm font-mono" />
                  {uploadComponents.length > 1 && (
                    <button onClick={() => removeUploadRow(i)} className="text-muted hover:text-destructive cursor-pointer transition-colors p-1"><X className="w-4 h-4" /></button>
                  )}
                </div>
              ))}
              <div className="flex items-center justify-between mt-2">
                <button onClick={addUploadRow} className="text-xs font-semibold text-primary hover:text-primary-hover cursor-pointer transition-colors">+ Add component</button>
                {(() => {
                  const total = uploadComponents
                    .filter(c => c.weight)
                    .reduce((s, c) => s + (parseFloat(c.weight) || 0), 0);
                  const ok = Math.abs(total - 100) < 0.01;
                  return (
                    <p className={`text-[11px] font-bold font-mono tracking-tight ${ok ? 'text-success' : total > 100 ? 'text-destructive' : 'text-muted'}`}>
                      Total: {total.toFixed(1)}% {ok ? '✓' : `(needs ${(100 - total).toFixed(1)}% more)`}
                    </p>
                  );
                })()}
              </div>
            </div>
            {uploadError && (
              <p className="text-[11px] font-semibold text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2 mb-4">
                {uploadError}
              </p>
            )}
            <button onClick={handleUpload} disabled={uploading} className="px-5 py-2.5 rounded-md bg-success border border-success/20 text-success-foreground text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 shadow-sm w-full sm:w-auto">
              {uploading ? 'Sharing...' : 'Share Template'}
            </button>
          </motion.div>
        )}

        {/* Templates grid */}
        {loading ? (
          <div className="text-center py-12"><p className="text-sm text-muted font-medium">Loading templates...</p></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 rounded-xl bg-surface border border-dashed border-border shadow-sm">
            <BookOpen className="w-8 h-8 text-muted/50 mx-auto mb-3" />
            <p className="text-sm font-semibold text-muted">{search ? 'No templates match your search.' : 'No templates available yet.'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filtered.map((tmpl, i) => (
              <motion.div
                key={tmpl.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl bg-surface border border-border hover:border-border-hover transition-colors p-6 shadow-sm flex flex-col"
              >
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-foreground line-clamp-1">{tmpl.title}</h3>
                  {(tmpl.subject || tmpl.professor) && (
                    <p className="text-xs font-semibold text-muted mt-1 truncate">
                      {tmpl.subject}{tmpl.subject && tmpl.professor ? ' · ' : ''}{tmpl.professor}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mb-5 flex-1">
                  {tmpl.components.map((comp, j) => (
                    <span key={j} className="text-[10px] px-2.5 py-1 rounded bg-background border border-border text-foreground font-medium shadow-sm">
                      {comp.name} <span className="text-muted font-mono ml-0.5">({comp.weight}%)</span>
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between border-t border-border pt-4 mt-auto">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5" title="Author">
                      <User className="w-3.5 h-3.5 text-muted" />
                      <span className="text-[11px] font-semibold text-muted truncate max-w-[80px]">{tmpl.author}</span>
                    </div>
                    <div className="flex items-center gap-1.5" title="Downloads">
                      <Download className="w-3.5 h-3.5 text-muted" />
                      <span className="text-[11px] font-mono font-semibold text-muted">{tmpl.downloads}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleApply(tmpl)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-transparent border border-primary/20 hover:bg-primary/5 hover:border-primary/50 text-primary text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" /> Use
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
