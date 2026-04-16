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
        <div className="flex items-center gap-4">
          <button onClick={() => onNavigate('dashboard')} className="flex items-center gap-3 cursor-pointer group">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-md shadow-primary/20 group-hover:shadow-primary/40 transition-shadow">
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="hidden sm:block text-left">
              <h1 className="text-base font-bold text-foreground tracking-tight leading-none">AcadNest</h1>
              <p className="text-[11px] font-medium text-muted mt-1 uppercase tracking-wider">Plan Smarter</p>
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
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    locked
                      ? 'text-muted/30 cursor-not-allowed'
                      : active
                        ? 'bg-surface-hover text-foreground cursor-pointer shadow-sm'
                        : 'text-muted hover:text-foreground hover:bg-surface cursor-pointer'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
                {locked && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-background border border-border rounded-md text-[10px] font-semibold text-muted whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-primary/10 text-primary border border-primary/20 shadow-sm hover:bg-primary/20 transition-all cursor-pointer"
            >
              <Crown className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Premium Active</span>
            </button>
          ) : (
            <button
              onClick={onTogglePremium}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-surface text-foreground border border-border hover:bg-surface-hover hover:border-border-hover transition-all duration-200 cursor-pointer shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span className="hidden sm:inline">Upgrade</span>
            </button>
          )}
          <button
            onClick={onGoToLanding}
            className="flex items-center justify-center w-8 h-8 rounded-md text-muted hover:text-foreground hover:bg-surface transition-colors cursor-pointer ml-1"
            title="Back to home"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
