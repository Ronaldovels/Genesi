// src/contexts/AuthContext.tsx

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner'; // Adicione a importação do toast para feedback

// --- Interfaces ---
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

// ✨ NOVAS INTERFACES (movidas do Dashboard para cá)
interface InvestmentAccount {
  _id: string;
  name:string;
  totalValue: number;
}

interface UserCategory {
  _id: string;
  name: string;
}


// --- Tipo do Contexto ---
interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean; // ✨ NOVO: Estado de carregamento global
  accounts: Account[];
  selectedAccount: Account | null;
  investmentAccounts: InvestmentAccount[]; // ✨ NOVO
  userCategories: UserCategory[]; // ✨ NOVO
  login: (userData: User, token: string) => void;
  logout: () => void;
  setAccounts: (accounts: Account[]) => void;
  setSelectedAccount: (account: Account | null) => void;
  // ✨ NOVOS SETTERS (opcional, mas bom para consistência)
  setInvestmentAccounts: (accounts: InvestmentAccount[]) => void;
  setUserCategories: (categories: UserCategory[]) => void;
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
  // --- Estados do Contexto ---
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true); // ✨ NOVO: Inicia como true
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [investmentAccounts, setInvestmentAccounts] = useState<InvestmentAccount[]>([]); // ✨ NOVO
  const [userCategories, setUserCategories] = useState<UserCategory[]>([]); // ✨ NOVO
  
  const navigate = useNavigate();

  // 🚀 LÓGICA CENTRALIZADA PARA BUSCAR DADOS GLOBAIS 🚀
  useEffect(() => {
    // Se não há usuário ou token, não faz nada e para de carregar.
    if (!user?.id || !token) {
      setLoading(false);
      return;
    }

    const fetchAllData = async () => {
      setLoading(true); // Inicia o carregamento
      try {
        // Faz todas as chamadas essenciais em paralelo para mais performance
        const [accountsRes, investmentAccountsRes, categoriesRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/accounts/${user.id}`),
          axios.get(`${API_BASE_URL}/api/investment/accounts/${user.id}`),
          axios.get(`${API_BASE_URL}/api/categories/user/${user.id}`)
        ]);

        const mainAccounts = Array.isArray(accountsRes.data) ? accountsRes.data : [];
        
        // Atualiza todos os estados do contexto
        setAccounts(mainAccounts);
        setInvestmentAccounts(investmentAccountsRes.data);
        setUserCategories(categoriesRes.data);

        // Lógica inteligente para selecionar a conta principal
        if (mainAccounts.length > 0) {
          // Se já existe uma conta selecionada e ela ainda está na lista, mantém
          const currentSelectionIsValid = selectedAccount && mainAccounts.some(acc => acc._id === selectedAccount._id);
          if (!currentSelectionIsValid) {
            // Se não, seleciona a primeira da lista
            setSelectedAccount(mainAccounts[0]);
          }
        } else {
            setSelectedAccount(null);
        }

      } catch (err) {
        console.error("Erro ao carregar dados essenciais da aplicação:", err);
        toast.error("Erro ao sincronizar dados. Verifique sua conexão.");
        // Em caso de erro, pode ser uma boa ideia deslogar o usuário se o token for inválido
        // logout(); 
      } finally {
        setLoading(false); // Finaliza o carregamento
      }
    };

    fetchAllData();
  }, [user, token]); // Roda sempre que o usuário ou token mudarem


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
    setInvestmentAccounts([]); // Limpa todos os dados
    setUserCategories([]);   // Limpa todos os dados
    navigate('/login');
  };

  // --- Valor final do Contexto ---
  const value = {
    isAuthenticated: !!token,
    user,
    token,
    loading, // ✨ NOVO
    accounts,
    selectedAccount,
    investmentAccounts, // ✨ NOVO
    userCategories, // ✨ NOVO
    login,
    logout,
    setAccounts,
    setSelectedAccount,
    setInvestmentAccounts, // ✨ NOVO
    setUserCategories,   // ✨ NOVO
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};