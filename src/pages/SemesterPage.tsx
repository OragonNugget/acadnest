import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, BookOpen, Plus, Trash2, ChevronDown, ChevronUp,
  GraduationCap, Save, Loader2, TrendingUp, AlertTriangle
} from 'lucide-react';
import type { SavedGrade } from '../components/SavedGradesSidebar';
import { percentToGPA, formatGPA, gpaToColor, calculateGWA, GPA_TABLE } from '../lib/gpaScale';

interface SemesterCourse {
  id: string;
  name: string;
  units: number;
  gradePercent: number | null;
  fromSavedGradeId: number | null;
}

interface SemesterData {
  id: string;
  name: string;
  year: string;
  courses: SemesterCourse[];
  collapsed: boolean;
}

let _id = 0;
function uid() { return `sc-${++_id}-${Date.now()}`; }

function calcGWA(courses: SemesterCourse[]) {
  const valid = courses.filter(c => c.gradePercent !== null && c.units > 0);
  if (!valid.length) return null;
  return calculateGWA(valid.map(c => ({ gpa: percentToGPA(c.gradePercent!), units: c.units })));
}

function calcOverallGWA(semesters: SemesterData[]) {
  const allCourses = semesters.flatMap(s => s.courses.filter(c => c.gradePercent !== null && c.units > 0));
  if (!allCourses.length) return null;
  return calculateGWA(allCourses.map(c => ({ gpa: percentToGPA(c.gradePercent!), units: c.units })));
}

const STORAGE_KEY = 'acadnest_semesters';

function loadSemesters(): SemesterData[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch { return []; }
}
function saveSemesters(s: SemesterData[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

interface Props {
  onBack: () => void;
  savedGrades: SavedGrade[];
}

export default function SemesterPage({ onBack, savedGrades }: Props) {
  const [semesters, setSemesters] = useState<SemesterData[]>(() => loadSemesters());
  const [showNewSem, setShowNewSem] = useState(false);
  const [newSemName, setNewSemName] = useState('');
  const [newSemYear, setNewSemYear] = useState('');
  const [showImportFor, setShowImportFor] = useState<string | null>(null);

  const update = (fn: (prev: SemesterData[]) => SemesterData[]) => {
    setSemesters(prev => {
      const next = fn(prev);
      saveSemesters(next);
      return next;
    });
  };

  const addSemester = () => {
    if (!newSemName.trim()) return;
    update(prev => [...prev, {
      id: uid(),
      name: newSemName.trim(),
      year: newSemYear.trim(),
      courses: [],
      collapsed: false,
    }]);
    setNewSemName('');
    setNewSemYear('');
    setShowNewSem(false);
  };

  const deleteSemester = (id: string) => update(prev => prev.filter(s => s.id !== id));

  const toggleCollapse = (id: string) => update(prev =>
    prev.map(s => s.id === id ? { ...s, collapsed: !s.collapsed } : s)
  );

  const addCourse = (semId: string) => update(prev =>
    prev.map(s => s.id === semId ? {
      ...s, courses: [...s.courses, { id: uid(), name: '', units: 3, gradePercent: null, fromSavedGradeId: null }]
    } : s)
  );

  const updateCourse = (semId: string, courseId: string, field: string, value: any) => update(prev =>
    prev.map(s => s.id === semId ? {
      ...s,
      courses: s.courses.map(c => c.id === courseId ? { ...c, [field]: value } : c)
    } : s)
  );

  const removeCourse = (semId: string, courseId: string) => update(prev =>
    prev.map(s => s.id === semId ? { ...s, courses: s.courses.filter(c => c.id !== courseId) } : s)
  );

  const importFromSaved = (semId: string, saved: SavedGrade) => {
    const snapshot = saved.components_snapshot as any[];
    let weightedSum = 0, totalWeight = 0;
    for (const comp of snapshot) {
      if (comp.entries?.length > 0) {
        const avg = comp.entries.reduce((s: number, e: any) =>
          s + (e.max_score > 0 ? e.score / e.max_score : 0), 0) / comp.entries.length * 100;
        weightedSum += avg * (comp.weight || 0);
        totalWeight += comp.weight || 0;
      }
    }
    const gradePercent = totalWeight > 0 ? weightedSum / totalWeight : saved.current_grade;

    update(prev => prev.map(s => s.id === semId ? {
      ...s,
      courses: [...s.courses, {
        id: uid(),
        name: saved.name,
        units: 3,
        gradePercent,
        fromSavedGradeId: saved.id,
      }]
    } : s));
    setShowImportFor(null);
  };

  const overallGWA = useMemo(() => calcOverallGWA(semesters), [semesters]);

  return (
    <div className="min-h-screen themed-bg themed-text">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[15%] left-[35%] w-[500px] h-[500px] bg-green-500/[0.015] rounded-full blur-[150px]" />
      </div>

      <header className="sticky top-0 z-50 border-b themed-border themed-bg/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-1.5 themed-text/40 hover:themed-text/60 text-sm cursor-pointer">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold themed-text flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-green-400" />
              Semestral Tracker
            </h1>
            <p className="text-[11px] themed-text/30">Track your GWA across all semesters</p>
          </div>
        </div>
      </header>

      <main className="relative max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Overall GWA Card */}
        <div className="rounded-2xl themed-surface border themed-border p-6 text-center">
          <p className="text-[10px] themed-text/30 uppercase tracking-wider mb-2">Overall Cumulative GWA</p>
          {overallGWA !== null ? (
            <div className="flex items-center justify-center gap-4">
              <span className="text-5xl font-extrabold" style={{ color: gpaToColor(overallGWA) }}>
                {formatGPA(overallGWA)}
              </span>
              <div className="text-left">
                <p className="text-sm font-semibold" style={{ color: gpaToColor(overallGWA) }}>
                  {overallGWA <= 1.25 ? "Dean's List" : overallGWA <= 1.75 ? 'Very Good' : overallGWA <= 2.50 ? 'Good' : overallGWA <= 3.00 ? 'Passing' : 'Below Passing'}
                </p>
                <p className="text-[10px] themed-text/25">
                  {semesters.length} semester{semesters.length !== 1 ? 's' : ''} ·{' '}
                  {semesters.flatMap(s => s.courses).filter(c => c.gradePercent !== null).length} courses
                </p>
              </div>
            </div>
          ) : (
            <p className="text-xl themed-text/20">Add courses to see your GWA</p>
          )}
        </div>

        {/* GPA Scale quick reference */}
        <div className="grid grid-cols-5 gap-1.5">
          {GPA_TABLE.filter(e => e.gpa <= 3).map(e => (
            <div key={e.gpa} className="text-center px-2 py-2 rounded-lg themed-surface border themed-border">
              <p className="text-xs font-bold" style={{ color: gpaToColor(e.gpa) }}>{formatGPA(e.gpa)}</p>
              <p className="text-[8px] themed-text/25 mt-0.5">{e.minPercent}%+</p>
            </div>
          ))}
        </div>

        {/* Semesters */}
        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {semesters.map(sem => {
              const semGWA = calcGWA(sem.courses);
              const unitsTotal = sem.courses.reduce((s, c) => s + c.units, 0);
              return (
                <motion.div
                  key={sem.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="rounded-2xl themed-surface border themed-border overflow-hidden"
                >
                  {/* Sem header */}
                  <div className="flex items-center gap-3 p-5">
                    <button
                      onClick={() => toggleCollapse(sem.id)}
                      className="flex-1 flex items-center gap-3 text-left cursor-pointer"
                    >
                      <div>
                        <h3 className="text-sm font-semibold themed-text/80">{sem.name}</h3>
                        {sem.year && <p className="text-[10px] themed-text/25">{sem.year}</p>}
                      </div>
                      <div className="ml-auto flex items-center gap-3">
                        {semGWA !== null && (
                          <div className="text-right">
                            <p className="text-lg font-extrabold" style={{ color: gpaToColor(semGWA) }}>
                              {formatGPA(semGWA)}
                            </p>
                            <p className="text-[9px] themed-text/25">{unitsTotal} units</p>
                          </div>
                        )}
                        {sem.collapsed
                          ? <ChevronDown className="w-4 h-4 themed-text/20" />
                          : <ChevronUp className="w-4 h-4 themed-text/20" />
                        }
                      </div>
                    </button>
                    <button onClick={() => deleteSemester(sem.id)} className="themed-text/15 hover:text-red-400 cursor-pointer">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <AnimatePresence>
                    {!sem.collapsed && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 space-y-2 border-t themed-border pt-4">
                          {/* Course list */}
                          {sem.courses.map((course, i) => (
                            <div key={course.id} className="flex flex-wrap items-center gap-2 group">
                              <span className="text-[9px] themed-text/15 w-4">{i + 1}</span>
                              <input
                                value={course.name}
                                onChange={e => updateCourse(sem.id, course.id, 'name', e.target.value)}
                                placeholder="Course name"
                                className="flex-1 min-w-[120px] bg-transparent text-sm themed-text placeholder:themed-text/15 focus:outline-none border-b border-transparent focus:border-yellow-300/20 pb-0.5"
                              />
                              <div className="w-14">
                                <label className="text-[8px] themed-text/20 block">Units</label>
                                <input
                                  type="number" min={0} max={12}
                                  value={course.units}
                                  onChange={e => updateCourse(sem.id, course.id, 'units', Number(e.target.value) || 0)}
                                  className="w-full themed-surface-h border themed-border-subtle rounded px-2 py-1 text-xs themed-text text-center focus:outline-none"
                                />
                              </div>
                              <div className="w-20">
                                <label className="text-[8px] themed-text/20 block">Grade %</label>
                                <input
                                  type="number" min={0} max={100} step="any"
                                  value={course.gradePercent ?? ''}
                                  onChange={e => updateCourse(sem.id, course.id, 'gradePercent', e.target.value === '' ? null : Number(e.target.value))}
                                  placeholder="—"
                                  className="w-full themed-surface-h border themed-border-subtle rounded px-2 py-1 text-xs themed-text text-center focus:outline-none"
                                />
                              </div>
                              {course.gradePercent !== null && (
                                <div className="w-10 text-center">
                                  <label className="text-[8px] themed-text/20 block">GPA</label>
                                  <span className="text-xs font-bold" style={{ color: gpaToColor(percentToGPA(course.gradePercent)) }}>
                                    {formatGPA(percentToGPA(course.gradePercent))}
                                  </span>
                                </div>
                              )}
                              <button
                                onClick={() => removeCourse(sem.id, course.id)}
                                className="themed-text/10 hover:text-red-400 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}

                          {sem.courses.length === 0 && (
                            <p className="text-[11px] themed-text/20 text-center py-3">No courses yet. Add one below or import from saved grades.</p>
                          )}

                          {/* Actions */}
                          <div className="flex flex-wrap gap-2 pt-2">
                            <button
                              onClick={() => addCourse(sem.id)}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-dashed themed-border-subtle hover:themed-border-subtle themed-text/30 hover:themed-text/50 text-[11px] transition-all cursor-pointer"
                            >
                              <Plus className="w-3 h-3" /> Add Course
                            </button>

                            {savedGrades.length > 0 && (
                              <div className="relative">
                                <button
                                  onClick={() => setShowImportFor(showImportFor === sem.id ? null : sem.id)}
                                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-green-500/15 bg-green-500/[0.04] hover:bg-green-500/[0.08] text-green-400/60 hover:text-green-400/80 text-[11px] transition-all cursor-pointer"
                                >
                                  <GraduationCap className="w-3 h-3" /> Import from Grade Tracker
                                  <ChevronDown className={`w-2.5 h-2.5 transition-transform ${showImportFor === sem.id ? 'rotate-180' : ''}`} />
                                </button>
                                <AnimatePresence>
                                  {showImportFor === sem.id && (
                                    <motion.div
                                      initial={{ opacity: 0, y: -5 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: -5 }}
                                      className="absolute top-full left-0 mt-1 w-64 rounded-xl bg-[#12121f] border themed-border-subtle shadow-2xl z-40 overflow-hidden"
                                    >
                                      <div className="p-2 max-h-48 overflow-y-auto">
                                        {savedGrades.map(sg => (
                                          <button
                                            key={sg.id}
                                            onClick={() => importFromSaved(sem.id, sg)}
                                            className="w-full text-left px-3 py-2 rounded-lg hover:themed-surface-h text-[11px] themed-text/50 hover:themed-text/70 cursor-pointer"
                                          >
                                            <p className="font-medium truncate">{sg.name}</p>
                                            <p className="text-[9px] themed-text/25">{sg.current_grade.toFixed(1)}% · {formatGPA(percentToGPA(sg.current_grade))} GPA</p>
                                          </button>
                                        ))}
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Add semester */}
        <AnimatePresence>
          {showNewSem ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="rounded-2xl themed-surface border themed-border p-5 space-y-3">
                <h3 className="text-xs font-semibold themed-text/50">New Semester</h3>
                <div className="flex flex-wrap gap-3">
                  <input
                    value={newSemName}
                    onChange={e => setNewSemName(e.target.value)}
                    placeholder="e.g. 2nd Year, 1st Semester"
                    autoFocus
                    className="flex-1 min-w-[200px] themed-surface-h border themed-border-subtle rounded-lg px-3 py-2 text-sm themed-text placeholder:themed-text/20 focus:outline-none focus:border-green-400/40"
                  />
                  <input
                    value={newSemYear}
                    onChange={e => setNewSemYear(e.target.value)}
                    placeholder="AY 2024–2025"
                    className="w-36 themed-surface-h border themed-border-subtle rounded-lg px-3 py-2 text-sm themed-text placeholder:themed-text/20 focus:outline-none focus:border-green-400/40"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={addSemester}
                    disabled={!newSemName.trim()}
                    className="px-4 py-2 rounded-lg bg-green-400/15 text-green-300/80 text-sm font-medium hover:bg-green-400/25 transition-colors cursor-pointer disabled:opacity-40"
                  >
                    Add Semester
                  </button>
                  <button onClick={() => setShowNewSem(false)} className="px-4 py-2 rounded-lg themed-surface-h themed-text/30 text-sm cursor-pointer">
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            <button
              onClick={() => setShowNewSem(true)}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border border-dashed themed-border-subtle hover:border-green-500/20 themed-text/25 hover:text-green-400/50 text-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Semester
            </button>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
