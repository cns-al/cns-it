import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Code2, Loader2, Clock, CheckCircle } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const result = await register(username, password);
      if (result?.pending) {
        setPending(true);
      } else {
        navigate('/snippets');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (pending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-dark-50 dark:bg-dark-950 px-4">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-600/20">
              <Code2 className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-100">CNS IT</h1>
          </div>

          <div className="rounded-2xl border border-dark-200 dark:border-dark-800 bg-white dark:bg-dark-900 p-8 shadow-sm text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
              <Clock className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            </div>
            <h2 className="text-lg font-semibold text-dark-900 dark:text-dark-100">Registration Submitted</h2>
            <p className="mt-3 text-sm text-dark-500">
              Your account is pending admin approval. You'll be able to log in once your account is approved.
            </p>
            <div className="mt-6 rounded-lg bg-amber-50 dark:bg-amber-950/30 p-4 text-left">
              <div className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  We've received your registration request. The admin will review and approve your account shortly.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="mt-6 w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 active:bg-brand-800 transition-colors"
            >
              Go to Login
            </button>
          </div>

          <p className="mt-6 text-center text-xs text-dark-400">
            &copy; {new Date().getFullYear()} CNS Solutions. All rights reserved.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-dark-50 dark:bg-dark-950 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-lg shadow-brand-600/20">
            <Code2 className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold text-dark-900 dark:text-dark-100">CNS IT</h1>
          <p className="mt-1 text-sm text-dark-500">Create your account</p>
        </div>

        <div className="rounded-2xl border border-dark-200 dark:border-dark-800 bg-white dark:bg-dark-900 p-8 shadow-sm">
          <h2 className="mb-6 text-lg font-semibold text-dark-900 dark:text-dark-100">Create Account</h2>
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-950/30 p-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border border-dark-300 dark:border-dark-600 bg-white dark:bg-dark-800 px-3 py-2.5 text-sm text-dark-900 dark:text-dark-100 placeholder-dark-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                placeholder="Choose a username"
                required
                minLength={3}
                maxLength={30}
                pattern="[a-zA-Z0-9_-]+"
                autoFocus
              />
              <p className="mt-1 text-xs text-dark-400">3-30 characters, letters, numbers, underscores, hyphens</p>
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
                placeholder="At least 8 characters"
                required
                minLength={8}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border border-dark-300 dark:border-dark-600 bg-white dark:bg-dark-800 px-3 py-2.5 text-sm text-dark-900 dark:text-dark-100 placeholder-dark-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                placeholder="Confirm your password"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 active:bg-brand-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-dark-500">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-brand-600 hover:text-brand-500">
              Sign in
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
