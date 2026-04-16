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
      <div className="acad-surface-soft p-5">
        <div className="flex items-center gap-2 mb-2">
          <Lock className="w-3.5 h-3.5 text-white/15" />
          <h3 className="text-xs font-medium text-white/25">Grade Prediction</h3>
        </div>
        <p className="text-[10px] text-white/15">Premium feature — AI trend analysis & forecasting</p>
      </div>
    );
  }

  if (!prediction || prediction.componentTrends.length === 0) {
    return (
      <div className="acad-surface-soft p-5">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="w-4 h-4 text-white/20" />
          <h3 className="text-xs font-medium text-white/40">Grade Prediction</h3>
        </div>
        <p className="text-[10px] text-white/25">Add more entries (2+ per component) to see trend predictions.</p>
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
      className={`acad-surface-glass-strong bg-gradient-to-br ${dir.bg} ${dir.border} overflow-hidden`}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-5 flex items-center gap-3 text-left cursor-pointer"
      >
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${dir.color}15` }}>
          <Eye className="w-4 h-4" style={{ color: dir.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-white/80">Grade Prediction</h3>
            <DirIcon className="w-3.5 h-3.5" style={{ color: dir.color }} />
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-lg font-bold" style={{ color: dir.color }}>
              {prediction.predictedFinalGrade.toFixed(1)}%
            </span>
            {Math.abs(diff) >= 0.1 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${diff > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                {diff > 0 ? '+' : ''}{diff.toFixed(1)}%
              </span>
            )}
            <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${conf.color}12`, color: conf.color }}>
              {conf.label}
            </span>
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-white/20" /> : <ChevronDown className="w-4 h-4 text-white/20" />}
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
              <div className="rounded-lg bg-black/20 p-3">
                <p className="text-[11px] text-white/45 leading-relaxed">{prediction.summary}</p>
              </div>

              {/* Component trends */}
              <div className="space-y-1.5">
                <p className="text-[10px] text-white/25 uppercase tracking-wider font-medium">Component Trends</p>
                {prediction.componentTrends.map(trend => {
                  const tDir = directionConfig[trend.direction];
                  const TIcon = tDir.icon;
                  return (
                    <div key={trend.componentId} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.02]">
                      <TIcon className="w-3 h-3 flex-shrink-0" style={{ color: tDir.color }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-medium text-white/55 truncate">{trend.componentName}</span>
                          <span className="text-[9px] text-white/20">({trend.weight}%)</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-white/30">
                            Next predicted: <span className="font-medium" style={{ color: tDir.color }}>{trend.predictedNext.toFixed(0)}%</span>
                          </span>
                          <span className="text-[9px] text-white/15">
                            {trend.slope > 0 ? '+' : ''}{trend.slope.toFixed(1)}/entry
                          </span>
                        </div>
                      </div>
                      <MiniSparkline points={trend.points.map(p => p.percent)} color={tDir.color} />
                    </div>
                  );
                })}
              </div>

              {/* Confidence bar */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-white/25">Prediction Confidence</span>
                  <span className="text-[10px] font-medium" style={{ color: conf.color }}>{prediction.confidencePercent.toFixed(0)}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${prediction.confidencePercent}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: conf.color }}
                  />
                </div>
                <p className="text-[9px] text-white/15 mt-1">Based on {prediction.componentTrends.reduce((s, t) => s + t.points.length, 0)} data points across {prediction.componentTrends.length} components</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
