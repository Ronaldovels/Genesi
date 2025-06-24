import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
}

interface Account {
  _id: string;
  name: string;
  balance: number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  accounts: Account[];
  selectedAccount: Account | null;
  login: (userData: User, token: string) => void;
  logout: () => void;
  setAccounts: (accounts: Account[]) => void;
  setSelectedAccount: (account: Account | null) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

const API_BASE_URL = import.meta.env.VITE_URL;

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      setUser(null);
      setAccounts([]);
      setSelectedAccount(null);
      localStorage.removeItem('user');
    }
  }, [token]);

  const login = (userData: User, userToken: string) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userToken);
    setUser(userData);
    setToken(userToken);
    navigate('/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
    setAccounts([]);
    setSelectedAccount(null);
    navigate('/login');
  };

  const value = {
    isAuthenticated: !!token,
    user,
    token,
    accounts,
    selectedAccount,
    login,
    logout,
    setAccounts,
    setSelectedAccount
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
