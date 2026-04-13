import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import Header from './components/Header';
import GradeOverview from './components/GradeOverview';
import ComponentCard from './components/ComponentCard';
import AddComponentForm from './components/AddComponentForm';
import AdBanner from './components/AdBanner';
import SavedGradesSidebar from './components/SavedGradesSidebar';
import type { SavedGrade } from './components/SavedGradesSidebar';
import ForumPage from './pages/ForumPage';
import TemplateBrowserPage from './pages/TemplateBrowserPage';
import GWACalculatorPage from './pages/GWACalculatorPage';
import LandingPage from './pages/LandingPage';
import { Loader2 } from 'lucide-react';
import type { Component as GradeComponent, GradeResult } from './lib/calculationEngine';
import { computeGrades } from './lib/calculationEngine';
import { supabase } from './lib/supabaseClient';
import { useAuth } from './hooks/useAuth';

type AppView = 'landing' | 'app';

export default function App() {
  const { user, session, loading: authLoading } = useAuth();

  const [appView, setAppView] = useState<AppView>(() => {
    const saved = sessionStorage.getItem('gradeforge_view');
    return saved === 'app' ? 'app' : 'landing';
  });

  const [components, setComponents] = useState<GradeComponent[]>([]);
  const [settings, setSettings] = useState<{ target_grade: number; is_premium: boolean }>({
    target_grade: 80,
    is_premium: false,
  });

  const [loading, setLoading] = useState(true);
  const [savedGrades, setSavedGrades] = useState<SavedGrade[]>([]);

  const authHeaders = () => ({
    'Content-Type': 'application/json',
    ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
  });

  const fetchData = async () => {
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

      setSettings({
        target_grade: settingsData?.target_grade ?? 80,
        is_premium: settingsData?.is_premium ?? false,
      });

      setSavedGrades(gradesData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (appView === 'app') fetchData();
    else setLoading(false);
  }, [appView]);

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

  const enterApp = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
  };

  if (appView === 'landing') {
    return <LandingPage onEnterFree={enterApp} onEnterPremium={enterApp} />;
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <motion.div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
          <p className="text-sm text-white/30">Loading Trackademic...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <AdBanner variant="top" isPremium={settings.is_premium} />

      <Header
        isPremium={settings.is_premium}
        onTogglePremium={() => {}}
        currentPage="dashboard"
        onNavigate={() => {}}
        onGoToLanding={() => setAppView('landing')}
      />

      <main className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-2">
          <SavedGradesSidebar
            savedGrades={savedGrades}
            activeGradeId={null}
            isPremium={settings.is_premium}
            currentGrade={gradeResult?.currentGrade ?? 0}
            onSave={() => {}}
            onLoad={() => {}}
            onDelete={() => {}}
            onUpdate={() => {}}
          />
        </div>

        <div className="lg:col-span-6 space-y-5">
          <GradeOverview
            gradeResult={gradeResult}
            target={settings.target_grade}
            isPremium={settings.is_premium}
            onTargetChange={() => {}}
          />

          <div className="space-y-3">
            {components.map(comp => (
              <ComponentCard
                key={comp.id}
                component={comp}
                average={-1}
                isPremium={settings.is_premium}
                onDelete={() => {}}
                onUpdate={() => {}}
                onToggleDone={() => {}}
                onAddEntry={() => {}}
                onDeleteEntry={() => {}}
              />
            ))}
          </div>

          <AddComponentForm onAdd={() => {}} />
        </div>

        <div className="lg:col-span-4 space-y-5">
          <AdBanner variant="sidebar" isPremium={settings.is_premium} />
        </div>
      </main>
    </div>
  );
}
