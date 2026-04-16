import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, Trash2, CheckCircle, Circle, Plus, X, ChevronDown, ChevronUp, Lock } from 'lucide-react';
import type { Component as GradeComponent } from '../lib/calculationEngine';

interface Props {
  component: GradeComponent;
  average: number;
  isPremium: boolean;
  onDelete: (id: number) => void;
  onUpdate: (id: number, data: Partial<GradeComponent>) => void;
  onToggleDone: (id: number, done: boolean) => void;
  onAddEntry: (componentId: number, score: number, maxScore: number, label: string) => void;
  onDeleteEntry: (entryId: number) => void;
}

export default function ComponentCard({
  component, average, isPremium, onDelete, onUpdate, onToggleDone, onAddEntry, onDeleteEntry
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(component.name);
  const [editWeight, setEditWeight] = useState(component.weight.toString());
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [newScore, setNewScore] = useState('');
  const [newMax, setNewMax] = useState('100');
  const [newLabel, setNewLabel] = useState('');

  const handleSaveEdit = () => {
    onUpdate(component.id, { name: editName, weight: parseFloat(editWeight) || 0 });
    setEditing(false);
  };

  const handleAddEntry = () => {
    const score = parseFloat(newScore);
    const max = parseFloat(newMax);
    if (isNaN(score) || isNaN(max) || max <= 0) return;
    onAddEntry(component.id, Math.max(0, score), Math.max(0.01, max), newLabel);
    setNewScore('');
    setNewMax('100');
    setNewLabel('');
    setShowAddEntry(false);
  };

  const avgColor = average < 0 ? 'text-white/30' : average >= 80 ? 'text-emerald-400' : average >= 60 ? 'text-amber-400' : 'text-red-400';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="rounded-xl bg-slate-900/40 backdrop-blur-sm border border-slate-800 overflow-hidden hover:border-slate-700 transition-colors shadow-lg"
    >
      {/* Header */}
      <div className="p-4 flex items-center gap-3">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex-1 flex items-center gap-3 text-left cursor-pointer"
        >
          <div className={`w-2 h-2 rounded-full ${component.done ? 'bg-emerald-400' : 'bg-amber-400/60'}`} />
          <div className="flex-1 min-w-0">
            {editing && isPremium ? (
              <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                <input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="bg-white/[0.06] border border-white/[0.1] rounded px-2 py-0.5 text-sm text-white w-32 focus:outline-none focus:border-amber-400/40"
                  autoFocus
                />
                <input
                  value={editWeight}
                  onChange={e => setEditWeight(e.target.value)}
                  className="bg-white/[0.06] border border-white/[0.1] rounded px-2 py-0.5 text-sm text-white w-16 focus:outline-none focus:border-amber-400/40"
                  type="number"
                />
                <span className="text-xs text-white/30 self-center">%</span>
                <button onClick={handleSaveEdit} className="text-xs text-emerald-400 hover:text-emerald-300 cursor-pointer">Save</button>
                <button onClick={() => setEditing(false)} className="text-xs text-white/30 hover:text-white/50 cursor-pointer">Cancel</button>
              </div>
            ) : (
              <>
                <h3 className="text-base font-semibold text-white truncate">{component.name}</h3>
                <p className="text-xs text-white/40 mt-0.5">Weight: {component.weight}% · {component.entries.length} entries</p>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-lg font-bold ${avgColor}`}>
              {average >= 0 ? `${average.toFixed(1)}%` : '—'}
            </span>
            {expanded ? <ChevronUp className="w-4 h-4 text-white/20" /> : <ChevronDown className="w-4 h-4 text-white/20" />}
          </div>
        </button>
      </div>

      {/* Action buttons */}
      <div className="px-4 pb-4 flex flex-wrap items-center gap-2 border-t border-slate-800/50 pt-3">
        {isPremium ? (
          <button
            onClick={() => { setEditing(true); setExpanded(true); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-surface hover:bg-white/[0.08] text-white/50 hover:text-white/80 text-xs transition-colors cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5" /> Edit
          </button>
        ) : (
          <div className="relative group">
            <button
              disabled
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/[0.02] text-white/20 text-xs cursor-not-allowed"
            >
              <Lock className="w-3.5 h-3.5" /> Edit
            </button>
            <div className="absolute bottom-full left-0 mb-1 px-2 py-1 bg-slate-900 border border-white/[0.1] rounded text-[10px] text-white/50 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              Premium feature — upgrade to edit
            </div>
          </div>
        )}
        <button
          onClick={() => onDelete(component.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-surface hover:bg-red-500/10 text-white/50 hover:text-red-400 text-xs transition-colors cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" /> Delete
        </button>
        {isPremium ? (
          <button
            onClick={() => onToggleDone(component.id, !component.done)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
              component.done
                ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                : 'bg-surface text-white/50 hover:bg-white/[0.08] hover:text-white/80'
            }`}
          >
            {component.done ? <CheckCircle className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
            {component.done ? 'Done' : 'Mark Done'}
          </button>
        ) : (
          <div className="relative group">
            <button
              disabled
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/[0.02] text-white/20 text-xs cursor-not-allowed"
            >
              <Lock className="w-3.5 h-3.5" /> Toggle Done
            </button>
            <div className="absolute bottom-full left-0 mb-1 px-2 py-1 bg-slate-900 border border-white/[0.1] rounded text-[10px] text-white/50 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              Premium feature — upgrade to toggle
            </div>
          </div>
        )}
      </div>

      {/* Expanded entries */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-white/[0.04] pt-3">
              {component.entries.length === 0 ? (
                <p className="text-xs text-white/20 text-center py-2">No entries yet</p>
              ) : (
                <div className="space-y-1.5 mb-3">
                  {component.entries.map((entry, i) => (
                    <div key={entry.id} className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-surface group border border-border">
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-white/30 w-5">#{i + 1}</span>
                        {entry.label && <span className="text-sm text-white/60">{entry.label}</span>}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-white/70 font-mono">
                          {entry.score}<span className="text-white/20">/</span>{entry.max_score}
                        </span>
                        <span className={`text-xs font-medium ${
                          (entry.score / entry.max_score * 100) >= 80 ? 'text-emerald-400/70' :
                          (entry.score / entry.max_score * 100) >= 60 ? 'text-amber-400/70' : 'text-red-400/70'
                        }`}>
                          {(entry.score / entry.max_score * 100).toFixed(0)}%
                        </span>
                        <button
                          onClick={() => onDeleteEntry(entry.id)}
                          className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition-all cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {showAddEntry ? (
                <div className="flex flex-wrap gap-3 items-end bg-surface rounded-lg p-4 border border-border">
                  <div className="flex-1 min-w-[100px]">
                    <label className="text-xs text-white/40 block mb-1.5">Label</label>
                    <input
                      value={newLabel}
                      onChange={e => setNewLabel(e.target.value)}
                      placeholder="e.g. Quiz 3"
                      className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                    />
                  </div>
                  <div className="w-20">
                    <label className="text-xs text-white/40 block mb-1.5">Score</label>
                    <input
                      value={newScore}
                      onChange={e => setNewScore(e.target.value)}
                      type="number"
                      min={0}
                      placeholder="85"
                      className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                      autoFocus
                    />
                  </div>
                  <div className="w-20">
                    <label className="text-xs text-white/40 block mb-1.5">Max</label>
                    <input
                      value={newMax}
                      onChange={e => setNewMax(e.target.value)}
                      type="number"
                      min={1}
                      placeholder="100"
                      className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-1.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-colors"
                    />
                  </div>
                  <button onClick={handleAddEntry} className="px-4 py-1.5 h-[34px] rounded-md bg-indigo-500/20 text-indigo-300 text-sm hover:bg-indigo-500/30 transition-colors cursor-pointer">Add</button>
                  <button onClick={() => setShowAddEntry(false)} className="px-4 py-1.5 h-[34px] rounded-md bg-surface text-white/40 text-sm hover:bg-white/[0.08] transition-colors cursor-pointer">Cancel</button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddEntry(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-surface hover:bg-white/[0.06] text-white/40 hover:text-white/60 text-sm transition-colors border border-dashed border-border hover:border-slate-600 cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Add Entry
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
