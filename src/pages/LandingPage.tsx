import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap, Crown, ArrowRight, Zap, Shield, Target, TrendingUp, Wrench,
  Bot, BarChart3, Save, MessageSquare, Library, CheckCircle, Sparkles,
} from 'lucide-react';
import { PREMIUM_PRICE, PREMIUM_PRICE_PERIOD } from './PaymentPage';

interface Props {
  onEnterFree: () => void;
  onGoToPayment: () => void;
}


const features = [
  { icon: BarChart3, title: 'Grade Calculator', desc: 'Weighted averages, component tracking, entry management', free: true },
  { icon: Target, title: 'Target System', desc: 'Set goals, detect feasibility, track progress', free: false },
  { icon: Bot, title: 'AI Grade Coach', desc: 'Personalized coaching, weak point analysis, strategy picks', free: false },
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
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden font-sans">
      {/* Ambient blurs */}
      <div className="fixed inset-0 pointer-events-none z-[-1]">
        <div className="absolute top-[-10%] left-[15%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[180px]" />
        <div className="absolute top-[40%] right-[30%] w-[300px] h-[300px] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <GraduationCap className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-black tracking-tight text-foreground">AcadNest</span>
        </div>
        <button
          onClick={() => setShowLogin(true)}
          className="flex items-center gap-1.5 text-xs font-bold text-muted hover:text-foreground cursor-pointer transition-colors px-3 py-1.5 rounded bg-surface border border-border shadow-sm"
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
                className="w-full max-w-sm rounded-2xl bg-background border border-border p-8 shadow-2xl pointer-events-auto relative"
                onClick={e => e.stopPropagation()}
              >
                <button
                  onClick={() => setShowLogin(false)}
                  className="absolute top-4 right-4 text-muted hover:text-foreground cursor-pointer text-xs transition-colors p-1"
                >✕</button>

                <div className="flex items-center gap-4 mb-8 border-b border-border pb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-sm">
                    <GraduationCap className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-foreground">Welcome back</h2>
                    <p className="text-xs font-semibold text-muted">Sign in to your nest</p>
                  </div>
                </div>

                <button
                  onClick={() => { setShowLogin(false); onEnterFree(); }}
                  className="w-full py-3 rounded-lg bg-surface border border-border text-sm font-bold text-foreground hover:bg-surface-hover hover:border-border-hover transition-colors cursor-pointer flex items-center justify-center gap-3 shadow-sm"
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
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-20 pb-28 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-8 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-[11px] text-primary font-bold uppercase tracking-wider">Your personal grade strategy hub</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black leading-[1.05] mb-6 tracking-tighter">
            Know your grade.
            <br />
            <span className="text-primary drop-shadow-md">
              Own your strategy.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-muted max-w-2xl mx-auto mb-14 leading-relaxed font-medium">
            Calculate weighted grades, detect weak areas, and get AI-powered strategies
            to hit your target. Stop guessing — start forging.
          </p>

          {/* CTA Cards */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-stretch max-w-2xl mx-auto">
            {/* Free card */}
            <motion.button
              onClick={onEnterFree}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 rounded-2xl bg-surface border border-border p-8 text-left cursor-pointer transition-colors hover:border-primary/50 group shadow-sm flex flex-col"
            >
              <div className="flex items-center justify-between mb-6 border-b border-border pb-4">
                <span className="text-xs font-bold text-muted uppercase tracking-widest">Free</span>
                <span className="text-2xl font-black text-foreground">₱0</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {['Grade calculator', 'Add components & entries', 'View results', 'Browse & read forum posts', 'Browse template library'].map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-xs text-muted font-medium">
                    <CheckCircle className="w-3.5 h-3.5 text-primary flex-shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-2 text-sm font-bold text-foreground group-hover:text-primary transition-colors mt-auto">
                Enter Free <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </motion.button>

            {/* Premium card */}
            <motion.button
              onClick={onGoToPayment}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 rounded-2xl bg-accent/5 border-2 border-accent/20 p-8 text-left cursor-pointer transition-all hover:border-accent/40 hover:bg-accent/10 group relative overflow-hidden flex flex-col shadow-md shadow-accent/5"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-[50px] pointer-events-none" />
              <div className="relative flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-6 border-b border-accent/20 pb-4">
                  <div className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-accent" />
                    <span className="text-xs font-bold text-accent uppercase tracking-widest">Premium</span>
                  </div>
                  {/* Edit price in PaymentPage.tsx → PREMIUM_PRICE / PREMIUM_PRICE_PERIOD */}
                  <div className="text-right">
                    <span className="text-2xl font-black text-foreground">{PREMIUM_PRICE}</span>
                    <span className="text-[10px] font-bold text-muted ml-1 uppercase tracking-wider">{PREMIUM_PRICE_PERIOD}</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {['Everything in Free', 'GWA Calculator', 'Full Template Library (share & apply)', 'Post in Community Forum', 'AI Grade Coach', '5 strategy engines', 'Target system', 'Save/load grades', 'Scenario simulator', 'No ads'].map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-xs text-foreground font-medium">
                      <CheckCircle className="w-3.5 h-3.5 text-accent flex-shrink-0 mt-0.5" />{f}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center gap-2 text-sm font-bold text-accent group-hover:text-accent-foreground transition-colors mt-auto">
                  Get Premium <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* Strategy showcase */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-black mb-4 tracking-tight">5 Strategies. One Nest.</h2>
          <p className="text-sm font-medium text-muted">Mathematically grounded — no guesswork, no surprises.</p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {strategies.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div key={s.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="rounded-2xl bg-surface border border-border p-6 hover:border-border-hover transition-colors shadow-sm flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 border border-border/50 shadow-sm" style={{ backgroundColor: `${s.color}10`, borderColor: `${s.color}20` }}>
                  <Icon className="w-5 h-5" style={{ color: s.color }} />
                </div>
                <h3 className="text-sm font-bold text-foreground mb-2">{s.name}</h3>
                <p className="text-[11px] font-medium text-muted leading-relaxed">{s.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Features grid */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-black mb-4 tracking-tight">Everything in One Place</h2>
          <p className="text-sm font-medium text-muted">Free gets you settled. Premium makes it home.</p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div key={f.title} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="rounded-2xl bg-surface border border-border p-6 hover:border-primary/30 transition-colors shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-background border border-border rounded-lg shadow-sm">
                    <Icon className="w-4 h-4 text-foreground/70" />
                  </div>
                  <h3 className="text-xs font-bold text-foreground">{f.title}</h3>
                  {f.free
                    ? <span className="text-[9px] font-bold px-2 py-0.5 rounded-sm bg-background border border-border text-muted uppercase tracking-wider ml-auto">Free</span>
                    : <span className="text-[9px] font-bold px-2 py-0.5 rounded-sm bg-accent/10 border border-accent/20 text-accent uppercase tracking-wider ml-auto">Pro</span>
                  }
                </div>
                <p className="text-xs font-medium text-muted leading-relaxed">{f.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative z-10 max-w-3xl mx-auto px-6 py-24 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="rounded-3xl bg-surface border-2 border-border p-12 shadow-lg shadow-black/5">
          <h2 className="text-3xl font-black mb-4 tracking-tight">Ready to build your nest?</h2>
          <p className="text-sm font-medium text-muted mb-10">Join students who stopped guessing and started owning their grades.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={onEnterFree} className="px-8 py-3.5 rounded-xl bg-background border border-border text-sm font-bold text-foreground hover:bg-surface-hover transition-colors cursor-pointer shadow-sm">
              Start Free
            </button>
            <button onClick={onGoToPayment} className="px-8 py-3.5 rounded-xl bg-accent text-accent-foreground border border-accent/20 text-sm font-bold hover:brightness-110 transition-all cursor-pointer flex items-center gap-2 justify-center shadow-md">
              <Crown className="w-4 h-4" /> Go Premium
            </button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-10 bg-background text-center">
        <div className="max-w-6xl mx-auto px-6 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 opacity-80">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
              <GraduationCap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-black tracking-tight text-foreground">AcadNest</span>
          </div>
          <p className="text-xs font-semibold text-muted uppercase tracking-widest">Crafted for students, by students.</p>
        </div>
      </footer>
    </div>
  );
}
