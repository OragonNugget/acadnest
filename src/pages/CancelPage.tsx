import { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, ArrowLeft, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface Props {
  onBack: () => void;
  onCancelled: () => void;
}

const lostPerks = [
  'AI Grade Coach & personalized weekly strategy',
  '5 mathematical strategy engines',
  'Target system with feasibility detection',
  'Save & load grades across subjects',
  'Scenario simulator — test scores before they happen',
  'Ad-free experience',
];

export default function CancelPage({ onBack, onCancelled }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCancel = async () => {
    setLoading(true);
    setError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ is_premium: false }),
      });
      if (!res.ok) throw new Error('Failed to update subscription');
      onCancelled();
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-4 py-16 font-sans">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none z-[-1]">
        <div className="absolute top-[-10%] left-[15%] w-[500px] h-[500px] bg-destructive/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] bg-destructive/10 rounded-full blur-[180px]" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-muted hover:text-foreground text-sm font-medium mb-8 cursor-pointer transition-colors shadow-sm px-3 py-1.5 rounded-md bg-surface border border-border w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Keep my Premium
        </button>

        {!confirming ? (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rounded-3xl bg-surface border border-border p-10 shadow-lg shadow-black/5"
          >
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center shadow-md shadow-accent/20">
                <Crown className="w-6 h-6 text-accent-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-black text-foreground">Before you leave your nest…</h1>
                <p className="text-xs font-semibold text-muted uppercase tracking-wider mt-0.5">We'd genuinely hate to see you go.</p>
              </div>
            </div>

            <p className="text-sm font-medium text-foreground/80 leading-relaxed mb-8">
              Cancelling your Premium subscription means losing access to everything that makes
              Acadnest worth using. Here's what you'd be giving up:
            </p>

            <ul className="space-y-3 mb-8">
              {lostPerks.map(perk => (
                <li key={perk} className="flex items-start gap-3 text-sm font-medium text-foreground">
                  <CheckCircle className="w-4 h-4 text-accent/50 flex-shrink-0 mt-0.5" />
                  {perk}
                </li>
              ))}
            </ul>

            <div className="rounded-xl bg-accent/5 border border-accent/20 px-5 py-4 mb-8 shadow-sm">
              <p className="text-xs font-semibold text-accent leading-relaxed">
                Your data and saved grades will remain intact — but you won't be able to access
                them until you resubscribe.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onBack}
                className="flex-1 py-3 rounded-lg bg-accent border border-accent/20 text-sm font-bold text-accent-foreground hover:brightness-110 transition-all cursor-pointer shadow-sm text-center"
              >
                Keep Premium
              </button>
              <button
                onClick={() => setConfirming(true)}
                className="flex-1 py-3 rounded-lg bg-background border border-border text-xs font-bold text-muted hover:text-foreground hover:bg-surface-hover transition-all cursor-pointer shadow-sm"
              >
                Cancel anyway
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rounded-3xl bg-surface border-2 border-destructive/20 p-10 shadow-lg shadow-black/5"
          >
            <div className="flex items-center gap-4 mb-8 border-b border-border pb-6">
              <div className="w-12 h-12 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <h1 className="text-xl font-black text-foreground">Are you certain?</h1>
                <p className="text-xs font-semibold text-muted uppercase tracking-wider mt-0.5">This will revert your account to the free tier.</p>
              </div>
            </div>

            <p className="text-sm font-medium text-foreground/80 leading-relaxed mb-8">
              Your Premium access will be removed immediately upon confirmation.
              You can always resubscribe — but your streak ends here.
            </p>

            {error && (
              <p className="text-xs font-semibold text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3 mb-6">
                {error}
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onBack}
                className="flex-1 py-3 rounded-lg bg-accent border border-accent/20 text-sm font-bold text-accent-foreground hover:brightness-110 transition-all cursor-pointer shadow-sm text-center"
              >
                Actually, keep it
              </button>
              <button
                onClick={handleCancel}
                disabled={loading}
                className="flex-[0.5] py-3 rounded-lg bg-destructive/10 border border-destructive/20 text-xs font-bold text-destructive hover:bg-destructive/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
              >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</> : 'Yes, cancel'}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
