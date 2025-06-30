import React, { useState, useEffect, useCallback, useContext } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { TrendingUp, DollarSign, Target, AlertCircle, Lightbulb } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from '../components/ui/skeleton';

// Interfaces para os dados da API
interface Investment {
  _id: string;
  name: string;
  type: string;
  currentValue: number;
}

interface InvestmentAccount {
  _id: string;
  name: string;
  totalValue: number;
}

const API_BASE_URL = import.meta.env.VITE_URL;


const Investimentos = () => {
  const { user } = useContext(AuthContext)!;
  
  // Estados para dados dinâmicos
  const [investmentAccounts, setInvestmentAccounts] = useState<InvestmentAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<InvestmentAccount | null>(null);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estado para o seletor de período do gráfico de performance
  const [selectedPeriod, setSelectedPeriod] = useState('1Y');

  // Busca as contas de investimento do usuário
  useEffect(() => {
    const fetchInvestmentAccounts = async () => {
      if (user?.id) {
        setLoading(true);
        try {
          const response = await axios.get(`${API_BASE_URL}/api/investment/accounts/${user.id}`);
          setInvestmentAccounts(response.data);
          if (response.data.length > 0) {
            setSelectedAccount(response.data[0]); // Seleciona a primeira por padrão
          } else {
            setLoading(false); // Para de carregar se não houver contas
          }
        } catch (error) {
          console.error("Erro ao buscar contas de investimento:", error);
          setLoading(false);
        }
      }
    };
    fetchInvestmentAccounts();
  }, [user]);

  // Busca os ativos da conta de investimento selecionada
  useEffect(() => {
    const fetchInvestments = async () => {
      if (selectedAccount) {
        setLoading(true);
        try {
          const response = await axios.get(`${API_BASE_URL}/api/investment/${selectedAccount._id}`);
          setInvestments(response.data);
        } catch (error) {
          console.error("Erro ao buscar investimentos:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchInvestments();
  }, [selectedAccount]);

  // Processa os dados recebidos para o gráfico de pizza
  const portfolioData = React.useMemo(() => {
    if (!investments) return [];
    
    const dataByType = investments.reduce((acc, investment) => {
      acc[investment.type] = (acc[investment.type] || 0) + investment.currentValue;
      return acc;
    }, {} as Record<string, number>);

    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6', '#f43f5e'];
    return Object.entries(dataByType).map(([name, value], index) => ({
      name,
      value,
      percentage: selectedAccount?.totalValue ? (value / selectedAccount.totalValue) * 100 : 0,
      color: colors[index % colors.length],
    }));
  }, [investments, selectedAccount]);
  
  // Dados de performance e insights ainda como placeholders
  const performanceData = [
    { month: 'Jan', valor: 28000 },
    { month: 'Fev', valor: 28500 },
    { month: 'Mar', valor: 29200 },
    { month: 'Abr', valor: 30100 },
    { month: 'Mai', valor: 31500 },
    { month: 'Jun', valor: selectedAccount?.totalValue || 0 }
  ];

  const insights = [
    { type: 'warning', icon: AlertCircle, title: 'Concentração de Risco', message: 'Sua carteira tem grande foco em um único tipo de ativo. Considere diversificar.', color: 'text-orange-400' },
    { type: 'tip', icon: Lightbulb, title: 'Oportunidade', message: 'O mercado de REITs está em baixa. Pode ser uma boa oportunidade para aumentar sua posição.', color: 'text-blue-400' },
    { type: 'success', icon: TrendingUp, title: 'Performance Positiva', message: 'Seus investimentos tiveram um bom rendimento no último mês.', color: 'text-green-400' }
  ];

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="genesi-card p-3 border border-white/20">
          <p className="text-white font-semibold">{payload[0].payload.month}</p>
          <p className="text-genesi-blue">Valor: {formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return <div className="p-8"><Skeleton className="h-[80vh] w-full" /></div>;
  }
  
  if (investmentAccounts.length === 0) {
    return <div className="text-center text-white/60 p-10">Você ainda não possui contas de investimento cadastradas.</div>
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Investimentos</h1>
          <p className="text-white/60">Análise completa da sua carteira de investimentos</p>
        </div>
        <div className="flex items-center gap-4">
           <Select value={selectedAccount?._id || ''} onValueChange={(accountId) => setSelectedAccount(investmentAccounts.find(acc => acc._id === accountId) || null)}>
            <SelectTrigger className="w-[220px] bg-slate-900/50 border-white/10">
              <SelectValue placeholder="Selecione a carteira" />
            </SelectTrigger>
            <SelectContent>
              {investmentAccounts.map((account) => (
                <SelectItem key={account._id} value={account._id}>
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="genesi-card px-4 py-2">
            <p className="text-white/60 text-sm">Patrimônio na Carteira</p>
            <p className="text-2xl font-bold text-white">{formatCurrency(selectedAccount?.totalValue || 0)}</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="genesi-card text-center"><div className="text-2xl font-bold text-white mb-1">+0%</div><div className="text-white/60 text-sm">Rendimento Total</div></div>
        <div className="genesi-card text-center"><div className="text-2xl font-bold text-green-400 mb-1">+0%</div><div className="text-white/60 text-sm">Último Mês</div></div>
        <div className="genesi-card text-center"><div className="text-2xl font-bold text-white mb-1">R$ 0</div><div className="text-white/60 text-sm">Ganho Realizado</div></div>
        <div className="genesi-card text-center"><div className="text-2xl font-bold text-blue-400 mb-1">{portfolioData.length}</div><div className="text-white/60 text-sm">Tipos de Ativos</div></div>
      </div>

      {/* Portfolio Distribution & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="genesi-card">
          <h2 className="text-xl font-semibold text-white mb-6">Distribuição da Carteira</h2>
          <div className="h-64 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={portfolioData} cx="50%" cy="50%" outerRadius={80} innerRadius={40} paddingAngle={2} dataKey="value" nameKey="name">
                  {portfolioData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(value: number, name: string) => [formatCurrency(value), name]} contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {portfolioData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}/>
                  <span className="text-white text-sm">{item.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-white font-semibold text-sm">{formatCurrency(item.value)}</div>
                  <div className="text-white/60 text-xs">{item.percentage.toFixed(1)}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="genesi-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Performance</h2>
            <div className="flex gap-2">
              {['6M', '1Y', '2Y'].map((period) => (
                <button key={period} onClick={() => setSelectedPeriod(period)} className={`px-3 py-1 rounded-md text-sm transition-colors ${selectedPeriod === period ? 'bg-genesi-blue text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}>
                  {period}
                </button>
              ))}
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <defs><linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="month" tick={{ fill: 'white', fontSize: 12 }}/>
                <YAxis tick={{ fill: 'white', fontSize: 12 }} tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}/>
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="valor" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)"/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="genesi-card">
        <h2 className="text-xl font-semibold text-white mb-6">Insights da IA Genesi</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {insights.map((insight, index) => {
            const Icon = insight.icon;
            return (
              <div key={index} className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg bg-white/10 ${insight.color}`}><Icon className="w-5 h-5" /></div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">{insight.title}</h3>
                    <p className="text-white/80 text-sm">{insight.message}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Investment Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="genesi-card">
          <h3 className="text-lg font-semibold text-white mb-4">Oportunidades</h3>
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20"><div className="flex items-center justify-between mb-2"><span className="text-green-400 font-semibold">PETR4</span><span className="text-green-400">+2.3%</span></div><p className="text-white/80 text-sm">Ação com potencial de crescimento baseado em análise fundamentalista</p></div>
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20"><div className="flex items-center justify-between mb-2"><span className="text-blue-400 font-semibold">HGLG11</span><span className="text-blue-400">+1.8%</span></div><p className="text-white/80 text-sm">FII com dividendo atrativo e gestão eficiente</p></div>
          </div>
        </div>
        <div className="genesi-card">
          <h3 className="text-lg font-semibold text-white mb-4">Ações Recomendadas</h3>
          <div className="space-y-3">
            <button className="genesi-button w-full bg-genesi-green hover:bg-genesi-green-dark">Rebalancear Carteira</button>
            <button className="genesi-button w-full bg-genesi-blue hover:bg-genesi-blue-dark">Aportar R$ 1.000</button>
            <button className="genesi-button w-full bg-white/10 hover:bg-white/20">Relatório Detalhado</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Investimentos;