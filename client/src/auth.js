import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

const AuthContext = createContext(null);

const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  const refreshAuth = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/checkforUser`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (res.status === 401) {
        setUser(null);
        return null;
      }

      if (!res.ok) {
        throw new Error('Unable to verify session');
      }

      const data = await res.json();
      setUser(data.user || null);

      return data.user || null;
    } catch (error) {
      console.log(error);
      setUser(null);
      return null;
    } finally {
      setInitializing(false);
    }
  }, []);

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  const login = useCallback(async ({ userName, password }) => {
    const res = await fetch(`${BACKEND_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ userName, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Invalid credentials');
    }

    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(async () => {
    await fetch(`${BACKEND_URL}/logout`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    setUser(null);
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