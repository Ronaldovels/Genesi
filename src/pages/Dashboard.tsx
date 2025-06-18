import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, DollarSign, PiggyBank, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import MetricCard from '../components/MetricCard';
import AIInsights from '../components/AIInsights';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const API_BASE_URL = 'https://de6f-2804-7f0-845d-ae81-7821-6145-fcac-655a.ngrok-free.app';

const Dashboard = () => {
  const { user } = useAuth();
  const [entradas, setEntradas] = useState(0);
  const [saidas, setSaidas] = useState(0);
  const [saldo, setSaldo] = useState(0);
  // Investimentos pode ser implementado depois

  useEffect(() => {
    console.log('user:', user);
    if (user && user.whatsapp) {
      const url = `${API_BASE_URL}/api/finance/saldo/${user.whatsapp}`;
      console.log('Fazendo requisição para:', url);
      const fetchData = async () => {
        try {
          const res = await axios.get(url, {
            headers: {
              'ngrok-skip-browser-warning': 'true'
            }
          });
          setEntradas(res.data.entradas || 0);
          setSaidas(res.data.saidas || 0);
          setSaldo(res.data.saldo || 0);
          console.log('Dados recebidos:', res.data);
        } catch (err) {
          setEntradas(0);
          setSaidas(0);
          setSaldo(0);
          console.error('Erro ao buscar dados financeiros:', err);
        }
      };
      fetchData();
    }
  }, [user]);

  const metrics = [
    {
      title: 'Entradas',
      value: `R$ ${entradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      change: '+0%',
      trend: 'up' as const,
      icon: ArrowUpCircle,
      color: 'text-green-400'
    },
    {
      title: 'Saídas',
      value: `R$ ${saidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      change: '0%',
      trend: 'down' as const,
      icon: ArrowDownCircle,
      color: 'text-red-400'
    },
    {
      title: 'Saldo Atual',
      value: `R$ ${saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
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
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Dashboard Financeiro</h1>
          <p className="text-white/60 text-sm sm:text-base">Visão geral das suas finanças em tempo real</p>
        </div>
        <div className="genesi-card px-3 py-2 sm:px-4 self-start sm:self-auto">
          <span className="text-xs sm:text-sm text-white/60">Última atualização: </span>
          <span className="text-white font-semibold text-xs sm:text-sm">Agora</span>
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

      {/* AI Insights */}
      <AIInsights />

      {/* Quick Actions */}
      <div className="genesi-card">
        <h2 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6">Ações Rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <button className="genesi-button bg-genesi-green hover:bg-genesi-green-dark text-sm sm:text-base py-2 sm:py-3">
            Adicionar Receita
          </button>
          <button className="genesi-button bg-genesi-orange hover:bg-orange-600 text-sm sm:text-base py-2 sm:py-3">
            Registrar Despesa
          </button>
          <button className="genesi-button bg-genesi-purple hover:bg-purple-600 text-sm sm:text-base py-2 sm:py-3 sm:col-span-2 lg:col-span-1">
            Novo Investimento
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
