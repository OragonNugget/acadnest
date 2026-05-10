import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Target, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import type { Component, GradeResult } from '../lib/calculationEngine';

interface Props {
  components: Component[];
  gradeResult: GradeResult | null;
  target: number;
}

interface ComponentTarget {
  id: number;
  name: string;
  weight: number;
  currentAvg: number;
  neededScore: number | null;
  hasentries: boolean;
  isDone: boolean;
  entriesCount: number;
}

export default function GradeNeededPanel({ components, gradeResult, target }: Props) {
  const analysis = useMemo(() => {
    if (!gradeResult || components.length === 0) return null;

    const totalWeight = components.reduce((s, c) => s + c.weight, 0);
    if (totalWeight === 0) return null;

    // Current weighted sum from components with entries
    const currentWeightedSum = components.reduce((s, comp) => {
      const avg = gradeResult.componentAverages.get(comp.id) ?? -1;
      if (avg >= 0) return s + avg * comp.weight;
      return s;
    }, 0);

    // Weight from components with NO entries (still open)
    const remainingComponents = components.filter(c => {
      const avg = gradeResult.componentAverages.get(c.id) ?? -1;
      return avg < 0 && !c.done;
    });

    const remainingWeight = remainingComponents.reduce((s, c) => s + c.weight, 0);

    // What's needed: target * totalWeight = currentWeightedSum + neededScore * remainingWeight
    // neededScore = (target * totalWeight - currentWeightedSum) / remainingWeight
    const neededOverall =
      remainingWeight > 0
        ? (target * totalWeight - currentWeightedSum) / remainingWeight
        : null;

    const componentTargets: ComponentTarget[] = components.map(comp => {
      const avg = gradeResult.componentAverages.get(comp.id) ?? -1;
      return {
        id: comp.id,
        name: comp.name,
        weight: comp.weight,
        currentAvg: avg,
        neededScore: null, // individual calculation is separate
        hasentries: avg >= 0,
        isDone: comp.done,
        entriesCount: comp.entries.length,
      };
    });

    return {
      neededOverall,
      remainingWeight,
      remainingComponents,
      currentGrade: gradeResult.currentGrade,
      target,
      isPossible: gradeResult.maxPossibleGrade >= target,
      isAlreadyAchieved: gradeResult.currentGrade >= target,
      componentTargets,
    };
  }, [components, gradeResult, target]);

  if (!analysis) return null;

  const { neededOverall, remainingWeight, remainingComponents, isPossible, isAlreadyAchieved } = analysis;

  // Don't render if there's nothing useful to show
  if (components.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-gradient-to-br from-emerald-500/[0.03] to-teal-500/[0.02] border border-emerald-500/[0.08] p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-4 h-4 text-emerald-400/70" />
        <h2 className="text-sm font-semibold themed-text/70">Grade Needed to Pass</h2>
        <span className="text-[10px] themed-text/25 ml-auto">Target: {target}%</span>
      </div>

      {isAlreadyAchieved ? (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/[0.08] border border-emerald-500/[0.15]">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-emerald-300">You've already hit your target!</p>
            <p className="text-[11px] text-emerald-400/50">Current: {analysis.currentGrade.toFixed(1)}% ≥ {target}%</p>
          </div>
        </div>
      ) : !isPossible ? (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/[0.08] border border-red-500/[0.15]">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-300">Target {target}% is no longer achievable</p>
            <p className="text-[11px] text-red-400/50">Max possible: {gradeResult?.maxPossibleGrade.toFixed(1)}%</p>
          </div>
        </div>
      ) : remainingWeight === 0 ? (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl themed-surface border themed-border">
          <TrendingUp className="w-4 h-4 themed-text/30 shrink-0" />
          <p className="text-[11px] themed-text/40">All components have entries. Your current grade is locked in.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Main needed score */}
          {neededOverall !== null && (
            <div className={`px-4 py-3.5 rounded-xl border ${
              neededOverall > 100
                ? 'bg-red-500/[0.06] border-red-500/[0.12]'
                : neededOverall > 85
                ? 'bg-orange-500/[0.06] border-orange-500/[0.12]'
                : 'bg-emerald-500/[0.06] border-emerald-500/[0.12]'
            }`}>
              <p className="text-[10px] themed-text/35 uppercase tracking-wider mb-1">You need an average of</p>
              <div className="flex items-baseline gap-2">
                <span className={`text-3xl font-extrabold ${
                  neededOverall > 100 ? 'text-red-400' : neededOverall > 85 ? 'text-orange-400' : 'text-emerald-400'
                }`}>
                  {neededOverall > 100 ? '—' : `${neededOverall.toFixed(1)}%`}
                </span>
                {neededOverall <= 100 && (
                  <span className="text-[11px] themed-text/30">
                    across remaining {remainingComponents.length} component{remainingComponents.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              {neededOverall > 100 && (
                <p className="text-[11px] text-red-400/70 mt-1">
                  Not achievable — would require more than 100% on all remaining components.
                </p>
              )}
            </div>
          )}

          {/* Remaining components breakdown */}
          {remainingComponents.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[9px] themed-text/25 uppercase tracking-wider">Remaining components</p>
              {remainingComponents.map(comp => (
                <div key={comp.id} className="flex items-center justify-between px-3 py-2 rounded-lg themed-surface border themed-border-subtle">
                  <div>
                    <p className="text-[11px] font-medium themed-text/60">{comp.name}</p>
                    <p className="text-[9px] themed-text/25">{comp.weight}% weight · {comp.entries.length} entries</p>
                  </div>
                  <span className="text-[10px] themed-text/30">no score yet</span>
                </div>
              ))}
            </div>
          )}

          {/* Components with existing scores */}
          {components.filter(c => (gradeResult?.componentAverages.get(c.id) ?? -1) >= 0).length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[9px] themed-text/25 uppercase tracking-wider">Current scores</p>
              {components
                .filter(c => (gradeResult?.componentAverages.get(c.id) ?? -1) >= 0)
                .map(comp => {
                  const avg = gradeResult!.componentAverages.get(comp.id)!;
                  return (
                    <div key={comp.id} className="flex items-center justify-between px-3 py-2 rounded-lg themed-surface border themed-border-subtle">
                      <div>
                        <p className="text-[11px] font-medium themed-text/60">{comp.name}</p>
                        <p className="text-[9px] themed-text/25">{comp.weight}% weight</p>
                      </div>
                      <span className={`text-sm font-bold ${avg >= 75 ? 'text-emerald-400' : avg >= 60 ? 'themed-accent' : 'text-red-400'}`}>
                        {avg.toFixed(1)}%
                      </span>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
