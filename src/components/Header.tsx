import { MessageSquare, Library, LayoutDashboard, LogOut, GraduationCap, BookOpen } from 'lucide-react';
import BrandLogo from './BrandLogo';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onGoToLanding: () => void;
}

export default function Header({ currentPage, onNavigate, onGoToLanding }: HeaderProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'semester', label: 'Semesters', icon: BookOpen },
    { id: 'gwa', label: 'GWA', icon: GraduationCap },
    { id: 'forum', label: 'Forum', icon: MessageSquare },
    { id: 'templates', label: 'Templates', icon: Library },
  ];

  return (
    <header className="w-full border-b themed-border themed-bg/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-2 sm:gap-4">
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

        <nav className="flex items-center gap-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const active = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                  active
                    ? 'themed-surface-raised themed-text/80'
                    : 'themed-text/30 hover:themed-text/50 hover:themed-surface'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <button
          onClick={onGoToLanding}
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg themed-text/20 hover:themed-text/40 hover:themed-surface text-[11px] transition-colors cursor-pointer"
          title="Back to home"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
}
