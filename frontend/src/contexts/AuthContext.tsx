import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthUser } from '../types';
import { authService } from '../services/authService';

interface AuthCtx {
  user: AuthUser | null;
  token: string | null;
  isRoot: boolean;
  login: (pin: string, adminToken?: string) => Promise<void>;
  setSession: (token: string, user: AuthUser) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]   = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Restaura sessão do localStorage
  useEffect(() => {
    const t = localStorage.getItem('token');
    const u = localStorage.getItem('user');
    if (t && u) {
      try {
        setToken(t);
        setUser(JSON.parse(u));
      } catch { /* ignore */ }
    }
    setLoading(false);
  }, []);

  const setSession = (t: string, u: AuthUser) => {
    localStorage.setItem('token', t);
    localStorage.setItem('user', JSON.stringify(u));
    setToken(t);
    setUser(u);
  };

  const login = async (pin: string, adminToken?: string) => {
    const result = await authService.login(pin, adminToken);
    // Só persiste sessão se o status for 'ok' (root entra direto)
    if (result.status === 'ok' && result.token && result.user) {
      setSession(result.token, result.user as AuthUser);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const isRoot = user?.role === 'ROOT';

  return (
    <AuthContext.Provider value={{ user, token, isRoot, login, setSession, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthCtx {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
