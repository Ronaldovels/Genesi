
import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Area, AreaChart } from 'recharts';
import { TrendingUp, DollarSign, Target, AlertCircle, Lightbulb } from 'lucide-react';

const Investimentos = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('1Y');

  const portfolioData = [
    { name: 'Renda Fixa', value: 15000, percentage: 45.8, color: '#3b82f6' },
    { name: 'Ações', value: 8500, percentage: 26.0, color: '#10b981' },
    { name: 'Fundos', value: 6000, percentage: 18.3, color: '#f59e0b' },
    { name: 'Cripto', value: 2250, percentage: 6.9, color: '#ef4444' },
    { name: 'REITs', value: 1000, percentage: 3.0, color: '#8b5cf6' }
  ];

  const performanceData = [
    { month: 'Jan', valor: 28000, rendimento: 2.1 },
    { month: 'Fev', valor: 28500, rendimento: 1.8 },
    { month: 'Mar', valor: 29200, rendimento: 2.4 },
    { month: 'Abr', valor: 30100, rendimento: 3.1 },
    { month: 'Mai', valor: 31500, rendimento: 4.6 },
    { month: 'Jun', valor: 32750, rendimento: 3.9 }
  ];

  const totalInvested = portfolioData.reduce((sum, item) => sum + item.value, 0);

  const insights = [
    {
      type: 'warning',
      icon: AlertCircle,
      title: 'Concentração de Risco',
      message: 'Sua carteira tem 45% em renda fixa. Considere diversificar mais em ações para potencializar ganhos a longo prazo.',
      color: 'text-orange-400'
    },
    {
      type: 'tip',
      icon: Lightbulb,
      title: 'Oportunidade',
      message: 'O mercado de REITs está em baixa. Pode ser uma boa oportunidade para aumentar sua posição com desconto.',
      color: 'text-blue-400'
    },
    {
      type: 'success',
      icon: TrendingUp,
      title: 'Performance Positiva',
      message: 'Seus investimentos tiveram rendimento de 3.9% no último mês, superando a meta de 3%.',
      color: 'text-green-400'
    }
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0
    }).format(value);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="genesi-card p-3 border border-white/20">
          <p className="text-white font-semibold">{payload[0].payload.month}</p>
          <p className="text-genesi-blue">
            Valor: {formatCurrency(payload[0].value)}
          </p>
          <p className="text-genesi-green">
            Rendimento: {payload[0].payload.rendimento}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Investimentos</h1>
          <p className="text-white/60">Análise completa da sua carteira de investimentos</p>
        </div>
        <div className="genesi-card px-4 py-2">
          <div className="text-right">
            <p className="text-white/60 text-sm">Patrimônio Total</p>
            <p className="text-2xl font-bold text-white">{formatCurrency(totalInvested)}</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="genesi-card text-center">
          <div className="text-2xl font-bold text-white mb-1">+12.8%</div>
          <div className="text-white/60 text-sm">Rendimento Total</div>
        </div>
        <div className="genesi-card text-center">
          <div className="text-2xl font-bold text-green-400 mb-1">+3.9%</div>
          <div className="text-white/60 text-sm">Último Mês</div>
        </div>
        <div className="genesi-card text-center">
          <div className="text-2xl font-bold text-white mb-1">R$ 4.200</div>
          <div className="text-white/60 text-sm">Ganho Realizado</div>
        </div>
        <div className="genesi-card text-center">
          <div className="text-2xl font-bold text-blue-400 mb-1">5</div>
          <div className="text-white/60 text-sm">Tipos de Ativos</div>
        </div>
      </div>

      {/* Portfolio Distribution & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Portfolio Distribution */}
        <div className="genesi-card">
          <h2 className="text-xl font-semibold text-white mb-6">Distribuição da Carteira</h2>
          <div className="h-64 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={portfolioData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={40}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {portfolioData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number, name: string) => [formatCurrency(value), name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {portfolioData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-white text-sm">{item.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-white font-semibold text-sm">
                    {formatCurrency(item.value)}
                  </div>
                  <div className="text-white/60 text-xs">
                    {item.percentage}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Chart */}
        <div className="genesi-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Performance</h2>
            <div className="flex gap-2">
              {['6M', '1Y', '2Y'].map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-3 py-1 rounded-md text-sm transition-colors ${
                    selectedPeriod === period
                      ? 'bg-genesi-blue text-white'
                      : 'bg-white/10 text-white/60 hover:bg-white/20'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: 'white', fontSize: 12 }}
                />
                <YAxis 
                  tick={{ fill: 'white', fontSize: 12 }}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="valor"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorValue)"
                />
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
              <div 
                key={index}
                className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg bg-white/10 ${insight.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
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
            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-green-400 font-semibold">PETR4</span>
                <span className="text-green-400">+2.3%</span>
              </div>
              <p className="text-white/80 text-sm">Ação com potencial de crescimento baseado em análise fundamentalista</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-blue-400 font-semibold">HGLG11</span>
                <span className="text-blue-400">+1.8%</span>
              </div>
              <p className="text-white/80 text-sm">FII com dividendo atrativo e gestão eficiente</p>
            </div>
          </div>
        </div>

        <div className="genesi-card">
          <h3 className="text-lg font-semibold text-white mb-4">Ações Recomendadas</h3>
          <div className="space-y-3">
            <button className="genesi-button w-full bg-genesi-green hover:bg-genesi-green-dark">
              Rebalancear Carteira
            </button>
            <button className="genesi-button w-full bg-genesi-blue hover:bg-genesi-blue-dark">
              Aportar R$ 1.000
            </button>
            <button className="genesi-button w-full bg-white/10 hover:bg-white/20">
              Relatório Detalhado
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Investimentos;
