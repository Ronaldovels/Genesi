import React, { useEffect, useState, useCallback, useContext } from 'react';
import { PlusCircle, Pencil, ArrowUpCircle, ArrowDownCircle, DollarSign, PiggyBank, TrendingUp, TrendingDown } from 'lucide-react';
import MetricCard from '../components/MetricCard';
import { AuthContext } from '../contexts/AuthContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectSeparator } from "@/components/ui/select";
import { TransactionModal } from '../components/TransactionModal';
import { AccountModal } from '../components/AccountModal';
import { InvestmentModal } from '../components/InvestmentModal';
import { toast } from 'sonner';
import axios from 'axios'
import { Dialog } from '@headlessui/react';
import { parseISO } from 'date-fns';

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

interface UserCategory {
  _id: string;
  name: string;
}

interface InvestmentAccount {
  _id: string;
  name: string;
  totalValue: number;
}

const Dashboard = () => {
  const { user, accounts, selectedAccount, setAccounts, setSelectedAccount } = useContext(AuthContext);
  
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const [entradas, setEntradas] = useState(0);
  const [saidas, setSaidas] = useState(0);
  const [saldo, setSaldo] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<'entrada' | 'saida'>('entrada');
  
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [userCategories, setUserCategories] = useState<UserCategory[]>([]);
  
  const [isInvestmentModalOpen, setIsInvestmentModalOpen] = useState(false);
  const [investmentAccounts, setInvestmentAccounts] = useState<InvestmentAccount[]>([]);

  // Estado do modal de extrato
  const [extractModalOpen, setExtractModalOpen] = useState(false);
  const [extractType, setExtractType] = useState<'entrada' | 'saida' | 'investimento' | null>(null);
  const [extractData, setExtractData] = useState<any[]>([]);
  const [extractOrder, setExtractOrder] = useState<'desc' | 'asc'>('desc');
  const [extractLoading, setExtractLoading] = useState(false);
  const [extractPrevData, setExtractPrevData] = useState<any[]>([]);

  // Garantir que a primeira conta seja selecionada ao carregar
  useEffect(() => {
    if (accounts && accounts.length > 0 && !selectedAccount) {
      setSelectedAccount(accounts[0]);
    }
  }, [accounts, selectedAccount, setSelectedAccount]);

  // Lógica para buscar as contas do usuário
  useEffect(() => {
    const fetchAccounts = async () => {
      if (user?.id) {
        try {
          const response = await axios.get(`${API_BASE_URL}/api/accounts/${user.id}`);
          if (Array.isArray(response.data)) {
            setAccounts(response.data);
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
  }, [user?.id, setAccounts]);

  // Lógica para buscar as categorias do usuário
  useEffect(() => {
    const fetchUserCategories = async () => {
      if (user?.id) {
        try {
          const response = await axios.get(`${API_BASE_URL}/api/categories/user/${user.id}`);
          setUserCategories(response.data);
        } catch (error) {
          console.error("Erro ao buscar categorias do usuário", error);
        }
      }
    };
    fetchUserCategories();
  }, [user?.id]);
  
  // Lógica para buscar as contas de INVESTIMENTO do usuário
  useEffect(() => {
    const fetchInvestmentAccounts = async () => {
      if (user?.id) {
        try {
          const response = await axios.get(`${API_BASE_URL}/api/investment/accounts/${user.id}`);
          setInvestmentAccounts(response.data);
        } catch (error) {
          console.error("Erro ao buscar contas de investimento:", error);
        }
      }
    };
    fetchInvestmentAccounts();
  }, [user?.id]);


  // Lógica para buscar dados financeiros
  const fetchFinancialData = useCallback(async () => {
    if (selectedAccount?._id && selectedMonth && selectedYear) {
      try {
        const summaryRes = await axios.get(`${API_BASE_URL}/api/finance/summary/${selectedAccount._id}`, {
          params: { month: selectedMonth, year: selectedYear },
        });
        setEntradas(summaryRes.data.entradas);
        setSaidas(summaryRes.data.saidas);
        setSaldo(summaryRes.data.saldoTotal);

        const transactionsRes = await axios.get(`${API_BASE_URL}/api/finance/transactions/${selectedAccount._id}`);
        setTransactions(transactionsRes.data);
      } catch (error) {
        console.error("Erro ao buscar resumo financeiro e transações:", error);
        toast.error("Não foi possível carregar os dados financeiros da conta selecionada.");
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
  const handleTransactionSubmit = async (data: { value: number; description: string; categoryId?: string }) => {
    if (!selectedAccount?._id) {
      toast.error('Por favor, selecione uma conta primeiro.');
      return;
    }
    try {
      const payload = { accountId: selectedAccount._id, type: transactionType, ...data };
      await axios.post(`${API_BASE_URL}/api/finance/transaction`, payload);
      toast.success(`Sua ${transactionType} foi registrada!`);
      setIsTransactionModalOpen(false);
      fetchFinancialData();
    } catch (error) {
      toast.error('Houve um erro ao registrar a transação.');
    }
  };

  // Funções de Gerenciamento de Contas
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

  // Funções para controlar o modal de investimento
  const handleOpenInvestmentModal = () => {
    if (investmentAccounts.length === 0) {
      toast.info("Você ainda não tem uma carteira de investimentos.", {
        description: "Acesse a página de Investimentos para mais detalhes.",
      });
      return;
    }
    setIsInvestmentModalOpen(true);
  };
  const handleInvestmentSubmit = async (data: any) => {
    try {
      await axios.post(`${API_BASE_URL}/api/investment`, data);
      toast.success(`Investimento "${data.name}" registrado com sucesso!`);
      setIsInvestmentModalOpen(false);
      // No futuro, podemos chamar uma função para atualizar o card de investimentos
    } catch (error) {
      toast.error("Ocorreu um erro ao registrar seu investimento.");
    }
  };

  // NOVO: Calcula o total investido usando useMemo para otimização
  const totalInvested = React.useMemo(() => {
    if (!investmentAccounts || investmentAccounts.length === 0) {
      return 0;
    }
    // A API que busca as contas precisa retornar o campo 'totalValue' em cada conta
    return investmentAccounts.reduce((sum, account) => sum + (account.totalValue || 0), 0);
  }, [investmentAccounts]);
  
  const metrics = [
    { title: 'Entradas', value: `R$ ${(entradas || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: ArrowUpCircle, color: 'text-green-400', change: '+0%', trend: 'up' as const },
    { title: 'Saídas', value: `R$ ${(saidas || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: ArrowDownCircle, color: 'text-red-400', change: '0%', trend: 'down' as const },
    { title: 'Saldo Atual', value: `R$ ${(saldo || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: DollarSign, color: 'text-blue-400', change: '+0%', trend: 'up' as const },
     { title: 'Investimentos', value: `R$ ${(totalInvested || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: PiggyBank, color: 'text-purple-400', change: '+0%', trend: 'up' as const }
  ];

  // Função para abrir modal de extrato
  const handleOpenExtractModal = async (type: 'entrada' | 'saida' | 'investimento') => {
    setExtractType(type);
    setExtractModalOpen(true);
    setExtractLoading(true);
    let url = '';
    if (type === 'investimento') {
      url = `${API_BASE_URL}/api/investment/${selectedAccount?._id}`;
    } else {
      url = `${API_BASE_URL}/api/finance/transactions/${selectedAccount?._id}`;
    }
    try {
      // Dados do mês atual
      const res = await axios.get(url, { params: { month: selectedMonth, year: selectedYear } });
      let data = res.data;
      if (type !== 'investimento') {
        data = data.filter((tx: any) => tx.type === type);
      }
      setExtractData(data);
      // Dados do mês anterior
      let prevMonth = selectedMonth - 1;
      let prevYear = selectedYear;
      if (prevMonth < 1) { prevMonth = 12; prevYear -= 1; }
      const resPrev = await axios.get(url, { params: { month: prevMonth, year: prevYear } });
      let prevData = resPrev.data;
      if (type !== 'investimento') {
        prevData = prevData.filter((tx: any) => tx.type === type);
      }
      setExtractPrevData(prevData);
    } catch (e) {
      setExtractData([]);
      setExtractPrevData([]);
    } finally {
      setExtractLoading(false);
    }
  };

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
          <Select value={String(selectedMonth)} onValueChange={(val) => setSelectedMonth(Number(val))}>
            <SelectTrigger className="w-[140px] bg-slate-900/50 border-white/10">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                <SelectItem key={month} value={String(month)}>{new Date(0, month - 1).toLocaleString('pt-BR', { month: 'long' })}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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
            onClick={
              metric.title === 'Entradas' ? () => handleOpenExtractModal('entrada') :
              metric.title === 'Saídas' ? () => handleOpenExtractModal('saida') :
              metric.title === 'Investimentos' ? () => handleOpenExtractModal('investimento') :
              undefined
            }
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
          <button 
            onClick={handleOpenInvestmentModal}
            className="genesi-button bg-genesi-purple hover:bg-purple-600 text-sm sm:text-base py-2 sm:py-3 sm:col-span-2 lg:col-span-1"
          >
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
        categories={userCategories}
      />
      {selectedAccount && (
        <AccountModal 
          isOpen={isAccountModalOpen}
          onClose={() => setIsAccountModalOpen(false)}
          onSubmit={handleUpdateAccountName}
          accountName={selectedAccount.name}
        />
      )}
      <InvestmentModal 
        isOpen={isInvestmentModalOpen}
        onClose={() => setIsInvestmentModalOpen(false)}
        onSubmit={handleInvestmentSubmit}
        investmentAccounts={investmentAccounts}
      />

      {/* Modal de Extrato */}
      <Dialog open={extractModalOpen} onClose={() => setExtractModalOpen(false)} className="fixed z-50 inset-0 flex items-center justify-center">
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
        <div className="relative bg-[#181f2a] rounded-lg shadow-2xl p-6 w-full max-w-2xl mx-auto z-10" style={{ boxShadow: '0 0 32px 0 rgba(37, 99, 235, 0.5)' }}>
          <Dialog.Title className="text-xl font-bold text-white mb-2 flex items-center justify-between">
            {extractType === 'entrada' && 'Entradas'}
            {extractType === 'saida' && 'Saídas'}
            {extractType === 'investimento' && 'Investimentos'}
            <button onClick={() => setExtractModalOpen(false)} className="text-white/60 hover:text-red-400 text-lg ml-2">×</button>
          </Dialog.Title>
          <div className="flex items-center justify-between mb-4">
            <span className="text-white/60 text-sm">{selectedMonth}/{selectedYear}</span>
            <select
              className="bg-slate-800 text-white/80 rounded px-2 py-1 text-sm border border-white/10"
              value={extractOrder}
              onChange={e => setExtractOrder(e.target.value as 'desc' | 'asc')}
            >
              <option value="desc">Mais recentes primeiro</option>
              <option value="asc">Mais antigas primeiro</option>
            </select>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {extractLoading ? (
              <div className="text-white/60 py-8 text-center">Carregando...</div>
            ) : (
              <>
                {/* Extrato do mês atual */}
                {(() => {
                  // Filtrar por mês/ano selecionado
                  const filtered = extractData.filter((item: any) => {
                    const d = parseISO(item.date);
                    return d.getMonth() + 1 === selectedMonth && d.getFullYear() === selectedYear;
                  });
                  if (filtered.length === 0) {
                    return <div className="text-white/60 py-8 text-center">Nenhum registro encontrado.</div>;
                  }
                  return (
                    <ul className="divide-y divide-white/10 mb-8">
                      {[...filtered].sort((a, b) => {
                        if (extractOrder === 'desc') {
                          return new Date(b.date).getTime() - new Date(a.date).getTime();
                        } else {
                          return new Date(a.date).getTime() - new Date(b.date).getTime();
                        }
                      }).map((item: any) => (
                        <li key={item._id} className="py-3 flex items-center gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-white text-base">
                                {extractType === 'investimento' ? item.name : item.description}
                              </span>
                              <span className="text-xs text-white/40">{new Date(item.date).toLocaleDateString()}</span>
                            </div>
                            {extractType === 'investimento' && (
                              <div className="text-white/60 text-xs">{item.type}</div>
                            )}
                          </div>
                          <div className={`font-bold text-lg ${extractType === 'entrada' ? 'text-green-400' : extractType === 'saida' ? 'text-red-400' : 'text-purple-400'}`}>
                            {extractType === 'entrada' ? '+' : extractType === 'saida' ? '-' : ''} R$ {item.value ? item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : (item.totalValue ? item.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '')}
                          </div>
                        </li>
                      ))}
                    </ul>
                  );
                })()}
                {/* Seção do mês anterior */}
                {(() => {
                  // Filtrar por mês anterior
                  let prevMonth = selectedMonth - 1;
                  let prevYear = selectedYear;
                  if (prevMonth < 1) { prevMonth = 12; prevYear -= 1; }
                  const filteredPrev = extractPrevData.filter((item: any) => {
                    const d = parseISO(item.date);
                    return d.getMonth() + 1 === prevMonth && d.getFullYear() === prevYear;
                  });
                  if (filteredPrev.length === 0) return null;
                  return (
                    <>
                      <div className="mt-2 mb-2 border-t border-white/10 pt-4 text-white/70 font-semibold bg-[#1e293b]/30 rounded px-2">
                        {extractType === 'entrada' && 'Entradas do mês passado'}
                        {extractType === 'saida' && 'Saídas do mês passado'}
                        {extractType === 'investimento' && 'Investimentos do mês passado'}
                      </div>
                      <ul className="divide-y divide-white/10">
                        {[...filteredPrev].sort((a, b) => {
                          if (extractOrder === 'desc') {
                            return new Date(b.date).getTime() - new Date(a.date).getTime();
                          } else {
                            return new Date(a.date).getTime() - new Date(b.date).getTime();
                          }
                        }).map((item: any) => (
                          <li key={item._id} className="py-3 flex items-center gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-white text-base">
                                  {extractType === 'investimento' ? item.name : item.description}
                                </span>
                                <span className="text-xs text-white/40">{new Date(item.date).toLocaleDateString()}</span>
                              </div>
                              {extractType === 'investimento' && (
                                <div className="text-white/60 text-xs">{item.type}</div>
                              )}
                            </div>
                            <div className={`font-bold text-lg ${extractType === 'entrada' ? 'text-green-400' : extractType === 'saida' ? 'text-red-400' : 'text-purple-400'}`}>
                              {extractType === 'entrada' ? '+' : extractType === 'saida' ? '-' : ''} R$ {item.value ? item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : (item.totalValue ? item.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '')}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </>
                  );
                })()}
              </>
            )}
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default Dashboard;