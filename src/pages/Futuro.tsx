
import React, { useState } from 'react';
import { Target, Calendar, DollarSign, Plus, Home, Plane, Briefcase, GraduationCap } from 'lucide-react';

const Futuro = () => {
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);

  const goals = [
    {
      id: '1',
      name: 'Comprar um imóvel',
      targetAmount: 250000,
      currentAmount: 45000,
      targetDate: '2026-12-31',
      icon: Home,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10'
    },
    {
      id: '2', 
      name: 'Viagem para Europa',
      targetAmount: 15000,
      currentAmount: 8500,
      targetDate: '2024-08-15',
      icon: Plane,
      color: 'text-green-400',
      bgColor: 'bg-green-400/10'
    },
    {
      id: '3',
      name: 'Abrir um negócio',
      targetAmount: 80000,
      currentAmount: 12000,
      targetDate: '2025-06-30',
      icon: Briefcase,
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10'
    },
    {
      id: '4',
      name: 'MBA Executivo',
      targetAmount: 25000,
      currentAmount: 18000,
      targetDate: '2024-12-01',
      icon: GraduationCap,
      color: 'text-orange-400',
      bgColor: 'bg-orange-400/10'
    }
  ];

  const retirementData = {
    targetAge: 65,
    currentAge: 32,
    targetAmount: 2000000,
    currentAmount: 85000,
    monthlyContribution: 1200
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Planejamento Futuro</h1>
          <p className="text-white/60">Defina e acompanhe suas metas financeiras</p>
        </div>
        <button className="genesi-button bg-genesi-green hover:bg-genesi-green-dark">
          <Plus className="w-5 h-5 mr-2" />
          Nova Meta
        </button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {goals.map((goal) => {
          const Icon = goal.icon;
          const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
          
          return (
            <div
              key={goal.id}
              className={`genesi-card cursor-pointer transition-all duration-300 ${
                selectedGoal === goal.id ? 'ring-2 ring-genesi-blue' : ''
              }`}
              onClick={() => setSelectedGoal(selectedGoal === goal.id ? null : goal.id)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${goal.bgColor} ${goal.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{goal.name}</h3>
                    <p className="text-white/60 text-sm">Meta: {formatDate(goal.targetDate)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-bold">{formatCurrency(goal.targetAmount)}</p>
                  <p className="text-white/60 text-sm">{progress.toFixed(1)}% concluído</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Atual: {formatCurrency(goal.currentAmount)}</span>
                  <span className="text-white/60">Faltam: {formatCurrency(goal.targetAmount - goal.currentAmount)}</span>
                </div>
                
                <div className="w-full bg-white/10 rounded-full h-3">
                  <div
                    className="bg-genesi-gradient h-3 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              {selectedGoal === goal.id && (
                <div className="mt-4 pt-4 border-t border-white/10 animate-fade-in">
                  <div className="grid grid-cols-2 gap-4">
                    <button className="genesi-button bg-genesi-blue hover:bg-genesi-blue-dark text-sm py-2">
                      Adicionar Valor
                    </button>
                    <button className="genesi-button bg-white/10 hover:bg-white/20 text-sm py-2">
                      Editar Meta
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Retirement Planning */}
      <div className="genesi-card">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-lg bg-genesi-purple/20 text-genesi-purple">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Planejamento de Aposentadoria</h2>
            <p className="text-white/60">Prepare-se para o futuro com tranquilidade</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-2">
              {retirementData.targetAge - retirementData.currentAge}
            </div>
            <div className="text-white/60">anos restantes</div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-2">
              {formatCurrency(retirementData.targetAmount)}
            </div>
            <div className="text-white/60">meta de aposentadoria</div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-2">
              {formatCurrency(retirementData.monthlyContribution)}
            </div>
            <div className="text-white/60">contribuição mensal</div>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-white/60">
              Progresso: {formatCurrency(retirementData.currentAmount)}
            </span>
            <span className="text-white/60">
              {calculateProgress(retirementData.currentAmount, retirementData.targetAmount).toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-3">
            <div
              className="bg-genesi-gradient h-3 rounded-full"
              style={{ 
                width: `${calculateProgress(retirementData.currentAmount, retirementData.targetAmount)}%` 
              }}
            />
          </div>
        </div>

        <div className="flex gap-4 mt-6">
          <button className="genesi-button bg-genesi-purple hover:bg-purple-600">
            Simular Cenários
          </button>
          <button className="genesi-button bg-white/10 hover:bg-white/20">
            Ajustar Contribuição
          </button>
        </div>
      </div>

      {/* Financial Planning Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="genesi-card">
          <h3 className="text-lg font-semibold text-white mb-4">Projeção de Renda</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-white/60">Renda atual</span>
              <span className="text-white font-semibold">R$ 8.500</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Crescimento anual estimado</span>
              <span className="text-genesi-green font-semibold">+8%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Projeção em 5 anos</span>
              <span className="text-white font-semibold">R$ 12.500</span>
            </div>
          </div>
        </div>

        <div className="genesi-card">
          <h3 className="text-lg font-semibold text-white mb-4">Emergência</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-white/60">Reserva recomendada</span>
              <span className="text-white font-semibold">R$ 25.500</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Reserva atual</span>
              <span className="text-genesi-orange font-semibold">R$ 15.300</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div
                className="bg-genesi-orange h-2 rounded-full"
                style={{ width: '60%' }}
              />
            </div>
            <p className="text-white/60 text-sm">
              60% da meta • Faltam R$ 10.200
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Futuro;
