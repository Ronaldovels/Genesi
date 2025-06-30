import { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import axios from 'axios';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from '../components/ui/skeleton';

// Importando os novos cards
import { IncomeVsExpenseCard } from '../components/componentsbalan/IncomeVsExpenseCard';
import { CategoryPercentageCard } from '../components/componentsbalan/CategoryPercentageCard';
import { PlannedVsActualCard } from '../components/componentsbalan/PlannedVsActualCard';
import { CreditCardCard } from '../components/componentsbalan/CreditCardCard';

// Função para gerar cores, necessária para o gráfico de pizza
const generateColor = (index: number): string => {
  const hue = (index * 137.508) % 360;
  return `hsl(${hue}, 70%, 50%)`;
};

const Balanco = () => {
  const { selectedAccount } = useContext(AuthContext)!;
  const [loading, setLoading] = useState(true);
  const [summaryData, setSummaryData] = useState({ entradas: 0, saidas: 0 });
  const [categoryData, setCategoryData] = useState([]);

  // Data e Mês (pode ser expandido no futuro)
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

    const fetchData = useCallback(async () => {
    if (!selectedAccount) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [summaryRes, categoryRes] = await Promise.all([
        axios.get(`/api/finance/summary/${selectedAccount._id}`, { params: { month, year } }),
        axios.get(`/api/finance/category-summary/${selectedAccount._id}`, { params: { month, year } })
      ]);
      
      // --- ETAPA DE HIGIENIZAÇÃO DOS DADOS ---

      // Garante que os valores do resumo sejam sempre números
      const sanitizedSummary = {
        entradas: Number(summaryRes.data.entradas) || 0,
        saidas: Number(summaryRes.data.saidas) || 0,
        // O saldo total não é usado nos cálculos dos gráficos, mas é uma boa prática
      };

      // Garante que os valores das categorias sejam sempre números
      const sanitizedCategoryData = categoryRes.data.map((item: any, index: number) => ({
        _id: item._id,
        name: item.name,
        value: Number(item.total) || 0, // Converte para número, se falhar (NaN), usa 0
        limit: Number(item.limit) || 0, // Converte para número, se falhar (NaN), usa 0
        color: generateColor(index)
      }));

      // Define os estados com os dados já limpos
      setSummaryData(sanitizedSummary);
      setCategoryData(sanitizedCategoryData);

    } catch (error) {
      console.error("Erro ao buscar dados para o balanço:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedAccount, month, year]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="space-y-6 sm:space-y-8 animate-fade-in">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Balanço Mensal</h1>
          <p className="text-white/60 text-sm sm:text-base">Uma visão geral da sua saúde financeira.</p>
        </div>
        {/* Adicione seletores de mês/ano aqui se desejar */}
      </div>

      {/* Grid de Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <IncomeVsExpenseCard data={summaryData} />
        <CategoryPercentageCard categories={categoryData} totalIncome={summaryData.entradas} />
        <PlannedVsActualCard categories={categoryData} />
        <CreditCardCard />
      </div>
    </div>
  );
};

export default Balanco;