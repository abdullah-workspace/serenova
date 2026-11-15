import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import * as authApi from '../api/auth.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [state, setState] = useState({ user: null, patient: null, loading: true });
  const initializing = useRef(true);
  const authActionInProgress = useRef(false);

  async function refresh() {
    try {
      const data = await authApi.getMe();
      setState({ ...data, loading: false });
      return data;
    } catch (error) {
      if (error.status !== 401) throw error;
      setState({ user: null, patient: null, loading: false });
      return null;
    }
  }

  useEffect(() => {
    authApi.getMe()
      .then((data) => {
        if (initializing.current && !authActionInProgress.current) setState({ ...data, loading: false });
      })
      .catch(() => {
        if (initializing.current && !authActionInProgress.current) setState({ user: null, patient: null, loading: false });
      })
      .finally(() => { initializing.current = false; });
  }, []);

  async function login(input) {
    authActionInProgress.current = true;
    try {
      const data = await authApi.login(input);
      setState({ ...data, loading: false });
      return data;
    } finally {
      authActionInProgress.current = false;
    }
  }

  async function register(input) {
    authActionInProgress.current = true;
    try {
      const data = await authApi.register(input);
      setState({ ...data, loading: false });
      return data;
    } finally {
      authActionInProgress.current = false;
    }
  }

  async function logout() {
    await authApi.logout();
    setState({ user: null, patient: null, loading: false });
  }

  const value = useMemo(() => ({ ...state, login, register, logout, refresh }), [state]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
