import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, Trash2, CheckCircle, Circle, Plus, X, ChevronDown, ChevronUp, Lock } from 'lucide-react';
import type { Component as GradeComponent } from '../lib/calculationEngine';

interface Props {
  component: GradeComponent;
  average: number;
    onDelete: (id: number) => void;
  onUpdate: (id: number, data: Partial<GradeComponent>) => void;
  onToggleDone: (id: number, done: boolean) => void;
  onAddEntry: (componentId: number, score: number, maxScore: number, label: string) => void;
  onDeleteEntry: (entryId: number) => void;
}

export default function ComponentCard({
  component, average, onDelete, onUpdate, onToggleDone, onAddEntry, onDeleteEntry
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

  const avgColor = average < 0 ? 'themed-text/30' : average >= 80 ? 'text-emerald-400' : average >= 60 ? 'themed-accent' : 'text-red-400';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="rounded-xl themed-surface border themed-border overflow-hidden hover:themed-border-subtle transition-colors"
    >
      {/* Header */}
      <div className="p-4 flex items-center gap-3">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex-1 flex items-center gap-3 text-left cursor-pointer"
        >
          <div className={`w-2 h-2 rounded-full ${component.done ? 'bg-emerald-400' : 'bg-yellow-300/60'}`} />
          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                <input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="themed-surface-raised border themed-border-subtle rounded px-2 py-0.5 text-sm themed-text w-32 focus:outline-none focus:border-yellow-300/40"
                  autoFocus
                />
                <input
                  value={editWeight}
                  onChange={e => setEditWeight(e.target.value)}
                  className="themed-surface-raised border themed-border-subtle rounded px-2 py-0.5 text-sm themed-text w-16 focus:outline-none focus:border-yellow-300/40"
                  type="number"
                />
                <span className="text-xs themed-text/30 self-center">%</span>
                <button onClick={handleSaveEdit} className="text-xs text-emerald-400 hover:text-emerald-300 cursor-pointer">Save</button>
                <button onClick={() => setEditing(false)} className="text-xs themed-text/30 hover:themed-text/50 cursor-pointer">Cancel</button>
              </div>
            ) : (
              <>
                <h3 className="text-sm font-semibold themed-text truncate">{component.name}</h3>
                <p className="text-[11px] themed-text/30">Weight: {component.weight}% · {component.entries.length} entries</p>
              </>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-lg font-bold ${avgColor}`}>
              {average >= 0 ? `${average.toFixed(1)}%` : '—'}
            </span>
            {expanded ? <ChevronUp className="w-4 h-4 themed-text/20" /> : <ChevronDown className="w-4 h-4 themed-text/20" />}
          </div>
        </button>
      </div>

      {/* Action buttons */}
      <div className="px-4 pb-3 flex items-center gap-2 border-t themed-border pt-3">
        {true ? (
          <button
            onClick={() => { setEditing(true); setExpanded(true); }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md themed-surface-h hover:themed-surface-raised themed-text/40 hover:themed-text/60 text-[11px] transition-colors cursor-pointer"
          >
            <Pencil className="w-3 h-3" /> Edit
          </button>
        ) : (
          <div className="relative group">
            <button
              disabled
              className="flex items-center gap-1 px-2.5 py-1 rounded-md themed-surface themed-text/20 text-[11px] cursor-not-allowed"
            >
              <Lock className="w-3 h-3" /> Edit
            </button>
            <div className="absolute bottom-full left-0 mb-1 px-2 py-1 themed-tooltip border themed-border-subtle rounded text-[10px] themed-text/50 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
            </div>
          </div>
        )}
        <button
          onClick={() => onDelete(component.id)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-md themed-surface-h hover:bg-red-500/10 themed-text/40 hover:text-red-400 text-[11px] transition-colors cursor-pointer"
        >
          <Trash2 className="w-3 h-3" /> Delete
        </button>
        {true ? (
          <button
            onClick={() => onToggleDone(component.id, !component.done)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] transition-colors cursor-pointer ${
              component.done
                ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                : 'themed-surface-h themed-text/40 hover:themed-surface-raised hover:themed-text/60'
            }`}
          >
            {component.done ? <CheckCircle className="w-3 h-3" /> : <Circle className="w-3 h-3" />}
            {component.done ? 'Done' : 'Mark Done'}
          </button>
        ) : (
          <div className="relative group">
            <button
              disabled
              className="flex items-center gap-1 px-2.5 py-1 rounded-md themed-surface themed-text/20 text-[11px] cursor-not-allowed"
            >
              <Lock className="w-3 h-3" /> Toggle Done
            </button>
            <div className="absolute bottom-full left-0 mb-1 px-2 py-1 themed-tooltip border themed-border-subtle rounded text-[10px] themed-text/50 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
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
            <div className="px-4 pb-4 border-t themed-border pt-3">
              {component.entries.length === 0 ? (
                <p className="text-xs themed-text/20 text-center py-2">No entries yet</p>
              ) : (
                <div className="space-y-1.5 mb-3">
                  {component.entries.map((entry, i) => (
                    <div key={entry.id} className="flex items-center justify-between px-3 py-1.5 rounded-lg themed-surface group">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] themed-text/20 w-5">#{i + 1}</span>
                        {entry.label && <span className="text-xs themed-text/40">{entry.label}</span>}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm themed-text/70 font-mono">
                          {entry.score}<span className="themed-text/20">/</span>{entry.max_score}
                        </span>
                        <span className={`text-xs font-medium ${
                          (entry.score / entry.max_score * 100) >= 80 ? 'text-emerald-400/70' :
                          (entry.score / entry.max_score * 100) >= 60 ? 'themed-accent/70' : 'text-red-400/70'
                        }`}>
                          {(entry.score / entry.max_score * 100).toFixed(0)}%
                        </span>
                        <button
                          onClick={() => onDeleteEntry(entry.id)}
                          className="opacity-0 group-hover:opacity-100 themed-text/20 hover:text-red-400 transition-all cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {showAddEntry ? (
                <div className="flex flex-wrap gap-2 items-end themed-surface rounded-lg p-3">
                  <div>
                    <label className="text-[10px] themed-text/30 block mb-1">Label</label>
                    <input
                      value={newLabel}
                      onChange={e => setNewLabel(e.target.value)}
                      placeholder="e.g. Quiz 3"
                      className="themed-surface-raised border themed-border-subtle rounded px-2 py-1 text-xs themed-text w-24 focus:outline-none focus:border-yellow-300/40"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] themed-text/30 block mb-1">Score</label>
                    <input
                      value={newScore}
                      onChange={e => setNewScore(e.target.value)}
                      type="number"
                      min={0}
                      placeholder="85"
                      className="themed-surface-raised border themed-border-subtle rounded px-2 py-1 text-xs themed-text w-16 focus:outline-none focus:border-yellow-300/40"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="text-[10px] themed-text/30 block mb-1">Max</label>
                    <input
                      value={newMax}
                      onChange={e => setNewMax(e.target.value)}
                      type="number"
                      min={1}
                      placeholder="100"
                      className="themed-surface-raised border themed-border-subtle rounded px-2 py-1 text-xs themed-text w-16 focus:outline-none focus:border-yellow-300/40"
                    />
                  </div>
                  <button onClick={handleAddEntry} className="px-3 py-1 rounded-md bg-yellow-300/20 themed-accent-soft text-xs hover:bg-yellow-300/30 transition-colors cursor-pointer">Add</button>
                  <button onClick={() => setShowAddEntry(false)} className="px-3 py-1 rounded-md themed-surface-h themed-text/30 text-xs hover:themed-surface-raised transition-colors cursor-pointer">Cancel</button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddEntry(true)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg themed-surface hover:themed-surface-h themed-text/30 hover:themed-text/50 text-xs transition-colors cursor-pointer"
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
