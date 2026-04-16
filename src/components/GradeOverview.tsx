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
          <span className="text-2xl font-bold text-white">{displayValue}</span>
          <span className="text-[10px] text-white/40 uppercase tracking-wider">{displayUnit}</span>
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
      <div className="acad-surface p-8 text-center">
        <p className="text-white/30">Add components and entries to see your grade overview.</p>
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
      className="acad-surface-strong p-6"
    >
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h2 className="text-base font-semibold text-white/80">Grade Overview</h2>
        <div className="flex items-center gap-3">
          {/* GPA toggle — Premium only */}
          {isPremium && (
            <button
              onClick={() => setDisplayMode(displayMode === 'percent' ? 'gpa' : 'percent')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.06] text-[11px] text-white/40 hover:text-white/60 transition-colors cursor-pointer"
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
              <Target className="w-4 h-4 text-amber-400/70" />
              <label className="text-xs text-white/40">Target:</label>
              <input
                type="number"
                min={0}
                max={100}
                value={target}
                onChange={e => onTargetChange(Math.min(100, Math.max(0, Number(e.target.value))))}
                className="w-16 bg-white/[0.04] border border-white/[0.08] rounded-md px-2 py-1 text-sm text-white text-center focus:outline-none focus:border-amber-400/40"
              />
              <span className="text-xs text-white/30">%</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-8 mb-6">
        <GradeRing value={currentGrade} label="Current Grade" color="#f59e0b" size={130} displayMode={displayMode} />
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
