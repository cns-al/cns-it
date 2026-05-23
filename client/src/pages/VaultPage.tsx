import { useState, useEffect, useCallback } from 'react';
import { Shield, Eye, EyeOff, Copy, Plus, Search, Trash2, Edit2, X, Key, Server, Lock, FileKey } from 'lucide-react';
import { api } from '../api/client';
import toast from 'react-hot-toast';

type VaultType = 'ssh-key' | 'password' | 'server' | 'database' | 'api' | 'other';

interface VaultEntry {
  id: number;
  name: string;
  type: VaultType;
  host?: string;
  username?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

const typeIcons: Record<VaultType, any> = {
  'ssh-key': Key,
  'password': Lock,
  'server': Server,
  'database': Server,
  'api': FileKey,
  'other': Lock
};

const typeColors: Record<VaultType, string> = {
  'ssh-key': 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30',
  'password': 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30',
  'server': 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30',
  'database': 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
  'api': 'text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30',
  'other': 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30'
};

export default function VaultPage() {
  const [entries, setEntries] = useState<VaultEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [masterKey, setMasterKey] = useState(() => sessionStorage.getItem('cnsit_vault_masterkey') || '');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [decryptedValues, setDecryptedValues] = useState<Record<number, string>>({});
  const [visibleValues, setVisibleValues] = useState<Record<number, boolean>>({});

  const [formData, setFormData] = useState({
    name: '', type: 'password' as VaultType, host: '', username: '', value: '', notes: ''
  });

  const fetchEntries = useCallback(async () => {
    try {
      const res = await api.get('/vault');
      const data = await res.json();
      setEntries(data.data || []);
    } catch {
      toast.error('Failed to load vault entries');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  // Persist master key in sessionStorage (cleared on tab close)
  useEffect(() => {
    if (masterKey) {
      sessionStorage.setItem('cnsit_vault_masterkey', masterKey);
    } else {
      sessionStorage.removeItem('cnsit_vault_masterkey');
    }
    return () => {
      // Clear sensitive data on component unmount
      sessionStorage.removeItem('cnsit_vault_masterkey');
      sessionStorage.removeItem('cnsit_vault_decrypted');
    };
  }, [masterKey]);

  // Clear decrypted values on page unload
  useEffect(() => {
    const handleUnload = () => {
      sessionStorage.clear();
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, []);

  const searchEntries = async () => {
    if (!search.trim()) { fetchEntries(); return; }
    try {
      const res = await api.get(`/vault/search?q=${encodeURIComponent(search)}`);
      const data = await res.json();
      setEntries(data.data || []);
    } catch { toast.error('Search failed'); }
  };

  const handleDecrypt = async (id: number) => {
    if (!masterKey.trim()) { toast.error('Enter your master key first'); return; }
    try {
      const res = await api.get(`/vault/${id}/decrypt?masterKey=${encodeURIComponent(masterKey)}`);
      const data = await res.json();
      setDecryptedValues(prev => ({ ...prev, [id]: data.value }));
      toast.success('Decrypted');
    } catch (err: any) {
      toast.error(err.message || 'Decryption failed - wrong master key');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!masterKey.trim()) { toast.error('Enter your master key first'); return; }
    if (!formData.name.trim() || !formData.value.trim()) { toast.error('Name and value are required'); return; }
    try {
      if (editingId) {
        await api.put(`/vault/${editingId}`, { ...formData, masterKey });
        toast.success('Entry updated');
      } else {
        await api.post('/vault', { ...formData, masterKey });
        toast.success('Entry saved');
      }
      setFormData({ name: '', type: 'password', host: '', username: '', value: '', notes: '' });
      setEditingId(null);
      setShowForm(false);
      fetchEntries();
    } catch (err: any) {
      toast.error(err.message || 'Save failed');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this entry? This cannot be undone.')) return;
    try {
      await api.delete(`/vault/${id}`);
      toast.success('Entry deleted');
      fetchEntries();
    } catch { toast.error('Delete failed'); }
  };

  const handleEdit = (entry: VaultEntry) => {
    setEditingId(entry.id);
    setFormData({
      name: entry.name, type: entry.type, host: entry.host || '',
      username: entry.username || '', value: '', notes: entry.notes || ''
    });
    setShowForm(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const clearVaultData = () => {
    setMasterKey('');
    setDecryptedValues({});
    setVisibleValues({});
    sessionStorage.clear();
    toast.success('Master key and decrypted values cleared');
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-dark-200 dark:border-dark-800 px-6 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
          <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
        </div>
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-dark-900 dark:text-dark-100">Password Vault</h1>
          <p className="text-xs text-dark-400">{entries.length} entries • Server-side AES-256 encrypted</p>
        </div>
        <button onClick={() => { setEditingId(null); setShowForm(true); setFormData({ name: '', type: 'password', host: '', username: '', value: '', notes: '' }); }}
          className="btn btn-primary text-sm flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Entry
        </button>
      </div>

      <div className="p-4 border-b border-dark-200 dark:border-dark-800 flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dark-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchEntries()}
            placeholder="Search entries..." className="input pl-9" />
        </div>
        <div className="flex items-center gap-2">
          <Key className="h-4 w-4 text-dark-400" />
          <input type="password" value={masterKey} onChange={(e) => setMasterKey(e.target.value)}
            placeholder="Master key" className="input text-sm w-48" />
          {masterKey && (
            <button onClick={clearVaultData} className="btn btn-secondary text-xs px-2 py-1 text-red-600 hover:text-red-700" title="Clear master key and decrypted values">
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Shield className="h-12 w-12 text-dark-300 dark:text-dark-600 mb-4" />
            <h3 className="text-lg font-medium text-dark-900 dark:text-dark-100">Vault is empty</h3>
            <p className="mt-1 text-sm text-dark-400 max-w-sm">Add your first SSH key, password, or server credential. All data is encrypted with AES-256 before storing.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {entries.map(entry => {
              const Icon = typeIcons[entry.type] || typeIcons.other;
              const colorClass = typeColors[entry.type] || typeColors.other;
              return (
                <div key={entry.id} className="rounded-xl border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-900 p-4 hover:border-brand-300 dark:hover:border-brand-700 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${colorClass}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-medium text-sm text-dark-900 dark:text-dark-100">{entry.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-dark-400 capitalize">{entry.type}</span>
                          {entry.host && <><span className="text-dark-300 dark:text-dark-600">•</span><span className="text-xs text-dark-400">{entry.host}</span></>}
                          {entry.username && <><span className="text-dark-300 dark:text-dark-600">•</span><span className="text-xs text-dark-400">{entry.username}</span></>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {decryptedValues[entry.id] ? (
                        <div className="flex items-center gap-1 mr-2">
                          <code className="text-xs font-mono px-2 py-1 rounded bg-dark-50 dark:bg-dark-800 text-dark-600 dark:text-dark-400 max-w-[200px] truncate">
                            {visibleValues[entry.id] ? decryptedValues[entry.id] : '•'.repeat(Math.min(decryptedValues[entry.id].length, 20))}
                          </code>
                          <button onClick={() => setVisibleValues(prev => ({ ...prev, [entry.id]: !prev[entry.id] }))}
                            className="p-1.5 text-dark-400 hover:text-dark-600 dark:hover:text-dark-300">
                            {visibleValues[entry.id] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </button>
                          <button onClick={() => copyToClipboard(decryptedValues[entry.id])}
                            className="p-1.5 text-dark-400 hover:text-dark-600 dark:hover:text-dark-300">
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => handleDecrypt(entry.id)}
                          className="btn btn-secondary text-xs flex items-center gap-1 px-2 py-1">
                          <Eye className="h-3.5 w-3.5" /> Decrypt
                        </button>
                      )}
                      <button onClick={() => handleEdit(entry)} className="p-1.5 text-dark-400 hover:text-dark-600 dark:hover:text-dark-300">
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => handleDelete(entry.id)} className="p-1.5 text-dark-400 hover:text-red-600">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  {entry.notes && (
                    <p className="mt-2 text-xs text-dark-400 pl-12">{entry.notes}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowForm(false)}>
          <div className="w-full max-w-lg rounded-2xl border border-dark-200 dark:border-dark-700 bg-white dark:bg-dark-900 shadow-xl mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-dark-200 dark:border-dark-800 px-6 py-4">
              <h2 className="text-base font-semibold text-dark-900 dark:text-dark-100">{editingId ? 'Edit Entry' : 'Add New Entry'}</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 text-dark-400 hover:text-dark-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Name</label>
                  <input required value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                    placeholder="e.g., Production Server" className="input text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Type</label>
                  <select value={formData.type} onChange={e => setFormData(p => ({ ...p, type: e.target.value as VaultType }))}
                    className="input text-sm">
                    <option value="password">Password</option>
                    <option value="ssh-key">SSH Key</option>
                    <option value="server">Server</option>
                    <option value="database">Database</option>
                    <option value="api">API Key</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Host</label>
                  <input value={formData.host} onChange={e => setFormData(p => ({ ...p, host: e.target.value }))}
                    placeholder="e.g., 172.10.10.83" className="input text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Username</label>
                  <input value={formData.username} onChange={e => setFormData(p => ({ ...p, username: e.target.value }))}
                    placeholder="e.g., root" className="input text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Value *</label>
                <textarea required value={formData.value} onChange={e => setFormData(p => ({ ...p, value: e.target.value }))}
                  placeholder={formData.type === 'ssh-key' ? '-----BEGIN OPENSSH PRIVATE KEY-----' : 'Enter secret value...'}
                  className="input font-mono text-sm resize-none" rows={formData.type === 'ssh-key' ? 5 : 2} />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1">Notes</label>
                <input value={formData.notes} onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))}
                  placeholder="Optional notes..." className="input text-sm" />
              </div>
              <div className="rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 p-3 text-xs text-purple-700 dark:text-purple-400">
                <Key className="h-3.5 w-3.5 inline mr-1" />
                Your master key encrypts this entry with AES-256-GCM before storing it on the server.
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="btn btn-primary flex-1">{editingId ? 'Update' : 'Save Entry'}</button>
                <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
