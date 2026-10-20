import React, { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '../services/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  register: (dados: { nome: string; email: string; senha: string; avatarUrl?: string }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token_clube_do_album'));
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token_clube_do_album');
      if (storedToken) {
        try {
          const me = await authApi.getMe();
          setUser(me);
        } catch {
          // Token expirado ou inválido
          localStorage.removeItem('token_clube_do_album');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, senha: string) => {
    const data = await authApi.login(email, senha);
    localStorage.setItem('token_clube_do_album', data.token);
    setToken(data.token);
    setUser(data.usuario);
  };

  const register = async (dados: { nome: string; email: string; senha: string; avatarUrl?: string }) => {
    const data = await authApi.register(dados);
    localStorage.setItem('token_clube_do_album', data.token);
    setToken(data.token);
    setUser(data.usuario);
  };

  const logout = () => {
    localStorage.removeItem('token_clube_do_album');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const me = await authApi.getMe();
      setUser(me);
    } catch {
      logout();
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de um AuthProvider');
  }
  return context;
};
