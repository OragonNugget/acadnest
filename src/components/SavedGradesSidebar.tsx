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
    return (
      <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-4">
        <div className="flex items-center gap-2 mb-2">
          <Lock className="w-3.5 h-3.5 text-white/15" />
          <h3 className="text-xs font-medium text-white/25">Saved Grades</h3>
        </div>
        <p className="text-[10px] text-white/15">Save & switch between multiple subjects</p>
      </div>
    );
  }

  return (
    <motion.div
      layout
      className="rounded-2xl bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/[0.06] overflow-hidden"
    >
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full p-4 flex items-center gap-2 text-left cursor-pointer"
      >
        <BookMarked className="w-4 h-4 text-rose-300/60" />
        <h3 className="text-xs font-semibold text-white/60 flex-1">Saved Grades</h3>
        <span className="text-[10px] text-white/20">{savedGrades.length}</span>
        {collapsed ? <ChevronRight className="w-3.5 h-3.5 text-white/20" /> : <ChevronLeft className="w-3.5 h-3.5 text-white/20" />}
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
                      ? 'bg-rose-300/10 border border-rose-300/20'
                      : 'bg-white/[0.02] border border-transparent hover:bg-white/[0.04]'
                  }`}
                >
                  <button
                    onClick={() => onLoad(grade)}
                    className="flex-1 text-left min-w-0 cursor-pointer"
                  >
                    <p className="text-[11px] font-medium text-white/60 truncate">{grade.name}</p>
                    <p className="text-[10px] text-white/25">
                      {grade.current_grade.toFixed(1)}% · {new Date(grade.created_at).toLocaleDateString()}
                    </p>
                  </button>
                  {activeGradeId === grade.id && (
                    <button
                      onClick={() => onUpdate(grade.id)}
                      className="text-white/20 hover:text-rose-300 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Update save"
                    >
                      <Save className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    onClick={() => onDelete(grade.id)}
                    className="text-white/15 hover:text-red-400 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {showSaveForm ? (
                <div className="flex gap-2 items-center bg-white/[0.02] rounded-lg p-2">
                  <input
                    value={saveName}
                    onChange={e => setSaveName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSave()}
                    placeholder="e.g. Calculus II"
                    className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded px-2 py-1 text-[11px] text-white placeholder:text-white/20 focus:outline-none focus:border-rose-300/40"
                    autoFocus
                  />
                  <button onClick={handleSave} className="text-[10px] text-rose-200 hover:text-rose-100 cursor-pointer">Save</button>
                  <button onClick={() => setShowSaveForm(false)} className="text-[10px] text-white/25 hover:text-white/40 cursor-pointer">✕</button>
                </div>
              ) : (
                <button
                  onClick={() => setShowSaveForm(true)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] text-white/25 hover:text-white/40 text-[11px] transition-colors cursor-pointer"
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
