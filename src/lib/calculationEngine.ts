// ============================================================
// CALCULATION ENGINE — Pure math, no side effects
// ============================================================

export interface Entry {
  id: number;
  component_id: number;
  score: number;
  max_score: number;
  label: string;
}

export interface Component {
  id: number;
  student_id: string;
  name: string;
  weight: number;
  done: boolean;
  entries: Entry[];
}

export interface GradeResult {
  currentGrade: number;
  maxPossibleGrade: number;
  minPossibleGrade: number;
  componentAverages: Map<number, number>;
  totalWeightCompleted: number;
  totalWeightRemaining: number;
  isComplete: boolean;
}

export interface WeakArea {
  componentId: number;
  componentName: string;
  average: number;
  weight: number;
  impactScore: number;
  reason: string;
}

// Step 1: Component average = (sum(score/max) / entries.length) * 100
export function computeComponentAverage(entries: Entry[]): number {
  if (entries.length === 0) return -1; // no data
  const sum = entries.reduce((acc, e) => {
    if (e.max_score <= 0) return acc;
    return acc + (e.score / e.max_score);
  }, 0);
  return (sum / entries.length) * 100;
}

// Step 2 & 3: Weighted grade computation
export function computeGrades(components: Component[]): GradeResult {
  const componentAverages = new Map<number, number>();
  let weightedSum = 0;
  let totalWeightCompleted = 0;
  let totalWeightRemaining = 0;
  let totalWeight = 0;

  for (const comp of components) {
    totalWeight += comp.weight;
    const avg = computeComponentAverage(comp.entries);
    componentAverages.set(comp.id, avg);

    if (avg >= 0) {
      // Has entries — contributes to current grade
      weightedSum += avg * comp.weight;
      totalWeightCompleted += comp.weight;
      if (!comp.done) {
        // Partially complete — still has remaining potential
        totalWeightRemaining += comp.weight * 0; // current entries already counted
      }
    }
    if (!comp.done && avg < 0) {
      // No entries yet, not done — fully remaining
      totalWeightRemaining += comp.weight;
    }
  }

  // Remaining weight for components not done and with no entries
  // Plus components not done that have entries (they could improve)
  let remainingWeightForMax = 0;
  let remainingWeightForMin = 0;

  for (const comp of components) {
    if (comp.done) continue;
    const avg = componentAverages.get(comp.id)!;
    if (avg < 0) {
      remainingWeightForMax += comp.weight;
      remainingWeightForMin += comp.weight;
    }
    // Note: if a component has entries but is not done, future entries could change the avg.
    // For simplicity, we treat the current avg as locked for done components.
  }

  const currentGrade = totalWeightCompleted > 0
    ? weightedSum / totalWeightCompleted
    : 0;

  // Max possible: current weighted sum + remaining at 100%
  const maxNumerator = weightedSum + remainingWeightForMax * 100;
  const maxDenominator = totalWeightCompleted + remainingWeightForMax;
  const maxPossibleGrade = maxDenominator > 0 ? maxNumerator / maxDenominator : 0;

  // Min possible: current weighted sum + remaining at 0%
  const minNumerator = weightedSum + remainingWeightForMin * 0;
  const minDenominator = totalWeightCompleted + remainingWeightForMin;
  const minPossibleGrade = minDenominator > 0 ? minNumerator / minDenominator : 0;

  // Use total weight for proper calculation
  const currentGradeTotal = totalWeight > 0 ? weightedSum / totalWeight : 0;
  const maxGradeTotal = totalWeight > 0 ? (weightedSum + remainingWeightForMax * 100) / totalWeight : 0;
  const minGradeTotal = totalWeight > 0 ? (weightedSum + remainingWeightForMin * 0) / totalWeight : 0;

  // If all weights accounted for, use total weight basis
  const useTotal = totalWeight > 0;

  return {
    currentGrade: clamp(useTotal ? currentGradeTotal : currentGrade, 0, 100),
    maxPossibleGrade: clamp(useTotal ? maxGradeTotal : maxPossibleGrade, 0, 100),
    minPossibleGrade: clamp(useTotal ? minGradeTotal : minPossibleGrade, 0, 100),
    componentAverages,
    totalWeightCompleted,
    totalWeightRemaining: remainingWeightForMax,
    isComplete: remainingWeightForMax === 0,
  };
}

// Weak area detection
export function detectWeakAreas(components: Component[], componentAverages: Map<number, number>): WeakArea[] {
  const withAvg = components
    .filter(c => (componentAverages.get(c.id) ?? -1) >= 0)
    .map(c => ({
      ...c,
      avg: componentAverages.get(c.id)!,
      impactScore: c.weight * (100 - componentAverages.get(c.id)!),
    }));

  if (withAvg.length === 0) return [];

  const globalAvg = withAvg.reduce((s, c) => s + c.avg, 0) / withAvg.length;
  const threshold90 = globalAvg * 0.9;

  // Sort by impact score descending
  const sorted = [...withAvg].sort((a, b) => b.impactScore - a.impactScore);
  const bottom30Count = Math.max(1, Math.ceil(sorted.length * 0.3));
  const bottom30Ids = new Set(sorted.slice(0, bottom30Count).map(c => c.id));

  const weakAreas: WeakArea[] = [];

  for (const c of withAvg) {
    const reasons: string[] = [];
    if (c.avg < threshold90) reasons.push(`Average ${c.avg.toFixed(1)}% is below 90% of class average (${threshold90.toFixed(1)}%)`);
    if (bottom30Ids.has(c.id)) reasons.push(`In bottom 30% by weighted impact`);

    if (reasons.length > 0) {
      weakAreas.push({
        componentId: c.id,
        componentName: c.name,
        average: c.avg,
        weight: c.weight,
        impactScore: c.impactScore,
        reason: reasons.join('; '),
      });
    }
  }

  return weakAreas.sort((a, b) => b.impactScore - a.impactScore);
}

export function isTargetPossible(maxPossibleGrade: number, target: number): boolean {
  return maxPossibleGrade >= target;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
