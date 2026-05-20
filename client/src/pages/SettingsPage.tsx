import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { api } from '../api/client';
import { Settings as SettingsIcon, Key, Shield, Loader2, Plus, Trash2, Copy, Check, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user, changePassword } = useAuth();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'api-keys'>('profile');
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [showNewKey, setShowNewKey] = useState<string | null>(null);
  const [loadingKeys, setLoadingKeys] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPass !== confirmPass) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      await changePassword(currentPass, newPass);
      setCurrentPass(''); setNewPass(''); setConfirmPass('');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadApiKeys = async () => {
    setLoadingKeys(true);
    try {
      const res = await api.get('/keys');
      const data = await res.json();
      setApiKeys(data);
    } catch (err) { console.error(err); }
    setLoadingKeys(false);
  };

  const createApiKey = async () => {
    if (!newKeyName.trim()) return;
    try {
      const res = await api.post('/keys', { name: newKeyName });
      const data = await res.json();
      setShowNewKey(data.key);
      setNewKeyName('');
      loadApiKeys();
    } catch (err) { toast.error('Failed to create API key'); }
  };

  const deleteApiKey = async (id: number) => {
    if (!confirm('Delete this API key?')) return;
    await api.delete(`/keys/${id}`);
    loadApiKeys();
    toast.success('API key deleted');
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-dark-200 dark:border-dark-800 px-6 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-100 dark:bg-brand-900/30">
          <SettingsIcon className="h-5 w-5 text-brand-600 dark:text-brand-400" />
        </div>
        <h1 className="text-lg font-semibold text-dark-900 dark:text-dark-100">Settings</h1>
      </div>

      <div className="flex border-b border-dark-200 dark:border-dark-800 px-6">
        {[
          { id: 'profile', label: 'Profile & Theme', icon: SettingsIcon },
          { id: 'security', label: 'Password', icon: Shield },
          { id: 'api-keys', label: 'API Keys', icon: Key },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id ? 'border-brand-500 text-brand-600 dark:text-brand-400' : 'border-transparent text-dark-400 hover:text-dark-600'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'profile' && (
          <div className="mx-auto max-w-md space-y-6">
            <div className="rounded-xl border border-dark-200 dark:border-dark-800 bg-white dark:bg-dark-900 p-6">
              <h2 className="text-sm font-semibold text-dark-900 dark:text-dark-100 mb-4">Account</h2>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs text-dark-400">Username</label>
                  <p className="text-sm font-medium text-dark-900 dark:text-dark-100">{user?.username}</p>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-dark-400">Role</label>
                  <span className={`badge ${user?.isAdmin ? 'badge-brand' : 'badge-yellow'}`}>{user?.isAdmin ? 'Admin' : 'User'}</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-dark-200 dark:border-dark-800 bg-white dark:bg-dark-900 p-6">
              <h2 className="text-sm font-semibold text-dark-900 dark:text-dark-100 mb-4">Theme</h2>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'light', label: 'Light', icon: '☀️' },
                  { id: 'dark', label: 'Dark', icon: '🌙' },
                  { id: 'system', label: 'System', icon: '💻' },
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id as any)}
                    className={`rounded-lg border-2 p-3 text-center transition-all ${
                      theme === t.id ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30' : 'border-dark-200 dark:border-dark-700 hover:border-dark-300'
                    }`}
                  >
                    <span className="text-xl">{t.icon}</span>
                    <p className="mt-1 text-xs font-medium text-dark-700 dark:text-dark-300">{t.label}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="mx-auto max-w-md">
            <form onSubmit={handlePasswordChange} className="rounded-xl border border-dark-200 dark:border-dark-800 bg-white dark:bg-dark-900 p-6 space-y-4">
              <h2 className="text-sm font-semibold text-dark-900 dark:text-dark-100">Change Password</h2>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">Current Password</label>
                <input type="password" value={currentPass} onChange={(e) => setCurrentPass(e.target.value)} className="input" required />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">New Password</label>
                <input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} className="input" minLength={8} required />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-dark-700 dark:text-dark-300">Confirm Password</label>
                <input type="password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} className="input" minLength={8} required />
              </div>
              <button type="submit" disabled={loading} className="btn btn-primary w-full">
                {loading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : null}
                Update Password
              </button>
            </form>
          </div>
        )}

        {activeTab === 'api-keys' && (
          <div className="mx-auto max-w-md space-y-4">
            <div className="rounded-xl border border-dark-200 dark:border-dark-800 bg-white dark:bg-dark-900 p-6">
              <h2 className="text-sm font-semibold text-dark-900 dark:text-dark-100 mb-4">Create API Key</h2>
              <div className="flex gap-2">
                <input value={newKeyName} onChange={(e) => setNewKeyName(e.target.value)} className="input flex-1" placeholder="Key name" />
                <button onClick={createApiKey} className="btn btn-primary"><Plus className="h-4 w-4" /></button>
              </div>
            </div>

            {showNewKey && (
              <div className="rounded-xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30 p-4">
                <p className="text-xs text-green-600 dark:text-green-400 mb-2">Save this key now - you won't see it again!</p>
                <div className="flex items-center gap-2 rounded-lg bg-white dark:bg-dark-900 px-3 py-2">
                  <code className="flex-1 text-sm font-mono text-dark-900 dark:text-dark-100 break-all">{showNewKey}</code>
                  <button onClick={() => { navigator.clipboard.writeText(showNewKey); toast.success('Copied!'); }} className="text-dark-400 hover:text-dark-600">
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="rounded-xl border border-dark-200 dark:border-dark-800 bg-white dark:bg-dark-900 p-6">
              <h2 className="text-sm font-semibold text-dark-900 dark:text-dark-100 mb-4">Your API Keys</h2>
              {loadingKeys ? <Loader2 className="h-5 w-5 animate-spin text-brand-600" /> : (
                <div className="space-y-2">
                  {apiKeys.length === 0 && <p className="text-sm text-dark-400">No API keys created yet</p>}
                  {apiKeys.map(key => (
                    <div key={key.id} className="flex items-center gap-3 rounded-lg border border-dark-200 dark:border-dark-700 px-4 py-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-dark-900 dark:text-dark-100">{key.name}</p>
                        <p className="text-xs text-dark-400">...{key.key_prefix}</p>
                      </div>
                      <button onClick={() => deleteApiKey(key.id)} className="text-dark-400 hover:text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
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
