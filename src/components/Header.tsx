import { BookOpen, Crown, Sparkles, MessageSquare, Library, LayoutDashboard, LogOut, GraduationCap } from 'lucide-react';

interface HeaderProps {
  isPremium: boolean;
  onTogglePremium: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
  onGoToLanding: () => void;
}

export default function Header({ isPremium, onTogglePremium, currentPage, onNavigate, onGoToLanding }: HeaderProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'gwa', label: 'GWA', icon: GraduationCap, premiumOnly: true },
    { id: 'forum', label: 'Forum', icon: MessageSquare },
    { id: 'templates', label: 'Templates', icon: Library },
  ];

  return (
    <header className="w-full border-b border-white/[0.06] bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate('dashboard')} className="flex items-center gap-3 cursor-pointer">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <BookOpen className="w-4.5 h-4.5 text-[#0a0a0f]" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base font-bold text-white tracking-tight leading-none">Trackademic</h1>
              <p className="text-[10px] text-white/35">Strategy · Optimizer · Calculator</p>
            </div>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const active = currentPage === item.id;
            const locked = item.premiumOnly && !isPremium;
            return (
              <div key={item.id} className="relative group">
                <button
                  onClick={() => !locked && onNavigate(item.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                    locked
                      ? 'text-white/15 cursor-not-allowed'
                      : active
                        ? 'bg-white/[0.08] text-white/80 cursor-pointer'
                        : 'text-white/30 hover:text-white/50 hover:bg-white/[0.03] cursor-pointer'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
                {locked && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-[#1a1a2e] border border-white/[0.1] rounded text-[10px] text-white/50 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    Premium feature
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={onTogglePremium}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-300 cursor-pointer ${
              isPremium
                ? 'bg-gradient-to-r from-amber-400/20 to-orange-500/20 text-amber-300 border border-amber-400/30 shadow-lg shadow-amber-500/10'
                : 'bg-white/[0.04] text-white/50 border border-white/[0.08] hover:bg-white/[0.08] hover:text-white/70'
            }`}
          >
            {isPremium ? <Crown className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isPremium ? 'Premium' : 'Upgrade'}</span>
          </button>
          <button
            onClick={onGoToLanding}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-white/20 hover:text-white/40 hover:bg-white/[0.03] text-[11px] transition-colors cursor-pointer"
            title="Back to home"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
