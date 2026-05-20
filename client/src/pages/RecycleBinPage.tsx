import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { Trash2, Clock, RefreshCw, Loader2, ArchiveX } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RecycleBinPage() {
  const [snippets, setSnippets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadSnippets(); }, []);

  const loadSnippets = async () => {
    setLoading(true);
    try {
      const res = await api.get('/snippets/recycle');
      const data = await res.json();
      setSnippets(data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const restore = async (id: number) => {
    await api.post(`/snippets/recycle/${id}/restore`);
    toast.success('Snippet restored');
    loadSnippets();
  };

  const permanentDelete = async (id: number) => {
    if (!confirm('Permanently delete this snippet? This cannot be undone!')) return;
    await api.delete(`/snippets/recycle/${id}`);
    toast.success('Snippet permanently deleted');
    loadSnippets();
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-dark-200 dark:border-dark-800 px-6 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
          <Trash2 className="h-5 w-5 text-orange-600 dark:text-orange-400" />
        </div>
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-dark-900 dark:text-dark-100">Recycle Bin</h1>
          <p className="text-xs text-dark-400">{snippets.length} deleted snippets</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex h-full items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-brand-600" /></div>
        ) : snippets.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center">
            <ArchiveX className="mb-4 h-12 w-12 text-dark-300 dark:text-dark-600" />
            <h3 className="text-lg font-medium text-dark-900 dark:text-dark-100">Recycle bin is empty</h3>
            <p className="mt-1 text-sm text-dark-400">Deleted snippets will appear here</p>
          </div>
        ) : (
          <div className="space-y-2">
            {snippets.map(snippet => (
              <div key={snippet.id} className="flex items-center gap-4 rounded-lg border border-dark-200 dark:border-dark-800 bg-white dark:bg-dark-900 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <Link to={`/snippets/${snippet.id}`} className="text-sm font-medium text-dark-900 dark:text-dark-100 hover:text-brand-600 dark:hover:text-brand-400">
                    {snippet.title}
                  </Link>
                  <p className="flex items-center gap-1 text-xs text-dark-400 mt-0.5">
                    <Clock className="h-3 w-3" />
                    {new Date(snippet.expiry_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => restore(snippet.id)} className="btn btn-secondary text-xs" title="Restore">
                    <RefreshCw className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => permanentDelete(snippet.id)} className="btn btn-danger text-xs" title="Delete permanently">
                    <ArchiveX className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
