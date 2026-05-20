import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import {
  Plus, Search, FileCode, Star, Trash2, MoreVertical,
  Copy, ExternalLink, Clock, Tag, ChevronDown, Grid, List,
  Loader2, FolderOpen, Code2, Check, X
} from 'lucide-react';

const LANGUAGES = [
  'abap', 'actionscript', 'ada', 'agda', 'al', 'antlr', 'apacheconf', 'apex', 'apl', 'applescript',
  'ara', 'asm', 'astro', 'awk', 'bash', 'basic', 'batch', 'beancount', 'berry', 'bibtex',
  'binary', 'bicep', 'birb', 'blade', 'brainfuck', 'brightscript', 'bro', 'c', 'cadence', 'cfc',
  'cfscript', 'chaiscript', 'cil', 'clarity', 'clojure', 'cmake', 'cobol', 'codeql', 'coffee',
  'cpp', 'crystal', 'csharp', 'cshtml', 'csp', 'css', 'csv', 'cue', 'cypher', 'd', 'dart',
  'dax', 'dhall', 'diff', 'django', 'dns', 'docker', 'dot', 'ebnf', 'editorconfig', 'eiffel',
  'ejs', 'elixir', 'elm', 'elvish', 'erb', 'erlang', 'excel-formula', 'factor', 'false', 'fortran',
  'fsharp', 'ftl', 'gap', 'gcode', 'gdscript', 'gedcom', 'gherkin', 'git', 'glsl', 'gnuplot',
  'go', 'go-module', 'graphql', 'groovy', 'haml', 'handlebars', 'haskell', 'hcl', 'hjson',
  'hlsl', 'hocon', 'html', 'http', 'hxml', 'icon', 'idris', 'ignore', 'inform7', 'ini', 'io',
  'janet', 'java', 'javascript', 'jexl', 'jinja', 'jolie', 'jq', 'js-extras', 'jsdoc', 'json',
  'json5', 'jsonc', 'jsonp', 'jspl', 'jsonnet', 'jssm', 'julia', 'keepalived', 'kotlin', 'kumir',
  'kusto', 'latex', 'latte', 'less', 'liquid', 'lisp', 'livescript', 'llvm', 'log', 'logtalk',
  'lolcode', 'lua', 'magma', 'makefile', 'markdown', 'marko', 'matlab', 'maxscript', 'melt',
  'mermaid', 'mizar', 'mongodb', 'monkey', 'moonscript', 'n1ql', 'n4js', 'nand2tetris-hdl',
  'nasm', 'neon', 'nginx', 'nim', 'nix', 'nsis', 'objectivec', 'ocaml', 'opencl', 'openqasm',
  'oz', 'pascal', 'psl', 'pcaxis', 'peoplecode', 'perl', 'php', 'php-extra', 'plsql', 'powerquery',
  'powershell', 'processing', 'prolog', 'promql', 'properties', 'protobuf', 'prql', 'pug', 'puppet',
  'pure', 'purebasic', 'purescript', 'python', 'q', 'qml', 'qore', 'qsharp', 'r', 'racket',
  'cs', 'regex', 'rego', 'renpy', 'rel', 'rmarkdown', 'robotframework', 'ruby', 'rust', 'sas',
  'sass', 'scala', 'scheme', 'scss', 'shell-session', 'smali', 'smalltalk', 'smarty', 'sml',
  'solidity', 'solution-file', 'soy', 'sparql', 'splunk', 'sqf', 'sql', 'squirrel', 'stan',
  'stata', 'iecst', 'stylus', 'supercollider', 'swift', 'systemd', 'tcl', 'textile', 'thrift',
  'ti', 'tla', 'toml', 'tremor', 'tsx', 'tt2', 'turtle', 'twig', 'typescript', 'uniroyal',
  'v', 'vbs', 'velocity', 'verilog', 'vhdl', 'vim', 'visual-basic', 'warpscript', 'wasm',
  'web-idl', 'wgsl', 'wiki', 'wolfram', 'wren', 'xeora', 'xml', 'xojo', 'xquery', 'yaml',
  'yang', 'zig'
];

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
  const lang = snippet.fragments?.[0]?.language || '';
  const cats = snippet.categories || [];
  const fragCount = snippet.fragments?.length || snippet.fragment_count || 0;
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
        {cats.map((cat) => (
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
          {fragCount} file{fragCount > 1 ? 's' : ''}
        </span>
      </div>
    </Link>
  );
}

function SnippetListCard({ snippet, timeAgo }: { snippet: Snippet; timeAgo: (d: string) => string }) {
  const lang = snippet.fragments?.[0]?.language || '';
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
        {lang && (
          <span className="badge badge-brand">{lang}</span>
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
            <LanguageSearch value={language} onChange={setLanguage} />
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

function LanguageSearch({ value, onChange }: { value: string; onChange: (l: string) => void }) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useCallback(() => {
    if (!query) return LANGUAGES;
    const q = query.toLowerCase();
    return LANGUAGES.filter(l => l.toLowerCase().includes(q));
  }, [query]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  const select = (lang: string) => {
    onChange(lang);
    setQuery(lang);
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { setOpen(false); inputRef.current?.blur(); }
  };

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center rounded-lg border border-dark-200 dark:border-dark-700 bg-dark-50 dark:bg-dark-800 px-3 py-2 focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500">
        <Search className="mr-2 h-4 w-4 shrink-0 text-dark-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search language..."
          className="flex-1 bg-transparent text-sm text-dark-900 dark:text-dark-100 placeholder-dark-400 outline-none"
        />
        {query && (
          <button type="button" onClick={() => { setQuery(''); setOpen(false); }} className="ml-1 rounded p-0.5 text-dark-400 hover:text-dark-600 dark:hover:text-dark-300">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {open && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-900 shadow-lg">
          {filtered().length === 0 ? (
            <div className="px-3 py-2 text-xs text-dark-400">No languages found</div>
          ) : (
            filtered().map(lang => (
              <button
                key={lang}
                type="button"
                onClick={() => select(lang)}
                className={`flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-dark-100 dark:hover:bg-dark-800 ${lang === value ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-400' : 'text-dark-700 dark:text-dark-300'}`}
              >
                <span className="capitalize">{lang}</span>
                {lang === value && <Check className="h-3.5 w-3.5" />}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
