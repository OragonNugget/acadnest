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

  const avgColor = average < 0 ? 'text-muted/50' : average >= 80 ? 'text-success' : average >= 60 ? 'text-accent' : 'text-destructive';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="rounded-xl bg-surface border border-border overflow-hidden hover:border-border-hover transition-colors shadow-sm relative"
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
                  className="bg-background border border-border rounded px-2 py-0.5 text-sm text-foreground w-32 focus:outline-none focus:border-primary/40"
                  autoFocus
                />
                <input
                  value={editWeight}
                  onChange={e => setEditWeight(e.target.value)}
                  className="bg-background border border-border rounded px-2 py-0.5 text-sm text-foreground w-16 focus:outline-none focus:border-primary/40"
                  type="number"
                />
                <span className="text-xs text-muted self-center">%</span>
                <button onClick={handleSaveEdit} className="text-xs font-bold text-success hover:text-success/80 cursor-pointer">Save</button>
                <button onClick={() => setEditing(false)} className="text-xs font-semibold text-muted hover:text-foreground cursor-pointer">Cancel</button>
              </div>
            ) : (
              <>
                <h3 className="text-sm font-semibold text-foreground truncate">{component.name}</h3>
                <p className="text-xs text-muted mt-0.5">Weight: {component.weight}% · {component.entries.length} entries</p>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-base font-bold ${avgColor} font-mono`}>
              {average >= 0 ? `${average.toFixed(1)}%` : '—'}
            </span>
            {expanded ? <ChevronUp className="w-4 h-4 text-muted" /> : <ChevronDown className="w-4 h-4 text-muted" />}
          </div>
        </button>
      </div>

      {/* Action buttons */}
      <div className="px-4 pb-4 flex flex-wrap items-center gap-2 border-t border-border pt-3 bg-background/30">
        {isPremium ? (
          <button
            onClick={() => { setEditing(true); setExpanded(true); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-muted hover:text-foreground hover:bg-surface-hover text-xs transition-colors cursor-pointer border border-transparent hover:border-border"
          >
            <Pencil className="w-3 h-3" /> Edit
          </button>
        ) : (
          <div className="relative group">
            <button
              disabled
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-surface border border-border text-muted text-xs cursor-not-allowed shadow-sm font-semibold"
            >
              <Lock className="w-3.5 h-3.5 text-muted/50" /> Edit
            </button>
            <div className="absolute bottom-full left-0 mb-2 px-2.5 py-1.5 bg-background border border-border rounded-md text-[10px] font-semibold text-muted whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
              Premium feature — upgrade to edit
            </div>
          </div>
        )}
        <button
          onClick={() => onDelete(component.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-muted hover:text-destructive hover:bg-destructive/10 text-xs transition-colors cursor-pointer border border-transparent hover:border-destructive/20"
        >
          <Trash2 className="w-3 h-3" /> Delete
        </button>
        {isPremium ? (
          <button
            onClick={() => onToggleDone(component.id, !component.done)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-colors cursor-pointer border ${
              component.done
                ? 'bg-success/10 text-success border-success/20 hover:bg-success/20'
                : 'text-muted border-transparent hover:text-foreground hover:bg-surface-hover hover:border-border'
            }`}
          >
            {component.done ? <CheckCircle className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
            {component.done ? 'Done' : 'Mark Done'}
          </button>
        ) : (
          <div className="relative group">
            <button
              disabled
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-surface border border-border text-muted text-xs cursor-not-allowed shadow-sm font-semibold"
            >
              <Lock className="w-3.5 h-3.5 text-muted/50" /> Toggle Done
            </button>
            <div className="absolute bottom-full left-0 mb-2 px-2.5 py-1.5 bg-background border border-border rounded-md text-[10px] font-semibold text-muted whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
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
            className="overflow-hidden bg-background/50"
          >
            <div className="px-4 pb-4 border-t border-border pt-3">
              {component.entries.length === 0 ? (
                <p className="text-xs text-muted text-center py-4 border border-dashed border-border rounded-lg mb-2">No entries yet</p>
              ) : (
                <div className="space-y-1.5 mb-3">
                  {component.entries.map((entry, i) => (
                    <div key={entry.id} className="flex items-center justify-between px-3 py-2 rounded-md bg-surface group border border-border/50 hover:border-border transition-colors">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-muted w-4 font-mono font-medium">0{i + 1}</span>
                        {entry.label && <span className="text-sm font-medium text-foreground">{entry.label}</span>}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-foreground font-mono">
                          {entry.score}<span className="text-muted/60">/</span>{entry.max_score}
                        </span>
                        <span className={`text-xs font-bold ${
                          (entry.score / entry.max_score * 100) >= 80 ? 'text-success' :
                          (entry.score / entry.max_score * 100) >= 60 ? 'text-accent' : 'text-destructive'
                        }`}>
                          {(entry.score / entry.max_score * 100).toFixed(0)}%
                        </span>
                        <button
                          onClick={() => onDeleteEntry(entry.id)}
                          className="opacity-0 group-hover:opacity-100 text-muted hover:text-destructive transition-all cursor-pointer p-1 rounded hover:bg-destructive/10"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {showAddEntry ? (
                <div className="flex flex-wrap gap-3 items-end bg-background rounded-lg p-4 border border-border">
                  <div className="flex-1 min-w-[100px]">
                    <label className="text-[11px] font-medium text-muted uppercase tracking-wider block mb-1.5">Label</label>
                    <input
                      value={newLabel}
                      onChange={e => setNewLabel(e.target.value)}
                      placeholder="e.g. Quiz 3"
                      className="w-full bg-surface border border-border rounded-md px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>
                  <div className="w-20">
                    <label className="text-[11px] font-medium text-muted uppercase tracking-wider block mb-1.5">Score</label>
                    <input
                      value={newScore}
                      onChange={e => setNewScore(e.target.value)}
                      type="number"
                      min={0}
                      placeholder="85"
                      className="w-full bg-surface border border-border rounded-md px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                      autoFocus
                    />
                  </div>
                  <div className="w-20">
                    <label className="text-[11px] font-medium text-muted uppercase tracking-wider block mb-1.5">Max</label>
                    <input
                      value={newMax}
                      onChange={e => setNewMax(e.target.value)}
                      type="number"
                      min={1}
                      placeholder="100"
                      className="w-full bg-surface border border-border rounded-md px-3 py-1.5 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>
                  <button onClick={handleAddEntry} className="px-4 py-1.5 h-[34px] rounded-md bg-primary/10 text-primary font-medium text-sm hover:bg-primary/20 transition-colors cursor-pointer border border-primary/20 shadow-sm">Add</button>
                  <button onClick={() => setShowAddEntry(false)} className="px-4 py-1.5 h-[34px] rounded-md bg-surface text-muted text-sm hover:text-foreground hover:bg-surface-hover transition-colors cursor-pointer border border-border">Cancel</button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddEntry(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-surface hover:bg-surface-hover text-muted hover:text-foreground text-sm transition-colors border border-dashed border-border hover:border-border-hover cursor-pointer shadow-sm"
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
