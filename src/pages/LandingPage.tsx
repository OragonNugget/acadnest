import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Crown, ArrowRight, Zap, Shield, Target, TrendingUp, Wrench,
  Bot, BarChart3, Save, MessageSquare, Library, CheckCircle, Sparkles,
} from 'lucide-react';
import { PREMIUM_PRICE, PREMIUM_PRICE_PERIOD } from './PaymentPage';
import BrandLogo from '../components/BrandLogo';

interface Props {
  onEnterFree: () => void;
  onGoToPayment: () => void;
}


const features = [
  { icon: BarChart3, title: 'Grade Calculator', desc: 'Weighted averages, component tracking, entry management', free: true },
  { icon: Target, title: 'Target System', desc: 'Set goals, detect feasibility, track progress', free: false },
  { icon: Bot, title: 'Grade Coach', desc: 'Personalized coaching, weak point analysis, strategy picks', free: false },
  { icon: Zap, title: '5 Strategy Engines', desc: 'Weak Area Repair, High Impact, Survival, Optimal, Conservative', free: false },
  { icon: Save, title: 'Save & Load Grades', desc: 'Switch between subjects, snapshot your progress', free: false },
  { icon: Library, title: 'Template Library', desc: 'Pre-made grading systems from real courses', free: false },
  { icon: MessageSquare, title: 'Community Forum', desc: 'Read free, post with Premium', free: false },
  { icon: Shield, title: 'Scenario Simulator', desc: 'Test "what if" scores before they happen', free: false },
];

const strategies = [
  { icon: Wrench, name: 'Weak Area Repair', color: '#f97316', desc: 'Fix your lowest-performing components' },
  { icon: TrendingUp, name: 'High Impact', color: '#3b82f6', desc: 'Focus where weight × potential is highest' },
  { icon: Shield, name: 'Survival', color: '#ef4444', desc: 'Minimum effort to reach your target' },
  { icon: Target, name: 'Optimal', color: '#22c55e', desc: 'Balanced distribution across all areas' },
  { icon: Zap, name: 'Conservative', color: '#a855f7', desc: 'Safety buffer for peace of mind' },
];

export default function LandingPage({ onEnterFree, onGoToPayment }: Props) {
  const [showLogin, setShowLogin] = useState(false);


  return (
    <div className="min-h-screen themed-bg themed-text overflow-x-hidden">
      {/* Ambient blurs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[15%] w-[500px] h-[500px] bg-yellow-400/[0.04] rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] bg-yellow-300/[0.03] rounded-full blur-[180px]" />
        <div className="absolute top-[40%] right-[30%] w-[300px] h-[300px] bg-cyan-500/[0.02] rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center shadow-lg shadow-yellow-300/25">
            <BrandLogo className="w-10 h-10" />
          </div>
          <span className="text-lg font-bold tracking-tight">AcadNest</span>
        </div>
        <button
          onClick={() => setShowLogin(true)}
          className="flex items-center gap-1.5 text-[11px] themed-text/30 hover:themed-text/60 cursor-pointer transition-colors"
        >
          Have an account? Log in
        </button>
      </header>

      {/* Login modal */}
      <AnimatePresence>
        {showLogin && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
              onClick={() => setShowLogin(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center px-4 pointer-events-none"
            >
              <div
                className="w-full max-w-sm rounded-2xl themed-bg-sec border themed-border-subtle p-7 shadow-2xl shadow-black/60 pointer-events-auto relative"
                onClick={e => e.stopPropagation()}
              >
                <button
                  onClick={() => setShowLogin(false)}
                  className="absolute top-4 right-4 themed-text/20 hover:themed-text/50 cursor-pointer text-xs"
                >✕</button>

                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg shadow-yellow-300/20">
                    <BrandLogo className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold themed-text">Welcome back</h2>
                    <p className="text-[10px] themed-text/30">Sign in to your nest</p>
                  </div>
                </div>

                <button
                  onClick={() => { setShowLogin(false); onEnterFree(); }}
                  className="w-full py-2.5 rounded-lg themed-surface-raised border themed-border-subtle text-sm font-medium themed-text/80 hover:themed-surface-raised transition-colors cursor-pointer flex items-center justify-center gap-2.5"
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                    <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
                    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Hero */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-16 pb-24 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-300/[0.08] border border-yellow-300/15 mb-8">
            <Sparkles className="w-3.5 h-3.5 themed-accent" />
            <span className="text-[11px] themed-accent-soft/80 font-medium">Your personal grade strategy hub</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.1] mb-6 tracking-tight">
            Know your grade.
            <br />
            <span className="dark-gradient-text light-gradient-text bg-clip-text text-transparent">
              Own your strategy.
            </span>
          </h1>

          <p className="text-base sm:text-lg themed-text/35 max-w-2xl mx-auto mb-12 leading-relaxed">
            Calculate weighted grades, detect weak areas, and get the best grade strategies
            to hit your target. Stop guessing — start forging.
          </p>

          {/* CTA Cards */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-stretch max-w-xl mx-auto">
            {/* Free card */}
            <motion.button
              onClick={onEnterFree}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 rounded-2xl themed-surface border themed-border-subtle p-6 text-left cursor-pointer transition-colors hover:themed-surface-h hover:themed-border-subtle group"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold themed-text/50 uppercase tracking-wider">Free</span>
                <span className="text-xl font-bold themed-text/70">₱0</span>
              </div>
              <ul className="space-y-2 mb-5">
                {['Grade calculator', 'Add components & entries', 'View results', 'Browse & read forum posts', 'Browse template library'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-[11px] themed-text/35">
                    <CheckCircle className="w-3 h-3 themed-text/20 flex-shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-2 text-sm font-medium themed-text/50 group-hover:themed-text/70 transition-colors">
                Enter Free <ArrowRight className="w-4 h-4" />
              </div>
            </motion.button>

            {/* Premium card */}
            <motion.button
              onClick={onGoToPayment}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 rounded-2xl bg-gradient-to-br from-yellow-300/[0.08] to-yellow-200/[0.04] border border-yellow-300/20 p-6 text-left cursor-pointer transition-colors hover:border-yellow-300/35 group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-300/[0.06] rounded-full blur-[40px]" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 themed-accent" />
                    <span className="text-xs font-semibold themed-accent-soft/80 uppercase tracking-wider">Premium</span>
                  </div>
                  {/* Edit price in PaymentPage.tsx → PREMIUM_PRICE / PREMIUM_PRICE_PERIOD */}
                  <div className="text-right">
                    <span className="text-xl font-bold themed-accent-soft">{PREMIUM_PRICE}</span>
                    <span className="text-[10px] themed-accent-soft/40 ml-1">{PREMIUM_PRICE_PERIOD}</span>
                  </div>
                </div>
                <ul className="space-y-2 mb-5">
                  {['Everything in Free', 'GWA Calculator', 'Full Template Library (share & apply)', 'Post in Community Forum', 'Grade Coach', '5 strategy engines', 'Target system', 'Save/load grades', 'Scenario simulator', 'No ads'].map(f => (
                    <li key={f} className="flex items-center gap-2 text-[11px] themed-accent-soft">
                      <CheckCircle className="w-3 h-3 themed-accent flex-shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center gap-2 text-sm font-medium themed-accent-soft group-hover:text-yellow-100 transition-colors">
                  Get Premium <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* Strategy showcase */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">5 Strategies. One Nest.</h2>
          <p className="text-sm themed-text/30">Mathematically grounded — no guesswork, no surprises.</p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {strategies.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div key={s.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="rounded-xl themed-surface border themed-border p-4 hover:themed-border-subtle transition-colors">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: `${s.color}15` }}>
                  <Icon className="w-4 h-4" style={{ color: s.color }} />
                </div>
                <h3 className="text-xs font-semibold themed-text/70 mb-1">{s.name}</h3>
                <p className="text-[10px] themed-text/25 leading-relaxed">{s.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Features grid */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Everything in One Place</h2>
          <p className="text-sm themed-text/30">Free gets you settled. Premium makes it home.</p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div key={f.title} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="rounded-xl themed-surface border themed-border p-4 hover:themed-border-subtle transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4 themed-text/30" />
                  <h3 className="text-xs font-semibold themed-text/60">{f.title}</h3>
                  {f.free
                    ? <span className="text-[8px] px-1.5 py-0.5 rounded-full themed-surface-raised themed-text/30 ml-auto">Free</span>
                    : <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-yellow-300/10 themed-accent/60 ml-auto">Pro</span>
                  }
                </div>
                <p className="text-[10px] themed-text-subtle leading-relaxed">{f.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative z-10 max-w-3xl mx-auto px-6 py-20 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-2xl bg-gradient-to-br from-yellow-300/[0.06] to-yellow-200/[0.03] border border-yellow-300/15 p-10">
          <h2 className="text-2xl font-bold mb-3">Ready to build your nest?</h2>
          <p className="text-sm themed-text/30 mb-8">Join students who stopped guessing and started owning their grades.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={onEnterFree} className="px-6 py-3 rounded-xl themed-surface-raised border themed-border-subtle text-sm font-medium themed-text/60 hover:themed-surface-raised hover:themed-text/80 transition-colors cursor-pointer">
              Start Free
            </button>
            <button onClick={onGoToPayment} className="px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-300/25 to-yellow-200/20 border border-yellow-300/25 text-sm font-medium themed-accent-soft hover:from-yellow-300/35 hover:to-yellow-200/30 transition-all cursor-pointer flex items-center gap-2 justify-center">
              <Crown className="w-4 h-4" /> Go Premium
            </button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t themed-border py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center shadow-lg shadow-yellow-300/20">
              <BrandLogo className="w-6 h-6" />
            </div>
            <span className="text-xs themed-text/25">AcadNest</span>
          </div>
          <p className="text-[10px] themed-text/15">Crafted for students, by students.</p>
        </div>
      </footer>
    </div>
  );
}
