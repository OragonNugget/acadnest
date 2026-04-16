import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Plus, Trash2, Save, X, BookMarked,
  ChevronDown, GraduationCap, Lock, Loader2
} from 'lucide-react';
import type { SavedGrade } from '../components/SavedGradesSidebar';
import { percentToGPA, formatGPA, gpaToColor, calculateGWA, GPA_TABLE } from '../lib/gpaScale';
import { useAuth } from '../hooks/useAuth';

interface GWACourse {
  id: string;
  name: string;
  units: number;
  gradePercent: number;
  gpa: number;
  fromSavedGradeId: number | null;
}

interface GWARecord {
  id: number;
  student_id: string;
  name: string;
  semester: string;
  courses: any[];
  gwa: number;
  created_at: string;
}

interface Props {
  onBack: () => void;
  isPremium: boolean;
  savedGrades: SavedGrade[];
}

let idCounter = 0;
function genId() { return `gwa-${++idCounter}-${Date.now()}`; }

export default function GWACalculatorPage({ onBack, isPremium, savedGrades }: Props) {
  const { session } = useAuth();
  const [courses, setCourses] = useState<GWACourse[]>([]);
  const [records, setRecords] = useState<GWARecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saveSemester, setSaveSemester] = useState('');
  const [showSave, setShowSave] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showScaleRef, setShowScaleRef] = useState(false);

  const authHeaders = useCallback((): Record<string, string> => ({
    'Content-Type': 'application/json',
    ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
  }), [session]);

  const fetchRecords = useCallback(async () => {
    try {
      const res = await fetch('/api/gwa', { headers: authHeaders() });
      if (!res.ok) {
        console.error('Fetch GWA records failed:', res.status, await res.json().catch(() => ({})));
        return;
      }
      const data = await res.json();
      setRecords(data || []);
    } catch (err) {
      console.error('Fetch GWA error:', err);
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  useEffect(() => { if (session) fetchRecords(); }, [session, fetchRecords]);

  const gwa = useMemo(() => {
    const valid = courses.filter(c => c.units > 0);
    if (valid.length === 0) return 0;
    return calculateGWA(valid.map(c => ({ gpa: c.gpa, units: c.units })));
  }, [courses]);

  const totalUnits = courses.reduce((s, c) => s + c.units, 0);

  const addManualCourse = () => {
    setCourses([...courses, {
      id: genId(),
      name: '',
      units: 3,
      gradePercent: 0,
      gpa: 5.00,
      fromSavedGradeId: null,
    }]);
  };

  const importFromSaved = (saved: SavedGrade) => {
    // Calculate the grade from snapshot
    const snapshot = saved.components_snapshot as any[];
    let weightedSum = 0;
    let totalWeight = 0;
    for (const comp of snapshot) {
      if (comp.entries && comp.entries.length > 0) {
        const entryAvg = comp.entries.reduce((s: number, e: any) => {
          return s + (e.max_score > 0 ? e.score / e.max_score : 0);
        }, 0) / comp.entries.length * 100;
        weightedSum += entryAvg * (comp.weight || 0);
        totalWeight += comp.weight || 0;
      }
    }
    const percent = totalWeight > 0 ? weightedSum / totalWeight : saved.current_grade;
    const gpa = percentToGPA(percent);

    setCourses([...courses, {
      id: genId(),
      name: saved.name,
      units: 3,
      gradePercent: percent,
      gpa,
      fromSavedGradeId: saved.id,
    }]);
    setShowImport(false);
  };

  const updateCourse = (id: string, field: string, value: any) => {
    setCourses(courses.map(c => {
      if (c.id !== id) return c;
      const updated = { ...c, [field]: value };
      if (field === 'gradePercent') {
        updated.gpa = percentToGPA(Number(value) || 0);
      }
      if (field === 'gpa') {
        updated.gpa = Number(value) || 5.00;
      }
      return updated;
    }));
  };

  const removeCourse = (id: string) => {
    setCourses(courses.filter(c => c.id !== id));
  };

  const handleSave = async () => {
    if (!saveName.trim()) return;
    setSaving(true);
    const res = await fetch('/api/gwa', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        name: saveName.trim(),
        semester: saveSemester.trim(),
        courses: courses.map(c => ({ name: c.name, units: c.units, gradePercent: c.gradePercent, gpa: c.gpa })),
        gwa,
      }),
    });
    if (!res.ok) {
      console.error('Save GWA failed:', res.status, await res.json().catch(() => ({})));
    }
    setSaveName('');
    setSaveSemester('');
    setShowSave(false);
    await fetchRecords();
    setSaving(false);
  };

  const loadRecord = (record: GWARecord) => {
    const loaded = (record.courses as any[]).map((c) => ({
      id: genId(),
      name: c.name || '',
      units: c.units || 0,
      gradePercent: c.gradePercent || 0,
      gpa: c.gpa || 5.00,
      fromSavedGradeId: null,
    }));
    setCourses(loaded);
  };

  const deleteRecord = async (id: number) => {
    setSaving(true);
    const res = await fetch('/api/gwa', {
      method: 'DELETE',
      headers: authHeaders(),
      body: JSON.stringify({ id }),
    });
    if (!res.ok) {
      console.error('Delete GWA failed:', res.status, await res.json().catch(() => ({})));
    }
    await fetchRecords();
    setSaving(false);
  };

  const gwaColor = gpaToColor(gwa);

  if (!isPremium) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center font-sans tracking-tight">
        <div className="text-center bg-surface border border-border p-8 rounded-xl shadow-sm max-w-sm w-full mx-4">
          <div className="w-16 h-16 rounded-full bg-background border border-border flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-muted" />
          </div>
          <h2 className="text-lg font-bold text-foreground mb-2">GWA Calculator Locked</h2>
          <p className="text-sm text-muted mb-8 font-medium">This is a Premium feature.</p>
          <button onClick={onBack} className="text-sm font-semibold text-primary hover:text-primary-hover cursor-pointer transition-colors px-4 py-2 bg-primary/10 rounded-md inline-block">← Back to Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <div className="fixed inset-0 pointer-events-none z-[-1]">
        <div className="absolute top-[20%] left-[40%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px]" />
      </div>

      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-1.5 text-muted hover:text-foreground text-sm cursor-pointer font-medium transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex-1 border-l border-border pl-4">
            <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-primary" />
              GWA Calculator
            </h1>
            <p className="text-[11px] text-muted font-medium mt-0.5">General Weighted Average · <span className="font-mono">1.00–5.00</span> Scale</p>
          </div>
          <button
            onClick={() => setShowScaleRef(!showScaleRef)}
            className="text-[11px] text-muted hover:text-foreground cursor-pointer px-3 py-1.5 rounded-md hover:bg-surface-hover border border-transparent hover:border-border transition-colors font-semibold shadow-sm"
          >
            Scale Reference
          </button>
        </div>
      </header>

      <main className="relative max-w-5xl mx-auto px-4 sm:px-6 py-6">
        {saving && (
          <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20">
            <Loader2 className="w-3 h-3 text-amber-400 animate-spin" />
            <span className="text-[11px] text-amber-300">Saving...</span>
          </div>
        )}

        {/* Scale reference */}
        <AnimatePresence>
          {showScaleRef && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className="rounded-xl bg-surface border border-border p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4 border-b border-border pb-2">
                  <h3 className="text-xs font-bold text-muted uppercase tracking-wider font-sans">GPA Scale Reference</h3>
                  <button onClick={() => setShowScaleRef(false)} className="text-muted hover:text-foreground cursor-pointer p-1 transition-colors"><X className="w-3.5 h-3.5" /></button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {GPA_TABLE.map(entry => (
                    <div key={entry.gpa} className="px-3 py-2.5 rounded-lg bg-background border border-border text-center shadow-sm">
                      <p className="text-sm font-bold font-mono" style={{ color: gpaToColor(entry.gpa) }}>{formatGPA(entry.gpa)}</p>
                      <p className="text-[10px] text-muted font-mono my-0.5">{entry.minPercent}–{entry.maxPercent}%</p>
                      <p className="text-[9px] text-muted/60 font-medium">{entry.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main calculator */}
          <div className="lg:col-span-2 space-y-5">
            {/* GWA display */}
            <div className="rounded-xl bg-surface border border-border p-8 text-center shadow-sm">
              <p className="text-[11px] text-muted uppercase tracking-wider font-bold mb-3">General Weighted Average</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <span className="text-6xl font-black font-mono tracking-tighter" style={{ color: courses.length > 0 ? gwaColor : 'var(--color-muted)' }}>
                  {courses.length > 0 ? formatGPA(gwa) : '—'}
                </span>
                {courses.length > 0 && (
                  <div className="text-center sm:text-left border-t sm:border-t-0 sm:border-l border-border pt-4 sm:pt-0 sm:pl-6">
                    <p className="text-sm font-bold tracking-wide uppercase" style={{ color: gwaColor }}>
                      {gwa <= 1.25 ? 'Dean\'s List' : gwa <= 1.75 ? 'Very Good' : gwa <= 2.50 ? 'Good' : gwa <= 3.00 ? 'Passing' : 'Below Passing'}
                    </p>
                    <p className="text-[11px] text-muted font-medium mt-1"><span className="font-mono">{totalUnits}</span> total units · <span className="font-mono">{courses.length}</span> courses</p>
                  </div>
                )}
              </div>
            </div>

            {/* Course list */}
            <div className="space-y-3">
              {courses.map((course, i) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl bg-background border border-border p-3.5 flex flex-wrap items-center gap-4 group shadow-sm hover:border-border-hover transition-colors"
                >
                  <span className="text-[11px] text-muted font-mono w-5 text-center bg-surface rounded-md py-1 border border-border/50">{i + 1}</span>
                  <div className="flex-1 min-w-[140px]">
                    <input
                      value={course.name}
                      onChange={e => updateCourse(course.id, 'name', e.target.value)}
                      placeholder="Course name"
                      className="w-full bg-transparent text-sm font-medium text-foreground placeholder:text-muted focus:outline-none focus:border-b focus:border-primary pb-0.5 transition-all"
                    />
                  </div>
                  <div className="w-16">
                    <label className="text-[9px] text-muted font-bold uppercase tracking-wider block mb-1">Units</label>
                    <input
                      type="number"
                      min={0}
                      max={12}
                      value={course.units}
                      onChange={e => updateCourse(course.id, 'units', Number(e.target.value) || 0)}
                      className="w-full bg-surface border border-border rounded-md px-2 py-1.5 text-xs text-foreground font-mono text-center focus:outline-none focus:border-primary/50 transition-colors shadow-sm"
                    />
                  </div>
                  <div className="w-20">
                    <label className="text-[9px] text-muted font-bold uppercase tracking-wider block mb-1">Grade %</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step="any"
                      value={course.gradePercent || ''}
                      onChange={e => updateCourse(course.id, 'gradePercent', Number(e.target.value) || 0)}
                      placeholder="—"
                      className="w-full bg-surface border border-border rounded-md px-2 py-1.5 text-xs text-foreground font-mono text-center focus:outline-none focus:border-primary/50 transition-colors shadow-sm"
                    />
                  </div>
                  <div className="w-16 text-center border-l border-border pl-4">
                    <label className="text-[9px] text-muted font-bold uppercase tracking-wider block mb-1">GPA</label>
                    <span className="text-sm font-black font-mono tracking-tight" style={{ color: gpaToColor(course.gpa) }}>
                      {formatGPA(course.gpa)}
                    </span>
                  </div>
                  <button
                    onClick={() => removeCourse(course.id)}
                    className="text-muted hover:text-destructive cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity p-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </div>

            {/* Add buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={addManualCourse}
                className="flex items-center gap-2 px-5 py-2.5 rounded-md border border-dashed border-border hover:border-border-hover bg-background hover:bg-surface text-muted hover:text-foreground text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer shadow-sm"
              >
                <Plus className="w-4 h-4" /> Add Course Manually
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowImport(!showImport)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-md border border-primary/20 bg-primary/10 hover:bg-primary/20 text-primary hover:text-primary-hover text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer shadow-sm"
                >
                  <BookMarked className="w-4 h-4" /> Import from Saved Grades
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showImport ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {showImport && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="absolute top-full left-0 mt-2 w-72 rounded-xl bg-surface border border-border shadow-xl z-40 overflow-hidden"
                    >
                      <div className="p-2 max-h-56 overflow-y-auto space-y-1">
                        {savedGrades.length === 0 ? (
                          <p className="text-[11px] text-muted text-center py-4 font-medium">No saved grades yet</p>
                        ) : (
                          savedGrades.map(sg => (
                            <button
                              key={sg.id}
                              onClick={() => importFromSaved(sg)}
                              className="w-full text-left px-3.5 py-2.5 rounded-md hover:bg-background border border-transparent hover:border-border text-xs text-muted hover:text-foreground cursor-pointer transition-colors group flex items-center justify-between"
                            >
                              <p className="font-semibold truncate">{sg.name}</p>
                              <p className="text-[10px] bg-background border border-border px-1.5 py-0.5 rounded font-mono group-hover:border-primary/30 transition-colors">{sg.current_grade.toFixed(1)}%</p>
                            </button>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Save */}
            {courses.length > 0 && (
              <div className="pt-4 border-t border-border">
                {showSave ? (
                  <div className="rounded-xl bg-surface border border-border p-5 shadow-sm">
                    <h3 className="text-xs font-bold text-foreground mb-4 uppercase tracking-wider">Save GWA Record</h3>
                    <div className="flex flex-wrap gap-3 items-end">
                      <div className="flex-1 min-w-[160px]">
                        <label className="text-[10px] font-semibold text-muted block mb-1">Name</label>
                        <input
                          value={saveName}
                          onChange={e => setSaveName(e.target.value)}
                          placeholder="e.g. 2nd Year, 1st Sem"
                          className="w-full bg-background border border-border rounded-md px-3 py-2.5 text-xs text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 shadow-sm transition-colors"
                          autoFocus
                        />
                      </div>
                      <div className="w-36">
                        <label className="text-[10px] font-semibold text-muted block mb-1">Semester</label>
                        <input
                          value={saveSemester}
                          onChange={e => setSaveSemester(e.target.value)}
                          placeholder="e.g. 1st Sem 2024"
                          className="w-full bg-background border border-border rounded-md px-3 py-2.5 text-xs text-foreground placeholder:text-muted focus:outline-none focus:border-primary/50 shadow-sm transition-colors"
                        />
                      </div>
                      <button onClick={handleSave} className="px-5 py-2.5 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary-hover shadow-sm transition-colors cursor-pointer flex items-center gap-2">
                        <Save className="w-4 h-4" /> Save
                      </button>
                      <button onClick={() => setShowSave(false)} className="px-4 py-2.5 rounded-md bg-transparent border border-border hover:bg-surface-hover text-muted hover:text-foreground text-xs font-semibold transition-colors cursor-pointer shadow-sm">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowSave(true)}
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-md bg-background border border-dashed border-border hover:border-border-hover hover:bg-surface-hover text-muted hover:text-foreground text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
                  >
                    <Save className="w-4 h-4" /> Save this GWA record
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Sidebar — saved records */}
          <div className="space-y-6">
            <div className="rounded-xl bg-surface border border-border p-5 shadow-sm">
              <h3 className="text-sm font-bold text-foreground mb-4 border-b border-border pb-2 flex items-center gap-2">
                <BookMarked className="w-4 h-4 text-primary" />
                Saved GWA Records
              </h3>
              {loading ? (
                <p className="text-[11px] text-muted text-center py-4 font-medium">Loading...</p>
              ) : records.length === 0 ? (
                <p className="text-[11px] text-muted text-center py-4 font-medium border border-dashed border-border rounded-lg bg-background">No saved records yet</p>
              ) : (
                <div className="space-y-2.5">
                  {records.map(rec => (
                    <div key={rec.id} className="px-3.5 py-3 rounded-lg bg-background border border-border/50 hover:border-border transition-colors group">
                      <div className="flex items-center justify-between mb-1.5">
                        <button
                          onClick={() => loadRecord(rec)}
                          className="text-left flex-1 min-w-0 cursor-pointer"
                        >
                          <p className="text-xs font-bold text-foreground truncate">{rec.name}</p>
                          {rec.semester && <p className="text-[10px] text-muted font-medium mt-0.5">{rec.semester}</p>}
                        </button>
                        <div className="flex items-center gap-3">
                          <span className="text-base font-black font-mono tracking-tight" style={{ color: gpaToColor(rec.gwa) }}>
                            {formatGPA(rec.gwa)}
                          </span>
                          <button
                            onClick={() => deleteRecord(rec.id)}
                            className="text-muted hover:text-destructive cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-surface rounded-md border border-border"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="border-t border-border/50 pt-1.5 mt-1">
                        <p className="text-[9px] text-muted font-mono">
                          {(rec.courses as any[]).length} courses · {new Date(rec.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* GWA interpretation */}
            <div className="rounded-xl bg-background border border-border p-5 shadow-sm">
              <h3 className="text-xs font-bold text-muted uppercase tracking-wider mb-4 border-b border-border pb-2">How GWA Works</h3>
              <div className="space-y-3 text-[11px] text-muted leading-relaxed">
                <p><span className="text-foreground font-semibold">Formula:</span> <span className="font-mono bg-surface border border-border px-1.5 py-0.5 rounded ml-1">GWA = Σ(Grade × Units) ÷ Σ(Units)</span></p>
                <div className="h-px bg-border/50 w-full" />
                <p><span className="text-foreground font-semibold">Scale:</span> 1.00 (highest) to 5.00 (failing)</p>
                <div className="h-px bg-border/50 w-full" />
                <p><span className="text-foreground font-semibold">Passing:</span> 3.00 or lower (75%+)</p>
                <div className="h-px bg-border/50 w-full" />
                <p><span className="text-foreground font-semibold">Dean's List:</span> Usually 1.25 or lower</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
