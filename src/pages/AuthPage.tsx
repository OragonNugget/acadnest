import { useState } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Chrome, Loader2, Sparkles, Shield, BarChart3, Bot } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Props {
  onAuthSuccess: () => void;
}

export default function AuthPage({ onAuthSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      if (error) throw error;
      // onAuthSuccess will be called after redirect + session restore in App.tsx
    } catch (err: any) {
      setError(err.message || 'Sign-in failed. Please try again.');
      setLoading(false);
    }
  };

  const highlights = [
    { icon: BarChart3, text: 'Weighted grade calculator' },
    { icon: Bot, text: 'AI-powered coaching' },
    { icon: Shield, text: 'Your data, private & secure' },
    { icon: Sparkles, text: 'Strategy engines & predictions' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col items-center justify-center px-4 overflow-hidden">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] bg-amber-500/[0.05] rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[600px] h-[600px] bg-orange-600/[0.04] rounded-full blur-[180px]" />
        <div className="absolute top-[40%] right-[30%] w-[300px] h-[300px] bg-cyan-500/[0.02] rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-2xl shadow-amber-500/30 mb-4">
            <GraduationCap className="w-8 h-8 text-[#0a0a0f]" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-1">Trackademic</h1>
          <p className="text-sm text-white/35">Plan Smarter · Score Better</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-8">
          <h2 className="text-xl font-bold mb-1 text-center">Welcome back</h2>
          <p className="text-sm text-white/35 text-center mb-8">
            Sign in to access your grades, strategies, and more.
          </p>

          {/* Feature highlights */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            {highlights.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-[11px] text-white/30">
                <Icon className="w-3.5 h-3.5 text-amber-400/50 flex-shrink-0" />
                {text}
              </div>
            ))}
          </div>

          {/* Google sign-in button */}
          <motion.button
            onClick={handleGoogleSignIn}
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl bg-white text-gray-800 font-semibold text-sm hover:bg-gray-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-black/30"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
            ) : (
              <Chrome className="w-5 h-5 text-[#4285F4]" />
            )}
            {loading ? 'Signing in…' : 'Continue with Google'}
          </motion.button>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 text-center text-[12px] text-red-400/80"
            >
              {error}
            </motion.p>
          )}

          <p className="mt-6 text-center text-[10px] text-white/15 leading-relaxed">
            Your grades and personal data are private to your account.
            Forum posts and shared templates are visible to all users.
          </p>
        </div>

        <p className="mt-6 text-center text-[10px] text-white/15">
          Built for students, by students.
        </p>
      </motion.div>
    </div>
  );
}
