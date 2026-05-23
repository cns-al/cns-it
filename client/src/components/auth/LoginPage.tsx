import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Code2, Loader2, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/snippets');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      if (!msg.includes('Too many')) {
        setError(msg);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-dark-50 dark:bg-dark-950 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-600/20">
            <Code2 className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-100">CNS IT</h1>
          <p className="mt-1 text-sm text-dark-500">Code Snippets & Developer Tools</p>
          <p className="mt-0.5 text-xs text-dark-400">by CNS Solutions &middot; <a href="https://cns.al" target="_blank" rel="noopener noreferrer" className="hover:text-brand-500">cns.al</a></p>
        </div>

        {/* Form */}
        <div className="rounded-2xl border border-dark-200 dark:border-dark-800 bg-white dark:bg-dark-900 p-8 shadow-sm">
          <h2 className="mb-6 text-lg font-semibold text-dark-900 dark:text-dark-100">Sign in</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 px-3 py-2.5 text-sm text-red-700 dark:text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border border-dark-300 dark:border-dark-600 bg-white dark:bg-dark-800 px-3 py-2.5 text-sm text-dark-900 dark:text-dark-100 placeholder-dark-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                placeholder="Enter your username"
                required
                autoFocus
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-dark-300 dark:border-dark-600 bg-white dark:bg-dark-800 px-3 py-2.5 text-sm text-dark-900 dark:text-dark-100 placeholder-dark-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                placeholder="Enter your password"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 active:bg-brand-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-dark-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-brand-600 hover:text-brand-500">
              Create one
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-dark-400">
          &copy; {new Date().getFullYear()} CNS Solutions. All rights reserved.
        </p>
      </div>
    </div>
  );
}
