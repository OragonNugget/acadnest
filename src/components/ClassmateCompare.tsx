import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, BarChart2, Share2, Eye, AlertCircle, BookOpen } from 'lucide-react';

interface Distribution {
  below60: number;
  s60to75: number;
  s75to85: number;
  s85to95: number;
  s95plus: number;
  total: number;
  avg: number;
  subject_name: string;
}

interface Props {
  currentGrade: number | null;
  session: any;
  subjectTitle: string;
}

function gradeToRange(grade: number): keyof Omit<Distribution, 'total' | 'avg' | 'subject_name'> {
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
const RANGES = ['below60', 's60to75', 's75to85', 's85to95', 's95plus'] as const;

export default function ClassmateCompare({ currentGrade, session, subjectTitle }: Props) {
  const [dist, setDist] = useState<Distribution | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [mySubmittedRange, setMySubmittedRange] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [collapsed, setCollapsed] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const hasSubject = subjectTitle.trim().length > 0;

  const authHeaders = useCallback((): Record<string, string> => ({
    'Content-Type': 'application/json',
    ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
  }), [session]);

  const fetchDist = useCallback(async () => {
    if (!hasSubject) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ subject: subjectTitle.trim() });
      const res = await fetch(`/api/compare?${params}`, { headers: authHeaders() });
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      setDist(data);
      setAlreadySubmitted(data.already_submitted ?? false);
      setMySubmittedRange(data.my_range ?? null);
    } catch {
      setError('Could not load data. Make sure the grade_compare table is set up in Supabase.');
    } finally {
      setLoading(false);
    }
  }, [authHeaders, subjectTitle, hasSubject]);

  const submitGrade = async () => {
    if (currentGrade === null || currentGrade <= 0 || !hasSubject) return;
    setSharing(true);
    setError(null);
    try {
      const res = await fetch('/api/compare', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          grade: Math.round(currentGrade * 10) / 10,
          subject: subjectTitle.trim(),
        }),
      });
      if (!res.ok) throw new Error(`${res.status}`);
      setSubmitted(true);
      await fetchDist();
    } catch {
      setError('Could not submit. Check that the Supabase table is set up.');
    } finally {
      setSharing(false);
    }
  };

  useEffect(() => {
    if (!collapsed && hasSubject) {
      setSubmitted(false);
      setDist(null);
      setAlreadySubmitted(false);
      setMySubmittedRange(null);
      fetchDist();
    }
  }, [collapsed, subjectTitle]); // eslint-disable-line react-hooks/exhaustive-deps

  const myRange = currentGrade !== null ? gradeToRange(currentGrade) : null;
  // Whether current grade would land in a different range than what was submitted
  const rangeChanged = alreadySubmitted && mySubmittedRange && myRange && mySubmittedRange !== myRange;

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
        <Users className="w-4 h-4 text-cyan-400/70 shrink-0" />
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold themed-text/70">Class Comparison</h2>
          <p className="text-[10px] themed-text/25 truncate">
            {hasSubject ? subjectTitle : 'Set a subject name first'}
          </p>
        </div>
        <BarChart2 className={`w-3.5 h-3.5 shrink-0 transition-colors ${collapsed ? 'themed-text/20' : 'text-cyan-400/50'}`} />
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

              {/* No subject set */}
              {!hasSubject ? (
                <div className="flex items-start gap-2 px-3 py-3 rounded-xl bg-yellow-400/[0.05] border border-yellow-400/[0.10]">
                  <BookOpen className="w-3.5 h-3.5 text-yellow-400/60 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-yellow-300/60 leading-relaxed">
                    Type a subject name at the top of the dashboard to compare with others in the same class.
                  </p>
                </div>
              ) : (
                <>
                  {/* Subject badge */}
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-3 h-3 text-cyan-400/40 shrink-0" />
                    <span className="text-[10px] text-cyan-300/50 truncate">Comparing for: <strong className="text-cyan-300/70">{subjectTitle}</strong></span>
                  </div>

                  {/* Privacy note */}
                  <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-cyan-500/[0.04] border border-cyan-500/[0.10]">
                    <Eye className="w-3.5 h-3.5 text-cyan-400/60 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-cyan-300/55 leading-relaxed">
                      Only your grade range is shared — never your name, identity, or exact score. Data is per-subject and aggregated.
                    </p>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/[0.06] border border-red-500/[0.12] text-[10px] text-red-300/70">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {error}
                    </div>
                  )}

                  {/* Distribution */}
                  {loading ? (
                    <p className="text-[11px] themed-text/25 text-center py-4">Loading...</p>
                  ) : dist && dist.total > 0 ? (
                    <div className="space-y-2">
                      <p className="text-[9px] themed-text/25 uppercase tracking-wider">
                        {dist.total} student{dist.total !== 1 ? 's' : ''} compared for this subject
                      </p>
                      {RANGES.map(range => {
                        const count = (dist[range] as number) || 0;
                        const pct = dist.total > 0 ? (count / dist.total) * 100 : 0;
                        const isMe = range === myRange;
                        return (
                          <div key={range} className="space-y-1">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className={isMe ? 'font-semibold' : 'themed-text/35'} style={isMe ? { color: RANGE_COLORS[range] } : {}}>
                                {RANGE_LABELS[range]}{isMe ? ' ← you' : ''}
                              </span>
                              <span className="themed-text/25">{count} ({pct.toFixed(0)}%)</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.5, ease: 'easeOut' }}
                                className="h-full rounded-full"
                                style={{ backgroundColor: isMe ? RANGE_COLORS[range] : `${RANGE_COLORS[range]}40` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                      {dist.avg > 0 && (
                        <p className="text-[10px] themed-text/25 pt-1">
                          Class avg: <span className="font-semibold themed-text/50">{dist.avg.toFixed(1)}%</span>
                        </p>
                      )}
                    </div>
                  ) : !error ? (
                    <p className="text-[11px] themed-text/25 text-center py-2">
                      No one has shared for <strong className="themed-text/40">{subjectTitle}</strong> yet — be the first!
                    </p>
                  ) : null}

                  {/* Submit */}
                  {currentGrade !== null && currentGrade > 0 && (
                    <div className="space-y-1.5">
                      <button
                        onClick={submitGrade}
                        disabled={sharing || (alreadySubmitted && !rangeChanged && !submitted)}
                        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11px] font-medium transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                          submitted || (alreadySubmitted && !rangeChanged)
                            ? 'bg-emerald-500/10 text-emerald-400/60 border border-emerald-500/15'
                            : rangeChanged
                            ? 'bg-yellow-400/10 hover:bg-yellow-400/15 text-yellow-300/70 hover:text-yellow-300/90 border border-yellow-400/15'
                            : 'bg-cyan-500/10 hover:bg-cyan-500/15 text-cyan-300/70 hover:text-cyan-300/90 border border-cyan-500/15'
                        }`}
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        {sharing
                          ? 'Submitting...'
                          : submitted
                          ? 'Shared ✓'
                          : alreadySubmitted && !rangeChanged
                          ? 'Already shared ✓'
                          : rangeChanged
                          ? `Update range (${RANGE_LABELS[mySubmittedRange!]} → ${RANGE_LABELS[myRange!]})`
                          : `Share my range (${currentGrade.toFixed(0)}%)`}
                      </button>
                      {alreadySubmitted && !rangeChanged && !submitted && (
                        <p className="text-[9px] themed-text/20 text-center">
                          Your grade range is already in the pool for this subject.
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
