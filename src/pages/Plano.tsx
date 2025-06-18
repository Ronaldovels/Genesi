
import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Plus, TrendingUp } from 'lucide-react';

const Plano = () => {
  const [viewMode, setViewMode] = useState<'pie' | 'bar'>('pie');
  
  const categoriesData = [
    { name: 'Alimentação', value: 1200, color: '#3b82f6' },
    { name: 'Casa', value: 800, color: '#10b981' },
    { name: 'Transporte', value: 600, color: '#f59e0b' },
    { name: 'Lazer', value: 400, color: '#ef4444' },
    { name: 'Mercado', value: 950, color: '#8b5cf6' },
    { name: 'Cuidados pessoais', value: 300, color: '#06b6d4' },
    { name: 'Despesas médicas', value: 250, color: '#84cc16' },
    { name: 'Educação', value: 350, color: '#f97316' },
    { name: 'Família', value: 200, color: '#ec4899' },
    { name: 'Pets', value: 150, color: '#6366f1' },
    { name: 'Prestador de serviço', value: 300, color: '#14b8a6' }
  ];

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null;
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="10"
        fontWeight="bold"
        className="sm:text-xs"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="genesi-card p-2 sm:p-3 border border-white/20 text-xs sm:text-sm">
          <p className="text-white font-semibold">{data.name}</p>
          <p className="text-genesi-blue">
            R$ {data.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Plano de Gastos</h1>
          <p className="text-white/60 text-sm sm:text-base">Visualize seus gastos por categoria</p>
        </div>
        <div className="flex gap-2 sm:gap-3">
          <button
            onClick={() => setViewMode('pie')}
            className={`px-3 py-2 text-xs sm:text-sm sm:px-4 rounded-lg transition-all duration-200 ${
              viewMode === 'pie' 
                ? 'bg-genesi-blue text-white' 
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            Pizza
          </button>
          <button
            onClick={() => setViewMode('bar')}
            className={`px-3 py-2 text-xs sm:text-sm sm:px-4 rounded-lg transition-all duration-200 ${
              viewMode === 'bar' 
                ? 'bg-genesi-blue text-white' 
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            Barras
          </button>
        </div>
      </div>

      {/* Chart Container */}
      <div className="genesi-card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3">
          <h2 className="text-lg sm:text-xl font-semibold text-white">Gastos por Categoria</h2>
          <div className="flex items-center gap-2 text-white/60">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-xs sm:text-sm">Últimos 30 dias</span>
          </div>
        </div>

        <div className="h-64 sm:h-80 lg:h-96">
          <ResponsiveContainer width="100%" height="100%">
            {viewMode === 'pie' ? (
              <PieChart>
                <Pie
                  data={categoriesData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius="80%"
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoriesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            ) : (
              <BarChart data={categoriesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fill: 'white', fontSize: 10 }}
                  className="sm:text-xs"
                />
                <YAxis tick={{ fill: 'white', fontSize: 10 }} className="sm:text-xs" />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Categories List */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        <div className="genesi-card">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Categorias Atuais</h3>
          <div className="space-y-2 sm:space-y-3">
            {categoriesData.map((category, index) => (
              <div key={category.name} className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div 
                    className="w-3 h-3 sm:w-4 sm:h-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-white text-sm sm:text-base">{category.name}</span>
                </div>
                <span className="text-white/80 font-semibold text-sm sm:text-base">
                  R$ {category.value.toLocaleString('pt-BR')}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="genesi-card">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Gerenciar Categorias</h3>
          
          <button className="genesi-button w-full mb-4 sm:mb-6 bg-genesi-green hover:bg-genesi-green-dark text-sm sm:text-base py-2 sm:py-3">
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Adicionar Categoria
          </button>

          <div className="space-y-2 sm:space-y-3">
            <h4 className="text-white/80 font-medium text-sm sm:text-base">Sugestões:</h4>
            {['Viagens', 'Seguros', 'Doações', 'Hobbies'].map((suggestion) => (
              <button
                key={suggestion}
                className="w-full p-2 sm:p-3 text-left rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-all duration-200 text-sm sm:text-base"
              >
                + {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Plano;
