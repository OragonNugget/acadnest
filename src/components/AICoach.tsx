import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, ChevronDown, ChevronUp, Sparkles, ArrowRight, Lock, MessageCircle } from 'lucide-react';
import type { CoachAnalysis } from '../lib/coachEngine';

interface Props {
  analysis: CoachAnalysis | null;
  isPremium: boolean;
  onSelectStrategy: (id: string) => void;
}

const verdictColors = {
  great: { bg: 'from-emerald-500/[0.08] to-emerald-600/[0.03]', border: 'border-emerald-500/20', text: 'text-emerald-300', dot: 'bg-emerald-400' },
  good: { bg: 'from-blue-500/[0.08] to-blue-600/[0.03]', border: 'border-blue-500/20', text: 'text-blue-300', dot: 'bg-blue-400' },
  caution: { bg: 'from-amber-500/[0.08] to-amber-600/[0.03]', border: 'border-amber-500/20', text: 'text-amber-300', dot: 'bg-amber-400' },
  danger: { bg: 'from-red-500/[0.08] to-red-600/[0.03]', border: 'border-red-500/20', text: 'text-red-300', dot: 'bg-red-400' },
};

const insightTypeColors = {
  encouragement: 'border-emerald-500/10 bg-emerald-500/[0.03]',
  warning: 'border-amber-500/10 bg-amber-500/[0.03]',
  action: 'border-blue-500/10 bg-blue-500/[0.03]',
  info: 'border-white/[0.06] bg-white/[0.02]',
};

export default function AICoach({ analysis, isPremium, onSelectStrategy }: Props) {
  const [expanded, setExpanded] = useState(true);

  if (!isPremium) {
    return (
      <div className="rounded-xl bg-surface border border-border p-6 shadow-sm flex flex-col items-center justify-center text-center">
        <div className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center mb-3">
          <Bot className="w-4 h-4 text-primary" />
        </div>
        <h2 className="text-sm font-semibold text-muted font-sans mb-1">AI Grade Coach Locked</h2>
        <p className="text-xs text-muted/60 mb-4">Personalized coaching & strategy picks</p>
        <p className="text-[11px] font-medium text-primary bg-primary/10 px-3 py-1 rounded-md">Upgrade to Premium</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="rounded-xl bg-surface border border-border p-6 shadow-sm flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center border border-border">
          <Bot className="w-4 h-4 text-primary" />
        </div>
        <p className="text-sm text-muted">Add components and entries to receive AI coaching.</p>
      </div>
    );
  }

  const colors = verdictColors[analysis.verdictType];

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
        <div className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-foreground">AI Grade Coach</h2>
            <Sparkles className="w-3.5 h-3.5 text-accent" />
          </div>
          <p className={`text-xs text-muted font-medium mt-0.5`}>{analysis.greeting}</p>
        </div>
        <div className={`w-2.5 h-2.5 rounded-full ${colors.dot} flex-shrink-0 shadow-sm`} />
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
              {/* Overall verdict */}
              <div className="rounded-lg bg-background p-4 border border-border shadow-sm">
                <div className="flex items-start gap-3">
                  <MessageCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-foreground leading-relaxed">{analysis.overallVerdict}</p>
                </div>
              </div>

              {/* Insights */}
              {analysis.insights.length > 0 && (
                <div className="space-y-3 mt-4">
                  {analysis.insights.map((insight, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={`rounded-lg border p-3.5 bg-background shadow-sm`}
                    >
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <span className="text-base">{insight.icon}</span>
                        <span className="text-xs font-semibold text-foreground tracking-wide">{insight.title}</span>
                      </div>
                      <p className="text-[11px] text-muted leading-relaxed pl-7">{insight.message}</p>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Best strategy recommendation */}
              {analysis.bestStrategy && (
                <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 mt-4 shadow-sm">
                  <p className="text-[10px] text-primary uppercase tracking-wider font-bold mb-2">Recommended Strategy</p>
                  <p className="text-[11px] text-foreground leading-relaxed mb-4">{analysis.bestStrategy.reason}</p>
                  <button
                    onClick={() => onSelectStrategy(analysis.bestStrategy!.id)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-[11px] font-medium hover:bg-primary-hover shadow-sm transition-colors cursor-pointer"
                  >
                    View Strategy <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Motivational quote */}
              <div className="mt-6 pt-4 border-t border-border">
                <p className="text-xs text-muted/60 italic text-center font-serif">"{analysis.motivationalQuote}"</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
