import React, { useState, useEffect, useContext, useCallback } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, PieLabelRenderProps } from 'recharts';
import { Plus, Trash2, AlertTriangle, Pencil } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { Skeleton } from '../components/ui/skeleton';
import { toast } from 'sonner';
import { CategoryModal } from '../components/componentsplano/CategoryModal';
import { LimitModal } from '../components/componentsplano/LimitModal';
import { CategoryProgressBar } from '../components/componentsplano/CategoryProgressBar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TransacaoProgramadaModal, TransacaoProgramadaData } from '../components/componentsplano/TransacaoProgramadaModal';


// Interfaces
interface CategoryData {
  _id: string; 
  name: string;
  value: number;
  color: string;
  limit: number;
}

interface SimpleCategory {
  _id: string;
  name: string;
  color?: string;
}

interface RechartsPayload {
  payload: CategoryData;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: RechartsPayload[];
}

// Função para gerar cores
const generateColor = (index: number): string => {
  const hue = (index * 137.508) % 360; 
  return `hsl(${hue}, 70%, 50%)`;
};

const API_BASE_URL = import.meta.env.VITE_URL;


// Função para determinar o aviso de limite
const getLimitWarning = (spent: number, limit: number) => {
    if (limit === 0) return null;
    const percentage = (spent / limit) * 100;
    if (percentage > 100) return { message: 'Limite ultrapassado', colorClass: 'text-black-500', iconColor: 'text-black-500'}
    if (percentage > 90) return { message: 'Limite CRÍTICO atingido!', colorClass: 'text-red-500 font-bold', iconColor: 'text-red-500' };
    if (percentage > 80) return { message: 'Atenção: Limite próximo', colorClass: 'text-red-400', iconColor: 'text-red-400' };
    if (percentage > 70) return { message: 'Alerta de gastos', colorClass: 'text-yellow-400', iconColor: 'text-yellow-400' };
    if (percentage > 50) return { message: 'Metade do limite atingido', colorClass: 'text-blue-400', iconColor: 'text-blue-400' };
    return null;
};

const Plano = () => {
  // Estados existentes
  const [categoriesData, setCategoriesData] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryData | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  
  // Estados para transações programadas
  const [recurringExpenses, setRecurringExpenses] = useState<(TransacaoProgramadaData & { category?: SimpleCategory })[]>([]);
  const [recurringIncomes, setRecurringIncomes] = useState<TransacaoProgramadaData[]>([]);
  const [allCategories, setAllCategories] = useState<SimpleCategory[]>([]);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<(TransacaoProgramadaData & { category?: SimpleCategory }) | null>(null);
  
  // Novos estados para UI
  const [activeTab, setActiveTab] = useState<'despesas' | 'entradas'>('despesas');
  const [modalType, setModalType] = useState<'entrada' | 'saida'>('saida');

  const authContext = useContext(AuthContext);
  if (!authContext) { throw new Error('AuthContext não foi encontrado'); }
  const { selectedAccount, user } = authContext;

  const fetchCategorySummary = useCallback(async () => {
    if (!selectedAccount) { setCategoriesData([]); return; }
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/finance/category-summary/${selectedAccount._id}`, {
        headers: { 'ngrok-skip-browser-warning': 'true' },
        params: { month: selectedMonth, year: selectedYear }
      });
      const dataWithColors: CategoryData[] = response.data.map((item: any, index: number) => ({
        _id: item._id, name: item.name, value: item.total, limit: item.limit, color: generateColor(index),
      }));
      setCategoriesData(dataWithColors);
    } catch (err) {
      console.error("Erro ao buscar resumo de categorias:", err);
      setError("Não foi possível carregar os dados de categorias.");
    }
  }, [selectedAccount, selectedMonth, selectedYear]);

  const fetchRecurringExpenses = useCallback(async () => {
    if (!selectedAccount) { setRecurringExpenses([]); return; }
    try {
        const response = await axios.get(`${API_BASE_URL}/api/recurring-expenses/account/${selectedAccount._id}`);
        setRecurringExpenses(response.data);
    } catch (err) {
        toast.error("Não foi possível carregar as despesas programadas.");
    }
  }, [selectedAccount]);

  const fetchRecurringIncomes = useCallback(async () => {
    if (!selectedAccount) { setRecurringIncomes([]); return; }
    try {
        const response = await axios.get(`${API_BASE_URL}/api/recurring-incomes/account/${selectedAccount._id}`);
        setRecurringIncomes(response.data);
    } catch (err) {
        toast.error("Não foi possível carregar as entradas programadas.");
    }
  }, [selectedAccount]);

  const fetchAllUserCategories = useCallback(async () => {
    if (!user) { setAllCategories([]); return; }
    try {
        const response = await axios.get(`${API_BASE_URL}/api/categories/user/${user.id}`);
        setAllCategories(response.data);
    } catch (err) {
        console.error("Erro ao buscar a lista de categorias:", err);
        toast.error("Não foi possível carregar suas categorias.");
    }
  }, [user]);

  useEffect(() => {
    const fetchAllData = async () => {
        if (!selectedAccount || !user) { setLoading(false); return; }
        setLoading(true);
        await Promise.all([
            fetchCategorySummary(),
            fetchRecurringExpenses(),
            fetchRecurringIncomes(),
            fetchAllUserCategories()
        ]);
        setLoading(false);
    };
    fetchAllData();
  }, [fetchCategorySummary, fetchRecurringExpenses, fetchRecurringIncomes, fetchAllUserCategories, selectedAccount, user]);

  const handleAddCategory = async (data: { name: string, limit: number }, isSuggestion = false) => {
    if (!user?.id) { toast.error("Usuário não encontrado."); return; }
    try {
      await axios.post(`${API_BASE_URL}/api/categories/assign`, {
        userId: user.id, categoryName: data.name, limit: data.limit
      });
      toast.success(`Categoria "${data.name}" adicionada com sucesso!`);
      if (!isSuggestion) setIsCategoryModalOpen(false);
      await Promise.all([fetchCategorySummary(), fetchAllUserCategories()]);
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Erro ao adicionar "${data.name}"`);
    }
  };

  const handleDeleteCategory = async (linkId: string, categoryName: string) => {
    if (!window.confirm(`Tem certeza que deseja remover a categoria "${categoryName}"?`)) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/categories/assign/${linkId}`);
      toast.success(`Categoria "${categoryName}" removida.`);
      await Promise.all([fetchCategorySummary(), fetchAllUserCategories()]);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao remover categoria.");
    }
  };
  
  const openLimitModal = (category: CategoryData) => {
    setEditingCategory(category);
    setIsLimitModalOpen(true);
  };

  const handleUpdateLimit = async (newLimit: number) => {
    if (!editingCategory) return;
    try {
      await axios.put(`${API_BASE_URL}/api/categories/assign/${editingCategory._id}`, { limit: newLimit });
      toast.success(`Limite de "${editingCategory.name}" atualizado!`);
      setIsLimitModalOpen(false);
      fetchCategorySummary();
    } catch(error: any) {
      toast.error(error.response?.data?.message || "Erro ao atualizar limite.");
    }
  };

  const handleAddOrUpdateTransaction = async (data: TransacaoProgramadaData) => {
    if (!user?.id || !selectedAccount?._id) { toast.error("Usuário ou conta não selecionada."); return; }
    
    const endpointType = data.type === 'entrada' ? 'recurring-incomes' : 'recurring-expenses';
    const payload = { ...data, user: user.id, account: selectedAccount._id };
    const isEditing = !!data._id;

    try {
        if (isEditing) {
            await axios.put(`${API_BASE_URL}/api/${endpointType}/${data._id}`, payload);
            toast.success(`Transação "${data.name}" atualizada!`);
        } else {
            await axios.post(`${API_BASE_URL}/api/${endpointType}`, payload);
            toast.success(`Transação "${data.name}" adicionada!`);
        }
        
        if (data.type === 'entrada') {
            fetchRecurringIncomes();
        } else {
            fetchRecurringExpenses();
        }

        setIsTransactionModalOpen(false);
        setEditingTransaction(null);
    } catch (error: any) {
        toast.error(error.response?.data?.message || `Erro ao salvar a transação.`);
    }
  };

  const handleDeleteTransaction = async (transaction: TransacaoProgramadaData) => {
      if (!window.confirm(`Tem certeza que deseja remover "${transaction.name}"?`)) return;
      
      const endpointType = transaction.type === 'saida' ? 'recurring-expenses' : 'recurring-incomes';
      
      try {
          await axios.delete(`${API_BASE_URL}/api/${endpointType}/${transaction._id}`);
          toast.success(`"${transaction.name}" removido(a).`);
          if (transaction.type === 'entrada') {
              fetchRecurringIncomes();
          } else {
              fetchRecurringExpenses();
          }
      } catch (error: any) {
          toast.error(error.response?.data?.message || "Erro ao remover.");
      }
  };

  const openAddModal = (type: 'entrada' | 'saida') => {
    setModalType(type);
    setEditingTransaction(null);
    setIsTransactionModalOpen(true);
  };

  const openEditModal = (transaction: any, type: 'entrada' | 'saida') => {
    setModalType(type);
    setEditingTransaction(transaction);
    setIsTransactionModalOpen(true);
  };

  const renderCustomizedLabel = (props: PieLabelRenderProps) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
    if (percent === undefined || percent < 0.05) return null;
    const RADIAN = Math.PI / 180;
    const radius = Number(innerRadius!) + (Number(outerRadius!) - Number(innerRadius!)) * 0.5;
    const x = Number(cx!) + radius * Math.cos(-Number(midAngle!) * RADIAN);
    const y = Number(cy!) + radius * Math.sin(-Number(midAngle!) * RADIAN);
    return (
      <text x={x} y={y} fill="white" textAnchor={x > Number(cx!) ? 'start' : 'end'} dominantBaseline="central" fontSize="10" fontWeight="bold" className="sm:text-xs">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="genesi-card p-2 sm:p-3 border border-white/20 text-xs sm:text-sm">
          <p className="text-white font-semibold">{data.name}</p>
          <p className="text-genesi-blue">
            R$ {(data.value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      );
    }
    return null;
  };

  const renderContent = () => {
    if (loading) return <Skeleton className="h-80 w-full" />;
    if (error) return <div className="text-center text-red-400">{error}</div>;
    if (categoriesData.length === 0) return <div className="text-center text-white/60">Nenhuma despesa categorizada encontrada neste período.</div>;
    return (
      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie data={categoriesData} cx="50%" cy="50%" labelLine={false} label={renderCustomizedLabel} outerRadius="80%" fill="#8884d8" dataKey="value">
            {categoriesData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  const renderCategoryList = () => {
    if (loading) return (<div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>);
    if (!loading && categoriesData.length === 0) return <div className="text-center text-white/60">Nenhuma categoria para exibir.</div>;
    return (
      <div className="space-y-4">
        {categoriesData.map((category) => {
          const warning = getLimitWarning(category.value, category.limit);
          return (
            <div 
              key={category._id}
              onClick={() => openLimitModal(category)}
              className="group p-4 rounded-xl transition-all duration-300 flex flex-col hover:scale-[1.02] cursor-pointer"
              style={{ 
                backgroundColor: category.color.replace(')', ', 0.3)').replace('hsl', 'hsla'),
                boxShadow: `0 0 15px -5px ${category.color.replace(')', ', 0.6)').replace('hsl', 'hsla')}`
              }}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="text-white font-semibold text-base">{category.name}</span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCategory(category._id, category.name);
                  }}
                  className="p-2 -mt-2 -mr-2 rounded-full bg-red-500/0 group-hover:bg-red-500/30 text-white/50 group-hover:text-white opacity-0 group-hover:opacity-100 transition-all duration-300"
                  title={`Remover categoria ${category.name}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="space-y-1">
                <CategoryProgressBar spent={category.value} limit={category.limit} color={category.color} />
                <div className="flex justify-between text-xs text-white/80">
                  <span>R$ {(category.value || 0).toLocaleString('pt-BR')}</span>
                  <span>Limite: R$ {(category.limit || 0).toLocaleString('pt-BR')}</span>
                </div>
              </div>
              {warning && (
                <div className={`mt-2 flex items-center gap-2 text-xs p-2 rounded-lg bg-black/20 ${warning.colorClass}`}>
                  <AlertTriangle size={14} className={warning.iconColor} />
                  <span>{warning.message}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  const renderRecurringExpensesList = () => {
    if (loading) return <Skeleton className="h-24 w-full" />;
    if (!loading && recurringExpenses.length === 0) return <p className="text-center text-sm text-white/60 mt-4">Nenhuma despesa programada.</p>;
    return (
        <div className="space-y-3 mt-4">
            {recurringExpenses.map(expense => (
                <div key={expense._id} className="flex items-center justify-between p-3 rounded-lg bg-red-500/10">
                    <div>
                        <p className="font-semibold text-white">{expense.name}</p>
                        <p className="text-xs text-red-300">
                            <span className="font-medium">{expense.category?.name || 'Sem Categoria'}</span>
                             - R$ {expense.value.toLocaleString('pt-BR')} (Dia {expense.billingDay})
                        </p>
                    </div>
                    <div className="flex items-center gap-2 text-white/70">
                        <button onClick={() => openEditModal(expense, 'saida')} title="Editar Despesa"><Pencil size={14} /></button>
                        <button onClick={() => handleDeleteTransaction(expense)} title="Remover Despesa"><Trash2 size={14} /></button>
                    </div>
                </div>
            ))}
        </div>
    );
  };

  const renderRecurringIncomesList = () => {
    if (loading) return <Skeleton className="h-24 w-full" />;
    if (!loading && recurringIncomes.length === 0) return <p className="text-center text-sm text-white/60 mt-4">Nenhuma entrada programada.</p>;
    return (
        <div className="space-y-3 mt-4">
            {recurringIncomes.map(income => (
                <div key={income._id} className="flex items-center justify-between p-3 rounded-lg bg-green-500/10">
                    <div>
                        <p className="font-semibold text-white">{income.name}</p>
                        <p className="text-xs text-green-300">
                            + R$ {income.value.toLocaleString('pt-BR')} (Dia {income.billingDay})
                        </p>
                    </div>
                    <div className="flex items-center gap-2 text-white/70">
                        <button onClick={() => openEditModal(income, 'entrada')} title="Editar Entrada"><Pencil size={14} /></button>
                        <button onClick={() => handleDeleteTransaction(income)} title="Remover Entrada"><Trash2 size={14} /></button>
                    </div>
                </div>
            ))}
        </div>
    );
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Plano de Gastos</h1>
          <p className="text-white/60 text-sm sm:text-base">Visualize e gerencie seus gastos e transações programadas.</p>
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
        </div>
      </div>

      <div className="genesi-card h-[400px] flex flex-col justify-center">
        {renderContent()}
      </div>

      {/* ATUALIZADO: Layout de grid com 3 colunas */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        {/* Coluna 1: Categorias do Mês */}
        <div className="genesi-card">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Categorias do Mês</h3>
          {renderCategoryList()}
        </div>
        
        {/* Coluna 2: Transações Programadas com Abas */}
        <div className="genesi-card">
            <div className="flex border-b border-white/10 mb-4">
                <button onClick={() => setActiveTab('despesas')} className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'despesas' ? 'text-white border-b-2 border-blue-500' : 'text-white/60 hover:text-white'}`}>Despesas Programadas</button>
                <button onClick={() => setActiveTab('entradas')} className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'entradas' ? 'text-white border-b-2 border-green-500' : 'text-white/60 hover:text-white'}`}>Entradas Programadas</button>
            </div>

            <button onClick={() => openAddModal(activeTab === 'despesas' ? 'saida' : 'entrada')} className="genesi-button w-full mb-4 bg-genesi-blue hover:bg-blue-600 text-sm py-2">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar {activeTab === 'despesas' ? 'Nova Despesa' : 'Nova Entrada'}
            </button>

            {activeTab === 'despesas' ? renderRecurringExpensesList() : renderRecurringIncomesList()}
        </div>

        {/* Coluna 3: Gerenciar Categorias (Reintroduzida) */}
        <div className="genesi-card">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Gerenciar Categorias</h3>
          <button onClick={() => setIsCategoryModalOpen(true)} className="genesi-button w-full mb-4 sm:mb-6 bg-genesi-green hover:bg-genesi-green-dark text-sm sm:text-base py-2 sm:py-3">
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Adicionar Categoria
          </button>
          <div className="space-y-2 sm:space-y-3">
            <h4 className="text-white/80 font-medium text-sm sm:text-base">Sugestões:</h4>
            {['Viagens', 'Seguros', 'Doações', 'Hobbies'].map((suggestion) => (
              <button key={suggestion} onClick={() => handleAddCategory({ name: suggestion, limit: 0 }, true)} className="w-full p-2 sm:p-3 text-left rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-all duration-200 text-sm sm:text-base">
                + {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <CategoryModal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} onSubmit={handleAddCategory} />
      
      {editingCategory && (
        <LimitModal 
          isOpen={isLimitModalOpen}
          onClose={() => setIsLimitModalOpen(false)}
          onSubmit={handleUpdateLimit}
          categoryName={editingCategory.name}
          currentLimit={editingCategory.limit}
        />
      )}

      <TransacaoProgramadaModal 
          isOpen={isTransactionModalOpen}
          onClose={() => setIsTransactionModalOpen(false)}
          onSubmit={handleAddOrUpdateTransaction}
          transactionType={modalType}
          editingTransaction={editingTransaction}
          categories={allCategories}
      />
    </div>
  );
};

export default Plano;