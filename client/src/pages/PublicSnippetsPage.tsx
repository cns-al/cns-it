import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { Search, Globe, Clock, Loader2, FileCode } from 'lucide-react';

export default function PublicSnippetsPage() {
  const [snippets, setSnippets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { loadSnippets(); }, []);

  const loadSnippets = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/public/snippets?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      setSnippets(data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); loadSnippets(); };

  return (
    <div className="flex min-h-screen flex-col bg-dark-50 dark:bg-dark-950">
      <header className="flex items-center gap-3 border-b border-dark-200 dark:border-dark-800 bg-white dark:bg-dark-900 px-6 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
          <Globe className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-dark-900 dark:text-dark-100">Public Snippets</h1>
          <p className="text-xs text-dark-400">Community shared code</p>
        </div>
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dark-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="w-64 rounded-lg border border-dark-200 dark:border-dark-700 bg-dark-50 dark:bg-dark-800 pl-9 pr-3 py-2 text-sm focus:border-brand-500 focus:outline-none" />
        </form>
        <Link to="/login" className="btn btn-primary text-sm">Sign In</Link>
      </header>

      <div className="flex-1 p-6">
        {loading ? (
          <div className="flex h-64 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-brand-600" /></div>
        ) : snippets.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center">
            <FileCode className="mb-4 h-12 w-12 text-dark-300 dark:text-dark-600" />
            <h3 className="text-lg font-medium text-dark-900 dark:text-dark-100">No public snippets</h3>
            <p className="mt-1 text-sm text-dark-400">Snippets shared publicly will appear here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {snippets.map(snippet => (
              <div key={snippet.id} className="rounded-xl border border-dark-200 dark:border-dark-800 bg-white dark:bg-dark-900 p-5">
                <h3 className="line-clamp-1 text-sm font-semibold text-dark-900 dark:text-dark-100">{snippet.title}</h3>
                {snippet.description && <p className="mt-1 line-clamp-2 text-xs text-dark-500">{snippet.description}</p>}
                <div className="mt-3 flex items-center justify-between border-t border-dark-100 dark:border-dark-800 pt-3">
                  <span className="text-xs text-dark-400">by {snippet.username}</span>
                  <span className="flex items-center gap-1 text-xs text-dark-400"><Clock className="h-3 w-3" />{new Date(snippet.updated_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <footer className="border-t border-dark-200 dark:border-dark-800 px-6 py-4 text-center text-xs text-dark-400">
        &copy; {new Date().getFullYear()} CNS Solutions &middot; <a href="https://cns.al" className="hover:text-brand-500">cns.al</a>
      </footer>
    </div>
  );
}
