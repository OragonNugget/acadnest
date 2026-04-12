// ============================================================
// AI COACH ENGINE — Natural language grade coaching
// ============================================================

import type { Component, GradeResult, WeakArea } from './calculationEngine';
import type { Strategy } from './strategyEngine';

export interface CoachInsight {
  icon: string;
  title: string;
  message: string;
  type: 'encouragement' | 'warning' | 'action' | 'info';
}

export interface CoachAnalysis {
  greeting: string;
  overallVerdict: string;
  verdictType: 'great' | 'good' | 'caution' | 'danger';
  insights: CoachInsight[];
  bestStrategy: { id: string; reason: string } | null;
  motivationalQuote: string;
}

const quotes = [
  "The expert in anything was once a beginner.",
  "Small progress is still progress. Keep going.",
  "You don't have to be perfect to be amazing.",
  "Focus on progress, not perfection.",
  "Discipline is choosing between what you want now and what you want most.",
  "The pain of studying is temporary. The pride of achievement is forever.",
  "Every hour you study is an investment in your future self.",
  "Don't watch the clock; do what it does — keep going.",
];

export function generateCoachAnalysis(
  components: Component[],
  gradeResult: GradeResult,
  weakAreas: WeakArea[],
  strategies: Strategy[],
  target: number
): CoachAnalysis {
  const { currentGrade, maxPossibleGrade, isComplete } = gradeResult;
  const insights: CoachInsight[] = [];

  // Determine overall verdict
  let verdictType: CoachAnalysis['verdictType'] = 'good';
  let overallVerdict = '';
  let greeting = '';

  if (currentGrade >= 90) {
    verdictType = 'great';
    greeting = "Outstanding work! 🏆";
    overallVerdict = `You're sitting at ${currentGrade.toFixed(1)}% — that's excellent. You're in a strong position and should focus on maintaining this momentum.`;
  } else if (currentGrade >= target) {
    verdictType = 'great';
    greeting = "Nice job! 💪";
    overallVerdict = `At ${currentGrade.toFixed(1)}%, you're above your ${target}% target. Keep doing what you're doing, but don't get complacent — there's always room to push higher.`;
  } else if (currentGrade >= target - 10) {
    verdictType = 'good';
    greeting = "You're in the zone. 🎯";
    overallVerdict = `You're at ${currentGrade.toFixed(1)}%, which is ${(target - currentGrade).toFixed(1)} points below your ${target}% target. This is very doable — a focused push on the right areas will get you there.`;
  } else if (maxPossibleGrade >= target) {
    verdictType = 'caution';
    greeting = "Time to lock in. ⚡";
    overallVerdict = `At ${currentGrade.toFixed(1)}%, you're ${(target - currentGrade).toFixed(1)} points away from your ${target}% target. It's still reachable (max possible: ${maxPossibleGrade.toFixed(1)}%), but you'll need a strategic approach.`;
  } else {
    verdictType = 'danger';
    greeting = "Let's be real with you. 📊";
    overallVerdict = `Your current grade is ${currentGrade.toFixed(1)}% and the maximum you can achieve is ${maxPossibleGrade.toFixed(1)}%. Your ${target}% target isn't reachable with current weights. Consider adjusting your target to something achievable, and let's maximize what we can.`;
  }

  // Weak areas analysis
  if (weakAreas.length > 0) {
    const worst = weakAreas[0];
    insights.push({
      icon: '🔍',
      title: `Biggest weak spot: ${worst.componentName}`,
      message: `At ${worst.average.toFixed(1)}% with ${worst.weight}% weight, this is dragging your grade down the most. Improving here gives you the highest return on effort — every 1% improvement here adds ${(worst.weight / 100).toFixed(2)} points to your final grade.`,
      type: 'warning',
    });

    if (weakAreas.length > 1) {
      const names = weakAreas.slice(1).map(w => w.componentName).join(', ');
      insights.push({
        icon: '⚠️',
        title: `${weakAreas.length} weak areas total`,
        message: `Besides ${worst.componentName}, you should also watch: ${names}. These are all below the performance threshold.`,
        type: 'warning',
      });
    }
  } else if (components.some(c => (gradeResult.componentAverages.get(c.id) ?? -1) >= 0)) {
    insights.push({
      icon: '✅',
      title: 'No major weak spots',
      message: 'All your components are performing at or above average. Keep this balanced approach going.',
      type: 'encouragement',
    });
  }

  // Consistency check
  const avgs = components
    .map(c => gradeResult.componentAverages.get(c.id) ?? -1)
    .filter(a => a >= 0);
  if (avgs.length >= 2) {
    const mean = avgs.reduce((s, a) => s + a, 0) / avgs.length;
    const variance = avgs.reduce((s, a) => s + (a - mean) ** 2, 0) / avgs.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev > 15) {
      insights.push({
        icon: '📉',
        title: 'High inconsistency detected',
        message: `Your scores vary a lot (±${stdDev.toFixed(1)}%). This suggests you're strong in some areas but struggling in others. Focus on bringing your lows up rather than pushing your highs higher — that's where the real gains are.`,
        type: 'action',
      });
    } else if (stdDev < 5) {
      insights.push({
        icon: '📊',
        title: 'Very consistent performer',
        message: `Your scores are remarkably consistent (±${stdDev.toFixed(1)}%). This is great — you can reliably predict your performance. Focus on uniformly raising all components.`,
        type: 'encouragement',
      });
    }
  }

  // Remaining potential
  if (!isComplete) {
    const gap = maxPossibleGrade - currentGrade;
    if (gap > 20) {
      insights.push({
        icon: '🚀',
        title: `${gap.toFixed(0)}% potential upside remaining`,
        message: `You still have significant room to improve. The remaining components haven't been finalized yet — this is your opportunity to make a big push.`,
        type: 'info',
      });
    }
  }

  // High-weight component check
  const highWeight = components.filter(c => c.weight >= 25);
  for (const hw of highWeight) {
    const avg = gradeResult.componentAverages.get(hw.id) ?? -1;
    if (avg < 0) {
      insights.push({
        icon: '🎯',
        title: `${hw.name} is worth ${hw.weight}% — and it's not done yet`,
        message: `This is a make-or-break component. Scoring well here could single-handedly hit your target. Prioritize preparation for this above everything else.`,
        type: 'action',
      });
    } else if (avg < target) {
      insights.push({
        icon: '💡',
        title: `${hw.name} is underperforming its weight`,
        message: `At ${avg.toFixed(1)}% on a ${hw.weight}%-weight component, this is below your target. Since it's so heavily weighted, even a small improvement here has outsized impact.`,
        type: 'action',
      });
    }
  }

  // Best strategy recommendation
  let bestStrategy: CoachAnalysis['bestStrategy'] = null;
  const feasible = strategies.filter(s => s.feasible && s.steps.length > 0);

  if (feasible.length > 0) {
    // Pick based on situation
    if (verdictType === 'danger') {
      const survival = feasible.find(s => s.id === 'survival');
      if (survival) {
        bestStrategy = { id: 'survival', reason: "Given the tight margins, Survival Strategy is your best bet — it tells you the absolute minimum you need on each remaining component. No wasted effort." };
      }
    } else if (weakAreas.length >= 2) {
      const weakArea = feasible.find(s => s.id === 'weak-area');
      if (weakArea) {
        bestStrategy = { id: 'weak-area', reason: `With ${weakAreas.length} weak areas identified, Weak Area Repair gives you the most efficient path. Fix the leaks before trying to fill the bucket higher.` };
      }
    } else if (verdictType === 'caution') {
      const highImpact = feasible.find(s => s.id === 'high-impact');
      if (highImpact) {
        bestStrategy = { id: 'high-impact', reason: "You need targeted improvement. High Impact Optimization focuses your energy where it matters most — the components with the biggest weight × improvement potential." };
      }
    } else if (verdictType === 'good' || verdictType === 'great') {
      const conservative = feasible.find(s => s.id === 'conservative');
      if (conservative) {
        bestStrategy = { id: 'conservative', reason: "You're in a good position. The Conservative Strategy adds a safety buffer so you're protected against any unexpected dips on exam day." };
      }
    }

    if (!bestStrategy) {
      const optimal = feasible.find(s => s.id === 'optimal');
      if (optimal) {
        bestStrategy = { id: 'optimal', reason: "The Optimal Strategy distributes effort proportionally across all your components — it's the most balanced and mathematically efficient path to your target." };
      }
    }
  }

  const motivationalQuote = quotes[Math.floor(Math.random() * quotes.length)];

  return {
    greeting,
    overallVerdict,
    verdictType,
    insights,
    bestStrategy,
    motivationalQuote,
  };
}
