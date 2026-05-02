import { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, ArrowLeft, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface Props {
  onBack: () => void;
  onCancelled: () => void;
}

const lostPerks = [
  'Grade Coach & personalized weekly strategy',
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
    <div className="min-h-screen themed-bg themed-text flex flex-col items-center justify-center px-4 py-16">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[15%] w-[500px] h-[500px] bg-red-500/[0.03] rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] bg-yellow-300/[0.02] rounded-full blur-[180px]" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 themed-text/30 hover:themed-text/60 text-sm mb-8 cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Keep my Premium
        </button>

        {!confirming ? (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rounded-2xl themed-bg-sec border themed-border-subtle p-8"
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-300 to-yellow-200 flex items-center justify-center shadow-lg shadow-yellow-300/25">
                <Crown className="w-5 h-5 text-[#0a0a0f]" />
              </div>
              <div>
                <h1 className="text-base font-bold themed-text">Before you leave your nest…</h1>
                <p className="text-[11px] themed-text/30">We'd genuinely hate to see you go.</p>
              </div>
            </div>

            <p className="text-sm themed-text/50 leading-relaxed mb-6">
              Cancelling your Premium subscription means losing access to everything that makes
              Acadnest worth using. Here's what you'd be giving up:
            </p>

            <ul className="space-y-2.5 mb-8">
              {lostPerks.map(perk => (
                <li key={perk} className="flex items-start gap-2.5 text-[12px] themed-text/40">
                  <CheckCircle className="w-3.5 h-3.5 themed-accent/40 flex-shrink-0 mt-0.5" />
                  {perk}
                </li>
              ))}
            </ul>

            <div className="rounded-xl bg-yellow-400/[0.06] border border-yellow-300/15 px-4 py-3 mb-6">
              <p className="text-[11px] themed-accent-soft/60 leading-relaxed">
                Your data and saved grades will remain intact — but you won't be able to access
                them until you resubscribe.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onBack}
                className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-yellow-300/20 to-yellow-200/15 border border-yellow-300/25 text-sm font-semibold themed-accent-soft hover:from-yellow-300/30 hover:to-yellow-200/25 transition-all cursor-pointer"
              >
                Keep Premium
              </button>
              <button
                onClick={() => setConfirming(true)}
                className="px-4 py-2.5 rounded-lg themed-surface border themed-border text-[11px] themed-text/25 hover:themed-text/40 hover:themed-surface-raised transition-all cursor-pointer"
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
            className="rounded-2xl themed-bg-sec border border-red-500/20 p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-red-500/15 border border-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-400/70" />
              </div>
              <div>
                <h1 className="text-base font-bold themed-text">Are you certain?</h1>
                <p className="text-[11px] themed-text/30">This will revert your account to the free tier.</p>
              </div>
            </div>

            <p className="text-sm themed-text/40 leading-relaxed mb-8">
              Your Premium access will be removed immediately upon confirmation.
              You can always resubscribe — but your streak ends here.
            </p>

            {error && (
              <p className="text-[11px] text-red-400/80 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-4">
                {error}
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={onBack}
                className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-yellow-300/20 to-yellow-200/15 border border-yellow-300/25 text-sm font-semibold themed-accent-soft hover:from-yellow-300/30 transition-all cursor-pointer"
              >
                Actually, keep it
              </button>
              <button
                onClick={handleCancel}
                disabled={loading}
                className="px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-[11px] text-red-400/60 hover:text-red-400/80 hover:bg-red-500/15 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                {loading ? <><Loader2 className="w-3 h-3 animate-spin" /> Processing…</> : 'Yes, cancel'}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
