import { Crown, Sparkles, MessageSquare, Library, LayoutDashboard, LogOut, GraduationCap } from 'lucide-react';

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
    { id: 'templates', label: 'Templates', icon: Library, premiumOnly: true },
  ];

  return (
    <header className="w-full border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate('dashboard')} className="flex items-center gap-3 cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-white tracking-tight leading-none">AcadNest</h1>
              <p className="text-xs text-white/40 mt-1">Plan Smarter · Score Better</p>
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
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    locked
                      ? 'text-white/15 cursor-not-allowed'
                      : active
                        ? 'bg-white/[0.08] text-white/80 cursor-pointer'
                        : 'text-white/30 hover:text-white/50 hover:bg-white/[0.03] cursor-pointer'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
                {locked && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-slate-900 border border-white/[0.1] rounded text-xs text-white/50 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
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
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-indigo-500/20 to-violet-600/20 text-indigo-300 border border-indigo-500/30 shadow-lg shadow-indigo-500/10 hover:from-indigo-500/30 hover:to-violet-600/30 transition-all cursor-pointer"
            >
              <Crown className="w-4 h-4" />
              <span className="hidden sm:inline">Premium</span>
            </button>
          ) : (
            <button
              onClick={onTogglePremium}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-white/[0.04] text-white/60 border border-white/[0.08] hover:bg-white/[0.08] hover:text-white transition-all duration-300 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Upgrade</span>
            </button>
          )}
          <button
            onClick={onGoToLanding}
            className="flex items-center gap-1 px-3 py-2 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.03] text-sm transition-colors cursor-pointer"
            title="Back to home"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
