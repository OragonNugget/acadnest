import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useState } from 'react';

interface Props {
  variant: 'top' | 'sidebar' | 'inline';
  isPremium: boolean;
}

const ads = {
  top: [
    { text: '📚 StudyPro — AI-powered flashcards for any subject', sub: 'Try free for 14 days', color: 'from-blue-600/20 to-indigo-600/10', borderColor: 'border-blue-500/15' },
    { text: '🎓 CourseHero — Get 24/7 homework help from tutors', sub: 'First month 50% off', color: 'from-orange-600/20 to-red-600/10', borderColor: 'border-orange-500/15' },
  ],
  sidebar: [
    { text: '☕ FocusBean — Pomodoro timer built for students', sub: 'Free download', color: 'from-emerald-600/15 to-teal-600/8', borderColor: 'border-emerald-500/12' },
    { text: '📝 NotionForStudents — Organize your entire semester', sub: 'Student discount available', color: 'from-purple-600/15 to-pink-600/8', borderColor: 'border-purple-500/12' },
    { text: '🧠 Anki Pro — Spaced repetition that actually works', sub: 'Join 2M+ students', color: 'from-cyan-600/15 to-blue-600/8', borderColor: 'border-cyan-500/12' },
  ],
  inline: [
    { text: '🚀 Acadnest Premium — Remove ads, unlock Grade Coach & strategies', sub: 'Upgrade now', color: 'from-amber-500/15 to-orange-500/8', borderColor: 'border-amber-500/15' },
  ],
};

export default function AdBanner({ variant, isPremium }: Props) {
  const [dismissed, setDismissed] = useState(false);

  if (isPremium || dismissed) return null;

  const pool = ads[variant];
  const ad = pool[Math.floor(Date.now() / 60000) % pool.length]; // rotates every minute

  if (variant === 'top') {
    return (
      <div className={`relative bg-gradient-to-r ${ad.color} border-b ${ad.borderColor}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-center gap-3">
          <p className="text-[11px] text-white/50">
            <span className="font-medium text-white/60">{ad.text}</span>
            <span className="text-white/30 ml-2">· {ad.sub}</span>
          </p>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.06] text-white/25 uppercase tracking-wider">Ad</span>
          <button
            onClick={() => setDismissed(true)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/15 hover:text-white/30 cursor-pointer"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  if (variant === 'sidebar') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`rounded-xl bg-gradient-to-br ${ad.color} border ${ad.borderColor} p-4 relative`}
      >
        <button
          onClick={() => setDismissed(true)}
          className="absolute top-2 right-2 text-white/15 hover:text-white/30 cursor-pointer"
        >
          <X className="w-3 h-3" />
        </button>
        <p className="text-[11px] text-white/50 font-medium mb-1">{ad.text}</p>
        <p className="text-[10px] text-white/25">{ad.sub}</p>
        <span className="text-[8px] px-1 py-0.5 rounded bg-white/[0.04] text-white/15 uppercase tracking-wider mt-2 inline-block">Sponsored</span>
      </motion.div>
    );
  }

  // inline
  return (
    <div className={`rounded-lg bg-gradient-to-r ${ad.color} border ${ad.borderColor} px-4 py-2.5 flex items-center justify-between`}>
      <div>
        <p className="text-[11px] text-white/50 font-medium">{ad.text}</p>
        <p className="text-[10px] text-white/25">{ad.sub}</p>
      </div>
      <span className="text-[8px] px-1 py-0.5 rounded bg-white/[0.04] text-white/15 uppercase tracking-wider flex-shrink-0">Ad</span>
    </div>
  );
}
