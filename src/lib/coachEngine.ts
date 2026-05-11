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

  // Partition components
  const doneComponents = components.filter(c => c.done);
  const activeComponents = components.filter(c => !c.done);
  const activeWithEntries = activeComponents.filter(c => (gradeResult.componentAverages.get(c.id) ?? -1) >= 0);
  const activeWithNoEntries = activeComponents.filter(c => (gradeResult.componentAverages.get(c.id) ?? -1) < 0);
  const doneWeight = doneComponents.reduce((s, c) => s + c.weight, 0);
  const activeWeight = activeComponents.reduce((s, c) => s + c.weight, 0);
  const activeNoEntryWeight = activeWithNoEntries.reduce((s, c) => s + c.weight, 0);
  const totalWeight = components.reduce((s, c) => s + c.weight, 0);

  // ── Overall verdict ───────────────────────────────────────────
  let verdictType: CoachAnalysis['verdictType'] = 'good';
  let overallVerdict = '';
  let greeting = '';

  if (isComplete) {
    if (currentGrade >= 90) {
      verdictType = 'great';
      greeting = 'All done — exceptional result! 🏆';
      overallVerdict = `Final grade: ${currentGrade.toFixed(1)}%. All ${components.length} components are locked in. That's well above your ${target}% target — nothing left to do here.`;
    } else if (currentGrade >= target) {
      verdictType = 'great';
      greeting = 'Wrapped up — you passed! 🎉';
      overallVerdict = `Final grade: ${currentGrade.toFixed(1)}%. All components done. You cleared your ${target}% target by ${(currentGrade - target).toFixed(1)} points — grade is sealed.`;
    } else {
      verdictType = 'danger';
      greeting = 'All done — grade is locked. 📋';
      overallVerdict = `Final grade: ${currentGrade.toFixed(1)}%. All components are marked done, so there's no more room to improve. Consider speaking with your professor about your options.`;
    }
  } else if (doneComponents.length > 0 && activeComponents.length > 0) {
    const lockedContrib = doneComponents.reduce((s, c) => s + (gradeResult.componentAverages.get(c.id) ?? 0) * c.weight, 0);
    const lockedPoints = totalWeight > 0 ? lockedContrib / totalWeight : 0;

    if (currentGrade >= 90) {
      verdictType = 'great';
      greeting = 'Outstanding with room to grow! 🏆';
      overallVerdict = `You're at ${currentGrade.toFixed(1)}%. ${doneComponents.length} component${doneComponents.length > 1 ? 's' : ''} locked (${doneWeight}% weight, contributing ${lockedPoints.toFixed(1)} pts). The remaining ${activeWeight}% is still open — you're in an excellent spot.`;
    } else if (currentGrade >= target) {
      verdictType = 'great';
      greeting = 'Above target with components still open! 💪';
      overallVerdict = `At ${currentGrade.toFixed(1)}%, you're ${(currentGrade - target).toFixed(1)} points above your ${target}% target. ${doneComponents.length} component${doneComponents.length > 1 ? 's are' : ' is'} locked in — your remaining ${activeWeight}% can only push this higher.`;
    } else if (maxPossibleGrade >= target) {
      verdictType = currentGrade >= target - 10 ? 'good' : 'caution';
      greeting = currentGrade >= target - 10 ? 'Solid base, keep pushing. 🎯' : 'Still reachable — lock in now. ⚡';
      const needed = activeNoEntryWeight + activeWithEntries.reduce((s, c) => s + c.weight, 0);
      const neededScore = needed > 0
        ? ((target * totalWeight - doneComponents.reduce((s, c) => s + (gradeResult.componentAverages.get(c.id) ?? 0) * c.weight, 0) - activeWithEntries.reduce((s, c) => s + (gradeResult.componentAverages.get(c.id) ?? 0) * c.weight, 0)) / needed).toFixed(1)
        : '—';
      overallVerdict = `At ${currentGrade.toFixed(1)}% with ${doneWeight}% locked in. You have ${activeWeight}% of components still open — max possible: ${maxPossibleGrade.toFixed(1)}%. You need roughly ${neededScore}% average on what's left to hit your ${target}% target.`;
    } else {
      verdictType = 'danger';
      greeting = "Let's be honest with you. 📊";
      overallVerdict = `With ${doneWeight}% of weight already locked in at your current scores, the max you can reach is ${maxPossibleGrade.toFixed(1)}% — below your ${target}% target. Focus on maximizing the remaining ${activeWeight}%.`;
    }
  } else {
    // Nothing locked yet
    if (currentGrade >= 90) {
      verdictType = 'great'; greeting = 'Flying high! 🚀';
      overallVerdict = `${currentGrade.toFixed(1)}% across the board — strong start. No components are locked yet, so you control everything right now.`;
    } else if (currentGrade >= target) {
      verdictType = 'great'; greeting = 'On track! 💪';
      overallVerdict = `At ${currentGrade.toFixed(1)}%, you're above your ${target}% target. Nothing is locked in yet — all components are still in play.`;
    } else if (maxPossibleGrade >= target) {
      verdictType = currentGrade >= target - 10 ? 'good' : 'caution';
      greeting = currentGrade >= target - 10 ? 'Looking good, stay focused. 🎯' : 'Time to lock in. ⚡';
      overallVerdict = `You're at ${currentGrade.toFixed(1)}%, ${(target - currentGrade).toFixed(1)} below your ${target}% target. Max possible is ${maxPossibleGrade.toFixed(1)}% — reachable, but needs consistent effort on all open components.`;
    } else {
      verdictType = 'danger'; greeting = "Let's be real with you. 📊";
      overallVerdict = `Current: ${currentGrade.toFixed(1)}%, max possible: ${maxPossibleGrade.toFixed(1)}%. Your ${target}% target isn't reachable at current weights. Adjust your target and focus on maximizing what you can.`;
    }
  }

  // ── Insight: Done components recap ───────────────────────────
  if (doneComponents.length > 0 && !isComplete) {
    const badDone = doneComponents.filter(c => (gradeResult.componentAverages.get(c.id) ?? 0) < target);
    const goodDone = doneComponents.filter(c => (gradeResult.componentAverages.get(c.id) ?? 0) >= target);

    if (badDone.length > 0) {
      const badList = badDone
        .map(c => `${c.name} (${(gradeResult.componentAverages.get(c.id) ?? 0).toFixed(1)}%, ${c.weight}% wt)`)
        .join(', ');
      insights.push({
        icon: '🔒',
        title: `${badDone.length} locked component${badDone.length > 1 ? 's are' : ' is'} below target`,
        message: `${badList} — ${badDone.length > 1 ? 'these are' : 'this is'} done and the scores can't change. You'll need to compensate on your remaining open components to make up the gap.`,
        type: 'warning',
      });
    }

    if (goodDone.length > 0 && badDone.length === 0) {
      insights.push({
        icon: '🔒',
        title: `${goodDone.length} locked component${goodDone.length > 1 ? 's' : ''} — all clear`,
        message: `${goodDone.map(c => `${c.name} (${(gradeResult.componentAverages.get(c.id) ?? 0).toFixed(1)}%)`).join(', ')} — all done and above ${target}%. That's ${doneWeight}% of your grade secured at a good level.`,
        type: 'encouragement',
      });
    }
  }

  // ── Insight: Weak areas — only active components ─────────────
  const activeWeakAreas = weakAreas.filter(w => {
    const comp = components.find(c => c.id === w.componentId);
    return comp && !comp.done;
  });

  if (activeWeakAreas.length > 0) {
    const worst = activeWeakAreas[0];
    insights.push({
      icon: '🔍',
      title: `Weakest open component: ${worst.componentName}`,
      message: `${worst.componentName} is at ${worst.average.toFixed(1)}% (${worst.weight}% weight) — and it's still open, so you can fix this. Every 1% improvement here adds ${(worst.weight / 100).toFixed(2)} points to your final grade.`,
      type: 'warning',
    });
    if (activeWeakAreas.length > 1) {
      const rest = activeWeakAreas.slice(1).map(w => `${w.componentName} (${w.average.toFixed(1)}%)`).join(', ');
      insights.push({
        icon: '⚠️',
        title: `${activeWeakAreas.length} open weak areas total`,
        message: `Beyond ${worst.componentName}, watch: ${rest}. None of these are locked yet — there's still time to turn them around.`,
        type: 'warning',
      });
    }
  } else if (activeWithEntries.length > 0 && weakAreas.filter(w => {
    const c = components.find(cc => cc.id === w.componentId);
    return c && c.done;
  }).length === 0) {
    insights.push({
      icon: '✅',
      title: 'No weak spots in your open components',
      message: 'All active (non-locked) components are at or above average. Consistency is your strength right now.',
      type: 'encouragement',
    });
  }

  // ── Insight: Untouched high-weight open components ───────────
  for (const comp of activeWithNoEntries.filter(c => c.weight >= 20).sort((a, b) => b.weight - a.weight).slice(0, 2)) {
    insights.push({
      icon: '🎯',
      title: `${comp.name} (${comp.weight}% weight) — no scores yet`,
      message: `This open component has no entries, which means it's contributing 0 to your weighted grade right now. At ${comp.weight}% weight it's one of your biggest levers — get scores in here.`,
      type: 'action',
    });
  }

  // ── Insight: High-performing open components ─────────────────
  const highPerformingActive = activeWithEntries.filter(c => (gradeResult.componentAverages.get(c.id) ?? -1) >= 88);
  if (highPerformingActive.length > 0 && verdictType !== 'danger') {
    insights.push({
      icon: '⭐',
      title: `Strong open ${highPerformingActive.length > 1 ? 'components' : 'component'}: ${highPerformingActive.map(c => c.name).join(', ')}`,
      message: `${highPerformingActive.map(c => `${c.name} (${(gradeResult.componentAverages.get(c.id)!).toFixed(0)}%)`).join(', ')} — performing well and still open. Same approach, same energy.`,
      type: 'encouragement',
    });
  }

  // ── Insight: Consistency in active components ────────────────
  const activeAvgs = activeWithEntries.map(c => gradeResult.componentAverages.get(c.id)!).filter(a => a >= 0);
  if (activeAvgs.length >= 2) {
    const mean = activeAvgs.reduce((s, a) => s + a, 0) / activeAvgs.length;
    const stdDev = Math.sqrt(activeAvgs.reduce((s, a) => s + (a - mean) ** 2, 0) / activeAvgs.length);
    if (stdDev > 15) {
      insights.push({
        icon: '📉',
        title: 'Wide spread across open components',
        message: `Your active component scores vary by ±${stdDev.toFixed(1)}% — you're strong in some areas but struggling in others. Raise your lowest active scores first; those give the most grade per effort.`,
        type: 'action',
      });
    } else if (stdDev < 5 && activeAvgs.length >= 3) {
      insights.push({
        icon: '📊',
        title: 'Very consistent across open components',
        message: `Active scores are tightly grouped (±${stdDev.toFixed(1)}%). Small uniform improvements across all open components will lift your grade efficiently.`,
        type: 'encouragement',
      });
    }
  }

  // ── Insight: Remaining upside ────────────────────────────────
  if (!isComplete && activeNoEntryWeight > 0 && verdictType !== 'danger') {
    const potentialBoost = maxPossibleGrade - currentGrade;
    if (potentialBoost > 15) {
      insights.push({
        icon: '🚀',
        title: `${potentialBoost.toFixed(0)} points of grade still up for grabs`,
        message: `${activeWithNoEntries.length} open component${activeWithNoEntries.length > 1 ? 's' : ''} with ${activeNoEntryWeight}% weight ${activeWithNoEntries.length > 1 ? 'have' : 'has'} no scores yet. Each one you perform well on directly raises your final grade.`,
        type: 'info',
      });
    }
  }

  // ── Best strategy ────────────────────────────────────────────
  let bestStrategy: CoachAnalysis['bestStrategy'] = null;
  const feasible = strategies.filter(s => s.feasible && s.steps.length > 0);

  if (!isComplete && feasible.length > 0) {
    if (verdictType === 'danger') {
      const s = feasible.find(s => s.id === 'survival');
      if (s) bestStrategy = { id: 'survival', reason: `Survival Strategy shows the minimum you need on each open component. Tight margins — no wasted effort.` };
    } else if (activeWeakAreas.length >= 2) {
      const s = feasible.find(s => s.id === 'weak-area');
      if (s) bestStrategy = { id: 'weak-area', reason: `${activeWeakAreas.length} open weak areas identified. Weak Area Repair targets them directly — fix the leaks before pushing higher.` };
    } else if (verdictType === 'caution') {
      const s = feasible.find(s => s.id === 'high-impact');
      if (s) bestStrategy = { id: 'high-impact', reason: `Focus your energy where weight × improvement potential is highest on your open components.` };
    } else {
      const s = feasible.find(s => s.id === 'conservative');
      if (s) bestStrategy = { id: 'conservative', reason: `You're in a good spot. Conservative Strategy builds a safety buffer on your remaining open components.` };
    }
    if (!bestStrategy) {
      const s = feasible.find(s => s.id === 'optimal');
      if (s) bestStrategy = { id: 'optimal', reason: `Optimal Strategy distributes effort across open components proportionally — the most balanced path forward.` };
    }
  }

  return {
    greeting,
    overallVerdict,
    verdictType,
    insights,
    bestStrategy,
    motivationalQuote: quotes[Math.floor(Math.random() * quotes.length)],
  };
}
