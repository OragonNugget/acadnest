import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Save, ChevronLeft, ChevronRight, BookMarked } from 'lucide-react';

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
    currentGrade: number;
  onSave: (name: string) => void;
  onLoad: (grade: SavedGrade) => void;
  onDelete: (id: number) => void;
  onUpdate: (id: number) => void;
}

export default function SavedGradesSidebar({
  savedGrades, activeGradeId, onSave, onLoad, onDelete, onUpdate
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


  return (
    <motion.div
      layout
      className="rounded-2xl themed-surface border themed-border overflow-hidden"
    >
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full p-4 flex items-center gap-2 text-left cursor-pointer"
      >
        <BookMarked className="w-4 h-4 themed-accent/60" />
        <h3 className="text-xs font-semibold themed-text/60 flex-1">Saved Grades</h3>
        <span className="text-[10px] themed-text/20">{savedGrades.length}</span>
        {collapsed ? <ChevronRight className="w-3.5 h-3.5 themed-text/20" /> : <ChevronLeft className="w-3.5 h-3.5 themed-text/20" />}
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
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors group ${
                    activeGradeId === grade.id
                      ? 'bg-yellow-300/10 border border-yellow-300/20'
                      : 'themed-surface border border-transparent hover:themed-surface-h'
                  }`}
                >
                  <button
                    onClick={() => onLoad(grade)}
                    className="flex-1 text-left min-w-0 cursor-pointer"
                  >
                    <p className="text-[11px] font-medium themed-text/60 truncate">{grade.name}</p>
                    <p className="text-[10px] themed-text/25">
                      {grade.current_grade.toFixed(1)}% · {new Date(grade.created_at).toLocaleDateString()}
                    </p>
                  </button>
                  {activeGradeId === grade.id && (
                    <button
                      onClick={() => onUpdate(grade.id)}
                      className="themed-text/20 hover:themed-accent cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Update save"
                    >
                      <Save className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    onClick={() => onDelete(grade.id)}
                    className="themed-text/15 hover:text-red-400 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {showSaveForm ? (
                <div className="flex gap-2 items-center themed-surface rounded-lg p-2">
                  <input
                    value={saveName}
                    onChange={e => setSaveName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSave()}
                    placeholder="e.g. Calculus II"
                    className="flex-1 themed-surface-h border themed-border-subtle rounded px-2 py-1 text-[11px] themed-text placeholder:themed-text/20 focus:outline-none focus:border-yellow-300/40"
                    autoFocus
                  />
                  <button onClick={handleSave} className="text-[10px] themed-accent-soft hover:text-yellow-100 cursor-pointer">Save</button>
                  <button onClick={() => setShowSaveForm(false)} className="text-[10px] themed-text/25 hover:themed-text/40 cursor-pointer">✕</button>
                </div>
              ) : (
                <button
                  onClick={() => setShowSaveForm(true)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg themed-surface hover:themed-surface-h themed-text/25 hover:themed-text/40 text-[11px] transition-colors cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Save Current
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
