import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Save, ChevronLeft, ChevronRight, BookMarked, Lock } from 'lucide-react';

export interface SavedGrade {
  id: number;
  student_id: string;
  name: string;
  components_snapshot: any[];
  current_grade: number;
  created_at: string;
}

interface Props {
  savedGrades: SavedGrade[];
  activeGradeId: number | null;
  isPremium: boolean;
  currentGrade: number;
  onSave: (name: string) => void;
  onLoad: (grade: SavedGrade) => void;
  onDelete: (id: number) => void;
  onUpdate: (id: number) => void;
}

export default function SavedGradesSidebar({
  savedGrades, activeGradeId, isPremium, onSave, onLoad, onDelete, onUpdate
}: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [saveName, setSaveName] = useState('');

  const handleSave = () => {
    if (!saveName.trim()) return;
    onSave(saveName.trim());
    setSaveName('');
    setShowSaveForm(false);
  };

  if (!isPremium) {
      <div className="rounded-xl flex flex-col items-center justify-center text-center bg-surface border border-border p-6 shadow-sm">
        <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center mb-3 border border-border">
          <Lock className="w-4 h-4 text-muted/50" />
        </div>
        <h3 className="text-sm font-semibold text-muted font-sans mb-1">Saved Grades Locked</h3>
        <p className="text-xs text-muted/60">Save & switch between multiple subjects</p>
      </div>
  }

  return (
    <motion.div
      layout
      className="rounded-xl bg-surface border border-border overflow-hidden shadow-sm"
    >
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full p-4 flex items-center gap-3 text-left cursor-pointer hover:bg-surface-hover transition-colors"
      >
        <BookMarked className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground flex-1">Saved Grades</h3>
        <span className="text-[10px] font-mono text-muted bg-background border border-border px-1.5 py-0.5 rounded-md">{savedGrades.length}</span>
        {collapsed ? <ChevronRight className="w-4 h-4 text-muted" /> : <ChevronLeft className="w-4 h-4 text-muted" />}
      </button>

      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-2">
              {savedGrades.map(grade => (
                <div
                  key={grade.id}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-md transition-colors group ${
                    activeGradeId === grade.id
                      ? 'bg-primary/10 border border-primary/20'
                      : 'bg-background/50 border border-transparent hover:bg-surface-hover'
                  }`}
                >
                  <button
                    onClick={() => onLoad(grade)}
                    className="flex-1 text-left min-w-0 cursor-pointer"
                  >
                    <p className="text-sm font-medium text-foreground truncate">{grade.name}</p>
                    <p className="text-[11px] text-muted font-mono mt-0.5">
                      {grade.current_grade.toFixed(1)}% · <span className="opacity-60">{new Date(grade.created_at).toLocaleDateString()}</span>
                    </p>
                  </button>
                  {activeGradeId === grade.id && (
                    <button
                      onClick={() => onUpdate(grade.id)}
                      className="text-muted hover:text-primary cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity p-1"
                      title="Update save"
                    >
                      <Save className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={() => onDelete(grade.id)}
                    className="text-muted hover:text-destructive cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {showSaveForm ? (
                <div className="flex gap-2 items-center bg-background rounded-md p-2 border border-border">
                  <input
                    value={saveName}
                    onChange={e => setSaveName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSave()}
                    placeholder="e.g. Calculus II"
                    className="flex-1 bg-surface border border-border rounded px-2 py-1 text-xs text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors"
                    autoFocus
                  />
                  <button onClick={handleSave} className="text-[11px] font-medium text-primary hover:text-primary-hover cursor-pointer px-1">Save</button>
                  <button onClick={() => setShowSaveForm(false)} className="text-[11px] text-muted hover:text-foreground cursor-pointer px-1">✕</button>
                </div>
              ) : (
                <button
                  onClick={() => setShowSaveForm(true)}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-md bg-background border border-dashed border-border hover:border-border-hover hover:bg-surface-hover text-muted hover:text-foreground text-xs transition-colors cursor-pointer shadow-sm"
                >
                  <Plus className="w-3 h-3" /> Save Current Model
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
