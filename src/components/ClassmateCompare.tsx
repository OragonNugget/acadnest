import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, BarChart2, Share2, Eye, AlertCircle } from 'lucide-react';

interface Distribution {
  below60: number;
  s60to75: number;
  s75to85: number;
  s85to95: number;
  s95plus: number;
  total: number;
  avg: number;
}

interface Props {
  currentGrade: number | null;
  session: any;
  subjectTitle?: string;
}

function gradeToRange(grade: number): keyof Distribution {
  if (grade < 60) return 'below60';
  if (grade < 75) return 's60to75';
  if (grade < 85) return 's75to85';
  if (grade < 95) return 's85to95';
  return 's95plus';
}

const RANGE_LABELS: Record<string, string> = {
  below60: 'Below 60%',
  s60to75: '60–75%',
  s75to85: '75–85%',
  s85to95: '85–95%',
  s95plus: '95–100%',
};
const RANGE_COLORS: Record<string, string> = {
  below60: '#ef4444',
  s60to75: '#f97316',
  s75to85: '#FFD45A',
  s85to95: '#4ade80',
  s95plus: '#22c55e',
};

export default function ClassmateCompare({ currentGrade, session, subjectTitle }: Props) {
  const [dist, setDist] = useState<Distribution | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [collapsed, setCollapsed] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const authHeaders = useCallback((): Record<string, string> => ({
    'Content-Type': 'application/json',
    ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
  }), [session]);

  const fetchDist = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/compare', { headers: authHeaders() });
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      setDist(data);
    } catch (e) {
      setError('Could not load data. The backend endpoint may not be set up yet.');
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  const submitGrade = async () => {
    if (currentGrade === null || currentGrade <= 0) return;
    setSharing(true);
    try {
      const res = await fetch('/api/compare', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          grade: Math.round(currentGrade * 10) / 10,
          ...(subjectTitle ? { subject: subjectTitle } : {}),
        }),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      setSubmitted(true);
      await fetchDist();
    } catch (e) {
      setError('Could not submit. The backend endpoint may not be set up yet.');
    } finally {
      setSharing(false);
    }
  };

  useEffect(() => {
    if (!collapsed) fetchDist();
  }, [collapsed]);

  const totalInDist = dist ? dist.total : 0;
  const myRange = currentGrade !== null ? gradeToRange(currentGrade) : null;

  const ranges: (keyof Distribution)[] = ['below60', 's60to75', 's75to85', 's85to95', 's95plus'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-gradient-to-br from-cyan-500/[0.03] to-blue-500/[0.02] border border-cyan-500/[0.08] overflow-hidden"
    >
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full p-5 flex items-center gap-3 text-left cursor-pointer"
      >
        <Users className="w-4 h-4 text-cyan-400/70" />
        <div className="flex-1">
          <h2 className="text-sm font-semibold themed-text/70">Anonymous Class Comparison</h2>
          <p className="text-[10px] themed-text/25">See where you stand vs other students</p>
        </div>
        <BarChart2 className={`w-3.5 h-3.5 themed-text/20 transition-transform ${collapsed ? '' : 'text-cyan-400/50'}`} />
      </button>

      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4 border-t themed-border pt-4">
              {/* Privacy note */}
              <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-cyan-500/[0.04] border border-cyan-500/[0.10]">
                <Eye className="w-3.5 h-3.5 text-cyan-400/60 shrink-0 mt-0.5" />
                <p className="text-[10px] text-cyan-300/60 leading-relaxed">
                  Only your grade range is shared — never your identity, name, or specific score. Data is aggregated across all AcadNest users.
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/[0.06] border border-red-500/[0.12] text-[10px] text-red-300/70">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {error}
                </div>
              )}

              {/* Distribution as leaderboard */}
              {loading ? (
                <p className="text-[11px] themed-text/25 text-center py-4">Loading...</p>
              ) : dist && dist.total > 0 ? (
                <div className="space-y-1.5">
                  <p className="text-[9px] themed-text/25 uppercase tracking-wider mb-2">{totalInDist} students · class avg <span className="themed-text/40 font-semibold">{dist.avg > 0 ? `${dist.avg.toFixed(1)}%` : '—'}</span></p>
                  {/* Sorted best → worst (leaderboard order) */}
                  {[...ranges].reverse().map((range, i) => {
                    const count = (dist[range] as number) || 0;
                    const pct = totalInDist > 0 ? (count / totalInDist) * 100 : 0;
                    const isMe = range === myRange;
                    const medals = ['🥇', '🥈', '🥉', '4th', '5th'];
                    return (
                      <div
                        key={range}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors ${
                          isMe
                            ? 'border'
                            : 'themed-surface border border-transparent'
                        }`}
                        style={isMe ? {
                          backgroundColor: `${RANGE_COLORS[range]}12`,
                          borderColor: `${RANGE_COLORS[range]}30`,
                        } : {}}
                      >
                        <span className="text-[11px] w-6 text-center shrink-0 themed-text/25">{medals[i]}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span
                              className={`text-[10px] font-medium ${isMe ? 'font-bold' : 'themed-text/45'}`}
                              style={isMe ? { color: RANGE_COLORS[range] } : {}}
                            >
                              {RANGE_LABELS[range]}{isMe ? ' ← You' : ''}
                            </span>
                            <span className="text-[10px] themed-text/25">{count}</span>
                          </div>
                          <div className="h-1.5 rounded-full themed-surface-raised overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.5, ease: 'easeOut', delay: i * 0.05 }}
                              className="h-full rounded-full"
                              style={{ backgroundColor: isMe ? RANGE_COLORS[range] : `${RANGE_COLORS[range]}40` }}
                            />
                          </div>
                        </div>
                        <span className="text-[10px] themed-text/30 shrink-0 w-8 text-right">{pct.toFixed(0)}%</span>
                      </div>
                    );
                  })}
                </div>
              ) : !error ? (
                <p className="text-[11px] themed-text/25 text-center py-2">No data yet. Be the first!</p>
              ) : null}

              {/* Submit button */}
              {currentGrade !== null && currentGrade > 0 && (
                <button
                  onClick={submitGrade}
                  disabled={sharing}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-medium transition-colors cursor-pointer ${
                    submitted
                      ? 'bg-emerald-500/10 text-emerald-400/60 border border-emerald-500/15'
                      : 'bg-cyan-500/10 hover:bg-cyan-500/15 text-cyan-300/70 hover:text-cyan-300/90 border border-cyan-500/15'
                  } disabled:opacity-50`}
                >
                  <Share2 className="w-3.5 h-3.5" />
                  {submitted ? 'Grade range submitted ✓' : sharing ? 'Submitting...' : `Share my range anonymously (${currentGrade.toFixed(0)}%)`}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
