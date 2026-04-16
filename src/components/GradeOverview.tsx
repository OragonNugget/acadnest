import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Target, AlertTriangle, CheckCircle, ToggleLeft, ToggleRight } from 'lucide-react';
import type { GradeResult } from '../lib/calculationEngine';
import { percentToGPA, percentToGPALabel, formatGPA, gpaToColor } from '../lib/gpaScale';

interface Props {
  gradeResult: GradeResult | null;
  target: number;
  isPremium: boolean;
  onTargetChange: (t: number) => void;
}

type DisplayMode = 'percent' | 'gpa';

function GradeRing({ value, label, color, size = 120, displayMode }: { value: number; label: string; color: string; size?: number; displayMode: DisplayMode }) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  // For GPA, invert: 1.0 = full ring, 5.0 = empty ring
  const gpa = percentToGPA(value);
  const ringPercent = displayMode === 'percent' ? value : Math.max(0, (5 - gpa) / 4 * 100);
  const offset = circumference - (ringPercent / 100) * circumference;

  const displayValue = displayMode === 'percent' ? value.toFixed(1) : formatGPA(gpa);
  const displayUnit = displayMode === 'percent' ? '%' : 'GPA';
  const ringColor = displayMode === 'gpa' ? gpaToColor(gpa) : color;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="6" />
          <motion.circle
            cx={size/2} cy={size/2} r={radius} fill="none"
            stroke={ringColor} strokeWidth="6" strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-white tracking-tight">{displayValue}</span>
          <span className="text-xs text-white/40 uppercase tracking-wider mt-1">{displayUnit}</span>
        </div>
      </div>
      <span className="text-xs text-white/50 font-medium">{label}</span>
      {displayMode === 'gpa' && (
        <span className="text-[9px] font-medium" style={{ color: gpaToColor(gpa) }}>
          {percentToGPALabel(value)}
        </span>
      )}
    </div>
  );
}

export default function GradeOverview({ gradeResult, target, isPremium, onTargetChange }: Props) {
  const [displayMode, setDisplayMode] = useState<DisplayMode>('percent');

  if (!gradeResult) {
    return (
      <div className="rounded-2xl bg-slate-900/50 backdrop-blur-md border border-slate-800 p-8 text-center shadow-xl">
        <p className="text-white/40">Add components and entries to see your grade overview.</p>
      </div>
    );
  }

  const { currentGrade, maxPossibleGrade, minPossibleGrade, isComplete, totalWeightRemaining } = gradeResult;
  const targetPossible = maxPossibleGrade >= target;
  const onTrack = currentGrade >= target;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-slate-900/50 backdrop-blur-md border border-slate-800 p-6 sm:p-8 shadow-xl"
    >
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <h2 className="text-lg font-semibold text-white/90 tracking-tight">Grade Overview</h2>
        <div className="flex items-center gap-4">
          {/* GPA toggle — Premium only */}
          {isPremium && (
            <button
              onClick={() => setDisplayMode(displayMode === 'percent' ? 'gpa' : 'percent')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface hover:bg-white/[0.06] text-xs text-white/50 hover:text-white/70 transition-colors cursor-pointer"
            >
              {displayMode === 'percent' ? (
                <><ToggleLeft className="w-4 h-4" /> Percentage</>
              ) : (
                <><ToggleRight className="w-4 h-4 text-indigo-400" /> <span className="text-indigo-300">1.0–5.0 GPA</span></>
              )}
            </button>
          )}
          {isPremium && (
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-400/80" />
              <label className="text-sm text-white/50">Target:</label>
              <input
                type="number"
                min={0}
                max={100}
                value={target}
                onChange={e => onTargetChange(Math.min(100, Math.max(0, Number(e.target.value))))}
                className="w-16 bg-surface border border-border rounded-md px-2 py-1 text-sm text-white text-center focus:outline-none focus:border-indigo-500/50 transition-colors"
              />
              <span className="text-sm text-white/30">%</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-10 mb-8">
        <GradeRing value={currentGrade} label="Current Grade" color="#6366f1" size={140} displayMode={displayMode} />
        {!isComplete && (
          <>
            <GradeRing value={maxPossibleGrade} label="Best Case" color="#22c55e" size={100} displayMode={displayMode} />
            <GradeRing value={minPossibleGrade} label="Worst Case" color="#ef4444" size={100} displayMode={displayMode} />
          </>
        )}
      </div>

      {/* GPA equivalent callout */}
      {isPremium && displayMode === 'gpa' && (
        <div className="flex justify-center mb-4">
          <div className="px-4 py-2 rounded-full border" style={{ borderColor: `${gpaToColor(percentToGPA(currentGrade))}30`, backgroundColor: `${gpaToColor(percentToGPA(currentGrade))}08` }}>
            <span className="text-xs" style={{ color: gpaToColor(percentToGPA(currentGrade)) }}>
              {percentToGPALabel(currentGrade)} · {currentGrade.toFixed(1)}% = {formatGPA(percentToGPA(currentGrade))} GPA
            </span>
          </div>
        </div>
      )}

      {isPremium && (
        <div className="flex flex-wrap gap-3 justify-center">
          {targetPossible ? (
            onTrack ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs text-emerald-300">On track for {target}%</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs text-amber-300">Target {target}% is achievable — need improvement</span>
              </div>
            )
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
              <span className="text-xs text-red-300">Target {target}% is impossible (max: {maxPossibleGrade.toFixed(1)}%)</span>
            </div>
          )}
          {!isComplete && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06]">
              <span className="text-xs text-white/40">{totalWeightRemaining.toFixed(0)}% weight remaining</span>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
