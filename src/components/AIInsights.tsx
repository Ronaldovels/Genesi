
import React from 'react';
import { Lightbulb, Sparkles, AlertTriangle, CheckCircle } from 'lucide-react';

const AIInsights = () => {
  const insights = [
    {
      type: 'tip',
      icon: Lightbulb,
      title: 'Oportunidade de Economia',
      message: 'Você gastou 20% a mais em alimentação este mês. Considere planejar refeições para economizar R$ 300.',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/10'
    },
    {
      type: 'success',
      icon: CheckCircle,
      title: 'Meta Alcançada',
      message: 'Parabéns! Você atingiu sua meta de investimentos mensais com 5 dias de antecedência.',
      color: 'text-green-400',
      bgColor: 'bg-green-400/10'
    },
    {
      type: 'warning',
      icon: AlertTriangle,
      title: 'Atenção aos Gastos',
      message: 'Seus gastos com lazer aumentaram 35% comparado ao mês passado. Revise seu orçamento.',
      color: 'text-orange-400',
      bgColor: 'bg-orange-400/10'
    }
  ];

  return (
    <div className="genesi-card">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-genesi-blue/20">
          <Sparkles className="w-6 h-6 text-genesi-blue" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">Insights da IA Genesi</h2>
          <p className="text-white/60 text-sm">Análises personalizadas do seu comportamento financeiro</p>
        </div>
      </div>

      <div className="space-y-4">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          
          return (
            <div 
              key={index}
              className={`p-4 rounded-lg border border-white/10 ${insight.bgColor} animate-fade-in`}
              style={{ animationDelay: `${index * 200}ms` }}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg bg-white/10 ${insight.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-1">{insight.title}</h3>
                  <p className="text-white/80 text-sm">{insight.message}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-white/10">
        <button className="genesi-button bg-genesi-gradient hover:opacity-90 text-sm">
          Ver Todas as Análises
        </button>
      </div>
    </div>
  );
};

export default AIInsights;
