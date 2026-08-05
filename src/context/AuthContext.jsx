import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { initStorage, login as doLogin, logout as doLogout, getSession } from '../utils/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initStorage();
    setUser(getSession());
    setLoading(false);
  }, []);

  const login = useCallback((email, password) => {
    const session = doLogin(email, password);
    if (session) setUser(session);
    return session;
  }, []);

  const logout = useCallback(() => {
    doLogout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
