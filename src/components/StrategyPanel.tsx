import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Shield, Target, TrendingUp, Wrench, Lock, AlertTriangle, ChevronRight, Crown, ArrowUpRight } from 'lucide-react';
import type { Strategy } from '../lib/strategyEngine';

interface Props {
  strategies: Strategy[];
  isPremium: boolean;
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
  'weak-area': '#f97316',
  'high-impact': '#3b82f6',
  'survival': '#ef4444',
  'optimal': '#22c55e',
  'conservative': '#a855f7',
};

export default function StrategyPanel({ strategies, isPremium, targetPossible, externalSelectedId, onExternalSelectedClear }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  // Handle external selection from AI Coach
  useEffect(() => {
    if (externalSelectedId) {
      setSelected(externalSelectedId);
      onExternalSelectedClear?.();
    }
  }, [externalSelectedId, onExternalSelectedClear]);

  const activeStrategy = strategies.find(s => s.id === selected);

  if (!isPremium) {
    return (
      <div className="acad-surface-glass-strong bg-gradient-to-br from-amber-400/[0.03] to-orange-500/[0.02] p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center">
            <Crown className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white/80">Strategy Engine</h2>
            <p className="text-[11px] text-white/30">Unlock 5 AI-powered grade strategies</p>
          </div>
        </div>
        <div className="space-y-2">
          {['Weak Area Repair', 'High Impact Optimization', 'Survival Strategy', 'Optimal Strategy', 'Conservative Strategy'].map(name => (
            <div key={name} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.02]">
              <Lock className="w-3 h-3 text-white/15" />
              <span className="text-xs text-white/20">{name}</span>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-amber-400/40 mt-4 text-center">Upgrade to Premium to access strategies</p>
      </div>
    );
  }

  return (
    <div className="acad-surface-glass-strong bg-gradient-to-br from-white/[0.03] to-white/[0.01] p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold text-white/80">Strategy Engine</h2>
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
          const color = strategyColors[strategy.id] || '#f59e0b';
          const isActive = selected === strategy.id;

          return (
            <button
              key={strategy.id}
              onClick={() => setSelected(isActive ? null : strategy.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all cursor-pointer ${
                isActive
                  ? 'bg-white/[0.06] border border-white/[0.12]'
                  : 'bg-white/[0.02] border border-transparent hover:bg-white/[0.04] hover:border-white/[0.06]'
              }`}
            >
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}15` }}>
                <Icon className="w-3.5 h-3.5" style={{ color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-white/70">{strategy.name}</span>
                  {!strategy.feasible && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400">Infeasible</span>
                  )}
                </div>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 text-white/15 transition-transform ${isActive ? 'rotate-90' : ''}`} />
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
            className="acad-surface-soft p-4"
          >
            <p className="text-xs text-white/40 mb-4 leading-relaxed">{activeStrategy.description}</p>

            {!activeStrategy.feasible && activeStrategy.infeasibleReason && (
              <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-red-500/5 border border-red-500/10 mb-4">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-[11px] text-red-300/80 leading-relaxed">{activeStrategy.infeasibleReason}</p>
              </div>
            )}

            {activeStrategy.steps.length > 0 ? (
              <div className="space-y-2">
                {activeStrategy.steps.map((step, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/[0.02]">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-white/60">{step.componentName}</span>
                        <span className="text-[10px] text-white/20">({step.weight}%)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-white/30">{step.currentAvg.toFixed(1)}%</span>
                        <ArrowUpRight className="w-3 h-3 text-amber-400/50" />
                        <span className="text-[11px] font-medium" style={{ color: strategyColors[activeStrategy.id] }}>
                          {step.requiredAvg.toFixed(1)}%
                        </span>
                        {step.improvement > 0 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.04] text-white/30">
                            +{step.improvement.toFixed(1)}%
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-white/20 mt-1">{step.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-white/20 text-center py-3">No actionable steps available.</p>
            )}

            <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center justify-between">
              <span className="text-[11px] text-white/30">Projected Grade</span>
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
