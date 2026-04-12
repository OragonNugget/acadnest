// ============================================================
// PREDICTION ENGINE — Trend analysis & final grade forecasting
// ============================================================

import type { Component, GradeResult } from './calculationEngine';
import { clamp } from './calculationEngine';

export interface TrendPoint {
  index: number;
  label: string;
  percent: number;
}

export interface ComponentTrend {
  componentId: number;
  componentName: string;
  weight: number;
  points: TrendPoint[];
  slope: number; // positive = improving, negative = declining
  direction: 'improving' | 'declining' | 'stable';
  predictedNext: number; // predicted score on next entry (0-100)
  confidence: number; // 0-1, how reliable the prediction is
}

export interface GradePrediction {
  predictedFinalGrade: number;
  confidenceLevel: 'high' | 'medium' | 'low';
  confidencePercent: number;
  componentTrends: ComponentTrend[];
  overallDirection: 'improving' | 'declining' | 'stable' | 'mixed';
  summary: string;
}

// Linear regression: returns slope and intercept
function linearRegression(points: number[]): { slope: number; intercept: number; r2: number } {
  const n = points.length;
  if (n < 2) return { slope: 0, intercept: points[0] ?? 0, r2: 0 };

  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += points[i];
    sumXY += i * points[i];
    sumX2 += i * i;
    sumY2 += points[i] * points[i];
  }

  const denom = n * sumX2 - sumX * sumX;
  if (denom === 0) return { slope: 0, intercept: sumY / n, r2: 0 };

  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;

  // R-squared
  const meanY = sumY / n;
  const ssTotal = sumY2 - n * meanY * meanY;
  const ssResidual = points.reduce((s, y, i) => {
    const predicted = intercept + slope * i;
    return s + (y - predicted) ** 2;
  }, 0);
  const r2 = ssTotal > 0 ? 1 - ssResidual / ssTotal : 0;

  return { slope, intercept, r2 };
}

function analyzeComponentTrend(comp: Component): ComponentTrend {
  const points: TrendPoint[] = comp.entries.map((e, i) => ({
    index: i,
    label: e.label || `#${i + 1}`,
    percent: e.max_score > 0 ? (e.score / e.max_score) * 100 : 0,
  }));

  const percents = points.map(p => p.percent);
  const { slope, intercept, r2 } = linearRegression(percents);

  // Direction based on slope significance
  const avgPercent = percents.length > 0 ? percents.reduce((s, p) => s + p, 0) / percents.length : 0;
  const slopeThreshold = avgPercent * 0.02; // 2% of average is "significant"

  let direction: ComponentTrend['direction'] = 'stable';
  if (slope > slopeThreshold) direction = 'improving';
  else if (slope < -slopeThreshold) direction = 'declining';

  // Predict next entry
  const nextIndex = percents.length;
  const predictedNext = clamp(intercept + slope * nextIndex, 0, 100);

  // Confidence based on R² and sample size
  const sampleBonus = Math.min(percents.length / 5, 1); // more data = more confident, caps at 5
  const confidence = clamp(r2 * 0.7 + sampleBonus * 0.3, 0, 1);

  return {
    componentId: comp.id,
    componentName: comp.name,
    weight: comp.weight,
    points,
    slope,
    direction,
    predictedNext,
    confidence,
  };
}

export function generatePrediction(
  components: Component[],
  gradeResult: GradeResult
): GradePrediction {
  const totalWeight = components.reduce((s, c) => s + c.weight, 0);
  if (totalWeight === 0) {
    return {
      predictedFinalGrade: 0,
      confidenceLevel: 'low',
      confidencePercent: 0,
      componentTrends: [],
      overallDirection: 'stable',
      summary: 'Add components and entries to see predictions.',
    };
  }

  // Analyze each component with entries
  const componentTrends: ComponentTrend[] = [];
  for (const comp of components) {
    if (comp.entries.length >= 1) {
      componentTrends.push(analyzeComponentTrend(comp));
    }
  }

  // Predict final grade
  // For components with trends: use predicted performance
  // For components with no entries and not done: use average of predicted values
  // For done components: use actual average
  let weightedPrediction = 0;
  const allPredictedAvgs: number[] = [];

  for (const comp of components) {
    const trend = componentTrends.find(t => t.componentId === comp.id);
    const currentAvg = gradeResult.componentAverages.get(comp.id) ?? -1;

    if (comp.done && currentAvg >= 0) {
      // Locked in
      weightedPrediction += currentAvg * comp.weight;
    } else if (trend && trend.points.length >= 2) {
      // Has trend data — blend current avg with predicted trajectory
      // Weight recent performance more heavily
      const trendWeight = Math.min(trend.confidence, 0.6);
      const blended = currentAvg * (1 - trendWeight) + trend.predictedNext * trendWeight;
      const predicted = clamp(blended, 0, 100);
      weightedPrediction += predicted * comp.weight;
      allPredictedAvgs.push(predicted);
    } else if (currentAvg >= 0) {
      // Has entries but no strong trend — use current average
      weightedPrediction += currentAvg * comp.weight;
      allPredictedAvgs.push(currentAvg);
    } else {
      // No entries at all — use average of other predictions, or 75 as baseline
      const fallback = allPredictedAvgs.length > 0
        ? allPredictedAvgs.reduce((s, a) => s + a, 0) / allPredictedAvgs.length
        : 75;
      weightedPrediction += fallback * comp.weight;
    }
  }

  const predictedFinalGrade = clamp(weightedPrediction / totalWeight, 0, 100);

  // Overall confidence
  const avgConfidence = componentTrends.length > 0
    ? componentTrends.reduce((s, t) => s + t.confidence, 0) / componentTrends.length
    : 0;
  const dataCompleteness = componentTrends.length / components.length;
  const overallConfidence = clamp(avgConfidence * 0.6 + dataCompleteness * 0.4, 0, 1);

  let confidenceLevel: GradePrediction['confidenceLevel'] = 'low';
  if (overallConfidence >= 0.6) confidenceLevel = 'high';
  else if (overallConfidence >= 0.3) confidenceLevel = 'medium';

  // Overall direction
  const improving = componentTrends.filter(t => t.direction === 'improving').length;
  const declining = componentTrends.filter(t => t.direction === 'declining').length;
  let overallDirection: GradePrediction['overallDirection'] = 'stable';
  if (improving > 0 && declining > 0) overallDirection = 'mixed';
  else if (improving > declining) overallDirection = 'improving';
  else if (declining > improving) overallDirection = 'declining';

  // Generate summary
  const currentGrade = gradeResult.currentGrade;
  const diff = predictedFinalGrade - currentGrade;
  let summary = '';

  if (componentTrends.length === 0) {
    summary = 'Not enough data to predict trends yet. Add more entries to see forecasts.';
  } else if (Math.abs(diff) < 1) {
    summary = `Based on your current trajectory, your final grade is likely to stay around ${predictedFinalGrade.toFixed(1)}%. Your performance is consistent.`;
  } else if (diff > 0) {
    summary = `Your scores are trending upward. If you maintain this momentum, your final grade could reach ${predictedFinalGrade.toFixed(1)}% — that's +${diff.toFixed(1)} points from where you are now.`;
  } else {
    summary = `Your scores show a slight downward trend. Without intervention, your final grade may drop to ${predictedFinalGrade.toFixed(1)}% (${Math.abs(diff).toFixed(1)} points below current). Focus on reversing the trend in your weakest areas.`;
  }

  if (declining > 0 && componentTrends.length > 0) {
    const worstDecline = componentTrends
      .filter(t => t.direction === 'declining')
      .sort((a, b) => a.slope - b.slope)[0];
    if (worstDecline) {
      summary += ` Watch out for ${worstDecline.componentName} — it's declining the fastest.`;
    }
  }

  return {
    predictedFinalGrade,
    confidenceLevel,
    confidencePercent: overallConfidence * 100,
    componentTrends,
    overallDirection,
    summary,
  };
}
