import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface Props {
  components: { name: string; weight: number }[];
}

export default function WeightValidator({ components }: Props) {
  if (components.length === 0) return null;

  const total = components.reduce((s, c) => s + c.weight, 0);
  const rounded = Math.round(total * 100) / 100;
  const isExact = Math.abs(rounded - 100) < 0.01;
  const isOver = rounded > 100.01;
  const isUnder = rounded < 99.99 && rounded > 0;

  return (
    <AnimatePresence>
      {!isExact && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          <div className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-[11px] ${
            isOver
              ? 'bg-red-500/[0.06] border-red-500/[0.15] text-red-300/80'
              : 'bg-yellow-400/[0.06] border-yellow-400/[0.12] text-yellow-300/70'
          }`}>
            <AlertTriangle className={`w-3.5 h-3.5 shrink-0 ${isOver ? 'text-red-400' : 'text-yellow-400/80'}`} />
            <span>
              Weights total <strong>{rounded.toFixed(1)}%</strong>
              {isOver
                ? ` — over by ${(rounded - 100).toFixed(1)}%. Grade calculation will be skewed.`
                : ` — ${(100 - rounded).toFixed(1)}% unallocated. Missing weight won't affect your grade.`
              }
            </span>
          </div>
        </motion.div>
      )}
      {isExact && components.length >= 2 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex items-center gap-1.5 text-[10px] text-emerald-400/40"
        >
          <CheckCircle className="w-3 h-3" />
          <span>Weights add up to 100%</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
