import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import { Loader2, FileCode, Clock, Copy, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ShareViewPage() {
  const { token } = useParams();
  const [snippet, setSnippet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    loadSnippet();
  }, [token]);

  const loadSnippet = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/public/snippets/share/${token}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSnippet(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load snippet');
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-dark-50 dark:bg-dark-950">
        <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  if (error || !snippet) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-dark-50 dark:bg-dark-950 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-100">Snippet Not Found</h1>
          <p className="mt-2 text-sm text-dark-400">This shared link may have expired or been removed</p>
          <Link to="/public" className="mt-4 inline-flex items-center gap-2 text-brand-600 hover:text-brand-500">
            <ArrowLeft className="h-4 w-4" /> Back to Public Snippets
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-dark-50 dark:bg-dark-950">
      <header className="flex items-center gap-3 border-b border-dark-200 dark:border-dark-800 bg-white dark:bg-dark-900 px-6 py-4">
        <Link to="/public" className="rounded-lg p-2 text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-800">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-dark-900 dark:text-dark-100">{snippet.title}</h1>
          <p className="text-xs text-dark-400">Shared by {snippet.username}</p>
        </div>
      </header>

      {snippet.fragments.length > 1 && (
        <div className="flex border-b border-dark-200 dark:border-dark-800 bg-white dark:bg-dark-900 overflow-x-auto">
          {snippet.fragments.map((frag: any, i: number) => (
            <button key={frag.id} onClick={() => setActiveTab(i)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap ${activeTab === i ? 'border-brand-500 text-brand-600 dark:text-brand-400' : 'border-transparent text-dark-400 hover:text-dark-600'}`}>
              {frag.file_name}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-auto">
        {snippet.fragments[activeTab] && (
          <div className="relative">
            <button onClick={() => { navigator.clipboard.writeText(snippet.fragments[activeTab].code); toast.success('Copied!'); }}
              className="absolute right-3 top-3 rounded-lg p-2 text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-800">
              <Copy className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2 px-6 py-2 border-b border-dark-200 dark:border-dark-800 bg-dark-50 dark:bg-dark-900">
              <FileCode className="h-4 w-4 text-dark-400" />
              <span className="text-xs text-dark-400">{snippet.fragments[activeTab].file_name}</span>
              {snippet.fragments[activeTab].language && <span className="badge badge-brand">{snippet.fragments[activeTab].language}</span>}
            </div>
            <pre className="p-6 text-sm font-mono leading-relaxed text-dark-900 dark:text-dark-100 whitespace-pre-wrap break-all">
              {snippet.fragments[activeTab].code}
            </pre>
          </div>
        )}
      </div>

      <footer className="border-t border-dark-200 dark:border-dark-800 px-6 py-4 text-center text-xs text-dark-400">
        <Link to="/login" className="text-brand-600 hover:text-brand-500">Sign in</Link> to CNS IT &middot; &copy; {new Date().getFullYear()} CNS Solutions &middot; <a href="https://cns.al" className="hover:text-brand-500">cns.al</a>
      </footer>
    </div>
  );
}
