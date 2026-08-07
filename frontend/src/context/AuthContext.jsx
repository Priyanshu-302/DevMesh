import { createContext, useEffect, useState, useCallback } from 'react';
import { authApi } from '../api/authApi';
import { registerUnauthorizedHandler } from '../api/axiosClient';
import { disconnectSocket } from '../sockets/socketClient';

export const AuthContext = createContext(null);
const TOKEN_KEY = 'devmesh_token';

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    disconnectSocket();
  }, []);

  useEffect(() => { registerUnauthorizedHandler(logout); }, [logout]);

  useEffect(() => {
    if (token) {
      setLoading(true);
      authApi.getProfile()
        .then(res => {
          setUser(res.data);
        })
        .catch(err => {
          console.error("Failed to restore user from token:", err);
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token, logout]);

  const login = async (credentials) => {
    const { data } = await authApi.login(credentials);
    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const signup = async (payload) => {
    const { data } = await authApi.signup(payload);
    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  return (
    <AuthContext.Provider value={{ user, setUser, token, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
