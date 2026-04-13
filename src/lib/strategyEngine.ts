// ============================================================
// STRATEGY ENGINE — Generates actionable strategies
// ============================================================

import type {
  Component,
  GradeResult,
  WeakArea,
} from './calculationEngine';
import { clamp } from './calculationEngine';

export interface StrategyStep {
  componentName: string;
  componentId: number;
  currentAvg: number;
  requiredAvg: number;
  improvement: number;
  weight: number;
  note: string;
}

export interface Strategy {
  name: string;
  id: string;
  description: string;
  feasible: boolean;
  infeasibleReason?: string;
  steps: StrategyStep[];
  projectedGrade: number;
}

export function generateWeakAreaRepair(
  components: Component[],
  gradeResult: GradeResult,
  weakAreas: WeakArea[],
  target: number
): Strategy {
  const steps: StrategyStep[] = [];
  const totalWeight = components.reduce((s, c) => s + c.weight, 0);
  if (totalWeight === 0) {
    return { name: 'Weak Area Repair', id: 'weak-area', description: 'Improve your weakest components.', feasible: false, infeasibleReason: 'No components defined.', steps: [], projectedGrade: 0 };
  }

  for (const wa of weakAreas) {
    const comp = components.find(c => c.id === wa.componentId);
    if (!comp) continue;
    // Required contribution: (weight / totalWeight) * target
    const requiredContribution = (comp.weight / totalWeight) * target;
    const currentContribution = wa.average * comp.weight / totalWeight;
    const deficit = requiredContribution - currentContribution;
    const requiredAvg = clamp(wa.average + (deficit > 0 ? deficit * totalWeight / comp.weight : 0), 0, 100);

    steps.push({
      componentName: wa.componentName,
      componentId: wa.componentId,
      currentAvg: wa.average,
      requiredAvg: clamp(requiredAvg, 0, 100),
      improvement: clamp(requiredAvg - wa.average, 0, 100),
      weight: comp.weight,
      note: deficit > 0 ? `Needs +${clamp(requiredAvg - wa.average, 0, 100).toFixed(1)}% improvement to meet target share` : 'Already meeting target share',
    });
  }

  const feasible = steps.every(s => s.requiredAvg <= 100);
  let projected = 0;
  for (const comp of components) {
    const step = steps.find(s => s.componentId === comp.id);
    const avg = step ? step.requiredAvg : (gradeResult.componentAverages.get(comp.id) ?? 0);
    projected += (avg >= 0 ? avg : 0) * comp.weight;
  }
  projected = totalWeight > 0 ? projected / totalWeight : 0;

  return {
    name: 'Weak Area Repair',
    id: 'weak-area',
    description: 'Focus improvement on your weakest components where the most grade recovery is possible.',
    feasible,
    infeasibleReason: feasible ? undefined : 'Some required averages exceed 100%. Target may not be achievable through weak area improvement alone.',
    steps,
    projectedGrade: clamp(projected, 0, 100),
  };
}

export function generateHighImpactOptimization(
  components: Component[],
  gradeResult: GradeResult,
  target: number
): Strategy {
  const totalWeight = components.reduce((s, c) => s + c.weight, 0);
  if (totalWeight === 0) {
    return { name: 'High Impact Optimization', id: 'high-impact', description: 'Focus on highest-impact components.', feasible: false, infeasibleReason: 'No components.', steps: [], projectedGrade: 0 };
  }

  // Rank by impact = weight * (100 - avg)
  const ranked = components
    .map(c => {
      const avg = gradeResult.componentAverages.get(c.id) ?? -1;
      return { comp: c, avg: avg >= 0 ? avg : 50, impact: c.weight * (100 - (avg >= 0 ? avg : 50)) };
    })
    .sort((a, b) => b.impact - a.impact);

  // Focus on top contributors (top 50% by impact)
  const topCount = Math.max(1, Math.ceil(ranked.length * 0.5));
  const topComponents = ranked.slice(0, topCount);

  // Distribute needed improvement among top components
  const currentWeightedSum = components.reduce((s, c) => {
    const avg = gradeResult.componentAverages.get(c.id) ?? -1;
    return s + (avg >= 0 ? avg : 0) * c.weight;
  }, 0);
  const needed = target * totalWeight - currentWeightedSum;

  const steps: StrategyStep[] = [];
  let remaining = needed;
  for (const { comp, avg } of topComponents) {
    const maxGain = (100 - avg) * comp.weight;
    const allocated = Math.min(remaining, maxGain);
    const requiredAvg = clamp(avg + (comp.weight > 0 ? allocated / comp.weight : 0), 0, 100);
    remaining -= allocated;

    steps.push({
      componentName: comp.name,
      componentId: comp.id,
      currentAvg: avg,
      requiredAvg,
      improvement: clamp(requiredAvg - avg, 0, 100),
      weight: comp.weight,
      note: `Impact potential: ${(comp.weight * (100 - avg)).toFixed(0)} points`,
    });
  }

  const feasible = remaining <= 0.01;
  let projected = 0;
  for (const comp of components) {
    const step = steps.find(s => s.componentId === comp.id);
    const avg = step ? step.requiredAvg : (gradeResult.componentAverages.get(comp.id) ?? 0);
    projected += (avg >= 0 ? avg : 0) * comp.weight;
  }
  projected = totalWeight > 0 ? projected / totalWeight : 0;

  return {
    name: 'High Impact Optimization',
    id: 'high-impact',
    description: 'Maximize grade gains by focusing on components with the highest weight × improvement potential.',
    feasible,
    infeasibleReason: feasible ? undefined : 'Cannot reach target even with maximum improvement on high-impact components.',
    steps,
    projectedGrade: clamp(projected, 0, 100),
  };
}

export function generateSurvivalStrategy(
  components: Component[],
  gradeResult: GradeResult,
  target: number
): Strategy {
  const totalWeight = components.reduce((s, c) => s + c.weight, 0);
  if (totalWeight === 0) {
    return { name: 'Survival Strategy', id: 'survival', description: 'Minimum effort to pass.', feasible: false, infeasibleReason: 'No components.', steps: [], projectedGrade: 0 };
  }

  // Locked contributions from done components
  let lockedSum = 0;
  let remainingWeight = 0;
  const incompleteComps: { comp: Component; avg: number }[] = [];

  for (const comp of components) {
    const avg = gradeResult.componentAverages.get(comp.id) ?? -1;
    if (comp.done && avg >= 0) {
      lockedSum += avg * comp.weight;
    } else {
      remainingWeight += comp.weight;
      incompleteComps.push({ comp, avg: avg >= 0 ? avg : 0 });
    }
  }

  const neededFromRemaining = target * totalWeight - lockedSum;
  const steps: StrategyStep[] = [];

  if (remainingWeight > 0) {
    // Distribute evenly among remaining
    const requiredAvgEach = clamp(neededFromRemaining / remainingWeight, 0, 100);

    for (const { comp, avg } of incompleteComps) {
      steps.push({
        componentName: comp.name,
        componentId: comp.id,
        currentAvg: avg,
        requiredAvg: clamp(requiredAvgEach, 0, 100),
        improvement: clamp(requiredAvgEach - avg, 0, 100),
        weight: comp.weight,
        note: `Minimum required: ${clamp(requiredAvgEach, 0, 100).toFixed(1)}%`,
      });
    }
  }

  const feasible = remainingWeight > 0 && neededFromRemaining / remainingWeight <= 100;
  let projected = 0;
  for (const comp of components) {
    const step = steps.find(s => s.componentId === comp.id);
    const avg = step ? step.requiredAvg : (gradeResult.componentAverages.get(comp.id) ?? 0);
    projected += (avg >= 0 ? avg : 0) * comp.weight;
  }
  projected = totalWeight > 0 ? projected / totalWeight : 0;

  return {
    name: 'Survival Strategy',
    id: 'survival',
    description: 'The absolute minimum performance needed on remaining components to reach your target.',
    feasible,
    infeasibleReason: feasible ? undefined : 'Target is impossible given locked-in grades.',
    steps,
    projectedGrade: clamp(projected, 0, 100),
  };
}

export function generateOptimalStrategy(
  components: Component[],
  gradeResult: GradeResult,
  target: number
): Strategy {
  const totalWeight = components.reduce((s, c) => s + c.weight, 0);
  if (totalWeight === 0) {
    return { name: 'Optimal Strategy', id: 'optimal', description: 'Linear distribution solve.', feasible: false, infeasibleReason: 'No components.', steps: [], projectedGrade: 0 };
  }

  // Solve: Σ(weight_i * x_i) / totalWeight = target
  // For done components, x_i is locked
  // For incomplete, distribute proportionally to available headroom

  let lockedSum = 0;
  const incomplete: { comp: Component; avg: number; headroom: number }[] = [];

  for (const comp of components) {
    const avg = gradeResult.componentAverages.get(comp.id) ?? -1;
    if (comp.done && avg >= 0) {
      lockedSum += avg * comp.weight;
    } else {
      const currentAvg = avg >= 0 ? avg : 0;
      incomplete.push({ comp, avg: currentAvg, headroom: 100 - currentAvg });
    }
  }

  const needed = target * totalWeight - lockedSum;
  const totalHeadroomWeighted = incomplete.reduce((s, c) => s + c.headroom * c.comp.weight, 0);

  const steps: StrategyStep[] = [];
  let feasible = true;

  if (totalHeadroomWeighted > 0) {
    // Distribute proportionally to headroom
    const currentIncompleteSum = incomplete.reduce((s, c) => s + c.avg * c.comp.weight, 0);
    const additionalNeeded = needed - currentIncompleteSum;

    for (const { comp, avg, headroom } of incomplete) {
      const proportion = (headroom * comp.weight) / totalHeadroomWeighted;
      const additionalForThis = additionalNeeded * proportion;
      const requiredAvg = clamp(avg + (comp.weight > 0 ? additionalForThis / comp.weight : 0), 0, 100);

      if (requiredAvg > 100) feasible = false;

      steps.push({
        componentName: comp.name,
        componentId: comp.id,
        currentAvg: avg,
        requiredAvg: clamp(requiredAvg, 0, 100),
        improvement: clamp(requiredAvg - avg, 0, 100 - avg),
        weight: comp.weight,
        note: `Optimal target: ${clamp(requiredAvg, 0, 100).toFixed(1)}% (proportional to headroom)`,
      });
    }
  } else {
    feasible = needed <= 0.01;
  }

  let projected = 0;
  for (const comp of components) {
    const step = steps.find(s => s.componentId === comp.id);
    const avg = step ? step.requiredAvg : (gradeResult.componentAverages.get(comp.id) ?? 0);
    projected += (avg >= 0 ? avg : 0) * comp.weight;
  }
  projected = totalWeight > 0 ? projected / totalWeight : 0;

  return {
    name: 'Optimal Strategy',
    id: 'optimal',
    description: 'Distributes effort proportionally based on available headroom per component — the most balanced path to your target.',
    feasible,
    infeasibleReason: feasible ? undefined : 'Target exceeds maximum possible grade. Reduce your target or check component weights.',
    steps,
    projectedGrade: clamp(projected, 0, 100),
  };
}

export function generateConservativeStrategy(
  components: Component[],
  gradeResult: GradeResult,
  target: number
): Strategy {
  // Add buffer of 3-8% based on variance
  const avgs = components
    .map(c => gradeResult.componentAverages.get(c.id) ?? -1)
    .filter(a => a >= 0);

  let variance = 0;
  if (avgs.length > 1) {
    const mean = avgs.reduce((s, a) => s + a, 0) / avgs.length;
    variance = avgs.reduce((s, a) => s + (a - mean) ** 2, 0) / avgs.length;
  }

  // Higher variance → higher buffer (3 to 8)
  const normalizedVariance = Math.min(variance / 500, 1); // 0 to 1
  const buffer = 3 + normalizedVariance * 5;
  const bufferedTarget = clamp(target + buffer, 0, 100);

  const base = generateOptimalStrategy(components, gradeResult, bufferedTarget);

  return {
    ...base,
    name: 'Conservative Strategy',
    id: 'conservative',
    description: `Adds a ${buffer.toFixed(1)}% safety buffer (based on grade variance) to protect against unexpected drops. Effective target: ${bufferedTarget.toFixed(1)}%.`,
    infeasibleReason: base.feasible ? undefined : `Even the buffered target of ${bufferedTarget.toFixed(1)}% exceeds your maximum possible grade.`,
  };
}

export function generateAllStrategies(
  components: Component[],
  gradeResult: GradeResult,
  weakAreas: WeakArea[],
  target: number
): Strategy[] {
  return [
    generateWeakAreaRepair(components, gradeResult, weakAreas, target),
    generateHighImpactOptimization(components, gradeResult, target),
    generateSurvivalStrategy(components, gradeResult, target),
    generateOptimalStrategy(components, gradeResult, target),
    generateConservativeStrategy(components, gradeResult, target),
  ];
}
