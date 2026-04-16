import { Crown, Sparkles, MessageSquare, Library, LayoutDashboard, LogOut, GraduationCap } from 'lucide-react';

interface HeaderProps {
  isPremium: boolean;
  onTogglePremium: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
  onGoToLanding: () => void;
}

function AcadnestA() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="acadnest-a-grad" x1="1" y1="0" x2="17" y2="18" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="50%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#3B82F6" />
        </linearGradient>
      </defs>
      <path
        d="M9.002 1.8c.33 0 .633.18.784.47l6.39 12.2a.86.86 0 0 1-.77 1.24H2.598a.86.86 0 0 1-.77-1.24l6.39-12.2c.151-.29.454-.47.784-.47Z"
        fill="url(#acadnest-a-grad)"
        opacity="0.95"
      />
      <path d="M6.85 11.8 9 7.95l2.15 3.85H6.85Z" fill="#0a0a0f" opacity="0.9" />
    </svg>
  );
}

export default function Header({ isPremium, onTogglePremium, currentPage, onNavigate, onGoToLanding }: HeaderProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'gwa', label: 'GWA', icon: GraduationCap, premiumOnly: true },
    { id: 'forum', label: 'Forum', icon: MessageSquare },
    { id: 'templates', label: 'Templates', icon: Library, premiumOnly: true },
  ];

  return (
    <header className="w-full border-b border-white/[0.08] bg-black/15 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate('dashboard')} className="flex items-center gap-3 cursor-pointer">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500/90 via-amber-400/90 to-sky-400/90 flex items-center justify-center shadow-lg shadow-black/40 border border-white/[0.10]">
              <AcadnestA />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base font-bold text-white tracking-tight leading-none">Acadnest</h1>
              <p className="text-[10px] text-white/35">Plan Smarter · Score Better</p>
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
          {isPremium ? (
            <button
              onClick={onTogglePremium}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-gradient-to-r from-amber-400/20 to-orange-500/20 text-amber-300 border border-amber-400/30 shadow-lg shadow-amber-500/10 hover:from-amber-400/30 hover:to-orange-500/30 transition-all cursor-pointer"
            >
              <Crown className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Premium</span>
            </button>
          ) : (
            <button
              onClick={onTogglePremium}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-white/[0.04] text-white/50 border border-white/[0.08] hover:bg-white/[0.08] hover:text-white/70 transition-all duration-300 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Upgrade</span>
            </button>
          )}
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
