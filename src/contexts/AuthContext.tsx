<<<<<<< HEAD
import React, { createContext, useContext, useState, ReactNode } from 'react';
import axios from 'axios';
import { User } from '../types';
import { useToast } from '../hooks/use-toast';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, setIsLoading: (loading: boolean) => void) => Promise<boolean>;
  register: (name: string, email: string, password: string, whatsapp: string, setIsLoading: (loading: boolean) => void) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
=======
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
>>>>>>> 3658fd0 (Atualizado)

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

<<<<<<< HEAD
const API_URL = import.meta.env.VITE_API_URL;

console.log('[AuthContext] API_URL utilizada:', API_URL);

=======
>>>>>>> 3658fd0 (Atualizado)
interface AuthProviderProps {
  children: ReactNode;
}

<<<<<<< HEAD
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const { toast } = useToast();

  // Salva o usuário no localStorage sempre que mudar
  const setUser = (user: User | null) => {
    setUserState(user);
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  };

  const login = async (email: string, password: string, setIsLoading: (loading: boolean) => void): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, { email, password });
      
      if (response.status === 200 && response.data.user) {
        setUser({
          id: response.data.user.id,
          name: response.data.user.name,
          email: response.data.user.email,
          whatsapp: response.data.user.whatsapp
        });
        toast({
          title: "Sucesso!",
          description: "Login realizado com sucesso.",
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      toast({
        title: "Erro",
        description: "Email ou senha incorretos.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, whatsapp: string, setIsLoading: (loading: boolean) => void): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, {
        name,
        email,
        password,
        whatsapp,
      });

      if (response.status === 201) {
        toast({
          title: "Sucesso!",
          description: "Sua conta foi criada com sucesso.",
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro no registro:', error);
      toast({
        title: "Erro no Cadastro",
        description: "Não foi possível criar a conta. Verifique os dados ou tente um email diferente.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
=======
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
>>>>>>> 3658fd0 (Atualizado)
};
