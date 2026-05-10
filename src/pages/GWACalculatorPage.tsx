import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Plus, Trash2, Save, X, BookMarked,
  ChevronDown, GraduationCap, Loader2
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
    savedGrades: SavedGrade[];
}

let idCounter = 0;
function genId() { return `gwa-${++idCounter}-${Date.now()}`; }

export default function GWACalculatorPage({ onBack, savedGrades }: Props) {
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


  return (
    <div className="min-h-screen themed-bg themed-text">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[20%] left-[40%] w-[500px] h-[500px] bg-indigo-500/[0.02] rounded-full blur-[150px]" />
      </div>

      <header className="sticky top-0 z-50 border-b themed-border themed-bg/80 backdrop-blur-xl">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-10 xl:px-16 py-4 flex items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-1.5 themed-text/40 hover:themed-text/60 text-sm cursor-pointer">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold themed-text flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-indigo-400" />
              GWA Calculator
            </h1>
            <p className="text-[11px] themed-text/30">General Weighted Average · 1.00–5.00 Scale</p>
          </div>
          <button
            onClick={() => setShowScaleRef(!showScaleRef)}
            className="text-[11px] themed-text/30 hover:themed-text/50 cursor-pointer px-2 py-1 rounded-lg hover:themed-surface-h transition-colors"
          >
            Scale Reference
          </button>
        </div>
      </header>

      <main className="relative max-w-[1200px] mx-auto px-6 sm:px-10 xl:px-16 py-6">
        {saving && (
          <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-300/10 border border-yellow-300/20">
            <Loader2 className="w-3 h-3 themed-accent animate-spin" />
            <span className="text-[11px] themed-accent-soft">Saving...</span>
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
              <div className="rounded-xl themed-surface border themed-border p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold themed-text/50">GPA Scale Reference</h3>
                  <button onClick={() => setShowScaleRef(false)} className="themed-text/20 hover:themed-text/40 cursor-pointer"><X className="w-3.5 h-3.5" /></button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {GPA_TABLE.map(entry => (
                    <div key={entry.gpa} className="px-3 py-2 rounded-lg themed-surface text-center">
                      <p className="text-sm font-bold" style={{ color: gpaToColor(entry.gpa) }}>{formatGPA(entry.gpa)}</p>
                      <p className="text-[10px] themed-text/30">{entry.minPercent}–{entry.maxPercent}%</p>
                      <p className="text-[9px] themed-text/20">{entry.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main calculator */}
          <div className="lg:col-span-2 space-y-4">
            {/* GWA display */}
            <div className="rounded-2xl themed-surface border themed-border p-6 text-center">
              <p className="text-[10px] themed-text/30 uppercase tracking-wider mb-2">General Weighted Average</p>
              <div className="flex items-center justify-center gap-4">
                <span className="text-5xl font-extrabold" style={{ color: courses.length > 0 ? gwaColor : 'rgba(255,255,255,0.15)' }}>
                  {courses.length > 0 ? formatGPA(gwa) : '—'}
                </span>
                {courses.length > 0 && (
                  <div className="text-left">
                    <p className="text-xs font-medium" style={{ color: gwaColor }}>
                      {gwa <= 1.25 ? 'Dean\'s List' : gwa <= 1.75 ? 'Very Good' : gwa <= 2.50 ? 'Good' : gwa <= 3.00 ? 'Passing' : 'Below Passing'}
                    </p>
                    <p className="text-[10px] themed-text/25">{totalUnits} total units · {courses.length} courses</p>
                  </div>
                )}
              </div>
            </div>

            {/* Course list */}
            <div className="space-y-2">
              {courses.map((course, i) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl themed-surface border themed-border p-3 flex flex-wrap items-center gap-3 group"
                >
                  <span className="text-[10px] themed-text/15 w-5">{i + 1}</span>
                  <div className="flex-1 min-w-[120px]">
                    <input
                      value={course.name}
                      onChange={e => updateCourse(course.id, 'name', e.target.value)}
                      placeholder="Course name"
                      className="w-full bg-transparent text-sm themed-text placeholder:themed-text/15 focus:outline-none"
                    />
                  </div>
                  <div className="w-16">
                    <label className="text-[9px] themed-text/20 block">Units</label>
                    <input
                      type="number"
                      min={0}
                      max={12}
                      value={course.units}
                      onChange={e => updateCourse(course.id, 'units', Number(e.target.value) || 0)}
                      className="w-full themed-surface-h border themed-border-subtle rounded px-2 py-1 text-xs themed-text text-center focus:outline-none focus:border-indigo-400/40"
                    />
                  </div>
                  <div className="w-20">
                    <label className="text-[9px] themed-text/20 block">Grade %</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step="any"
                      value={course.gradePercent || ''}
                      onChange={e => updateCourse(course.id, 'gradePercent', Number(e.target.value) || 0)}
                      placeholder="—"
                      className="w-full themed-surface-h border themed-border-subtle rounded px-2 py-1 text-xs themed-text text-center focus:outline-none focus:border-indigo-400/40"
                    />
                  </div>
                  <div className="w-16 text-center">
                    <label className="text-[9px] themed-text/20 block">GPA</label>
                    <span className="text-sm font-bold" style={{ color: gpaToColor(course.gpa) }}>
                      {formatGPA(course.gpa)}
                    </span>
                  </div>
                  <button
                    onClick={() => removeCourse(course.id)}
                    className="themed-text/10 hover:text-red-400 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              ))}
            </div>

            {/* Add buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={addManualCourse}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-dashed themed-border-subtle hover:themed-border-subtle themed-surface hover:themed-surface themed-text/30 hover:themed-text/50 text-xs transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Course Manually
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowImport(!showImport)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-indigo-500/15 bg-indigo-500/[0.04] hover:bg-indigo-500/[0.08] text-indigo-300/60 hover:text-indigo-300/80 text-xs transition-all cursor-pointer"
                >
                  <BookMarked className="w-3.5 h-3.5" /> Import from Saved Grades
                  <ChevronDown className={`w-3 h-3 transition-transform ${showImport ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {showImport && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="absolute top-full left-0 mt-1 w-64 rounded-xl bg-[#12121f] border themed-border-subtle shadow-2xl shadow-black/40 z-40 overflow-hidden"
                    >
                      <div className="p-2 max-h-48 overflow-y-auto">
                        {savedGrades.length === 0 ? (
                          <p className="text-[11px] themed-text/20 text-center py-3">No saved grades yet</p>
                        ) : (
                          savedGrades.map(sg => (
                            <button
                              key={sg.id}
                              onClick={() => importFromSaved(sg)}
                              className="w-full text-left px-3 py-2 rounded-lg hover:themed-surface-h text-[11px] themed-text/50 hover:themed-text/70 cursor-pointer transition-colors"
                            >
                              <p className="font-medium truncate">{sg.name}</p>
                              <p className="text-[10px] themed-text/25">{sg.current_grade.toFixed(1)}%</p>
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
              <div className="pt-2">
                {showSave ? (
                  <div className="rounded-xl themed-surface border themed-border p-4">
                    <h3 className="text-xs font-semibold themed-text/50 mb-3">Save GWA Record</h3>
                    <div className="flex flex-wrap gap-2 items-end">
                      <div className="flex-1 min-w-[140px]">
                        <label className="text-[9px] themed-text/25 block mb-1">Name</label>
                        <input
                          value={saveName}
                          onChange={e => setSaveName(e.target.value)}
                          placeholder="e.g. 2nd Year, 1st Sem"
                          className="w-full themed-surface-h border themed-border-subtle rounded-lg px-3 py-2 text-xs themed-text placeholder:themed-text/20 focus:outline-none focus:border-indigo-400/40"
                          autoFocus
                        />
                      </div>
                      <div className="w-32">
                        <label className="text-[9px] themed-text/25 block mb-1">Semester</label>
                        <input
                          value={saveSemester}
                          onChange={e => setSaveSemester(e.target.value)}
                          placeholder="e.g. 1st Sem 2024"
                          className="w-full themed-surface-h border themed-border-subtle rounded-lg px-3 py-2 text-xs themed-text placeholder:themed-text/20 focus:outline-none focus:border-indigo-400/40"
                        />
                      </div>
                      <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-indigo-400/20 text-indigo-300 text-xs font-medium hover:bg-indigo-400/30 transition-colors cursor-pointer flex items-center gap-1.5">
                        <Save className="w-3 h-3" /> Save
                      </button>
                      <button onClick={() => setShowSave(false)} className="px-3 py-2 rounded-lg themed-surface-h themed-text/30 text-xs hover:themed-surface-raised cursor-pointer">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowSave(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg themed-surface hover:themed-surface-raised themed-text/30 hover:themed-text/50 text-xs transition-colors cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" /> Save this GWA record
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Sidebar — saved records */}
          <div className="space-y-4">
            <div className="rounded-2xl themed-surface border themed-border p-5">
              <h3 className="text-xs font-semibold themed-text/50 mb-3 flex items-center gap-2">
                <BookMarked className="w-3.5 h-3.5 text-indigo-400/60" />
                Saved GWA Records
              </h3>
              {loading ? (
                <p className="text-[11px] themed-text/20 text-center py-3">Loading...</p>
              ) : records.length === 0 ? (
                <p className="text-[11px] themed-text/20 text-center py-3">No saved records yet</p>
              ) : (
                <div className="space-y-2">
                  {records.map(rec => (
                    <div key={rec.id} className="px-3 py-2.5 rounded-lg themed-surface hover:themed-surface-h transition-colors group">
                      <div className="flex items-center justify-between mb-1">
                        <button
                          onClick={() => loadRecord(rec)}
                          className="text-left flex-1 min-w-0 cursor-pointer"
                        >
                          <p className="text-[11px] font-medium themed-text/60 truncate">{rec.name}</p>
                          {rec.semester && <p className="text-[9px] themed-text/20">{rec.semester}</p>}
                        </button>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold" style={{ color: gpaToColor(rec.gwa) }}>
                            {formatGPA(rec.gwa)}
                          </span>
                          <button
                            onClick={() => deleteRecord(rec.id)}
                            className="themed-text/10 hover:text-red-400 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <p className="text-[9px] themed-text/15">
                        {(rec.courses as any[]).length} courses · {new Date(rec.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* GWA interpretation */}
            <div className="rounded-2xl bg-gradient-to-br from-indigo-500/[0.03] to-purple-500/[0.02] border border-indigo-500/[0.08] p-5">
              <h3 className="text-xs font-semibold themed-text/50 mb-3">How GWA Works</h3>
              <div className="space-y-2 text-[10px] themed-text/25 leading-relaxed">
                <p><span className="themed-text/40 font-medium">Formula:</span> GWA = Σ(Grade × Units) ÷ Σ(Units)</p>
                <p><span className="themed-text/40 font-medium">Scale:</span> 1.00 (highest) to 5.00 (failing)</p>
                <p><span className="themed-text/40 font-medium">Passing:</span> 3.00 or lower (75%+)</p>
                <p><span className="themed-text/40 font-medium">Dean's List:</span> Usually 1.25 or lower</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
