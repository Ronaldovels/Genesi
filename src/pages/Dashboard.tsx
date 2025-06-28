import React, { useEffect, useState, useCallback } from 'react';
import { PlusCircle, Pencil, ArrowUpCircle, ArrowDownCircle, DollarSign, PiggyBank, TrendingUp, TrendingDown } from 'lucide-react';
import MetricCard from '../components/MetricCard';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectSeparator } from "@/components/ui/select";
import { TransactionModal } from '../components/TransactionModal';
import { AccountModal } from '../components/AccountModal';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_URL;

interface Account {
  _id: string;
  name: string;
  balance: number;
}

interface Transaction {
  _id: string;
  type: 'entrada' | 'saida';
  value: number;
  description: string;
  date: string;
}

const Dashboard = () => {
  const { user, accounts, selectedAccount, setAccounts, setSelectedAccount } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const [entradas, setEntradas] = useState(0);
  const [saidas, setSaidas] = useState(0);
  const [saldo, setSaldo] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Estados do Modal de Transação
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<'entrada' | 'saida'>('entrada');
  
  // Estado para o Modal de Edição de Conta
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  
  // Lógica para buscar as contas do usuário
  useEffect(() => {
    const fetchAccounts = async () => {
      if (user?.id && accounts.length === 0) {
        try {
          const response = await axios.get(`${API_BASE_URL}/api/accounts/${user.id}`, {
            headers: { 'ngrok-skip-browser-warning': 'true' }
          });
          
          if (Array.isArray(response.data)) {
            setAccounts(response.data);
            if (response.data.length > 0 && !selectedAccount) {
              setSelectedAccount(response.data[0]);
            }
          } else {
            setAccounts([]);
          }
        } catch (error) {
          console.error("Erro ao buscar contas:", error);
          setAccounts([]);
        }
      }
    };
    fetchAccounts();
  }, [user?.id, accounts.length, setAccounts, selectedAccount, setSelectedAccount]);

  // Lógica para buscar dados financeiros
  const fetchFinancialData = useCallback(async () => {
    if (selectedAccount?._id && selectedMonth && selectedYear) {
      try {
        const summaryRes = await axios.get(`${API_BASE_URL}/api/finance/summary/${selectedAccount._id}`, {
          params: { month: selectedMonth, year: selectedYear },
          headers: { 'ngrok-skip-browser-warning': 'true' }
        });
        setEntradas(summaryRes.data.entradas);
        setSaidas(summaryRes.data.saidas);
        setSaldo(summaryRes.data.saldoTotal);

        const transactionsRes = await axios.get(`${API_BASE_URL}/api/finance/transactions/${selectedAccount._id}`, {
          headers: { 'ngrok-skip-browser-warning': 'true' }
        });
        setTransactions(transactionsRes.data);
      } catch (error) {
        console.error("Erro ao buscar resumo financeiro e transações:", error);
        setEntradas(0);
        setSaidas(0);
        setSaldo(0);
        setTransactions([]);
      }
    }
  }, [selectedAccount, selectedMonth, selectedYear]);

  useEffect(() => {
    fetchFinancialData();
  }, [fetchFinancialData]);

  // Funções do Modal de Transação
  const handleOpenTransactionModal = (type: 'entrada' | 'saida') => {
    setTransactionType(type);
    setIsTransactionModalOpen(true);
  };
  const handleTransactionSubmit = async (data: { value: number; description: string }) => {
    if (!selectedAccount?._id) {
      toast.error('Por favor, selecione uma conta primeiro.');
      return;
    }
    try {
      const payload = {
        accountId: selectedAccount._id,
        type: transactionType,
        value: data.value,
        description: data.description,
      };
      
      await axios.post(`${API_BASE_URL}/api/finance/transaction`, payload);
      
      toast.success(`Sua ${transactionType === 'entrada' ? 'receita' : 'despesa'} foi registrada!`);
      setIsTransactionModalOpen(false);
      fetchFinancialData();
      
    } catch (error) {
      console.error('Erro ao registrar transação:', error);
      toast.error('Houve um erro ao registrar. Tente novamente.');
    }
  };

  // --- LÓGICA PARA GERENCIAR CONTAS ---

  const handleCreateAccount = async () => {
    if (!user?.id) return;
    try {
      const response = await axios.post(`${API_BASE_URL}/api/accounts`, { userId: user.id });
      const newAccount = response.data;
      setAccounts([...accounts, newAccount]);
      setSelectedAccount(newAccount);
      toast.success(`'${newAccount.name}' criada com sucesso!`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao criar conta.");
    }
  };
  
  const handleUpdateAccountName = async (newName: string) => {
    if (!selectedAccount) return;
    try {
      const response = await axios.put(`${API_BASE_URL}/api/accounts/${selectedAccount._id}`, { name: newName });
      const updatedAccount = response.data;

      const updatedAccounts = accounts.map(acc => acc._id === updatedAccount._id ? updatedAccount : acc);
      setAccounts(updatedAccounts);
      
      setSelectedAccount(updatedAccount);

      toast.success("Nome da conta atualizado!");
      setIsAccountModalOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao editar nome.");
    }
  };

  const handleAccountChange = (accountId: string) => {
    if (accountId === 'create_new') {
      handleCreateAccount();
      return;
    }
    const account = accounts.find(acc => acc._id === accountId);
    if (account) setSelectedAccount(account);
  };
  
  const metrics = [
    {
      title: 'Entradas',
      value: `R$ ${(entradas || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      change: '+0%',
      trend: 'up' as const,
      icon: ArrowUpCircle,
      color: 'text-green-400'
    },
    {
      title: 'Saídas',
      value: `R$ ${(saidas || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      change: '0%',
      trend: 'down' as const,
      icon: ArrowDownCircle,
      color: 'text-red-400'
    },
    {
      title: 'Saldo Atual',
      value: `R$ ${(saldo || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      change: '+0%',
      trend: 'up' as const,
      icon: DollarSign,
      color: 'text-blue-400'
    },
    {
      title: 'Investimentos',
      value: 'R$ 0,00',
      change: '+0%',
      trend: 'up' as const,
      icon: PiggyBank,
      color: 'text-purple-400'
    }
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Olá, {user?.name || 'Usuário'}!
          </h1>
          <p className="text-white/60 text-sm sm:text-base">Aqui está o resumo da sua conta.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Seletor de Mês */}
          <Select value={String(selectedMonth)} onValueChange={(val) => setSelectedMonth(Number(val))}>
            <SelectTrigger className="w-[140px] bg-slate-900/50 border-white/10">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                <SelectItem key={month} value={String(month)}>{new Date(0, month - 1).toLocaleString('default', { month: 'long' })}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* Seletor de Ano */}
          <Select value={String(selectedYear)} onValueChange={(val) => setSelectedYear(Number(val))}>
            <SelectTrigger className="w-[100px] bg-slate-900/50 border-white/10">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <SelectItem key={year} value={String(year)}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {/* Seletor de Conta */}
          <Select value={selectedAccount?._id || ''} onValueChange={handleAccountChange}>
            <SelectTrigger className="w-[180px] bg-slate-900/50 border-white/10">
              <SelectValue placeholder="Selecione a conta">
                {selectedAccount ? selectedAccount.name : "Selecione a conta"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {accounts.map((account) => (
                <SelectItem key={account._id} value={account._id}>
                  {account.name}
                </SelectItem>
              ))}
              {accounts.length < 10 && (
                <>
                  <SelectSeparator />
                  <SelectItem value="create_new" className="text-genesi-green focus:text-genesi-green">
                    <div className="flex items-center gap-2">
                      <PlusCircle size={16} />
                      <span>Criar nova conta</span>
                    </div>
                  </SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
          <button onClick={() => setIsAccountModalOpen(true)} className="p-2 text-white/60 hover:text-white transition-colors" title="Editar nome da conta">
            <Pencil size={18} />
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {metrics.map((metric, index) => (
          <MetricCard
            key={metric.title}
            title={metric.title}
            value={metric.value}
            change={metric.change}
            trend={metric.trend}
            icon={metric.icon}
            color={metric.color}
            delay={index * 100}
          />
        ))}
      </div>

      {/* Recent Transactions */}
      <div className="genesi-card">
        <h2 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6">Últimas Transações</h2>
        <div className="space-y-4">
          {transactions.length > 0 ? (
            transactions.map((tx) => (
              <div key={tx._id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'entrada' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    {tx.type === 'entrada' ? <ArrowUpCircle size={20} /> : <ArrowDownCircle size={20} />}
                  </div>
                  <div>
                    <p className="font-medium text-white">{tx.description}</p>
                    <p className="text-sm text-white/60">{new Date(tx.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <p className={`font-semibold ${tx.type === 'entrada' ? 'text-green-400' : 'text-red-400'}`}>
                  {tx.type === 'entrada' ? '+' : '-'} R$ {tx.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            ))
          ) : (
            <p className="text-white/60 text-center py-4">Nenhuma transação encontrada neste período.</p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="genesi-card">
        <h2 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6">Ações Rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <button
            onClick={() => handleOpenTransactionModal('entrada')}
            className="genesi-button bg-genesi-green hover:bg-genesi-green-dark text-sm sm:text-base py-2 sm:py-3"
          >
            Adicionar Receita
          </button>
          <button
            onClick={() => handleOpenTransactionModal('saida')}
            className="genesi-button bg-genesi-orange hover:bg-orange-600 text-sm sm:text-base py-2 sm:py-3"
          >
            Registrar Despesa
          </button>
          <button className="genesi-button bg-genesi-purple hover:bg-purple-600 text-sm sm:text-base py-2 sm:py-3 sm:col-span-2 lg:col-span-1">
            Novo Investimento
          </button>
        </div>
      </div>
      
      {/* Modals */}
      <TransactionModal 
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        onSubmit={handleTransactionSubmit}
        type={transactionType}
      />
      {selectedAccount && (
        <AccountModal 
          isOpen={isAccountModalOpen}
          onClose={() => setIsAccountModalOpen(false)}
          onSubmit={handleUpdateAccountName}
          accountName={selectedAccount.name}
        />
      )}
    </div>
  );
};

export default Dashboard;