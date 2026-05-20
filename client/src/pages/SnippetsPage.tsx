import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../api/client';
import {
  Plus, Search, FileCode, Star, Trash2, MoreVertical,
  Copy, ExternalLink, Clock, Tag, ChevronDown, Grid, List,
  Loader2, FolderOpen, Code2, Check, X, Globe, Lock, Share2, RefreshCw, Eye
} from 'lucide-react';
import toast from 'react-hot-toast';

const BUILTIN_LANGUAGES = [
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

function getCustomLanguages(): string[] {
  try { return JSON.parse(localStorage.getItem('cnsit_custom_langs') || '[]'); } catch { return []; }
}
function addCustomLanguage(lang: string) {
  const langs = getCustomLanguages();
  if (!langs.includes(lang)) { langs.push(lang); localStorage.setItem('cnsit_custom_langs', JSON.stringify(langs)); }
}

function getAllLanguages(): string[] {
  return [...BUILTIN_LANGUAGES, ...getCustomLanguages()].sort();
}

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

interface SnippetDetail {
  id: number;
  title: string;
  description: string;
  updated_at: string;
  is_public: number;
  is_pinned: number;
  is_favorite: number;
  categories: string[];
  fragments: { id: number; file_name: string; code: string; language: string }[];
}

export default function SnippetsPage() {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCreate, setShowCreate] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);

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
              <SnippetCard key={snippet.id} snippet={snippet} timeAgo={timeAgo} onOpen={() => setDetailId(snippet.id)} />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {snippets.map((snippet) => (
              <SnippetListCard key={snippet.id} snippet={snippet} timeAgo={timeAgo} onOpen={() => setDetailId(snippet.id)} />
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreate && <CreateSnippetModal onClose={() => setShowCreate(false)} onSuccess={() => { setShowCreate(false); loadSnippets(); }} />}

      {/* Detail Modal */}
      {detailId !== null && <SnippetDetailModal id={detailId} onClose={() => setDetailId(null)} onDeleted={() => { setDetailId(null); loadSnippets(); }} />}
    </div>
  );
}

function SnippetCard({ snippet, timeAgo, onOpen }: { snippet: Snippet; timeAgo: (d: string) => string; onOpen: () => void }) {
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
    <button
      onClick={onOpen}
      className="group block w-full rounded-xl border border-dark-200 dark:border-dark-800 bg-white dark:bg-dark-900 p-5 text-left hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-sm transition-all"
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
    </button>
  );
}

function SnippetListCard({ snippet, timeAgo, onOpen }: { snippet: Snippet; timeAgo: (d: string) => string; onOpen: () => void }) {
  const lang = snippet.fragments?.[0]?.language || '';
  return (
    <button
      onClick={onOpen}
      className="flex w-full items-center gap-4 rounded-lg border border-dark-200 dark:border-dark-800 bg-white dark:bg-dark-900 px-4 py-3 text-left hover:border-brand-300 dark:hover:border-brand-700 transition-colors"
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
    </button>
  );
}

function SnippetDetailModal({ id, onClose, onDeleted }: { id: number; onClose: () => void; onDeleted: () => void }) {
  const [snippet, setSnippet] = useState<SnippetDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [showShare, setShowShare] = useState(false);
  const [shareLink, setShareLink] = useState('');

  useEffect(() => {
    loadSnippet();
  }, [id]);

  const loadSnippet = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/snippets/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSnippet(data);
      setActiveTab(0);
    } catch (err) {
      console.error('Failed to load snippet:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Move to recycle bin?')) return;
    await api.delete(`/snippets/${id}`);
    toast.success('Moved to recycle bin');
    onDeleted();
  };

  const togglePin = async () => {
    if (!snippet) return;
    const res = await api.put(`/snippets/${id}`, { isPinned: !snippet.is_pinned });
    const data = await res.json();
    setSnippet(data);
  };

  const toggleFavorite = async () => {
    if (!snippet) return;
    const res = await api.put(`/snippets/${id}`, { isFavorite: !snippet.is_favorite });
    const data = await res.json();
    setSnippet(data);
  };

  const togglePublic = async () => {
    if (!snippet) return;
    const res = await api.put(`/snippets/${id}`, { isPublic: !snippet.is_public });
    const data = await res.json();
    setSnippet(data);
  };

  const createShare = async () => {
    try {
      const res = await api.post(`/share/${id}`, { expiresIn: '24h' });
      const data = await res.json();
      setShareLink(`${window.location.origin}/share/${data.token}`);
      setShowShare(true);
    } catch (err) {
      console.error('Failed to create share link:', err);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-900 shadow-xl mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-dark-200 dark:border-dark-800 px-6 py-4 shrink-0">
          <div className="min-w-0 flex-1">
            {loading ? (
              <div className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin text-brand-600" /><span className="text-sm text-dark-400">Loading...</span></div>
            ) : snippet ? (
              <>
                <h2 className="truncate text-lg font-semibold text-dark-900 dark:text-dark-100">{snippet.title}</h2>
                <div className="flex items-center gap-2 text-xs text-dark-400">
                  <Clock className="h-3 w-3" />
                  {new Date(snippet.updated_at).toLocaleDateString()}
                  {(snippet.categories || []).map(c => <span key={c} className="badge badge-brand"><Tag className="mr-0.5 h-3 w-3" />{c}</span>)}
                </div>
              </>
            ) : (
              <span className="text-sm text-dark-400">Snippet not found</span>
            )}
          </div>
          {!loading && snippet && (
            <div className="flex items-center gap-1">
              <button onClick={togglePin} className={`rounded-lg p-2 ${snippet.is_pinned ? 'text-yellow-500' : 'text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-800'}`} title="Pin">
                <Star className={`h-4 w-4 ${snippet.is_pinned ? 'fill-yellow-500' : ''}`} />
              </button>
              <button onClick={toggleFavorite} className={`rounded-lg p-2 ${snippet.is_favorite ? 'text-red-500' : 'text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-800'}`} title="Favorite">
                <Star className={`h-4 w-4 ${snippet.is_favorite ? 'fill-red-500' : ''}`} />
              </button>
              <button onClick={togglePublic} className={`rounded-lg p-2 ${snippet.is_public ? 'text-green-500' : 'text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-800'}`} title={snippet.is_public ? 'Public' : 'Private'}>
                {snippet.is_public ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
              </button>
              <button onClick={createShare} className="rounded-lg p-2 text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-800" title="Share">
                <Share2 className="h-4 w-4" />
              </button>
              <button onClick={handleDelete} className="rounded-lg p-2 text-dark-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30" title="Delete">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
          <button onClick={onClose} className="rounded-lg p-1.5 text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-800 ml-1">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        {!loading && snippet && (
          <>
            {snippet.description && (
              <div className="border-b border-dark-200 dark:border-dark-800 px-6 py-3 shrink-0">
                <p className="text-sm text-dark-500">{snippet.description}</p>
              </div>
            )}

            {/* File Tabs */}
            <div className="flex border-b border-dark-200 dark:border-dark-800 overflow-x-auto shrink-0">
              {snippet.fragments.map((frag, i) => (
                <button
                  key={frag.id}
                  onClick={() => setActiveTab(i)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === i
                      ? 'border-brand-500 text-brand-600 dark:text-brand-400'
                      : 'border-transparent text-dark-400 hover:text-dark-600 dark:hover:text-dark-300'
                  }`}
                >
                  <code className="text-xs">{frag.file_name}</code>
                  {frag.language && <span className="badge badge-brand">{frag.language}</span>}
                </button>
              ))}
            </div>

            {/* Code Viewer */}
            <div className="flex-1 overflow-auto bg-dark-50 dark:bg-dark-950 p-6 min-h-0">
              {snippet.fragments[activeTab] && (
                <div className="relative">
                  <button
                    onClick={() => copyCode(snippet.fragments[activeTab].code)}
                    className="absolute right-3 top-3 rounded-lg p-2 text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-800 z-10"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <pre className="text-sm font-mono leading-relaxed text-dark-900 dark:text-dark-100 whitespace-pre-wrap break-all">
                    {snippet.fragments[activeTab].code}
                  </pre>
                </div>
              )}
            </div>
          </>
        )}

        {/* Share Modal */}
        {showShare && shareLink && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 rounded-2xl" onClick={() => setShowShare(false)}>
            <div className="w-full max-w-md mx-4 rounded-xl border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-900 p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-base font-semibold text-dark-900 dark:text-dark-100 mb-3">Share Link</h3>
              <div className="flex items-center gap-2 rounded-lg border border-dark-200 dark:border-dark-700 bg-dark-50 dark:bg-dark-800 px-3 py-2">
                <code className="flex-1 text-xs font-mono text-dark-900 dark:text-dark-100 break-all">{shareLink}</code>
                <button onClick={() => { navigator.clipboard.writeText(shareLink); toast.success('Copied!'); }} className="shrink-0 text-dark-400 hover:text-dark-600">
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-2 text-xs text-dark-400">Link expires in 24 hours</p>
              <button onClick={() => setShowShare(false)} className="mt-3 w-full btn btn-primary text-sm">Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
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
            <X className="h-4 w-4" />
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

  const allLangs = getAllLanguages();

  const filtered = useCallback(() => {
    if (!query) return allLangs;
    const q = query.toLowerCase();
    return allLangs.filter(l => l.toLowerCase().includes(q));
  }, [query, allLangs]);

  const isCustom = (lang: string) => !BUILTIN_LANGUAGES.includes(lang);
  const matchesBuiltin = BUILTIN_LANGUAGES.some(l => l.toLowerCase().includes(query.toLowerCase()));
  const showAddOption = query.trim() && !allLangs.includes(query.trim()) && !matchesBuiltin;

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

  const handleAddCustom = () => {
    const lang = query.trim();
    if (lang) {
      addCustomLanguage(lang);
      onChange(lang);
      setQuery(lang);
      setOpen(false);
      toast.success(`Added "${lang}" to languages`);
    }
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
          placeholder="Search or type to add..."
          className="flex-1 bg-transparent text-sm text-dark-900 dark:text-dark-100 placeholder-dark-400 outline-none"
        />
        {query && (
          <button type="button" onClick={() => { setQuery(''); setOpen(false); }} className="ml-1 rounded p-0.5 text-dark-400 hover:text-dark-600 dark:hover:text-dark-300">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {open && (
        <div className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-900 shadow-lg">
          {showAddOption && (
            <button
              type="button"
              onClick={handleAddCustom}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950/30 border-b border-dark-100 dark:border-dark-800"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add "<strong>{query.trim()}</strong>" as language</span>
            </button>
          )}
          {filtered().length === 0 && !showAddOption ? (
            <div className="px-3 py-2 text-xs text-dark-400">No languages found</div>
          ) : (
            filtered().map(lang => (
              <button
                key={lang}
                type="button"
                onClick={() => select(lang)}
                className={`flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-dark-100 dark:hover:bg-dark-800 ${lang === value ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-400' : 'text-dark-700 dark:text-dark-300'}`}
              >
                <span className="flex items-center gap-2">
                  <span className="capitalize">{lang}</span>
                  {isCustom(lang) && <span className="text-[10px] text-dark-400">(custom)</span>}
                </span>
                {lang === value && <Check className="h-3.5 w-3.5" />}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
