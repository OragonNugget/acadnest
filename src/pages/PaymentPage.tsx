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
  'AI Grade Coach — personalized weekly strategy',
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
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden flex flex-col items-center justify-center px-4 py-16 font-sans">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none z-[-1]">
        <div className="absolute top-[-10%] left-[15%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[180px]" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-muted hover:text-foreground text-sm font-medium mb-8 cursor-pointer transition-colors shadow-sm px-3 py-1.5 rounded-md bg-surface border border-border w-fit"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl bg-surface border-2 border-accent/20 p-10 shadow-lg shadow-black/5 relative overflow-hidden flex flex-col"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-[50px] pointer-events-none" />
          <div className="relative">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center shadow-md shadow-accent/20">
                <Crown className="w-6 h-6 text-accent-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-foreground">Acadnest Premium</h1>
                <p className="text-xs font-semibold text-muted uppercase tracking-wider mt-0.5">Unlock everything. Forge better grades.</p>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-end gap-2 mb-8 border-b border-border pb-6">
              <span className="text-5xl font-black text-foreground">{PREMIUM_PRICE}</span>
              <span className="text-sm font-bold text-muted mb-1.5 uppercase tracking-wider">{PREMIUM_PRICE_PERIOD}</span>
            </div>

          {/* Features */}
          <ul className="space-y-3 mb-10 flex-1">
            {premiumFeatures.map(f => (
              <li key={f} className="flex items-start gap-3 text-sm font-medium text-foreground">
                <CheckCircle className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                {f}
              </li>
            ))}
          </ul>

          {/* Payment placeholder */}
          <div className="rounded-2xl border border-dashed border-border bg-background p-8 text-center mb-6 shadow-sm">
            <Lock className="w-8 h-8 text-muted/50 mx-auto mb-4" />
            <p className="text-base font-bold text-foreground mb-2">Payment coming soon</p>
            <p className="text-xs font-medium text-muted leading-relaxed">
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
          </div>
          <p className="text-[11px] font-bold text-muted text-center uppercase tracking-widest">{PREMIUM_PRICE_NOTE}</p>
        </motion.div>

        <p className="text-center text-xs font-semibold text-muted mt-8">
          Questions? Reach us at{' '}
          {/* EDIT: replace with your support email */}
          <span className="text-foreground hover:underline cursor-pointer">support@acadnest.app</span>
        </p>
      </div>
    </div>
  );
}
