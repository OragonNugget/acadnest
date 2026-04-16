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
      <div className="rounded-xl flex flex-col items-center justify-center text-center bg-surface border border-border p-6 shadow-sm">
        <div className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center mb-3 text-primary">
          <Crown className="w-4 h-4" />
        </div>
        <h2 className="text-sm font-semibold text-muted font-sans mb-1">Strategy Engine Locked</h2>
        <p className="text-xs text-muted/60 mb-4">Unlock 5 AI-powered grade strategies</p>
        
        <div className="space-y-2 w-full mb-4 opacity-50 pointer-events-none">
          {['Weak Area Repair', 'High Impact Optimization', 'Survival Strategy', 'Optimal Strategy', 'Conservative Strategy'].map(name => (
            <div key={name} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background border border-border">
              <Lock className="w-3.5 h-3.5 text-muted" />
              <span className="text-xs font-medium text-muted">{name}</span>
            </div>
          ))}
        </div>
        <p className="text-[11px] font-medium text-primary bg-primary/10 px-3 py-1 rounded-md">Upgrade to Premium</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-surface border border-border p-6 shadow-sm">
      <div className="flex items-center justify-between mb-5 border-b border-border pb-4">
        <h2 className="text-base font-semibold text-foreground">Strategy Engine</h2>
        {!targetPossible && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-destructive/10 border border-destructive/20">
            <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
            <span className="text-[10px] text-destructive font-medium uppercase tracking-wider">Target impossible</span>
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
                  ? 'bg-background border border-border shadow-sm'
                  : 'bg-transparent border border-transparent hover:bg-surface-hover hover:border-border'
              }`}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}15` }}>
                <Icon className="w-4 h-4" style={{ color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{strategy.name}</span>
                  {!strategy.feasible && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-destructive/10 text-destructive font-medium uppercase">Infeasible</span>
                  )}
                </div>
              </div>
              <ChevronRight className={`w-4 h-4 text-muted transition-transform ${isActive ? 'rotate-90' : ''}`} />
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
            className="rounded-xl bg-background border border-border p-5 shadow-sm mt-2"
          >
            <p className="text-xs text-muted mb-5 leading-relaxed">{activeStrategy.description}</p>

            {!activeStrategy.feasible && activeStrategy.infeasibleReason && (
              <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-destructive/5 border border-destructive/10 mb-4">
                <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                <p className="text-[11px] text-destructive/80 leading-relaxed font-medium">{activeStrategy.infeasibleReason}</p>
              </div>
            )}

            {activeStrategy.steps.length > 0 ? (
              <div className="space-y-2">
                {activeStrategy.steps.map((step, i) => (
                  <div key={i} className="flex items-center gap-3 px-3.5 py-3 rounded-lg bg-surface border border-border/50">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs font-semibold text-foreground">{step.componentName}</span>
                        <span className="text-[10px] text-muted font-mono">({step.weight}%)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted font-mono bg-background px-1.5 py-0.5 rounded">{step.currentAvg.toFixed(1)}%</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-muted" />
                        <span className="text-xs font-bold font-mono px-1.5 py-0.5 rounded" style={{ color: strategyColors[activeStrategy.id], backgroundColor: `${strategyColors[activeStrategy.id]}10` }}>
                          {step.requiredAvg.toFixed(1)}%
                        </span>
                        {step.improvement > 0 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-success/10 text-success font-medium">
                            +{step.improvement.toFixed(1)}%
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted mt-2 pl-1 border-l-2 border-border/50">{step.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted text-center py-4 border border-dashed border-border rounded-lg">No actionable steps available.</p>
            )}

            <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
              <span className="text-xs font-medium text-muted uppercase tracking-wider">Projected Grade</span>
              <span className="text-base font-bold font-mono" style={{ color: strategyColors[activeStrategy.id] }}>
                {activeStrategy.projectedGrade.toFixed(1)}%
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
