import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, LucideIcon, Menu, X } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

interface NavItem {
  label: string;
  icon: LucideIcon;
  path: string;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  navItems: NavItem[];
}

function SidebarContent({ title, navItems, onNavigate }: { title: string; navItems: NavItem[]; onNavigate?: () => void }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleNav = (path: string) => {
    navigate(path);
    onNavigate?.();
  };

  return (
    <>
      <div className="p-6 border-b border-border">
        <Logo size="sm" />
      </div>

      <div className="p-6 border-b border-border">
        <p className="text-xs tracking-widest uppercase text-muted-foreground mb-1">
          {title}
        </p>
        <p className="font-serif text-lg">{user?.name}</p>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <motion.button
                  whileHover={{ x: 4 }}
                  onClick={() => handleNav(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm transition-all duration-300 ${
                    isActive
                      ? 'bg-accent/10 text-accent'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <item.icon className="w-4 h-4" strokeWidth={1.5} />
                  <span className="text-sm">{item.label}</span>
                </motion.button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-border">
        {/* LanguageSwitcher removed */}
      </div>

      <div className="p-4">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm">{t('logout')}</span>
        </Button>
      </div>
    </>
  );
}

export function DashboardLayout({ children, title, navItems }: DashboardLayoutProps) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background">
        {/* Mobile Header */}
        <header className="sticky top-0 z-40 flex items-center justify-between px-4 py-3 border-b border-border bg-background/95 backdrop-blur-sm">
          <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
            <Menu className="w-5 h-5" />
          </Button>
          <Logo size="sm" />
          <div className="w-9" /> {/* spacer */}
        </header>

        {/* Mobile Drawer */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="left" className="w-72 p-0 flex flex-col">
            <SheetHeader className="sr-only">
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <SidebarContent title={title} navItems={navItems} onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <main className="p-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="w-72 border-r border-border bg-card flex flex-col sticky top-0 h-screen">
        <SidebarContent title={title} navItems={navItems} />
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="p-8"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
