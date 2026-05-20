import { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Shield, Users, Loader2, UserCheck, UserX, Crown, UserMinus } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users');
      const data = await res.json();
      setUsers(data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const toggleActive = async (id: number, current: boolean) => {
    await api.put(`/admin/users/${id}/${current ? 'deactivate' : 'activate'}`);
    toast.success(current ? 'User deactivated' : 'User activated');
    loadUsers();
  };

  const makeAdmin = async (id: number) => {
    await api.put(`/admin/users/${id}/make-admin`);
    toast.success('User promoted to admin');
    loadUsers();
  };

  const demote = async (id: number) => {
    await api.put(`/admin/users/${id}/demote`);
    toast.success('User demoted');
    loadUsers();
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-dark-200 dark:border-dark-800 px-6 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
          <Shield className="h-5 w-5 text-red-600 dark:text-red-400" />
        </div>
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-dark-900 dark:text-dark-100">Admin Panel</h1>
          <p className="text-xs text-dark-400">{users.length} registered users</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex h-full items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-brand-600" /></div>
        ) : (
          <div className="rounded-xl border border-dark-200 dark:border-dark-800 bg-white dark:bg-dark-900 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dark-200 dark:border-dark-800">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-dark-500">User</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-dark-500">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-dark-500">Role</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-dark-500">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-dark-500">Joined</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-dark-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="border-b border-dark-100 dark:border-dark-800 last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/30 text-xs font-semibold text-brand-700 dark:text-brand-300">
                          {user.username?.[0]?.toUpperCase()}
                        </div>
                        <span className="font-medium text-dark-900 dark:text-dark-100">{user.username}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-dark-400">{user.email || '—'}</td>
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
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => toggleActive(user.id, user.is_active)}
                          className={`rounded-lg p-1.5 ${user.is_active ? 'text-dark-400 hover:text-red-500' : 'text-dark-400 hover:text-green-500'}`}>
                          {user.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                        </button>
                        {!user.is_admin && (
                          <button onClick={() => makeAdmin(user.id)} className="rounded-lg p-1.5 text-dark-400 hover:text-brand-500">
                            <Crown className="h-4 w-4" />
                          </button>
                        )}
                        {user.is_admin && user.id !== 1 && (
                          <button onClick={() => demote(user.id)} className="rounded-lg p-1.5 text-dark-400 hover:text-yellow-500">
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
