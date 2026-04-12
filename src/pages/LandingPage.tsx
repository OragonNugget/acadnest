import { motion } from 'framer-motion';
import {
  GraduationCap, Crown, ArrowRight, Zap, Shield, Target, TrendingUp, Wrench,
  Bot, BarChart3, Save, MessageSquare, Library, CheckCircle, Sparkles, LogOut
} from 'lucide-react';
import type { SupabaseUser } from '../lib/supabase';

interface Props {
  onEnterFree: () => void;
  onEnterPremium: () => void;
  user?: SupabaseUser | null;
  onSignOut?: () => void;
}

const features = [
  { icon: BarChart3, title: 'Grade Calculator', desc: 'Weighted averages, component tracking, entry management', free: true },
  { icon: Target, title: 'Target System', desc: 'Set goals, detect feasibility, track progress', free: false },
  { icon: Bot, title: 'AI Grade Coach', desc: 'Personalized coaching, weak point analysis, strategy picks', free: false },
  { icon: Zap, title: '5 Strategy Engines', desc: 'Weak Area Repair, High Impact, Survival, Optimal, Conservative', free: false },
  { icon: Save, title: 'Save & Load Grades', desc: 'Switch between subjects, snapshot your progress', free: false },
  { icon: Library, title: 'Template Library', desc: 'Pre-made grading systems from real courses', free: true },
  { icon: MessageSquare, title: 'Community Forum', desc: 'Tips, strategies & discussion from students', free: true },
  { icon: Shield, title: 'Scenario Simulator', desc: 'Test "what if" scores before they happen', free: false },
];

const strategies = [
  { icon: Wrench, name: 'Weak Area Repair', color: '#f97316', desc: 'Fix your lowest-performing components' },
  { icon: TrendingUp, name: 'High Impact', color: '#3b82f6', desc: 'Focus where weight × potential is highest' },
  { icon: Shield, name: 'Survival', color: '#ef4444', desc: 'Minimum effort to reach your target' },
  { icon: Target, name: 'Optimal', color: '#22c55e', desc: 'Balanced distribution across all areas' },
  { icon: Zap, name: 'Conservative', color: '#a855f7', desc: 'Safety buffer for peace of mind' },
];

export default function LandingPage({ onEnterFree, onEnterPremium, user, onSignOut }: Props) {
  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Student';
  const avatarUrl = user?.user_metadata?.avatar_url;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      {/* Ambient blurs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[15%] w-[500px] h-[500px] bg-amber-500/[0.04] rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] bg-orange-600/[0.03] rounded-full blur-[180px]" />
        <div className="absolute top-[40%] right-[30%] w-[300px] h-[300px] bg-cyan-500/[0.02] rounded-full blur-[120px]" />
      </div>

      {/* Header with user info */}
      <header className="relative z-10 max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/25">
            <GraduationCap className="w-5 h-5 text-[#0a0a0f]" />
          </div>
          <span className="text-lg font-bold tracking-tight">Trackademic</span>
        </div>
        {user && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className="w-7 h-7 rounded-full border border-white/10" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-[11px] font-bold text-amber-300">
                  {displayName[0]?.toUpperCase()}
                </div>
              )}
              <span className="text-[12px] text-white/40 hidden sm:block">{displayName}</span>
            </div>
            {onSignOut && (
              <button
                onClick={onSignOut}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-white/20 hover:text-white/40 hover:bg-white/[0.04] text-[11px] transition-colors cursor-pointer"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            )}
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-16 pb-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/[0.08] border border-amber-400/15 mb-8">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] text-amber-300/80 font-medium">
              {user ? `Welcome back, ${displayName}!` : 'Smart grade optimization for students'}
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.1] mb-6 tracking-tight">
            Know your grade.
            <br />
            <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-amber-500 bg-clip-text text-transparent">
              Own your strategy.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-white/35 max-w-2xl mx-auto mb-12 leading-relaxed">
            Calculate weighted grades, detect weak areas, and get AI-powered strategies
            to hit your target. Stop guessing — start forging.
          </p>

          {/* CTA Cards */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-stretch max-w-xl mx-auto">
            {/* Free card */}
            <motion.button
              onClick={onEnterFree}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 rounded-2xl bg-white/[0.03] border border-white/[0.08] p-6 text-left cursor-pointer transition-colors hover:bg-white/[0.05] hover:border-white/[0.12] group"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">Free</span>
                <span className="text-xl font-bold text-white/70">$0</span>
              </div>
              <ul className="space-y-2 mb-5">
                {['Grade calculator', 'Add components & entries', 'Delete components', 'View results', 'Browse forum', 'Browse templates'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-[11px] text-white/35">
                    <CheckCircle className="w-3 h-3 text-white/20 flex-shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-2 text-sm font-medium text-white/50 group-hover:text-white/70 transition-colors">
                Enter Free <ArrowRight className="w-4 h-4" />
              </div>
            </motion.button>

            {/* Premium card */}
            <motion.button
              onClick={onEnterPremium}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 rounded-2xl bg-gradient-to-br from-amber-400/[0.08] to-orange-500/[0.04] border border-amber-400/20 p-6 text-left cursor-pointer transition-colors hover:border-amber-400/35 group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400/[0.06] rounded-full blur-[40px]" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Crown className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-semibold text-amber-300/80 uppercase tracking-wider">Premium</span>
                  </div>
                  <span className="text-xl font-bold text-amber-300">Pro</span>
                </div>
                <ul className="space-y-2 mb-5">
                  {['Everything in Free', 'AI Grade Coach', '5 strategy engines', 'Target system', 'Save/load grades', 'Edit & toggle done', 'Scenario simulator', 'Save/load templates', 'Create forum posts', 'No ads'].map(f => (
                    <li key={f} className="flex items-center gap-2 text-[11px] text-amber-200/50">
                      <CheckCircle className="w-3 h-3 text-amber-400/50 flex-shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center gap-2 text-sm font-medium text-amber-300 group-hover:text-amber-200 transition-colors">
                  Enter Premium <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* Strategy showcase */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">5 Strategies. One Goal.</h2>
          <p className="text-sm text-white/30">Each one is mathematically grounded — no guesswork.</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {strategies.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-4 hover:border-white/[0.1] transition-colors"
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: `${s.color}15` }}>
                  <Icon className="w-4 h-4" style={{ color: s.color }} />
                </div>
                <h3 className="text-xs font-semibold text-white/70 mb-1">{s.name}</h3>
                <p className="text-[10px] text-white/25 leading-relaxed">{s.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Features grid */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Everything You Need</h2>
          <p className="text-sm text-white/30">Free gets you started. Premium gets you there.</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-4 hover:border-white/[0.1] transition-colors"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4 text-white/30" />
                  <h3 className="text-xs font-semibold text-white/60">{f.title}</h3>
                  {f.free ? (
                    <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-white/[0.06] text-white/30 ml-auto">Free</span>
                  ) : (
                    <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-amber-400/10 text-amber-400/60 ml-auto">Pro</span>
                  )}
                </div>
                <p className="text-[10px] text-white/20 leading-relaxed">{f.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative z-10 max-w-3xl mx-auto px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl bg-gradient-to-br from-amber-400/[0.06] to-orange-500/[0.03] border border-amber-400/15 p-10"
        >
          <h2 className="text-2xl font-bold mb-3">Ready to forge better grades?</h2>
          <p className="text-sm text-white/30 mb-8">Join thousands of students who stopped guessing and started strategizing.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={onEnterFree}
              className="px-6 py-3 rounded-xl bg-white/[0.06] border border-white/[0.1] text-sm font-medium text-white/60 hover:bg-white/[0.1] hover:text-white/80 transition-colors cursor-pointer"
            >
              Start Free
            </button>
            <button
              onClick={onEnterPremium}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400/25 to-orange-500/20 border border-amber-400/25 text-sm font-medium text-amber-300 hover:from-amber-400/35 hover:to-orange-500/30 transition-all cursor-pointer flex items-center gap-2 justify-center"
            >
              <Crown className="w-4 h-4" /> Go Premium
            </button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.04] py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <GraduationCap className="w-3 h-3 text-[#0a0a0f]" />
            </div>
            <span className="text-xs text-white/25">Trackademic</span>
          </div>
          <p className="text-[10px] text-white/15">Built for students, by students.</p>
        </div>
      </footer>
    </div>
  );
}
