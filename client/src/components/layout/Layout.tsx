import { useState } from 'react';
import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import type { Theme } from '../../contexts/ThemeContext';
import {
  Code2, Wrench, Settings, Trash2, LogOut, Menu, X,
  Sun, Moon, Monitor, FolderOpen, Shield, ChevronDown,
  Search, Command
} from 'lucide-react';

const navItems = [
  { group: 'Main', items: [
    { icon: FolderOpen, label: 'Snippets', path: '/snippets' },
    { icon: Wrench, label: 'Dev Tools', path: '/tools' },
  ]},
  { group: 'Other', items: [
    { icon: Trash2, label: 'Recycle Bin', path: '/recycle' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ]},
];

export default function Layout() {
  const { user, logout } = useAuth();
  const { theme, setTheme, resolved } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const ThemeToggle = () => {
    const modes: Theme[] = ['light', 'dark', 'system'];
    const currentIdx = modes.indexOf(theme);
    const next = modes[(currentIdx + 1) % modes.length];
    const Icon = next === 'light' ? Sun : next === 'dark' ? Moon : Monitor;

    return (
      <button
        onClick={() => setTheme(next)}
        className="rounded-lg p-2 text-dark-500 hover:bg-dark-100 dark:text-dark-400 dark:hover:bg-dark-800 transition-colors"
        title={`Theme: ${next}`}
      >
        <Icon className="h-4 w-4" />
      </button>
    );
  };

  return (
    <div className="flex h-screen overflow-hidden bg-dark-50 dark:bg-dark-950">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-0'
        } flex-shrink-0 border-r border-dark-200 dark:border-dark-800 bg-white dark:bg-dark-900 transition-all duration-300 overflow-hidden`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center gap-3 border-b border-dark-200 dark:border-dark-800 px-5 py-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
              <Code2 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-dark-900 dark:text-dark-100">CNS IT</h1>
              <p className="text-[10px] text-dark-400">by CNS Solutions</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 py-4">
            {navItems.map((group) => (
              <div key={group.group} className="mb-5">
                <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-dark-400 dark:text-dark-500">
                  {group.group}
                </p>
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const isActive = location.pathname === item.path ||
                      (item.path !== '/' && location.pathname.startsWith(item.path));
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300'
                            : 'text-dark-600 hover:bg-dark-100 dark:text-dark-400 dark:hover:bg-dark-800'
                        }`}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}

            {user?.isAdmin && (
              <div className="mb-5">
                <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-dark-400 dark:text-dark-500">
                  Admin
                </p>
                <Link
                  to="/admin"
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    location.pathname.startsWith('/admin')
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300'
                      : 'text-dark-600 hover:bg-dark-100 dark:text-dark-400 dark:hover:bg-dark-800'
                  }`}
                >
                  <Shield className="h-4 w-4" />
                  Admin Panel
                </Link>
              </div>
            )}
          </nav>

          {/* User section */}
          <div className="border-t border-dark-200 dark:border-dark-800 p-3">
            <div className="flex items-center gap-3 rounded-lg px-3 py-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 text-sm font-semibold">
                {user?.username?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-dark-900 dark:text-dark-100">
                  {user?.username}
                </p>
                <p className="text-xs text-dark-400">
                  {user?.isAdmin ? 'Admin' : 'User'}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="rounded-lg p-1.5 text-dark-400 hover:bg-dark-100 hover:text-dark-600 dark:hover:bg-dark-800 dark:hover:text-dark-300 transition-colors"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-14 items-center gap-3 border-b border-dark-200 dark:border-dark-800 bg-white dark:bg-dark-900 px-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-lg p-2 text-dark-500 hover:bg-dark-100 dark:text-dark-400 dark:hover:bg-dark-800 transition-colors"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <div className="flex-1" />

          {/* Search shortcut */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 rounded-lg border border-dark-200 dark:border-dark-700 px-3 py-1.5 text-sm text-dark-400 hover:border-dark-300 dark:hover:border-dark-600 transition-colors"
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Search...</span>
            <kbd className="rounded border border-dark-200 dark:border-dark-700 px-1.5 py-0.5 text-[10px] font-mono">
              ⌘K
            </kbd>
          </button>

          <ThemeToggle />

          <a
            href="https://cns.al"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-dark-500 hover:text-brand-600 dark:text-dark-400 dark:hover:text-brand-400 transition-colors"
          >
            cns.al
          </a>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
