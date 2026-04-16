import { motion } from 'framer-motion';
import { AlertCircle, TrendingDown } from 'lucide-react';
import type { WeakArea } from '../lib/calculationEngine';

interface Props {
  weakAreas: WeakArea[];
  isPremium: boolean;
}

export default function WeakAreasPanel({ weakAreas, isPremium }: Props) {
  if (!isPremium || weakAreas.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl bg-destructive/5 border border-destructive/20 p-5 shadow-sm"
    >
      <div className="flex items-center gap-2 mb-4 border-b border-destructive/10 pb-3">
        <AlertCircle className="w-4 h-4 text-destructive" />
        <h2 className="text-sm font-semibold text-destructive/90">Weak Areas Detected</h2>
      </div>
      <div className="space-y-2">
        {weakAreas.map((wa) => (
          <div key={wa.componentId} className="flex items-center gap-3 px-3.5 py-3 rounded-lg bg-background border border-border/50">
            <div className="w-8 h-8 rounded-md bg-destructive/10 flex items-center justify-center flex-shrink-0">
              <TrendingDown className="w-4 h-4 text-destructive" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-foreground">{wa.componentName}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-destructive/10 text-destructive font-medium">
                  {wa.average.toFixed(1)}%
                </span>
              </div>
              <p className="text-[11px] text-muted mt-1 font-medium">{wa.reason}</p>
            </div>
            <div className="text-right flex-shrink-0 border-l border-border/50 pl-3">
              <p className="text-[10px] text-muted uppercase tracking-wider">Impact</p>
              <p className="text-sm font-mono font-bold text-destructive/80 mt-0.5">{wa.impactScore.toFixed(0)}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
