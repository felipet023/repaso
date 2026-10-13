import { createContext, useEffect, useMemo, useState } from 'react';
import * as authService from '../services/auth.service';
import { clearSession, getToken, getUser, saveSession } from '../utils/storage';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(getToken());
  const [user, setUser] = useState(getUser());
  const [loadingSession, setLoadingSession] = useState(Boolean(token));

  // Verifica la sesión al cargar: detecta tokens expirados o cuentas desactivadas
  useEffect(() => {
    if (!token) {
      setLoadingSession(false);
      return;
    }
    authService
      .me()
      .then((result) => {
        setUser(result.user);
        saveSession(token, result.user);
      })
      .catch(() => {
        clearSession();
        setToken(null);
        setUser(null);
      })
      .finally(() => setLoadingSession(false));
    // Solo al montar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function login(credentials) {
    const result = await authService.login(credentials);
    saveSession(result.token, result.user);
    setToken(result.token);
    setUser(result.user);
  }

  async function register(data) {
    const result = await authService.register(data);
    saveSession(result.token, result.user);
    setToken(result.token);
    setUser(result.user);
  }

  function logout() {
    clearSession();
    setToken(null);
    setUser(null);
  }

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      isAdmin: user?.rol === 'admin',
      loadingSession,
      login,
      logout,
      register
    }),
    [token, user, loadingSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
