import { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import type { Theme } from '../../contexts/ThemeContext';
import { api } from '../../api/client';
import {
  Code2, Wrench, Settings, Trash2, LogOut, Menu, X,
  Sun, Moon, Monitor, FolderOpen, Shield, ChevronDown,
  Search, Command, LayoutGrid, Image as ImageIcon, FileCode,
  PanelLeftClose, PanelLeftOpen
} from 'lucide-react';

const navItems = [
  { group: 'Main', items: [
    { icon: LayoutGrid, label: 'Dashboard', path: '/' },
    { icon: FolderOpen, label: 'Snippets', path: '/snippets' },
    { icon: Wrench, label: 'Dev Tools', path: '/tools' },
    { icon: ImageIcon, label: 'Diagram', path: '/diagram' },
    { icon: Shield, label: 'Vault', path: '/vault' },
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Auto-collapse sidebar on diagram page
  useEffect(() => {
    if (location.pathname.startsWith('/diagram')) {
      setSidebarCollapsed(true);
      setSidebarOpen(true);
    }
  }, [location.pathname]);

  // Keyboard shortcut ⌘K / Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
      if (e.key === 'Escape') setSearchOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  // Focus input when modal opens
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await api.get(`/snippets?search=${encodeURIComponent(searchQuery)}&limit=10`);
        const data = await res.json();
        setSearchResults((data.data || []).map((s: any) => ({
          ...s,
          categories: s.categories ? s.categories.split(',').filter(Boolean) : [],
        })));
      } catch { /* ignore */ }
      setSearchLoading(false);
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

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

  const collapsed = sidebarCollapsed && sidebarOpen;

  return (
    <div className="flex h-screen overflow-hidden bg-dark-50 dark:bg-dark-950">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen
            ? collapsed
              ? 'w-[52px]'
              : 'w-64'
            : 'w-0'
        } flex-shrink-0 border-r border-dark-200 dark:border-dark-800 bg-white dark:bg-dark-900 transition-all duration-300 overflow-hidden`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className={`flex items-center gap-3 border-b border-dark-200 dark:border-dark-800 py-4 ${collapsed ? 'justify-center px-2' : 'px-5'}`}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white flex-shrink-0">
              <Code2 className="h-5 w-5" />
            </div>
            {!collapsed && (
              <div>
                <h1 className="text-base font-bold text-dark-900 dark:text-dark-100">CNS IT</h1>
                <p className="text-[10px] text-dark-400">by CNS Solutions</p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-2 py-4">
            {navItems.map((group) => (
              <div key={group.group} className="mb-5">
                {!collapsed && (
                  <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-dark-400 dark:text-dark-500">
                    {group.group}
                  </p>
                )}
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const isActive = location.pathname === item.path ||
                      (item.path !== '/' && location.pathname.startsWith(item.path));
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center ${collapsed ? 'justify-center rounded-lg p-2' : 'gap-3 rounded-lg px-3 py-2'} text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300'
                            : 'text-dark-600 hover:bg-dark-100 dark:text-dark-400 dark:hover:bg-dark-800'
                        }`}
                        title={collapsed ? item.label : undefined}
                      >
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        {!collapsed && item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}

            {user?.isAdmin && (
              <div className="mb-5">
                {!collapsed && (
                  <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-dark-400 dark:text-dark-500">
                    Admin
                  </p>
                )}
                <Link
                  to="/admin"
                  className={`flex items-center ${collapsed ? 'justify-center rounded-lg p-2' : 'gap-3 rounded-lg px-3 py-2'} text-sm font-medium transition-colors ${
                    location.pathname.startsWith('/admin')
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300'
                      : 'text-dark-600 hover:bg-dark-100 dark:text-dark-400 dark:hover:bg-dark-800'
                  }`}
                  title={collapsed ? 'Admin Panel' : undefined}
                >
                  <Shield className="h-4 w-4 flex-shrink-0" />
                  {!collapsed && 'Admin Panel'}
                </Link>
              </div>
            )}
          </nav>

          {/* User section */}
          <div className="border-t border-dark-200 dark:border-dark-800 p-2">
            <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} rounded-lg px-2 py-2`}>
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 text-xs font-semibold flex-shrink-0">
                {user?.username?.[0]?.toUpperCase()}
              </div>
              {!collapsed && (
                <>
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
                </>
              )}
              {collapsed && (
                <button
                  onClick={handleLogout}
                  className="rounded-lg p-1.5 text-dark-400 hover:bg-dark-100 hover:text-dark-600 dark:hover:bg-dark-800 dark:hover:text-dark-300 transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-14 items-center gap-3 border-b border-dark-200 dark:border-dark-800 bg-white dark:bg-dark-900 px-4">
          <button
            onClick={() => {
              if (!sidebarOpen) {
                setSidebarOpen(true);
              } else {
                setSidebarCollapsed(!sidebarCollapsed);
              }
            }}
            className="rounded-lg p-2 text-dark-500 hover:bg-dark-100 dark:text-dark-400 dark:hover:bg-dark-800 transition-colors"
            title={sidebarOpen ? (sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar') : 'Open sidebar'}
          >
            {!sidebarOpen ? <Menu className="h-5 w-5" /> : sidebarCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
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

      {/* Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/50 backdrop-blur-sm" onClick={() => setSearchOpen(false)}>
          <div ref={searchRef} className="w-full max-w-xl rounded-2xl border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-900 shadow-2xl mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 border-b border-dark-200 dark:border-dark-800 px-4">
              <Search className="h-5 w-5 text-dark-400 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search snippets..."
                className="flex-1 py-4 text-sm bg-transparent outline-none text-dark-900 dark:text-dark-100 placeholder-dark-400"
              />
              <button onClick={() => setSearchOpen(false)} className="rounded-lg p-1 text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-800">
                <kbd className="rounded border border-dark-200 dark:border-dark-700 px-1.5 py-0.5 text-[10px] font-mono">ESC</kbd>
              </button>
            </div>
            {(searchQuery.trim() || searchLoading) && (
              <div className="max-h-80 overflow-y-auto">
                {searchLoading ? (
                  <div className="px-4 py-8 text-center text-sm text-dark-400">Searching...</div>
                ) : searchResults.length === 0 && searchQuery.trim() ? (
                  <div className="px-4 py-8 text-center text-sm text-dark-400">No snippets found</div>
                ) : (
                  searchResults.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => { setSearchOpen(false); setSearchQuery(''); navigate('/snippets'); }}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-dark-50 dark:hover:bg-dark-800 transition-colors border-b border-dark-100 dark:border-dark-800 last:border-0"
                    >
                      <FileCode className="h-4 w-4 shrink-0 text-dark-400" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-dark-900 dark:text-dark-100">{s.title}</div>
                        {s.description && <div className="truncate text-xs text-dark-400">{s.description}</div>}
                      </div>
                      {s.categories?.length > 0 && <span className="badge badge-brand shrink-0">{s.categories[0]}</span>}
                    </button>
                  ))
                )}
              </div>
            )}
            {!searchQuery.trim() && (
              <div className="px-4 py-6 text-center text-xs text-dark-400">Type to search your snippets</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
