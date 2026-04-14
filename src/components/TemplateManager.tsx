import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileDown, Lock, Download, FolderOpen, X } from 'lucide-react';

interface TemplateComponent {
  name: string;
  weight: number;
}

interface LocalTemplate {
  name: string;
  components: TemplateComponent[];
  savedAt: string;
}

interface Props {
  isPremium: boolean;
  currentComponents: { name: string; weight: number }[];
  onApplyTemplate: (components: TemplateComponent[]) => void;
}

const LS_KEY = 'acadnest_templates';

function getLocalTemplates(): LocalTemplate[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveLocalTemplates(templates: LocalTemplate[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(templates));
}

export default function TemplateManager({ isPremium, currentComponents, onApplyTemplate }: Props) {
  const [open, setOpen] = useState(false);
  const [templates, setTemplates] = useState<LocalTemplate[]>(getLocalTemplates);
  const [saveName, setSaveName] = useState('');
  const [showSave, setShowSave] = useState(false);

  const handleSave = () => {
    if (!saveName.trim() || currentComponents.length === 0) return;
    const newTemplate: LocalTemplate = {
      name: saveName.trim(),
      components: currentComponents.map(c => ({ name: c.name, weight: c.weight })),
      savedAt: new Date().toISOString(),
    };
    const updated = [newTemplate, ...templates];
    setTemplates(updated);
    saveLocalTemplates(updated);
    setSaveName('');
    setShowSave(false);
  };

  const handleDelete = (index: number) => {
    const updated = templates.filter((_, i) => i !== index);
    setTemplates(updated);
    saveLocalTemplates(updated);
  };

  const handleLoad = (tmpl: LocalTemplate) => {
    onApplyTemplate(tmpl.components);
    setOpen(false);
  };

  if (!isPremium) {
    return (
      <div className="relative group inline-block">
        <button disabled className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.02] text-white/20 text-[11px] cursor-not-allowed">
          <Lock className="w-3 h-3" /> Templates
        </button>
        <div className="absolute bottom-full left-0 mb-1 px-2 py-1 bg-[#1a1a2e] border border-white/[0.1] rounded text-[10px] text-white/50 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
          Premium feature — save/load grading templates
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/40 hover:text-white/60 text-[11px] transition-colors cursor-pointer"
      >
        <FolderOpen className="w-3 h-3" /> Templates
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.95 }}
            className="absolute top-full right-0 mt-2 w-72 rounded-xl bg-[#12121f] border border-white/[0.08] shadow-2xl shadow-black/40 z-50 overflow-hidden"
          >
            <div className="p-3 border-b border-white/[0.06] flex items-center justify-between">
              <h3 className="text-xs font-semibold text-white/60">Local Templates</h3>
              <button onClick={() => setOpen(false)} className="text-white/20 hover:text-white/40 cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto p-2 space-y-1.5">
              {templates.length === 0 ? (
                <p className="text-[11px] text-white/20 text-center py-4">No saved templates yet</p>
              ) : (
                templates.map((tmpl, i) => (
                  <div key={i} className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] group">
                    <button
                      onClick={() => handleLoad(tmpl)}
                      className="flex-1 text-left min-w-0 cursor-pointer"
                    >
                      <p className="text-[11px] font-medium text-white/50 truncate">{tmpl.name}</p>
                      <p className="text-[9px] text-white/20">{tmpl.components.length} components · {new Date(tmpl.savedAt).toLocaleDateString()}</p>
                    </button>
                    <button
                      onClick={() => handleDelete(i)}
                      className="text-white/10 hover:text-red-400 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="p-2 border-t border-white/[0.06]">
              {showSave ? (
                <div className="flex gap-1.5 items-center">
                  <input
                    value={saveName}
                    onChange={e => setSaveName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSave()}
                    placeholder="Template name..."
                    className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded px-2 py-1 text-[11px] text-white placeholder:text-white/20 focus:outline-none focus:border-amber-400/40"
                    autoFocus
                  />
                  <button onClick={handleSave} className="px-2 py-1 rounded bg-amber-400/15 text-amber-300 text-[10px] hover:bg-amber-400/25 cursor-pointer">
                    <Download className="w-3 h-3" />
                  </button>
                  <button onClick={() => setShowSave(false)} className="text-white/20 hover:text-white/40 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setShowSave(true)}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md bg-white/[0.03] hover:bg-white/[0.06] text-white/30 text-[10px] cursor-pointer transition-colors"
                  >
                    <FileDown className="w-3 h-3" /> Save Current
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
