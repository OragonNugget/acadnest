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
        <button disabled className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg themed-surface themed-text/20 text-[11px] cursor-not-allowed">
          <Lock className="w-3 h-3" /> Templates
        </button>
        <div className="absolute bottom-full left-0 mb-1 px-2 py-1 themed-tooltip border themed-border-subtle rounded text-[10px] themed-text/50 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
          Premium feature — save/load grading templates
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg themed-surface-h hover:themed-surface-raised themed-text/40 hover:themed-text/60 text-[11px] transition-colors cursor-pointer"
      >
        <FolderOpen className="w-3 h-3" /> Templates
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.95 }}
            className="absolute top-full right-0 mt-2 w-72 rounded-xl bg-[#12121f] border themed-border-subtle shadow-2xl shadow-black/40 z-50 overflow-hidden"
          >
            <div className="p-3 border-b themed-border flex items-center justify-between">
              <h3 className="text-xs font-semibold themed-text/60">Local Templates</h3>
              <button onClick={() => setOpen(false)} className="themed-text/20 hover:themed-text/40 cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto p-2 space-y-1.5">
              {templates.length === 0 ? (
                <p className="text-[11px] themed-text/20 text-center py-4">No saved templates yet</p>
              ) : (
                templates.map((tmpl, i) => (
                  <div key={i} className="flex items-center gap-2 px-2.5 py-2 rounded-lg themed-surface hover:themed-surface-h group">
                    <button
                      onClick={() => handleLoad(tmpl)}
                      className="flex-1 text-left min-w-0 cursor-pointer"
                    >
                      <p className="text-[11px] font-medium themed-text/50 truncate">{tmpl.name}</p>
                      <p className="text-[9px] themed-text/20">{tmpl.components.length} components · {new Date(tmpl.savedAt).toLocaleDateString()}</p>
                    </button>
                    <button
                      onClick={() => handleDelete(i)}
                      className="themed-text/10 hover:text-red-400 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="p-2 border-t themed-border">
              {showSave ? (
                <div className="flex gap-1.5 items-center">
                  <input
                    value={saveName}
                    onChange={e => setSaveName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSave()}
                    placeholder="Template name..."
                    className="flex-1 themed-surface-h border themed-border-subtle rounded px-2 py-1 text-[11px] themed-text placeholder:themed-text/20 focus:outline-none focus:border-yellow-300/40"
                    autoFocus
                  />
                  <button onClick={handleSave} className="px-2 py-1 rounded bg-yellow-300/15 themed-accent-soft text-[10px] hover:bg-yellow-300/25 cursor-pointer">
                    <Download className="w-3 h-3" />
                  </button>
                  <button onClick={() => setShowSave(false)} className="themed-text/20 hover:themed-text/40 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setShowSave(true)}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md themed-surface hover:themed-surface-raised themed-text/30 text-[10px] cursor-pointer transition-colors"
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
