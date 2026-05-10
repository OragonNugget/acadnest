import { motion } from 'framer-motion';
import { AlertCircle, TrendingDown } from 'lucide-react';
import type { WeakArea } from '../lib/calculationEngine';

interface Props {
  weakAreas: WeakArea[];
}

export default function WeakAreasPanel({ weakAreas }: Props) {
  if (weakAreas.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-gradient-to-br from-red-500/[0.03] to-yellow-200/[0.02] border border-red-500/[0.08] p-5"
    >
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="w-4 h-4 text-red-400/70" />
        <h2 className="text-sm font-semibold themed-text/70">Weak Areas Detected</h2>
      </div>
      <div className="space-y-2">
        {weakAreas.map((wa) => (
          <div key={wa.componentId} className="flex items-center gap-3 px-3 py-2.5 rounded-lg themed-surface">
            <div className="w-6 h-6 rounded-md bg-red-500/10 flex items-center justify-center flex-shrink-0">
              <TrendingDown className="w-3 h-3 text-red-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium themed-text/60">{wa.componentName}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400">
                  {wa.average.toFixed(1)}%
                </span>
              </div>
              <p className="text-[10px] themed-text/25 mt-0.5">{wa.reason}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-[10px] themed-text/30">Impact</p>
              <p className="text-xs font-mono themed-accent/70">{wa.impactScore.toFixed(0)}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
