
import { useState } from 'react';
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { ChartData } from '@/types/financial';

interface FinancialChartProps {
  data: ChartData[];
  currentAge: number;
}

export const FinancialChart = ({ data, currentAge }: FinancialChartProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getDateFromAge = (age: number) => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();
    const birthYear = currentYear - currentAge;
    const targetYear = birthYear + age;
    
    return {
      month: currentMonth + 1, // +1 porque getMonth() retorna 0-11
      year: targetYear
    };
  };

  const getMonthName = (month: number) => {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return months[month - 1];
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const { month, year } = getDateFromAge(label);
      
      return (
        <div className="bg-slate-700 p-4 border border-slate-600 rounded-lg shadow-lg">
          <p className="font-semibold text-white mb-2">
            {`${getMonthName(month)} de ${year} - ${label} anos`}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.name}: ${formatCurrency(entry.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Calcular ticks do eixo X de 8 em 8 anos
  const generateXAxisTicks = () => {
    const ticks = [];
    let startAge = Math.ceil(currentAge / 8) * 8; // Próximo múltiplo de 8
    if (startAge === currentAge) startAge = currentAge;
    else if (currentAge % 8 !== 0) startAge = currentAge;
    
    for (let age = startAge; age <= 100; age += 8) {
      ticks.push(age);
    }
    return ticks;
  };

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
          <defs>
            <linearGradient id="patrimonioTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#9CCC65" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#9CCC65" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="patrimonioPrincipal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#42A5F5" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#42A5F5" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="aposentadoriaIdeal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FFB74D" stopOpacity={0.6}/>
              <stop offset="95%" stopColor="#FFB74D" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          
          <XAxis 
            dataKey="age" 
            domain={[currentAge, 100]}
            type="number"
            scale="linear"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            tickFormatter={(value) => `${value}`}
            ticks={generateXAxisTicks()}
            interval={0}
          />
          <YAxis 
            tickFormatter={formatCurrency}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 11, fill: '#94a3b8' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ color: '#fff', fontSize: '12px' }}
          />
          
          {/* Área de aposentadoria ideal (laranja) - linha de referência */}
          <Area
            type="monotone"
            dataKey="aposentadoriaIdeal"
            stroke="#FFB74D"
            strokeWidth={2}
            strokeDasharray="5,5"
            fillOpacity={0.05}
            fill="url(#aposentadoriaIdeal)"
            name="Aposentadoria ideal"
          />
          
          {/* Área do patrimônio principal investido (azul) */}
          <Area
            type="monotone"
            dataKey="patrimonioPrincipal"
            stroke="#42A5F5"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#patrimonioPrincipal)"
            name="Patrimônio principal investido"
          />
          
          {/* Área do patrimônio total projetado (verde) - área principal */}
          <Area
            type="monotone"
            dataKey="patrimonioTotal"
            stroke="#9CCC65"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#patrimonioTotal)"
            name="Patrimônio total projetado"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
