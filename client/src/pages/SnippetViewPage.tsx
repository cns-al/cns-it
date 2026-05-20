import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { ArrowLeft, Copy, Check, Star, Globe, Lock, Share2, Trash2, Clock, Tag, Loader2, RefreshCw, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

interface Snippet {
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

export default function SnippetViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [snippet, setSnippet] = useState<Snippet | null>(null);
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
      if (data.fragments.length > 0) setActiveTab(0);
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
    navigate('/recycle');
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

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
      </div>
    );
  }

  if (!snippet) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <button onClick={() => navigate('/snippets')} className="mb-8 flex items-center gap-2 text-dark-500 hover:text-brand-600">
          <ArrowLeft className="h-4 w-4" /> Back to Snippets
        </button>
        <h2 className="text-xl font-semibold text-dark-900 dark:text-dark-100">Snippet not found</h2>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-dark-200 dark:border-dark-800 px-6 py-4">
        <button onClick={() => navigate('/snippets')} className="rounded-lg p-2 text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-800">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-semibold text-dark-900 dark:text-dark-100">{snippet.title}</h1>
          <div className="flex items-center gap-2 text-xs text-dark-400">
            <Clock className="h-3 w-3" />
            {new Date(snippet.updated_at).toLocaleDateString()}
            {snippet.categories.map(c => <span key={c} className="badge badge-brand"><Tag className="mr-0.5 h-3 w-3" />{c}</span>)}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={togglePin} className={`rounded-lg p-2 ${snippet.is_pinned ? 'text-yellow-500' : 'text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-800'}`}>
            <Star className={`h-4 w-4 ${snippet.is_pinned ? 'fill-yellow-500' : ''}`} />
          </button>
          <button onClick={toggleFavorite} className={`rounded-lg p-2 ${snippet.is_favorite ? 'text-red-500' : 'text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-800'}`}>
            <Star className={`h-4 w-4 ${snippet.is_favorite ? 'fill-red-500' : ''}`} />
          </button>
          <button onClick={togglePublic} className={`rounded-lg p-2 ${snippet.is_public ? 'text-green-500' : 'text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-800'}`}>
            {snippet.is_public ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
          </button>
          <button onClick={createShare} className="rounded-lg p-2 text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-800">
            <Share2 className="h-4 w-4" />
          </button>
          <button onClick={handleDelete} className="rounded-lg p-2 text-dark-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {snippet.description && (
        <div className="border-b border-dark-200 dark:border-dark-800 px-6 py-3">
          <p className="text-sm text-dark-500">{snippet.description}</p>
        </div>
      )}

      {/* File Tabs */}
      <div className="flex border-b border-dark-200 dark:border-dark-800 overflow-x-auto">
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
      <div className="flex-1 overflow-auto bg-dark-50 dark:bg-dark-950">
        {snippet.fragments[activeTab] && (
          <div className="relative">
            <button
              onClick={() => copyCode(snippet.fragments[activeTab].code)}
              className="absolute right-3 top-3 rounded-lg p-2 text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-800 z-10"
            >
              <Copy className="h-4 w-4" />
            </button>
            <pre className="p-6 text-sm font-mono leading-relaxed text-dark-900 dark:text-dark-100 whitespace-pre-wrap break-all">
              {snippet.fragments[activeTab].code}
            </pre>
          </div>
        )}
      </div>

      {/* Share Modal */}
      {showShare && shareLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowShare(false)}>
          <div className="w-full max-w-md rounded-2xl border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-900 p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-dark-900 dark:text-dark-100 mb-4">Share Link</h2>
            <div className="flex items-center gap-2 rounded-lg border border-dark-200 dark:border-dark-700 bg-dark-50 dark:bg-dark-800 px-4 py-3">
              <code className="flex-1 text-sm font-mono text-dark-900 dark:text-dark-100 break-all">{shareLink}</code>
              <button onClick={() => { navigator.clipboard.writeText(shareLink); toast.success('Copied!'); }} className="shrink-0 text-dark-400 hover:text-dark-600">
                <Copy className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 text-xs text-dark-400">Link expires in 24 hours</p>
            <button onClick={() => setShowShare(false)} className="mt-4 w-full btn btn-primary">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
