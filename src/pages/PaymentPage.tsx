import { motion } from 'framer-motion';
import { Crown, ArrowLeft, CheckCircle, Lock } from 'lucide-react';

// ─────────────────────────────────────────────
// EDIT PRICING HERE
// ─────────────────────────────────────────────
export const PREMIUM_PRICE = '₱99'; // e.g. '$4.99' or '₱99'
export const PREMIUM_PRICE_PERIOD = '/ month';
export const PREMIUM_PRICE_NOTE = 'Billed monthly. Cancel anytime.';
// ─────────────────────────────────────────────

const premiumFeatures = [
  'Grade Coach — personalized weekly strategy',
  '5 mathematical strategy engines',
  'Target system with feasibility detection',
  'Save & load grades across subjects',
  'Scenario simulator — test scores before they happen',
  'Edit & toggle components as done',
  'GWA Calculator — track your semester GPA',
  'Full access to template library',
  'Post & participate in community forum',
  'No ads',
];
interface Props {
  onBack: () => void;
}

export default function PaymentPage({ onBack }: Props) {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden flex flex-col items-center justify-center px-4 py-16">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[15%] w-[500px] h-[500px] bg-rose-400/[0.04] rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] bg-pink-500/[0.03] rounded-full blur-[180px]" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-white/30 hover:text-white/60 text-sm mb-8 cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl bg-gradient-to-br from-rose-300/[0.07] to-pink-400/[0.03] border border-rose-300/20 p-8"
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-300 to-pink-400 flex items-center justify-center shadow-lg shadow-rose-400/25">
              <Crown className="w-5 h-5 text-[#0a0a0f]" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Acadnest Premium</h1>
              <p className="text-[11px] text-white/35">Unlock everything. Forge better grades.</p>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-end gap-2 mb-6">
            <span className="text-4xl font-extrabold text-rose-200">{PREMIUM_PRICE}</span>
            <span className="text-sm text-white/35 mb-1">{PREMIUM_PRICE_PERIOD}</span>
          </div>

          {/* Features */}
          <ul className="space-y-2.5 mb-8">
            {premiumFeatures.map(f => (
              <li key={f} className="flex items-start gap-2.5 text-[12px] text-rose-50/50">
                <CheckCircle className="w-3.5 h-3.5 text-rose-300/60 flex-shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>

          {/* Payment placeholder */}
          <div className="rounded-xl border border-dashed border-white/[0.1] bg-white/[0.02] p-6 text-center mb-6">
            <Lock className="w-6 h-6 text-white/15 mx-auto mb-3" />
            <p className="text-sm font-semibold text-white/30 mb-1">Payment coming soon</p>
            <p className="text-[11px] text-white/20 leading-relaxed">
              We're setting up secure payment processing.<br />
              Check back shortly — this will connect to your preferred payment gateway.
            </p>

            {/* ─────────────────────────────────────────────────────────────────
                PAYMENT INTEGRATION GOES HERE
                Replace the placeholder above with your payment form/button.
                Recommended: Stripe Checkout, PayMongo, or Paddle.

                After successful payment, call your API to set is_premium = true
                for the user, then redirect them back to the app.

                Example Stripe flow:
                1. POST /api/create-checkout-session  → returns { url }
                2. window.location.href = url
                3. Stripe redirects back to ?session_id=...
                4. Your webhook sets is_premium = true in Supabase
            ───────────────────────────────────────────────────────────────── */}
          </div>

          <p className="text-[10px] text-white/20 text-center">{PREMIUM_PRICE_NOTE}</p>
        </motion.div>

        <p className="text-center text-[10px] text-white/15 mt-6">
          Questions? Reach us at{' '}
          {/* EDIT: replace with your support email */}
          <span className="text-white/25">support@acadnest.app</span>
        </p>
      </div>
    </div>
  );
}
