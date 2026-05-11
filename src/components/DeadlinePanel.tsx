import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Plus, Trash2, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

export interface Deadline {
  id: string;
  label: string;
  componentName: string;
  date: string; // ISO date string
  done: boolean;
}

interface Props {
  componentNames: string[];
  // We store deadlines in localStorage for simplicity (no backend needed)
}

function getDeadlines(): Deadline[] {
  try {
    return JSON.parse(localStorage.getItem('acadnest_deadlines') || '[]');
  } catch {
    return [];
  }
}

function saveDeadlines(deadlines: Deadline[]) {
  localStorage.setItem('acadnest_deadlines', JSON.stringify(deadlines));
}

function daysUntil(dateStr: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function urgencyClass(days: number, done: boolean): string {
  if (done) return 'text-emerald-400/60';
  if (days < 0) return 'text-red-400';
  if (days <= 2) return 'text-orange-400';
  if (days <= 7) return 'themed-accent';
  return 'themed-text/40';
}

function urgencyBg(days: number, done: boolean): string {
  if (done) return 'bg-emerald-500/[0.04] border-emerald-500/[0.08]';
  if (days < 0) return 'bg-red-500/[0.06] border-red-500/[0.12]';
  if (days <= 2) return 'bg-orange-500/[0.06] border-orange-500/[0.12]';
  if (days <= 7) return 'bg-yellow-400/[0.04] border-yellow-400/[0.1]';
  return 'themed-surface border-transparent';
}

function daysLabel(days: number): string {
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `${days}d left`;
}

export default function DeadlinePanel({ componentNames }: Props) {
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newComponent, setNewComponent] = useState('');
  const [newDate, setNewDate] = useState('');
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setDeadlines(getDeadlines());
  }, []);

  const addDeadline = () => {
    if (!newLabel.trim() || !newDate) return;
    const d: Deadline = {
      id: `dl-${Date.now()}`,
      label: newLabel.trim(),
      componentName: newComponent || '',
      date: newDate,
      done: false,
    };
    const updated = [...deadlines, d].sort((a, b) => a.date.localeCompare(b.date));
    setDeadlines(updated);
    saveDeadlines(updated);
    setNewLabel('');
    setNewComponent('');
    setNewDate('');
    setShowAdd(false);
  };

  const toggleDone = (id: string) => {
    const updated = deadlines.map(d => d.id === id ? { ...d, done: !d.done } : d);
    setDeadlines(updated);
    saveDeadlines(updated);
  };

  const deleteDeadline = (id: string) => {
    const updated = deadlines.filter(d => d.id !== id);
    setDeadlines(updated);
    saveDeadlines(updated);
  };

  const upcoming = deadlines.filter(d => !d.done).sort((a, b) => a.date.localeCompare(b.date));
  const overdue = upcoming.filter(d => daysUntil(d.date) < 0).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-gradient-to-br from-orange-500/[0.03] to-red-500/[0.02] border border-orange-500/[0.08] overflow-hidden"
    >
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full p-5 flex items-center gap-3 text-left cursor-pointer"
      >
        <Bell className="w-4 h-4 text-orange-400/70" />
        <h2 className="text-sm font-semibold themed-text/70 flex-1">Deadline Reminders</h2>
        <div className="flex items-center gap-2">
          {overdue > 0 && (
            <span className="text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full">
              {overdue} overdue
            </span>
          )}
          {upcoming.length > 0 && overdue === 0 && (
            <span className="text-[10px] themed-text/20">{upcoming.length}</span>
          )}
          <Clock className={`w-3.5 h-3.5 transition-transform ${collapsed ? '' : 'rotate-180'} themed-text/20`} />
        </div>
      </button>

      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-2">
              {deadlines.length === 0 && !showAdd && (
                <p className="text-[11px] themed-text/25 text-center py-2">No deadlines yet. Add one to stay on track.</p>
              )}

              <AnimatePresence initial={false}>
                {deadlines
                  .slice()
                  .sort((a, b) => {
                    if (a.done !== b.done) return a.done ? 1 : -1;
                    return a.date.localeCompare(b.date);
                  })
                  .map(dl => {
                    const days = daysUntil(dl.date);
                    return (
                      <motion.div
                        key={dl.id}
                        layout
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-colors group ${urgencyBg(days, dl.done)}`}
                      >
                        <button onClick={() => toggleDone(dl.id)} className="cursor-pointer shrink-0">
                          {dl.done
                            ? <CheckCircle2 className="w-4 h-4 text-emerald-400/60" />
                            : days < 0
                            ? <AlertCircle className="w-4 h-4 text-red-400" />
                            : <Circle className="w-4 h-4 themed-text/20" />
                          }
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className={`text-[11px] font-medium truncate ${dl.done ? 'line-through themed-text/25' : 'themed-text/70'}`}>
                            {dl.label}
                          </p>
                          {dl.componentName && (
                            <p className="text-[9px] themed-text/25 truncate">{dl.componentName}</p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <p className={`text-[10px] font-semibold ${dl.done ? 'text-emerald-400/40' : urgencyClass(days, dl.done)}`}>
                            {dl.done ? 'Done' : daysLabel(days)}
                          </p>
                          <p className="text-[9px] themed-text/20">
                            {new Date(dl.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                        <button
                          onClick={() => deleteDeadline(dl.id)}
                          className="themed-text/10 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shrink-0"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </motion.div>
                    );
                  })}
              </AnimatePresence>

              <AnimatePresence>
                {showAdd && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="rounded-xl themed-surface border themed-border-subtle p-4 space-y-3">
                      <h3 className="text-[10px] font-semibold themed-text/40 uppercase tracking-wider">New Deadline</h3>
                      <div className="space-y-2">
                        <input
                          value={newLabel}
                          onChange={e => setNewLabel(e.target.value)}
                          placeholder="e.g. Midterm Exam, Lab Report"
                          autoFocus
                          className="w-full themed-surface-h border themed-border-subtle rounded-lg px-3 py-2 text-xs themed-text placeholder:themed-text/20 focus:outline-none focus:border-orange-400/40"
                        />
                        {componentNames.length > 0 && (
                          <select
                            value={newComponent}
                            onChange={e => setNewComponent(e.target.value)}
                            className="w-full themed-surface-h border themed-border-subtle rounded-lg px-3 py-2 text-xs themed-text focus:outline-none focus:border-orange-400/40 bg-transparent"
                          >
                            <option value="">No component (general deadline)</option>
                            {componentNames.map(n => (
                              <option key={n} value={n}>{n}</option>
                            ))}
                          </select>
                        )}
                        <input
                          type="date"
                          value={newDate}
                          onChange={e => setNewDate(e.target.value)}
                          className="w-full themed-surface-h border themed-border-subtle rounded-lg px-3 py-2 text-xs themed-text focus:outline-none focus:border-orange-400/40"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={addDeadline}
                          disabled={!newLabel.trim() || !newDate}
                          className="flex-1 py-1.5 rounded-lg bg-orange-400/15 hover:bg-orange-400/25 text-[11px] text-orange-300/80 font-medium transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Add Deadline
                        </button>
                        <button
                          onClick={() => setShowAdd(false)}
                          className="flex-1 py-1.5 rounded-lg themed-surface-h themed-text/30 text-[11px] hover:themed-surface-raised cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {!showAdd && (
                <button
                  onClick={() => setShowAdd(true)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-dashed border-orange-500/15 hover:border-orange-500/25 themed-text/25 hover:text-orange-400/60 text-[11px] transition-all cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Add Deadline
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Fix missing Circle import
function Circle({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}
