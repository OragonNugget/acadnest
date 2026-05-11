import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Shield, Target, TrendingUp, Wrench, AlertTriangle, ChevronRight, ArrowUpRight } from 'lucide-react';
import type { Strategy } from '../lib/strategyEngine';

interface Props {
  strategies: Strategy[];
  targetPossible: boolean;
  externalSelectedId?: string | null;
  onExternalSelectedClear?: () => void;
}

const strategyIcons: Record<string, any> = {
  'weak-area': Wrench,
  'high-impact': TrendingUp,
  'survival': Shield,
  'optimal': Target,
  'conservative': Zap,
};

const strategyColors: Record<string, string> = {
  'weak-area': '#FFD45A',
  'high-impact': '#3b82f6',
  'survival': '#ef4444',
  'optimal': '#22c55e',
  'conservative': '#a855f7',
};

export default function StrategyPanel({ strategies, targetPossible, externalSelectedId, onExternalSelectedClear }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  // Handle external selection from AI Coach
  useEffect(() => {
    if (externalSelectedId) {
      setSelected(externalSelectedId);
      onExternalSelectedClear?.();
    }
  }, [externalSelectedId, onExternalSelectedClear]);

  const activeStrategy = strategies.find(s => s.id === selected);


  return (
    <div className="rounded-2xl themed-surface border themed-border p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold themed-text/80">Strategy Engine</h2>
        {!targetPossible && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-500/10 border border-red-500/20">
            <AlertTriangle className="w-3 h-3 text-red-400" />
            <span className="text-[10px] text-red-300">Target impossible</span>
          </div>
        )}
      </div>

      {/* Strategy selector */}
      <div className="grid grid-cols-1 gap-2 mb-5">
        {strategies.map(strategy => {
          const Icon = strategyIcons[strategy.id] || Target;
          const color = strategyColors[strategy.id] || '#FFD45A';
          const isActive = selected === strategy.id;

          return (
            <button
              key={strategy.id}
              onClick={() => setSelected(isActive ? null : strategy.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all cursor-pointer ${
                isActive
                  ? 'themed-surface-raised border themed-border-subtle'
                  : 'themed-surface border border-transparent hover:themed-surface-h hover:themed-border'
              }`}
            >
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}15` }}>
                <Icon className="w-3.5 h-3.5" style={{ color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className={`text-xs font-medium truncate ${!strategy.feasible ? 'text-red-400/80' : 'themed-text/70'}`}>
                    {strategy.name}
                  </span>
                  {!strategy.feasible && (
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                  )}
                </div>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 themed-text/15 transition-transform ${isActive ? 'rotate-90' : ''}`} />
            </button>
          );
        })}
      </div>

      {/* Strategy detail */}
      <AnimatePresence mode="wait">
        {activeStrategy && (
          <motion.div
            key={activeStrategy.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-xl themed-surface border themed-border p-4"
          >
            <p className="text-xs themed-text/40 mb-4 leading-relaxed">{activeStrategy.description}</p>

            {!activeStrategy.feasible && activeStrategy.infeasibleReason && (
              <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-red-500/5 border border-red-500/10 mb-4">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-[11px] text-red-300/80 leading-relaxed">{activeStrategy.infeasibleReason}</p>
              </div>
            )}

            {activeStrategy.steps.length > 0 ? (
              <div className="space-y-2">
                {activeStrategy.steps.map((step, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg themed-surface">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium themed-text/60">{step.componentName}</span>
                        <span className="text-[10px] themed-text/20">({step.weight}%)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] themed-text/30">{step.currentAvg.toFixed(1)}%</span>
                        <ArrowUpRight className="w-3 h-3 themed-accent/50" />
                        <span className="text-[11px] font-medium" style={{ color: strategyColors[activeStrategy.id] }}>
                          {step.requiredAvg.toFixed(1)}%
                        </span>
                        {step.improvement > 0 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded themed-surface-h themed-text/30">
                            +{step.improvement.toFixed(1)}%
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] themed-text/20 mt-1">{step.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs themed-text/20 text-center py-3">No actionable steps available.</p>
            )}

            <div className="mt-4 pt-3 border-t themed-border flex items-center justify-between">
              <span className="text-[11px] themed-text/30">Projected Grade</span>
              <span className="text-sm font-bold" style={{ color: strategyColors[activeStrategy.id] }}>
                {activeStrategy.projectedGrade.toFixed(1)}%
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
