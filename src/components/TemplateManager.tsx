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
        <button disabled className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-muted bg-surface/50 text-[11px] font-medium cursor-not-allowed border border-transparent">
          <Lock className="w-3 h-3" /> Templates
        </button>
        <div className="absolute bottom-full left-0 mb-1 px-2 py-1 bg-surface border border-border rounded text-[10px] text-muted whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
          Premium feature — save/load templates
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-surface border border-border hover:bg-surface-hover hover:border-border-hover text-muted hover:text-foreground text-[11px] font-medium transition-colors cursor-pointer shadow-sm"
      >
        <FolderOpen className="w-3 h-3" /> Templates
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.95 }}
            className="absolute top-full right-0 mt-2 w-72 rounded-xl bg-surface border border-border shadow-xl z-50 overflow-hidden"
          >
            <div className="p-3 border-b border-border flex items-center justify-between bg-background/50">
              <h3 className="text-xs font-semibold text-foreground">Local Templates</h3>
              <button onClick={() => setOpen(false)} className="text-muted hover:text-foreground cursor-pointer transition-colors p-1">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto p-2 space-y-1.5 bg-background">
              {templates.length === 0 ? (
                <p className="text-[11px] text-muted text-center py-6 font-medium">No saved templates yet</p>
              ) : (
                templates.map((tmpl, i) => (
                  <div key={i} className="flex items-center gap-2 px-2.5 py-2 rounded-md bg-surface border border-transparent hover:border-border transition-colors group">
                    <button
                      onClick={() => handleLoad(tmpl)}
                      className="flex-1 text-left min-w-0 cursor-pointer"
                    >
                      <p className="text-[11px] font-semibold text-foreground truncate">{tmpl.name}</p>
                      <p className="text-[9px] text-muted mt-0.5 font-mono">{tmpl.components.length} components · {new Date(tmpl.savedAt).toLocaleDateString()}</p>
                    </button>
                    <button
                      onClick={() => handleDelete(i)}
                      className="text-muted hover:text-destructive cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity p-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="p-2 border-t border-border bg-background/50">
              {showSave ? (
                <div className="flex gap-1.5 items-center">
                  <input
                    value={saveName}
                    onChange={e => setSaveName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSave()}
                    placeholder="Template name..."
                    className="flex-1 bg-background border border-border rounded-md px-2 py-1.5 text-[11px] text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 transition-colors shadow-sm"
                    autoFocus
                  />
                  <button onClick={handleSave} className="p-1.5 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer border border-primary/20">
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setShowSave(false)} className="p-1.5 rounded-md text-muted hover:text-foreground hover:bg-surface transition-colors cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setShowSave(true)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md bg-surface border border-dashed border-border hover:border-border-hover hover:bg-surface-hover text-muted hover:text-foreground text-[10px] uppercase tracking-wider font-medium cursor-pointer transition-colors"
                  >
                    <FileDown className="w-3.5 h-3.5" /> Save Current
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
