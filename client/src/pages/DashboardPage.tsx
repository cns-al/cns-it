import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import {
  FolderOpen, Code2, Clock, ArrowRight, FileCode, Heart, Pin, Globe,
  Zap, TrendingUp, BarChart3, Plus, Search, Eye, Maximize2, Minimize2,
  Loader2, Tag, ChevronRight, Hash
} from 'lucide-react';

interface Snippet {
  id: number;
  title: string;
  description: string;
  updated_at: string;
  is_public: number;
  is_pinned: number;
  is_favorite: number;
  fragment_count?: number;
  categories?: string[];
  fragments?: { file_name: string; language: string; code: string }[];
}

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recentSnippets, setRecentSnippets] = useState<Snippet[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, pinned: 0, favorites: 0, public: 0 });

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.get('/snippets?sortBy=newest&limit=12');
      const data = await res.json();
      const snippets = (data.data || []).map((s: any) => ({
        ...s,
        categories: s.categories ? s.categories.split(',').filter(Boolean) : [],
      }));
      setRecentSnippets(snippets);
      setStats({
        total: data.total || snippets.length,
        pinned: snippets.filter((s: Snippet) => s.is_pinned).length,
        favorites: snippets.filter((s: Snippet) => s.is_favorite).length,
        public: snippets.filter((s: Snippet) => s.is_public).length,
      });
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const langColor: Record<string, string> = {
    javascript: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    typescript: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    python: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    html: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    css: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    json: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    bash: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    shell: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    go: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
    rust: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    java: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    ruby: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    php: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
    sql: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  };

  const getLang = (s: Snippet) => s.fragments?.[0]?.language || '';

  const statCards = [
    {
      label: 'Total Snippets',
      value: stats.total,
      icon: FolderOpen,
      color: 'bg-blue-50 dark:bg-blue-950/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      change: `${stats.total} saved`,
    },
    {
      label: 'Pinned',
      value: stats.pinned,
      icon: Pin,
      color: 'bg-indigo-50 dark:bg-indigo-950/30',
      iconColor: 'text-indigo-600 dark:text-indigo-400',
      change: 'quick access',
    },
    {
      label: 'Favorites',
      value: stats.favorites,
      icon: Heart,
      color: 'bg-red-50 dark:bg-red-950/30',
      iconColor: 'text-red-600 dark:text-red-400',
      change: 'hearted',
    },
    {
      label: 'Public',
      value: stats.public,
      icon: Globe,
      color: 'bg-green-50 dark:bg-green-950/30',
      iconColor: 'text-green-600 dark:text-green-400',
      change: 'shared',
    },
  ];

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-dark-200 dark:border-dark-800 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-dark-900 dark:text-dark-100">
              Welcome back, {user?.username}
            </h1>
            <p className="mt-0.5 text-sm text-dark-500">
              Here's what's happening with your snippets
            </p>
          </div>
          <button
            onClick={() => navigate('/snippets', { state: { action: 'create' } })}
            className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Snippet
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {statCards.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-dark-200 dark:border-dark-800 bg-white dark:bg-dark-900 p-4 transition-all hover:shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${stat.color}`}>
                      <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-2xl font-bold text-dark-900 dark:text-dark-100">{stat.value}</p>
                    <p className="text-xs text-dark-500">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: 'All Snippets', icon: FolderOpen, path: '/snippets', color: 'bg-blue-50 dark:bg-blue-950/20 hover:bg-blue-100 dark:hover:bg-blue-950/40' },
                { label: 'Developer Tools', icon: Zap, path: '/tools', color: 'bg-amber-50 dark:bg-amber-950/20 hover:bg-amber-100 dark:hover:bg-amber-950/40' },
                { label: 'Recycle Bin', icon: FileCode, path: '/recycle', color: 'bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/40' },
                { label: 'Settings', icon: Hash, path: '/settings', color: 'bg-purple-50 dark:bg-purple-950/20 hover:bg-purple-100 dark:hover:bg-purple-950/40' },
              ].map((action) => (
                <button
                  key={action.label}
                  onClick={() => navigate(action.path)}
                  className={`flex flex-col items-center gap-2 rounded-xl border border-dark-200 dark:border-dark-800 p-4 text-left transition-all ${action.color}`}
                >
                  <action.icon className="h-5 w-5 text-dark-600 dark:text-dark-400" />
                  <span className="text-xs font-medium text-dark-700 dark:text-dark-300">{action.label}</span>
                </button>
              ))}
            </div>

            {/* Recent Snippets */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-dark-400" />
                  <h2 className="text-sm font-semibold text-dark-900 dark:text-dark-100">Recent Snippets</h2>
                  <span className="badge badge-brand">{recentSnippets.length}</span>
                </div>
                <button
                  onClick={() => navigate('/snippets')}
                  className="flex items-center gap-1 text-xs font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300"
                >
                  View all
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>

              {recentSnippets.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-dark-200 dark:border-dark-800 py-16 text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-dark-100 dark:bg-dark-800">
                    <Code2 className="h-6 w-6 text-dark-400" />
                  </div>
                  <h3 className="text-sm font-medium text-dark-900 dark:text-dark-100">No snippets yet</h3>
                  <p className="mt-1 max-w-xs text-xs text-dark-400">
                    Create your first code snippet to see it here
                  </p>
                  <button
                    onClick={() => navigate('/snippets', { state: { action: 'create' } })}
                    className="mt-4 flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-xs font-medium text-white hover:bg-brand-700 transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                    Create Snippet
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {recentSnippets.map((snippet) => (
                    <SnippetCard
                      key={snippet.id}
                      snippet={snippet}
                      timeAgo={timeAgo}
                      langColor={langColor}
                      expanded={expandedId === snippet.id}
                      onExpand={() => setExpandedId(expandedId === snippet.id ? null : snippet.id)}
                      onNavigate={() => navigate(`/snippets/${snippet.id}`)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SnippetCard({
  snippet,
  timeAgo,
  langColor,
  expanded,
  onExpand,
  onNavigate,
}: {
  snippet: Snippet;
  timeAgo: (d: string) => string;
  langColor: Record<string, string>;
  expanded: boolean;
  onExpand: () => void;
  onNavigate: () => void;
}) {
  const lang = snippet.fragments?.[0]?.language || '';
  const code = snippet.fragments?.[0]?.code || '';
  const cats = snippet.categories || [];

  return (
    <div
      className={`group rounded-xl border border-dark-200 dark:border-dark-800 bg-white dark:bg-dark-900 transition-all duration-200 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-sm ${
        expanded ? 'ring-1 ring-brand-500/20' : ''
      }`}
    >
      <div className="p-4">
        {/* Header */}
        <div className="mb-2 flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <button
              onClick={onNavigate}
              className="line-clamp-1 text-sm font-semibold text-dark-900 dark:text-dark-100 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
            >
              {snippet.title}
            </button>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {snippet.is_pinned && <Pin className="h-3.5 w-3.5 text-blue-500" />}
            {snippet.is_favorite && <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500" />}
            {snippet.is_public && <Globe className="h-3.5 w-3.5 text-green-500" />}
          </div>
        </div>

        {/* Description */}
        {snippet.description && (
          <p className="mb-2 line-clamp-2 text-xs text-dark-500">{snippet.description}</p>
        )}

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-1.5">
          {lang && (
            <span className={`badge ${langColor[lang] || 'bg-dark-100 text-dark-600 dark:bg-dark-800 dark:text-dark-400'}`}>
              {lang}
            </span>
          )}
          {cats.slice(0, 2).map((cat) => (
            <span key={cat} className="badge badge-brand">
              <Tag className="mr-0.5 h-3 w-3" />
              {cat}
            </span>
          ))}
          {cats.length > 2 && (
            <span className="badge badge-gray">+{cats.length - 2}</span>
          )}
        </div>

        {/* Expanded Code Preview */}
        {expanded && code && (
          <div className="mt-3 rounded-lg bg-dark-50 dark:bg-dark-950 p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-dark-500">
                {snippet.fragments?.[0]?.file_name || 'code'}
              </span>
              <span className="text-xs text-dark-400">
                {code.split('\n').length} lines
              </span>
            </div>
            <pre className="max-h-32 overflow-auto text-xs font-mono leading-relaxed text-dark-700 dark:text-dark-300 whitespace-pre-wrap break-all">
              {code.substring(0, 2000)}
              {code.length > 2000 && '\n...'}
            </pre>
          </div>
        )}

        {/* Footer */}
        <div className="mt-3 flex items-center justify-between border-t border-dark-100 dark:border-dark-800 pt-3">
          <span className="flex items-center gap-1 text-xs text-dark-400">
            <Clock className="h-3 w-3" />
            {timeAgo(snippet.updated_at)}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={onExpand}
              className="rounded-md p-1 text-dark-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/30 transition-colors"
              title={expanded ? 'Collapse' : 'Expand preview'}
            >
              {expanded ? (
                <Minimize2 className="h-3.5 w-3.5" />
              ) : (
                <Maximize2 className="h-3.5 w-3.5" />
              )}
            </button>
            <button
              onClick={onNavigate}
              className="rounded-md p-1 text-dark-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/30 transition-colors"
              title="Open snippet"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
