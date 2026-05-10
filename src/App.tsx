import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import GradeOverview from './components/GradeOverview';
import ComponentCard from './components/ComponentCard';
import AddComponentForm from './components/AddComponentForm';
import StrategyPanel from './components/StrategyPanel';
import WeakAreasPanel from './components/WeakAreasPanel';
import ScenarioSimulator from './components/ScenarioSimulator';
import AICoach from './components/AICoach';
import AdBanner from './components/AdBanner';
import SavedGradesSidebar from './components/SavedGradesSidebar';
import type { SavedGrade } from './components/SavedGradesSidebar';
import TemplateManager from './components/TemplateManager';
import ForumPage from './pages/ForumPage';
import TemplateBrowserPage from './pages/TemplateBrowserPage';
import GWACalculatorPage from './pages/GWACalculatorPage';
import LandingPage from './pages/LandingPage';
import { Loader2, Trash2 } from 'lucide-react';
import type { Component as GradeComponent, GradeResult, WeakArea } from './lib/calculationEngine';
import { computeGrades, detectWeakAreas, isTargetPossible } from './lib/calculationEngine';
import { generateAllStrategies, type Strategy } from './lib/strategyEngine';
import { generateCoachAnalysis, type CoachAnalysis } from './lib/coachEngine';
import { generatePrediction, type GradePrediction } from './lib/predictionEngine';
import PredictionPanel from './components/PredictionPanel';
import DeadlinePanel from './components/DeadlinePanel';
import GradeNeededPanel from './components/GradeNeededPanel';
import GradeHistoryChart from './components/GradeHistoryChart';
import WeightValidator from './components/WeightValidator';
import ExportButton from './components/ExportButton';
import ClassmateCompare from './components/ClassmateCompare';
import SemesterPage from './pages/SemesterPage';
import { supabase } from './lib/supabaseClient';
import { useAuth } from './hooks/useAuth';
import BookLoader from './components/BookLoader';

type AppView = 'landing' | 'app';

export default function App() {
  const { user, session, loading: authLoading } = useAuth();

  const [appView, setAppView] = useState<AppView>(() => {
    const saved = sessionStorage.getItem('acadnest_view');
    return (saved === 'app') ? 'app' : 'landing';
  });
  const [components, setComponents] = useState<GradeComponent[]>([]);
  const [settings, setSettings] = useState<{ target_grade: number }>({ target_grade: 80 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [savedGrades, setSavedGrades] = useState<SavedGrade[]>([]);
  const [activeGradeId, setActiveGradeId] = useState<number | null>(null);
  const [selectedStrategyId, setSelectedStrategyId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [subjectTitle, setSubjectTitle] = useState('');

  // Build auth headers from the live session token
  const authHeaders = useCallback((): Record<string, string> => ({
    'Content-Type': 'application/json',
    ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
  }), [session]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const h = authHeaders();
      const [compsRes, entriesRes, settingsRes, gradesRes] = await Promise.all([
        fetch('/api/components', { headers: h }),
        fetch('/api/entries', { headers: h }),
        fetch('/api/settings', { headers: h }),
        fetch('/api/grades', { headers: h }),
      ]);
      // Surface API errors visibly instead of silently failing
      if (!compsRes.ok) {
        const e = await compsRes.json().catch(() => ({}));
        const msg = `GET /api/components ${compsRes.status}: ${e.error || JSON.stringify(e)}`;
        console.error(msg);
        setApiError(msg);
        setLoading(false);
        setSaving(false);
        return;
      }
      const comps = await compsRes.json();
      const entries = await entriesRes.json();
      const settingsData = await settingsRes.json();
      const gradesData = await gradesRes.json();

      // Guard: API returns {error:...} objects on auth failure — don't .map() them
      const compsArray = Array.isArray(comps) ? comps : [];
      const entriesArray = Array.isArray(entries) ? entries : [];
      const gradesArray = Array.isArray(gradesData) ? gradesData : [];

      if (!Array.isArray(comps)) {
        console.error('GET /api/components returned non-array:', comps);
        setApiError(`GET /api/components failed: ${comps?.error || JSON.stringify(comps)}`);
      }

      const merged = compsArray.map((c: any) => ({
        ...c,
        entries: entriesArray.filter((e: any) => e.component_id === c.id),
      }));

      setComponents(merged);
      if (settingsData && !settingsData.error) {
        setSettings({
          target_grade: settingsData.target_grade ?? 80,
          
        });
      }
      setSavedGrades(gradesArray);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [session, authHeaders]);

  // Auth state machine — runs once auth has fully resolved
  useEffect(() => {
    if (authLoading) return; // wait for Supabase to restore session from storage

    if (user && session) {
      // Logged in: make sure we're in app view and fetch data
      if (appView === 'landing') {
        sessionStorage.setItem('acadnest_view', 'app');
        setAppView('app');
      } else {
        // Already in app view, fetch data now that we have a real session
        fetchData();
      }
    } else {
      // Auth resolved with no user — go to landing
      sessionStorage.removeItem('acadnest_view');
      setAppView('landing');
      setLoading(false);
    }
  }, [authLoading, user, session]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch data whenever appView switches to 'app' and we have a session
  useEffect(() => {
    if (appView === 'app' && session && !authLoading) {
      fetchData();
    }
  }, [appView]); // eslint-disable-line react-hooks/exhaustive-deps

  const gradeResult: GradeResult | null = useMemo(() => {
    if (components.length === 0) return null;
    return computeGrades(components);
  }, [components]);

  const weakAreas: WeakArea[] = useMemo(() => {
    if (!gradeResult) return [];
    return detectWeakAreas(components, gradeResult.componentAverages);
  }, [components, gradeResult]);

  const strategies: Strategy[] = useMemo(() => {
    if (!gradeResult) return [];
    return generateAllStrategies(components, gradeResult, weakAreas, settings.target_grade);
  }, [components, gradeResult, weakAreas, settings.target_grade]);

  const coachAnalysis: CoachAnalysis | null = useMemo(() => {
    if (!gradeResult) return null;
    return generateCoachAnalysis(components, gradeResult, weakAreas, strategies, settings.target_grade);
  }, [components, gradeResult, weakAreas, strategies, settings.target_grade]);

  const prediction: GradePrediction | null = useMemo(() => {
    if (!gradeResult) return null;
    return generatePrediction(components, gradeResult);
  }, [components, gradeResult]);

  const targetPossible = gradeResult ? isTargetPossible(gradeResult.maxPossibleGrade, settings.target_grade) : true;

  // Google OAuth — always show account picker so users can switch accounts
  const enterApp = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: { prompt: 'select_account' },
      },
    });
  };


  const goToLanding = async () => {
    await supabase.auth.signOut({ scope: 'local' });
    sessionStorage.clear();
    localStorage.clear();
    setComponents([]);
    setSavedGrades([]);
    setSettings({ target_grade: 80 });
    setAppView('landing');
  };

  const addComponent = async (name: string, weight: number) => {
    setSaving(true);
    try {
      const res = await fetch('/api/components', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ name, weight }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg = `POST /api/components ${res.status}: ${err.error || JSON.stringify(err)}`;
        console.error(msg);
        setApiError(msg);
      } else {
        setApiError(null);
      }
    } catch (err) {
      console.error('Add component error:', err);
    }
    await fetchData();
    setSaving(false);
  };

  const deleteComponent = async (id: number) => {
    setSaving(true);
    await fetch('/api/components', {
      method: 'DELETE',
      headers: authHeaders(),
      body: JSON.stringify({ id }),
    });
    await fetchData();
    setSaving(false);
  };

  const updateComponent = async (id: number, data: Partial<GradeComponent>) => {
    setSaving(true);
    await fetch('/api/components', {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ id, ...data }),
    });
    await fetchData();
    setSaving(false);
  };

  const toggleDone = async (id: number, done: boolean) => {
    setSaving(true);
    await fetch('/api/components', {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ id, done }),
    });
    await fetchData();
    setSaving(false);
  };

  const addEntry = async (componentId: number, score: number, maxScore: number, label: string) => {
    setSaving(true);
    await fetch('/api/entries', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ component_id: componentId, score, max_score: maxScore, label }),
    });
    await fetchData();
    setSaving(false);
  };

  const deleteEntry = async (entryId: number) => {
    setSaving(true);
    await fetch('/api/entries', {
      method: 'DELETE',
      headers: authHeaders(),
      body: JSON.stringify({ id: entryId }),
    });
    await fetchData();
    setSaving(false);
  };

  const updateTarget = async (target: number) => {
    setSettings(s => ({ ...s, target_grade: target }));
    await fetch('/api/settings', {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ target_grade: target }),
    });
  };


  const clearAllComponents = async () => {
    setSaving(true);
    setShowClearConfirm(false);
    await fetch('/api/components?action=clear', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({}),
    });
    setActiveGradeId(null);
    await fetchData();
    setSaving(false);
  };

  const saveGrade = async (name: string) => {
    setSaving(true);
    const snapshot = components.map(c => ({
      name: c.name,
      weight: c.weight,
      done: c.done,
      entries: c.entries.map(e => ({ score: e.score, max_score: e.max_score, label: e.label })),
    }));
    const fullName = subjectTitle.trim() ? `${subjectTitle.trim()} — ${name}` : name;
    const res = await fetch('/api/grades', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        name: fullName,
        components_snapshot: snapshot,
        current_grade: gradeResult?.currentGrade ?? 0,
      }),
    });
    const data = await res.json();
    setActiveGradeId(data.id);
    await fetchData();
    setSaving(false);
  };

  const loadGrade = async (grade: SavedGrade) => {
    setSaving(true);
    // Restore subject title if the saved name has the "Subject — label" pattern
    const dashIdx = grade.name.indexOf(' — ');
    if (dashIdx !== -1) {
      setSubjectTitle(grade.name.slice(0, dashIdx));
    } else {
      setSubjectTitle('');
    }
    await fetch('/api/components?action=clear', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({}),
    });
    const snapshot = grade.components_snapshot as any[];
    await fetch('/api/components?action=bulk-create', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ components: snapshot }),
    });
    setActiveGradeId(grade.id);
    await fetchData();
    setSaving(false);
  };

  const updateSavedGrade = async (id: number) => {
    setSaving(true);
    const snapshot = components.map(c => ({
      name: c.name,
      weight: c.weight,
      done: c.done,
      entries: c.entries.map(e => ({ score: e.score, max_score: e.max_score, label: e.label })),
    }));
    await fetch('/api/grades', {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ id, components_snapshot: snapshot, current_grade: gradeResult?.currentGrade ?? 0 }),
    });
    await fetchData();
    setSaving(false);
  };

  const deleteSavedGrade = async (id: number) => {
    setSaving(true);
    await fetch('/api/grades', {
      method: 'DELETE',
      headers: authHeaders(),
      body: JSON.stringify({ id }),
    });
    if (activeGradeId === id) setActiveGradeId(null);
    await fetchData();
    setSaving(false);
  };

  const applyTemplate = async (templateComponents: { name: string; weight: number }[]) => {
    setSaving(true);
    await fetch('/api/components?action=clear', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({}),
    });
    await fetch('/api/components?action=bulk-create', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        components: templateComponents.map(tc => ({ name: tc.name, weight: tc.weight, done: false, entries: [] })),
      }),
    });
    setActiveGradeId(null);
    await fetchData();
    setSaving(false);
  };

  // Always wait for auth to resolve before deciding what to render —
  // prevents a logged-in user from briefly seeing the landing page on redirect.
  if (authLoading) {
    return (
      <div className="min-h-screen themed-bg flex items-center justify-center">
        <BookLoader />
      </div>
    );
  }

  if (appView === 'landing') {
    return (
      <LandingPage
        onEnterFree={enterApp}
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen themed-bg flex items-center justify-center">
        <BookLoader />
      </div>
    );
  }

  // Page routing
  if (currentPage === 'forum') {
    return <ForumPage onBack={() => setCurrentPage('dashboard')} session={session} />;
  }
  if (currentPage === 'templates') {
    return <TemplateBrowserPage onBack={() => setCurrentPage('dashboard')} onApplyTemplate={applyTemplate} session={session} />;
  }
  if (currentPage === 'gwa') {
    return <GWACalculatorPage onBack={() => setCurrentPage('dashboard')} savedGrades={savedGrades} />;
  }
  if (currentPage === 'semester') {
    return <SemesterPage onBack={() => setCurrentPage('dashboard')} savedGrades={savedGrades} />;
  }

  return (
    <div className="min-h-screen themed-bg themed-text">
      <AdBanner variant="top" />

      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-400/[0.02] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-yellow-200/[0.02] rounded-full blur-[120px]" />
      </div>

      <Header
                        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onGoToLanding={goToLanding}
      />

      <main className="relative max-w-[1600px] mx-auto px-6 sm:px-10 xl:px-16 py-6">
        {saving && (
          <div className="fixed top-20 right-6 z-50 flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-300/10 border border-yellow-300/20">
            <Loader2 className="w-3 h-3 themed-accent animate-spin" />
            <span className="text-[11px] themed-accent-soft">Saving...</span>
          </div>
        )}
        {apiError && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-lg w-full mx-4 flex items-start gap-3 px-4 py-3 rounded-xl bg-red-500/20 border border-red-500/40 shadow-2xl">
            <span className="text-red-400 text-xs font-bold mt-0.5">API ERROR</span>
            <span className="text-red-300 text-xs font-mono break-all flex-1">{apiError}</span>
            <button onClick={() => setApiError(null)} className="text-red-400/60 hover:text-red-300 text-xs cursor-pointer shrink-0">✕</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* ── LEFT RAIL: Saved Grades + Deadlines + ClassmateCompare ── */}
          <div className="lg:col-span-2 space-y-4">
            <SavedGradesSidebar
              savedGrades={savedGrades}
              activeGradeId={activeGradeId}
              currentGrade={gradeResult?.currentGrade ?? 0}
              defaultName={subjectTitle}
              onSave={saveGrade}
              onLoad={loadGrade}
              onDelete={deleteSavedGrade}
              onUpdate={updateSavedGrade}
            />
            <DeadlinePanel
              componentNames={components.map(c => c.name)}
            />
            <ClassmateCompare
              currentGrade={gradeResult?.currentGrade ?? null}
              session={session}
              subjectTitle={subjectTitle}
            />
            <AdBanner variant="sidebar" />
          </div>

          {/* ── CENTER: Subject Title + Overview + Components + History ── */}
          <div className="lg:col-span-5 space-y-5">
            {/* Subject / Course title */}
            <div className="flex items-center gap-3 px-1">
              <input
                value={subjectTitle}
                onChange={e => setSubjectTitle(e.target.value)}
                placeholder="Subject or course name…"
                className="flex-1 bg-transparent text-xl font-bold themed-text placeholder:themed-text/15 focus:outline-none border-b border-transparent focus:border-yellow-300/20 pb-1 transition-colors"
              />
              {subjectTitle && (
                <button
                  onClick={() => setSubjectTitle('')}
                  className="text-[10px] themed-text/20 hover:themed-text/40 transition-colors cursor-pointer shrink-0"
                >
                  clear
                </button>
              )}
            </div>

            <GradeOverview
              gradeResult={gradeResult}
              components={components}
              target={settings.target_grade}
              onTargetChange={updateTarget}
            />

            <AdBanner variant="inline" />

            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-semibold themed-text/40 uppercase tracking-wider">Components</h2>
                <div className="flex items-center gap-2">
                  {components.length > 0 && (
                    <div className="relative">
                      {showClearConfirm ? (
                        <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 rounded-lg px-2 py-1">
                          <span className="text-[10px] text-red-300">Clear all?</span>
                          <button onClick={clearAllComponents} className="text-[10px] text-red-400 font-medium hover:text-red-300 cursor-pointer px-1">Yes</button>
                          <button onClick={() => setShowClearConfirm(false)} className="text-[10px] themed-text/30 hover:themed-text/50 cursor-pointer px-1">No</button>
                        </div>
                      ) : (
                        <button onClick={() => setShowClearConfirm(true)} className="flex items-center gap-1 px-2.5 py-1 rounded-lg themed-surface hover:bg-red-500/10 themed-text/25 hover:text-red-400 text-[10px] transition-colors cursor-pointer">
                          <Trash2 className="w-3 h-3" /> Clear All
                        </button>
                      )}
                    </div>
                  )}
                  <TemplateManager
                    currentComponents={components.map(c => ({ name: c.name, weight: c.weight }))}
                    onApplyTemplate={applyTemplate}
                  />
                  {gradeResult && (
                    <ExportButton
                      components={components}
                      gradeResult={gradeResult}
                      target={settings.target_grade}
                      subjectName={subjectTitle || undefined}
                    />
                  )}
                  <span className="text-[10px] themed-text/20">
                    {components.reduce((s, c) => s + c.weight, 0)}% total
                  </span>
                </div>
              </div>
              <WeightValidator components={components} />
              <div className="space-y-3 mt-3">
                <AnimatePresence initial={false}>
                  {components.map(comp => (
                    <ComponentCard
                      key={comp.id}
                      component={comp}
                      average={gradeResult?.componentAverages.get(comp.id) ?? -1}
                      onDelete={deleteComponent}
                      onUpdate={updateComponent}
                      onToggleDone={toggleDone}
                      onAddEntry={addEntry}
                      onDeleteEntry={deleteEntry}
                    />
                  ))}
                </AnimatePresence>
                <AddComponentForm onAdd={addComponent} />
              </div>
            </div>

            {/* Grade History — below components */}
            <GradeHistoryChart
              components={components}
              target={settings.target_grade}
            />
          </div>

          {/* ── RIGHT: 2-col grid for panels ── */}
          <div className="lg:col-span-5">
            <div className="grid grid-cols-2 gap-5">
              {/* AICoach — full width (2 cols) */}
              <div className="col-span-2">
                <AICoach
                  analysis={coachAnalysis}
                  onSelectStrategy={(id) => setSelectedStrategyId(id)}
                />
              </div>
              {/* PredictionPanel — full width (2 cols) */}
              <div className="col-span-2">
                <PredictionPanel
                  prediction={prediction}
                  currentGrade={gradeResult?.currentGrade ?? 0}
                />
              </div>
              {/* StrategyPanel — full width (2 cols) */}
              <div className="col-span-2">
                <StrategyPanel
                  strategies={strategies}
                  targetPossible={targetPossible}
                  externalSelectedId={selectedStrategyId}
                  onExternalSelectedClear={() => setSelectedStrategyId(null)}
                />
              </div>
              {/* GradeNeededPanel — full width (2 cols) */}
              <div className="col-span-2">
                <GradeNeededPanel
                  components={components}
                  gradeResult={gradeResult}
                  target={settings.target_grade}
                />
              </div>
              {/* ScenarioSimulator — 1 col */}
              <div className="col-span-1">
                <ScenarioSimulator components={components} />
              </div>
              {/* WeakAreasPanel — 1 col */}
              <div className="col-span-1">
                <WeakAreasPanel weakAreas={weakAreas} />
              </div>
              {/* AdBanner — full width */}
              <div className="col-span-2">
                <AdBanner variant="sidebar" />
              </div>
            </div>
          </div>
        </div>

        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-10 rounded-2xl themed-surface border themed-border p-6"
          >
            <h3 className="text-sm font-semibold themed-text/40 mb-3">Mathematical Model</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-[11px] themed-text/25 leading-relaxed font-mono">
              <div>
                <p className="themed-text/40 font-sans font-medium mb-1">Component Average</p>
                <p>avg = (Σ(score÷max) ÷ n) × 100</p>
              </div>
              <div>
                <p className="themed-text/40 font-sans font-medium mb-1">Weighted Final Grade</p>
                <p>grade = Σ(avgᵢ × weightᵢ) ÷ Σ(weights)</p>
              </div>
              <div>
                <p className="themed-text/40 font-sans font-medium mb-1">Potential Range</p>
                <p>max = current + remaining×100</p>
                <p>min = current + remaining×0</p>
              </div>
            </div>
          </motion.div>
      </main>
    </div>
  );
}
