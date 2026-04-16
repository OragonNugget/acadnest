import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Activity, ChevronDown, ChevronUp, Lock, Eye } from 'lucide-react';
import type { GradePrediction } from '../lib/predictionEngine';

interface Props {
  prediction: GradePrediction | null;
  isPremium: boolean;
  currentGrade: number;
}

const directionConfig = {
  improving: { icon: TrendingUp, color: '#22c55e', label: 'Improving', bg: 'from-emerald-500/[0.06] to-emerald-600/[0.02]', border: 'border-emerald-500/15' },
  declining: { icon: TrendingDown, color: '#ef4444', label: 'Declining', bg: 'from-red-500/[0.06] to-red-600/[0.02]', border: 'border-red-500/15' },
  stable: { icon: Minus, color: '#f59e0b', label: 'Stable', bg: 'from-amber-500/[0.06] to-amber-600/[0.02]', border: 'border-amber-500/15' },
  mixed: { icon: Activity, color: '#a855f7', label: 'Mixed', bg: 'from-purple-500/[0.06] to-purple-600/[0.02]', border: 'border-purple-500/15' },
};

const confidenceColors = {
  high: { color: '#22c55e', label: 'High Confidence' },
  medium: { color: '#f59e0b', label: 'Medium Confidence' },
  low: { color: '#ef4444', label: 'Low Confidence' },
};

function MiniSparkline({ points, color }: { points: number[]; color: string }) {
  if (points.length < 2) return null;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const h = 24;
  const w = 60;
  const step = w / (points.length - 1);

  const pathData = points
    .map((p, i) => {
      const x = i * step;
      const y = h - ((p - min) / range) * h;
      return `${i === 0 ? 'M' : 'L'}${x},${y}`;
    })
    .join(' ');

  return (
    <svg width={w} height={h} className="flex-shrink-0">
      <path d={pathData} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity={0.6} />
    </svg>
  );
}

export default function PredictionPanel({ prediction, isPremium, currentGrade }: Props) {
  const [expanded, setExpanded] = useState(false);

  if (!isPremium) {
    return (
      <div className="rounded-xl flex flex-col items-center justify-center text-center bg-surface border border-border p-6 shadow-sm">
        <div className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center mb-3">
          <Lock className="w-4 h-4 text-muted/50" />
        </div>
        <h3 className="text-sm font-semibold text-muted font-sans mb-1">Grade Prediction Locked</h3>
        <p className="text-xs text-muted/60 mb-2">Premium feature — AI trend analysis & forecasting</p>
      </div>
    );
  }

  if (!prediction || prediction.componentTrends.length === 0) {
    return (
      <div className="rounded-xl flex flex-col items-center justify-center text-center bg-surface border border-border p-6 shadow-sm">
        <div className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center mb-3">
          <Activity className="w-4 h-4 text-primary" />
        </div>
        <h3 className="text-sm font-semibold text-muted font-sans mb-1">Need More Data</h3>
        <p className="text-xs text-muted/60">Add more entries (2+ per component) to see trend predictions.</p>
      </div>
    );
  }

  const dir = directionConfig[prediction.overallDirection];
  const DirIcon = dir.icon;
  const conf = confidenceColors[prediction.confidenceLevel];
  const diff = prediction.predictedFinalGrade - currentGrade;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl bg-surface border border-border overflow-hidden shadow-sm`}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-5 flex items-center gap-4 text-left cursor-pointer hover:bg-surface-hover transition-colors"
      >
        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${dir.color}15` }}>
          <Eye className="w-4 h-4" style={{ color: dir.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">Grade Prediction</h3>
            <DirIcon className="w-3.5 h-3.5" style={{ color: dir.color }} />
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-lg font-bold font-mono" style={{ color: dir.color }}>
              {prediction.predictedFinalGrade.toFixed(1)}%
            </span>
            {Math.abs(diff) >= 0.1 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${diff > 0 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                {diff > 0 ? '+' : ''}{diff.toFixed(1)}%
              </span>
            )}
            <span className="text-[9px] px-1.5 py-0.5 rounded-md font-medium uppercase" style={{ backgroundColor: `${conf.color}12`, color: conf.color }}>
              {conf.label}
            </span>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted" /> : <ChevronDown className="w-4 h-4 text-muted" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4">
              {/* Summary */}
              <div className="rounded-lg bg-background p-4 border border-border">
                <p className="text-sm font-medium text-foreground leading-relaxed">{prediction.summary}</p>
              </div>

              {/* Component trends */}
              <div className="space-y-2 mt-4">
                <p className="text-[10px] text-muted uppercase tracking-wider font-bold mb-2">Component Trends</p>
                {prediction.componentTrends.map(trend => {
                  const tDir = directionConfig[trend.direction];
                  const TIcon = tDir.icon;
                  return (
                    <div key={trend.componentId} className="flex items-center gap-3 px-3 py-2.5 rounded-md bg-background border border-border group">
                      <TIcon className="w-4 h-4 flex-shrink-0" style={{ color: tDir.color }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-foreground truncate">{trend.componentName}</span>
                          <span className="text-[9px] text-muted font-mono">({trend.weight}%)</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-muted">
                            Next predicted: <span className="font-bold font-mono" style={{ color: tDir.color }}>{trend.predictedNext.toFixed(0)}%</span>
                          </span>
                          <span className="text-[9px] text-muted/60 font-mono bg-surface px-1 py-0.5 rounded border border-border/50">
                            {trend.slope > 0 ? '+' : ''}{trend.slope.toFixed(1)}/entry
                          </span>
                        </div>
                      </div>
                      <div className="opacity-70 group-hover:opacity-100 transition-opacity">
                        <MiniSparkline points={trend.points.map(p => p.percent)} color={tDir.color} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Confidence bar */}
              <div className="pt-4 mt-2 border-t border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] text-muted font-medium">Prediction Confidence</span>
                  <span className="text-[11px] font-bold font-mono" style={{ color: conf.color }}>{prediction.confidencePercent.toFixed(0)}%</span>
                </div>
                <div className="h-2 rounded-full bg-background border border-border overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${prediction.confidencePercent}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: conf.color }}
                  />
                </div>
                <p className="text-[10px] text-muted/60 mt-2 text-center">Based on {prediction.componentTrends.reduce((s, t) => s + t.points.length, 0)} data points across {prediction.componentTrends.length} components</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
