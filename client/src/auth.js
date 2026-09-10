import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

const AuthContext = createContext(null);

import { BACKEND_URL } from './config';

const USER_STORAGE_KEY = 'syncode_user';
const TOKEN_STORAGE_KEY = 'syncode_token';

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

const getStoredToken = () => {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY) || '';
  } catch (e) {
    return '';
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getStoredUser());
  const [initializing, setInitializing] = useState(() => !getStoredUser());

  const refreshAuth = useCallback(async () => {
    const token = getStoredToken();

    try {
      const headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${BACKEND_URL}/checkforUser`, {
        method: 'GET',
        headers,
        credentials: 'include',
      });

      if (res.status === 401) {
        localStorage.removeItem(USER_STORAGE_KEY);
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        setUser(null);
        return null;
      }

      if (!res.ok) {
        throw new Error('Unable to verify session');
      }

      const data = await res.json();
      const verifiedUser = data.user || null;

      if (verifiedUser) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(verifiedUser));
        setUser(verifiedUser);
      }

      return verifiedUser;
    } catch (error) {
      console.log('Auth check note:', error.message || error);
      // On network failure, retain offline cached user if token exists
      const cached = getStoredUser();
      if (cached && token) {
        setUser(cached);
        return cached;
      }
      return null;
    } finally {
      setInitializing(false);
    }
  }, []);

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  const login = useCallback(async (credentials) => {
    const identifier =
      typeof credentials === 'string'
        ? credentials
        : credentials.identifier || credentials.userName || credentials.email || '';
    const password = credentials.password;

    const res = await fetch(`${BACKEND_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ identifier, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Invalid credentials');
    }

    if (data.token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
    }

    if (data.user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
    }

    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(async () => {
    const token = getStoredToken();
    try {
      const headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      await fetch(`${BACKEND_URL}/logout`, {
        method: 'GET',
        headers,
        credentials: 'include',
      });
    } catch (error) {
      console.log('Logout error:', error);
    } finally {
      localStorage.removeItem(USER_STORAGE_KEY);
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      setUser(null);
    }
  }, []);

  return React.createElement(
    AuthContext.Provider,
    {
      value: {
        user,
        initializing,
        isAuthenticated: Boolean(user),
        login,
        logout,
        refreshAuth,
      },
    },
    children
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
};