import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, ChevronDown, ChevronUp, Sparkles, ArrowRight, MessageCircle } from 'lucide-react';
import type { CoachAnalysis } from '../lib/coachEngine';

interface Props {
  analysis: CoachAnalysis | null;
  onSelectStrategy: (id: string) => void;
}

const verdictColors = {
  great: { bg: 'from-emerald-500/[0.08] to-emerald-600/[0.03]', border: 'border-emerald-500/20', text: 'text-emerald-300', dot: 'bg-emerald-400' },
  good: { bg: 'from-blue-500/[0.08] to-blue-600/[0.03]', border: 'border-blue-500/20', text: 'text-blue-300', dot: 'bg-blue-400' },
  caution: { bg: 'from-yellow-400/[0.08] to-yellow-500/[0.03]', border: 'border-yellow-400/20', text: 'themed-accent-soft', dot: 'bg-yellow-300' },
  danger: { bg: 'from-red-500/[0.08] to-red-600/[0.03]', border: 'border-red-500/20', text: 'text-red-300', dot: 'bg-red-400' },
};

const insightTypeColors = {
  encouragement: 'border-emerald-500/10 bg-emerald-500/[0.03]',
  warning: 'border-yellow-400/10 bg-yellow-400/[0.03]',
  action: 'border-blue-500/10 bg-blue-500/[0.03]',
  info: 'themed-border themed-surface',
};

  const [expanded, setExpanded] = useState(true);


  if (!analysis) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-cyan-500/[0.03] to-blue-500/[0.02] border border-cyan-500/[0.08] p-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-400/10 flex items-center justify-center">
            <Bot className="w-4.5 h-4.5 text-cyan-400" />
          </div>
          <p className="text-xs themed-text/30">Add your components and grades first — then I can help!</p>
        </div>
      </div>
    );
  }

  const colors = verdictColors[analysis.verdictType];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl bg-gradient-to-br ${colors.bg} border ${colors.border} overflow-hidden`}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-5 flex items-center gap-3 text-left cursor-pointer"
      >
        <div className="w-9 h-9 rounded-xl bg-cyan-400/10 flex items-center justify-center flex-shrink-0">
          <Bot className="w-4.5 h-4.5 text-cyan-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold themed-text/80">Grade Coach</h2>
            <Sparkles className="w-3 h-3 themed-accent/60" />
          </div>
          <p className={`text-xs ${colors.text} mt-0.5`}>{analysis.greeting}</p>
        </div>
        <div className={`w-2.5 h-2.5 rounded-full ${colors.dot} animate-pulse flex-shrink-0`} />
        {expanded ? <ChevronUp className="w-4 h-4 themed-text/20" /> : <ChevronDown className="w-4 h-4 themed-text/20" />}
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
              {/* Overall verdict */}
              <div className="rounded-lg bg-black/20 p-3.5">
                <div className="flex items-start gap-2">
                  <MessageCircle className="w-3.5 h-3.5 text-cyan-400/50 mt-0.5 flex-shrink-0" />
                  <p className="text-xs themed-text/50 leading-relaxed">{analysis.overallVerdict}</p>
                </div>
              </div>

              {/* Insights */}
              {analysis.insights.length > 0 && (
                <div className="space-y-2">
                  {analysis.insights.map((insight, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={`rounded-lg border p-3 ${insightTypeColors[insight.type]}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm">{insight.icon}</span>
                        <span className="text-[11px] font-semibold themed-text/60">{insight.title}</span>
                      </div>
                      <p className="text-[11px] themed-text/35 leading-relaxed pl-6">{insight.message}</p>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Best strategy recommendation */}
              {analysis.bestStrategy && (
                <div className="rounded-lg bg-cyan-500/[0.06] border border-cyan-500/10 p-3.5">
                  <p className="text-[10px] text-cyan-400/50 uppercase tracking-wider font-medium mb-2">Recommended Strategy</p>
                  <p className="text-[11px] themed-text/45 leading-relaxed mb-3">{analysis.bestStrategy.reason}</p>
                  <button
                    onClick={() => onSelectStrategy(analysis.bestStrategy!.id)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-cyan-400/10 text-cyan-300 text-[11px] font-medium hover:bg-cyan-400/20 transition-colors cursor-pointer"
                  >
                    View Strategy <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Motivational quote */}
              <div className="pt-2 border-t themed-border">
                <p className="text-[10px] themed-text/15 italic text-center">"{analysis.motivationalQuote}"</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
