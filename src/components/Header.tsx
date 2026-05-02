import { Crown, Sparkles, MessageSquare, Library, LayoutDashboard, LogOut, GraduationCap } from 'lucide-react';
import BrandLogo from './BrandLogo';

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
    <header className="w-full border-b themed-border themed-bg/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate('dashboard')} className="flex items-center gap-3 cursor-pointer">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-300/20">
              <BrandLogo className="w-9 h-9" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base font-bold themed-text tracking-tight leading-none">AcadNest</h1>
              <p className="text-[10px] themed-text/35">Plan Smarter · Score Better</p>
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
                      ? 'themed-text/15 cursor-not-allowed'
                      : active
                        ? 'themed-surface-raised themed-text/80 cursor-pointer'
                        : 'themed-text/30 hover:themed-text/50 hover:themed-surface cursor-pointer'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
                {locked && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 themed-tooltip border themed-border-subtle rounded text-[10px] themed-text/50 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-gradient-to-r from-yellow-300/20 to-yellow-200/20 themed-accent-soft border border-yellow-300/30 shadow-lg shadow-yellow-300/10 hover:from-yellow-300/30 hover:to-yellow-200/30 transition-all cursor-pointer"
            >
              <Crown className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Premium</span>
            </button>
          ) : (
            <button
              onClick={onTogglePremium}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium themed-surface-h themed-text/50 border themed-border-subtle hover:themed-surface-raised hover:themed-text/70 transition-all duration-300 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Upgrade</span>
            </button>
          )}
          <button
            onClick={onGoToLanding}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg themed-text/20 hover:themed-text/40 hover:themed-surface text-[11px] transition-colors cursor-pointer"
            title="Back to home"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
