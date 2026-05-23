import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { api } from '../api/client';
import toast from 'react-hot-toast';

interface User {
  id: number;
  username: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<{ pending: boolean }>;
  logout: () => void;
  changePassword: (current: string, newPass: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('cnsit_token');
    if (token) {
      try {
        const res = await api.get('/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser({ id: data.id, username: data.username, isAdmin: data.isAdmin });
        } else {
          localStorage.removeItem('cnsit_token');
        }
      } catch {
        localStorage.removeItem('cnsit_token');
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (username: string, password: string) => {
    try {
      const res = await api.post('/auth/login', { username, password });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      localStorage.setItem('cnsit_token', data.token);
      setUser(data.user);
      toast.success('Welcome back, ' + data.user.username + '!');
    } catch (err: any) {
      throw err;
    }
  };

  const register = async (username: string, password: string) => {
    try {
      const res = await api.post('/auth/register', { username, password });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (data.pending) {
        toast.success('Registration submitted! Awaiting admin approval.');
        return { pending: true };
      }

      localStorage.setItem('cnsit_token', data.token);
      setUser(data.user);
      toast.success(data.message || 'Account created successfully!');
      return { pending: false };
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('cnsit_token');
    // Clear vault sensitive data
    sessionStorage.removeItem('cnsit_vault_masterkey');
    sessionStorage.removeItem('cnsit_vault_decrypted');
    setUser(null);
    toast.success('Logged out');
  };

  const changePassword = async (current: string, newPass: string) => {
    const res = await api.post('/auth/change-password', { currentPassword: current, newPassword: newPass });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    toast.success('Password changed');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
