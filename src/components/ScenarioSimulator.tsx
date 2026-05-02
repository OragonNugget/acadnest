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
      <div className="rounded-2xl themed-surface border themed-border p-5">
        <div className="flex items-center gap-2 mb-2">
          <Lock className="w-4 h-4 themed-text/15" />
          <h2 className="text-sm font-medium themed-text/25">Scenario Simulator</h2>
        </div>
        <p className="text-[11px] themed-text/15">Premium feature — test "what if" scenarios</p>
      </div>
    );
  }

  const incompleteComponents = components.filter(c => !c.done);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-gradient-to-br from-purple-500/[0.03] to-blue-500/[0.02] border border-purple-500/[0.08] p-5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Beaker className="w-4 h-4 text-purple-400/70" />
          <h2 className="text-sm font-semibold themed-text/70">Scenario Simulator</h2>
        </div>
        <div className="flex gap-2">
          {active && (
            <button
              onClick={() => { setScenarios({}); setActive(false); }}
              className="flex items-center gap-1 px-2 py-1 rounded-md themed-surface-h themed-text/30 text-[11px] hover:themed-surface-raised cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          )}
          <button
            onClick={() => setActive(!active)}
            className={`flex items-center gap-1 px-3 py-1 rounded-md text-[11px] font-medium cursor-pointer transition-colors ${
              active ? 'bg-purple-500/20 text-purple-300' : 'themed-surface-h themed-text/40 hover:themed-surface-raised'
            }`}
          >
            <Play className="w-3 h-3" /> {active ? 'Active' : 'Simulate'}
          </button>
        </div>
      </div>

      {active && (
        <div className="space-y-2">
          <p className="text-[11px] themed-text/30 mb-3">Enter hypothetical scores (0–100) for incomplete components:</p>
          {incompleteComponents.length === 0 ? (
            <p className="text-xs themed-text/20 text-center py-2">All components are marked as done.</p>
          ) : (
            incompleteComponents.map(comp => (
              <div key={comp.id} className="flex items-center gap-3 px-3 py-2 rounded-lg themed-surface">
                <span className="text-xs themed-text/50 flex-1">{comp.name}</span>
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
                  className="w-16 themed-surface-h border themed-border-subtle rounded px-2 py-1 text-xs themed-text text-center focus:outline-none focus:border-purple-400/40"
                />
              </div>
            ))
          )}

          {simulatedResult && (
            <div className="mt-3 pt-3 border-t themed-border flex items-center justify-between">
              <span className="text-[11px] themed-text/30">Simulated Grade</span>
              <span className={`text-lg font-bold ${
                simulatedResult.currentGrade >= 80 ? 'text-emerald-400' :
                simulatedResult.currentGrade >= 60 ? 'themed-accent' : 'text-red-400'
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
