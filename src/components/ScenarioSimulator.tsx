import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Beaker, Lock, Play, RotateCcw } from 'lucide-react';
import type { Component as GradeComponent } from '../lib/calculationEngine';
import { computeGrades } from '../lib/calculationEngine';

interface Props {
  components: GradeComponent[];
  isPremium: boolean;
}

export default function ScenarioSimulator({ components, isPremium }: Props) {
  const [scenarios, setScenarios] = useState<Record<number, number>>({});
  const [active, setActive] = useState(false);

  const simulatedResult = useMemo(() => {
    if (!active || Object.keys(scenarios).length === 0) return null;
    // Create modified components with hypothetical entries
    const modified = components.map(c => {
      if (scenarios[c.id] !== undefined) {
        return {
          ...c,
          entries: [
            ...c.entries,
            { id: -1, component_id: c.id, score: scenarios[c.id], max_score: 100, label: 'Simulated' }
          ],
        };
      }
      return c;
    });
    return computeGrades(modified);
  }, [components, scenarios, active]);

  if (!isPremium) {
    return (
      <div className="rounded-xl flex flex-col items-center justify-center text-center bg-surface border border-border p-6 shadow-sm">
        <div className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center mb-3">
          <Lock className="w-4 h-4 text-muted/50" />
        </div>
        <h2 className="text-sm font-semibold text-muted font-sans mb-1">Scenario Simulator Locked</h2>
        <p className="text-xs text-muted/60">Premium feature — test "what if" scenarios</p>
      </div>
    );
  }

  const incompleteComponents = components.filter(c => !c.done);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl bg-surface border border-border overflow-hidden shadow-sm"
    >
      <div className="flex items-center justify-between p-5 border-b border-border bg-background/50">
        <div className="flex items-center gap-2">
          <Beaker className="w-4 h-4 text-accent" />
          <h2 className="text-sm font-semibold text-foreground">Scenario Simulator</h2>
        </div>
        <div className="flex gap-2">
          {active && (
            <button
              onClick={() => { setScenarios({}); setActive(false); }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-transparent text-muted text-[11px] font-medium hover:text-foreground hover:bg-surface-hover cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          )}
          <button
            onClick={() => setActive(!active)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-semibold tracking-wide uppercase cursor-pointer transition-colors ${
              active ? 'bg-accent/10 border border-accent/20 text-accent' : 'bg-surface border border-border text-muted hover:text-foreground hover:bg-surface-hover hover:border-border-hover'
            }`}
          >
            <Play className="w-3 h-3" /> {active ? 'Active' : 'Simulate'}
          </button>
        </div>
      </div>

      {active && (
        <div className="p-5 space-y-3">
          <p className="text-[11px] text-muted mb-4 uppercase tracking-wider font-medium">Enter hypothetical scores (0–100) for incomplete components:</p>
          {incompleteComponents.length === 0 ? (
            <p className="text-xs text-muted text-center py-4 border border-dashed border-border rounded-lg">All components are marked as done.</p>
          ) : (
            incompleteComponents.map(comp => (
              <div key={comp.id} className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg bg-background border border-border">
                <span className="text-xs font-medium text-foreground flex-1">{comp.name}</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={scenarios[comp.id] ?? ''}
                  onChange={e => {
                    const val = e.target.value;
                    if (val === '') {
                      const next = { ...scenarios };
                      delete next[comp.id];
                      setScenarios(next);
                    } else {
                      setScenarios({ ...scenarios, [comp.id]: Math.min(100, Math.max(0, Number(val))) });
                    }
                  }}
                  placeholder="—"
                  className="w-16 bg-surface border border-border rounded px-2 py-1.5 text-xs text-foreground font-mono text-center focus:outline-none focus:border-accent/50 transition-colors shadow-sm"
                />
              </div>
            ))
          )}

          {simulatedResult && (
            <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
              <span className="text-xs font-semibold text-muted uppercase tracking-wider">Simulated Grade</span>
              <span className={`text-xl font-bold font-mono tracking-tight ${
                simulatedResult.currentGrade >= 80 ? 'text-success' :
                simulatedResult.currentGrade >= 60 ? 'text-amber-500' : 'text-destructive'
              }`}>
                {simulatedResult.currentGrade.toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
