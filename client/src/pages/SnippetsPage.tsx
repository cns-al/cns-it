import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import {
  Plus, Search, FileCode, Star, Trash2, MoreVertical,
  Copy, ExternalLink, Clock, Tag, ChevronDown, Grid, List,
  Loader2, FolderOpen, Code2
} from 'lucide-react';

interface Snippet {
  id: number;
  title: string;
  description: string;
  updated_at: string;
  is_public: number;
  is_pinned: number;
  is_favorite: number;
  categories: string[];
  fragments: { file_name: string; language: string; code: string }[];
}

export default function SnippetsPage() {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    loadSnippets();
  }, [sortBy]);

  const loadSnippets = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/snippets?sortBy=${sortBy}&search=${encodeURIComponent(search)}`);
      const data = await res.json();
      setSnippets(data.data || []);
    } catch (err) {
      console.error('Failed to load snippets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadSnippets();
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

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-dark-200 dark:border-dark-800 px-6 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-100 dark:bg-brand-900/30">
          <FolderOpen className="h-5 w-5 text-brand-600 dark:text-brand-400" />
        </div>
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-dark-900 dark:text-dark-100">Snippets</h1>
          <p className="text-xs text-dark-400">{snippets.length} snippets</p>
        </div>

        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dark-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search snippets..."
            className="w-64 rounded-lg border border-dark-200 dark:border-dark-700 bg-dark-50 dark:bg-dark-800 pl-9 pr-3 py-2 text-sm text-dark-900 dark:text-dark-100 placeholder-dark-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </form>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="rounded-lg border border-dark-200 dark:border-dark-700 bg-dark-50 dark:bg-dark-800 px-3 py-2 text-sm text-dark-700 dark:text-dark-300 focus:border-brand-500 focus:outline-none"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="alpha">A-Z</option>
          <option value="reverseAlpha">Z-A</option>
        </select>

        <div className="flex items-center rounded-lg border border-dark-200 dark:border-dark-700">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 ${viewMode === 'grid' ? 'bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400' : 'text-dark-400 hover:text-dark-600 dark:hover:text-dark-300'}`}
          >
            <Grid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 ${viewMode === 'list' ? 'bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400' : 'text-dark-400 hover:text-dark-600 dark:hover:text-dark-300'}`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>

        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Snippet
        </button>
      </div>

      {/* Snippet List */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
          </div>
        ) : snippets.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-dark-100 dark:bg-dark-800">
              <FileCode className="h-8 w-8 text-dark-400" />
            </div>
            <h3 className="text-lg font-medium text-dark-900 dark:text-dark-100">No snippets yet</h3>
            <p className="mt-1 text-sm text-dark-400">Create your first code snippet to get started</p>
            <button
              onClick={() => setShowCreate(true)}
              className="mt-4 flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create Snippet
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {snippets.map((snippet) => (
              <SnippetCard key={snippet.id} snippet={snippet} timeAgo={timeAgo} />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {snippets.map((snippet) => (
              <SnippetListCard key={snippet.id} snippet={snippet} timeAgo={timeAgo} />
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreate && <CreateSnippetModal onClose={() => setShowCreate(false)} onSuccess={() => { setShowCreate(false); loadSnippets(); }} />}
    </div>
  );
}

function SnippetCard({ snippet, timeAgo }: { snippet: Snippet; timeAgo: (d: string) => string }) {
  const lang = snippet.fragments[0]?.language || '';
  const langColor: Record<string, string> = {
    javascript: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    typescript: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    python: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    html: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    css: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    json: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  };

  return (
    <Link
      to={`/snippets/${snippet.id}`}
      className="group block rounded-xl border border-dark-200 dark:border-dark-800 bg-white dark:bg-dark-900 p-5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-sm transition-all"
    >
      <div className="mb-3 flex items-start justify-between">
        <h3 className="line-clamp-1 text-sm font-semibold text-dark-900 dark:text-dark-100 group-hover:text-brand-600 dark:group-hover:text-brand-400">
          {snippet.title}
        </h3>
        <div className="ml-2 flex shrink-0 items-center gap-1">
          {snippet.is_pinned && <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500" />}
          {snippet.is_public && (
            <span className="badge badge-green">public</span>
          )}
        </div>
      </div>

      {snippet.description && (
        <p className="mb-3 line-clamp-2 text-xs text-dark-500">{snippet.description}</p>
      )}

      <div className="flex items-center gap-2">
        {lang && (
          <span className={`badge ${langColor[lang] || 'bg-dark-100 text-dark-600 dark:bg-dark-800 dark:text-dark-400'}`}>
            {lang}
          </span>
        )}
        {snippet.categories.map((cat) => (
          <span key={cat} className="badge badge-brand">
            <Tag className="mr-0.5 h-3 w-3" />
            {cat}
          </span>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-dark-100 dark:border-dark-800 pt-3">
        <span className="flex items-center gap-1 text-xs text-dark-400">
          <Clock className="h-3 w-3" />
          {timeAgo(snippet.updated_at)}
        </span>
        <span className="text-xs text-dark-400">
          {snippet.fragments.length} file{snippet.fragments.length > 1 ? 's' : ''}
        </span>
      </div>
    </Link>
  );
}

function SnippetListCard({ snippet, timeAgo }: { snippet: Snippet; timeAgo: (d: string) => string }) {
  return (
    <Link
      to={`/snippets/${snippet.id}`}
      className="flex items-center gap-4 rounded-lg border border-dark-200 dark:border-dark-800 bg-white dark:bg-dark-900 px-4 py-3 hover:border-brand-300 dark:hover:border-brand-700 transition-colors"
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-950/30">
        <Code2 className="h-4 w-4 text-brand-600 dark:text-brand-400" />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-medium text-dark-900 dark:text-dark-100">{snippet.title}</h3>
        {snippet.description && (
          <p className="truncate text-xs text-dark-400">{snippet.description}</p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {snippet.is_public && <span className="badge badge-green">public</span>}
        {snippet.fragments[0]?.language && (
          <span className="badge badge-brand">{snippet.fragments[0].language}</span>
        )}
        <span className="text-xs text-dark-400">{timeAgo(snippet.updated_at)}</span>
      </div>
    </Link>
  );
}

function CreateSnippetModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/snippets', {
        title,
        description,
        fragments: [{ name: 'main', code, language }],
      });
      if (!res.ok) throw new Error('Failed to create snippet');
      onSuccess();
    } catch (err) {
      console.error('Failed to create snippet:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-900 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-dark-200 dark:border-dark-800 px-6 py-4">
          <h2 className="text-lg font-semibold text-dark-900 dark:text-dark-100">New Snippet</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-800">
            <Trash2 className="h-4 w-4 rotate-45" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input"
              placeholder="Snippet title"
              required
              autoFocus
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input resize-none"
              rows={2}
              placeholder="Optional description"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="input"
            >
              {['javascript', 'typescript', 'python', 'html', 'css', 'json', 'bash', 'sql', 'go', 'rust', 'java', 'c', 'cpp', 'ruby', 'php', 'yaml', 'markdown', 'dockerfile', 'toml', 'xml'].map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">Code</label>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="input font-mono text-sm resize-none"
              rows={8}
              placeholder="Paste your code here..."
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : null}
              Create Snippet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
