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
import { supabase } from './lib/supabaseClient';
import { useAuth } from './hooks/useAuth';

type AppView = 'landing' | 'app';

export default function App() {
  const { user, session, loading: authLoading } = useAuth();

  const [appView, setAppView] = useState<AppView>(() => {
    const saved = sessionStorage.getItem('gradeforge_view');
    return (saved === 'app') ? 'app' : 'landing';
  });

  const [components, setComponents] = useState<GradeComponent[]>([]);
  const [settings, setSettings] = useState<{ target_grade: number; is_premium: boolean }>({
    target_grade: 80,
    is_premium: false,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [savedGrades, setSavedGrades] = useState<SavedGrade[]>([]);
  const [activeGradeId, setActiveGradeId] = useState<number | null>(null);
  const [selectedStrategyId, setSelectedStrategyId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const authHeaders = () => ({
    'Content-Type': 'application/json',
    ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
  });

  // Fetch all data
  const fetchData = useCallback(async () => {
    try {
      const [compsRes, entriesRes, settingsRes, gradesRes] = await Promise.all([
        fetch('/api/components', { headers: authHeaders() }),
        fetch('/api/entries', { headers: authHeaders() }),
        fetch('/api/settings', { headers: authHeaders() }),
        fetch('/api/grades', { headers: authHeaders() }),
      ]);

      const comps = await compsRes.json();
      const entries = await entriesRes.json();
      const settingsData = await settingsRes.json();
      const gradesData = await gradesRes.json();

      const merged = (comps || []).map((c: any) => ({
        ...c,
        entries: (entries || []).filter((e: any) => e.component_id === c.id),
      }));

      setComponents(merged);

      if (settingsData) {
        setSettings({
          target_grade: settingsData.target_grade ?? 80,
          is_premium: settingsData.is_premium ?? false,
        });
      }

      setSavedGrades(gradesData || []);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (appView === 'app') fetchData();
    else setLoading(false);
  }, [appView, fetchData]);

  // auto-enter after auth
  useEffect(() => {
    if (!authLoading && user && appView === 'landing') {
      sessionStorage.setItem('gradeforge_view', 'app');
      setAppView('app');
    }
  }, [authLoading, user, appView]);

  const gradeResult: GradeResult | null = useMemo(() => {
    if (!components.length) return null;
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

  const targetPossible = gradeResult
    ? isTargetPossible(gradeResult.maxPossibleGrade, settings.target_grade)
    : true;

  // 🔥 GOOGLE LOGIN VERSION
  const enterApp = async (premium: boolean) => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
  };

  const goToLanding = () => {
    sessionStorage.removeItem('gradeforge_view');
    setAppView('landing');
  };

  const addComponent = async (name: string, weight: number) => {
    setSaving(true);
    await fetch('/api/components', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ name, weight }),
    });
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

  const togglePremium = async () => {
    const newPremium = !settings.is_premium;
    setSettings(s => ({ ...s, is_premium: newPremium }));
    await fetch('/api/settings', {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ is_premium: newPremium }),
    });
  };

  const clearAllComponents = async () => {
    setSaving(true);
    setShowClearConfirm(false);
    await fetch('/api/clear-components', {
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
      entries: c.entries.map(e => ({
        score: e.score,
        max_score: e.max_score,
        label: e.label,
      })),
    }));

    const res = await fetch('/api/grades', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        name,
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

    await fetch('/api/clear-components', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({}),
    });

    await fetch('/api/bulk-create', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ components: grade.components_snapshot }),
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
      entries: c.entries.map(e => ({
        score: e.score,
        max_score: e.max_score,
        label: e.label,
      })),
    }));

    await fetch('/api/grades', {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({
        id,
        components_snapshot: snapshot,
        current_grade: gradeResult?.currentGrade ?? 0,
      }),
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

    await fetch('/api/clear-components', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({}),
    });

    await fetch('/api/bulk-create', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        components: templateComponents.map(tc => ({
          name: tc.name,
          weight: tc.weight,
          done: false,
          entries: [],
        })),
      }),
    });

    setActiveGradeId(null);
    await fetchData();
    setSaving(false);
  };

  if (appView === 'landing') {
    return <LandingPage onEnterFree={() => enterApp(false)} onEnterPremium={() => enterApp(true)} />;
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
          <p className="text-sm text-white/30">Loading Trackademic...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* rest of your UI unchanged */}
      ...
    </div>
  );
}
