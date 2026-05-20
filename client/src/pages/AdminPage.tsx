import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Shield, Users, Loader2, UserCheck, UserX, Crown, UserMinus, Clock, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

type Tab = 'pending' | 'users';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>('pending');
  const [users, setUsers] = useState<any[]>([]);
  const [pending, setPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [usersRes, pendingRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/users/pending')
      ]);
      setUsers(await usersRes.json());
      setPending(await pendingRes.json());
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const approveUser = async (id: number) => {
    try {
      await api.put(`/admin/users/${id}/approve`);
      toast.success('User approved');
      loadAll();
    } catch {
      toast.error('Failed to approve user');
    }
  };

  const rejectUser = async (id: number, username: string) => {
    if (!confirm(`Reject and delete "${username}"? This cannot be undone.`)) return;
    try {
      await api.put(`/admin/users/${id}/reject`);
      toast.success('User rejected');
      loadAll();
    } catch {
      toast.error('Failed to reject user');
    }
  };

  const toggleActive = async (id: number, current: boolean) => {
    await api.put(`/admin/users/${id}/${current ? 'deactivate' : 'activate'}`);
    toast.success(current ? 'User deactivated' : 'User activated');
    loadAll();
  };

  const makeAdmin = async (id: number) => {
    await api.put(`/admin/users/${id}/make-admin`);
    toast.success('User promoted to admin');
    loadAll();
  };

  const demote = async (id: number) => {
    await api.put(`/admin/users/${id}/demote`);
    toast.success('User demoted');
    loadAll();
  };

  const approvedUsers = users.filter(u => u.is_approved);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-dark-200 dark:border-dark-800 px-6 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
          <Shield className="h-5 w-5 text-red-600 dark:text-red-400" />
        </div>
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-dark-900 dark:text-dark-100">Admin Panel</h1>
          <p className="text-xs text-dark-400">{users.length} total users · {pending.length} pending approval</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-dark-200 dark:border-dark-800 px-6">
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'pending'
              ? 'border-brand-500 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-dark-400 hover:text-dark-600 dark:hover:text-dark-300'
          }`}
        >
          <Clock className="h-4 w-4" />
          Pending
          {pending.length > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white">
              {pending.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'users'
              ? 'border-brand-500 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-dark-400 hover:text-dark-600 dark:hover:text-dark-300'
          }`}
        >
          <Users className="h-4 w-4" />
          All Users
          <span className="badge badge-brand">{approvedUsers.length}</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-brand-600" />
          </div>
        ) : activeTab === 'pending' ? (
          /* Pending Tab */
          pending.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <CheckCircle className="mb-3 h-12 w-12 text-green-300 dark:text-green-700" />
              <h3 className="text-lg font-medium text-dark-900 dark:text-dark-100">All Caught Up</h3>
              <p className="mt-1 text-sm text-dark-400">No pending registrations to review</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pending.map(user => (
                <div key={user.id} className="rounded-xl border border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-950/20 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30 text-sm font-semibold text-amber-700 dark:text-amber-300">
                        {user.username?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-medium text-dark-900 dark:text-dark-100">{user.username}</h3>
                        <p className="text-xs text-dark-400">
                          Registered {new Date(user.created_at).toLocaleString()}
                          {user.email && ` · ${user.email}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => rejectUser(user.id, user.username)}
                        className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      >
                        <XCircle className="h-4 w-4" />
                        Reject
                      </button>
                      <button
                        onClick={() => approveUser(user.id)}
                        className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Approve
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* All Users Tab */
          <div className="rounded-xl border border-dark-200 dark:border-dark-800 bg-white dark:bg-dark-900 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dark-200 dark:border-dark-800">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-dark-500">User</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-dark-500">Role</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-dark-500">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-dark-500">Joined</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-dark-500">Last Login</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-dark-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {approvedUsers.map(user => (
                  <tr key={user.id} className="border-b border-dark-100 dark:border-dark-800 last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/30 text-xs font-semibold text-brand-700 dark:text-brand-300">
                          {user.username?.[0]?.toUpperCase()}
                        </div>
                        <span className="font-medium text-dark-900 dark:text-dark-100">{user.username}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${user.is_admin ? 'badge-brand' : 'badge-yellow'}`}>
                        {user.is_admin ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${user.is_active ? 'badge-green' : 'badge-red'}`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-dark-400">{new Date(user.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-dark-400">
                      {user.last_login ? new Date(user.last_login).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => toggleActive(user.id, user.is_active === 1)}
                          className={`rounded-lg p-1.5 ${user.is_active ? 'text-dark-400 hover:text-red-500' : 'text-dark-400 hover:text-green-500'}`}
                          title={user.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {user.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                        </button>
                        {!user.is_admin && (
                          <button
                            onClick={() => makeAdmin(user.id)}
                            className="rounded-lg p-1.5 text-dark-400 hover:text-brand-500"
                            title="Make Admin"
                          >
                            <Crown className="h-4 w-4" />
                          </button>
                        )}
                        {user.is_admin && user.id !== 1 && (
                          <button
                            onClick={() => demote(user.id)}
                            className="rounded-lg p-1.5 text-dark-400 hover:text-yellow-500"
                            title="Demote"
                          >
                            <UserMinus className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
