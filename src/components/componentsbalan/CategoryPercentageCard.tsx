// src/components/componentsbalan/CategoryPercentageCard.jsx

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface Category { name: string; value: number; color: string; }
interface Props {
  categories: Category[];
  totalIncome: number;
}

// ✨ NOVO: Estilo para a legenda que será aplicado
const legendWrapperStyle = {
  top: '50%',          // Alinha o topo da legenda com o meio do container
  right: 0,            // Encosta na direita
  transform: 'translate(0, -50%)', // Centraliza verticalmente de forma precisa
  lineHeight: '24px',  // Espaçamento entre os itens
  width: 120,          // Largura fixa para a legenda
  overflowY: 'auto',   // Adiciona scroll se a lista for maior que a altura
  maxHeight: '90%',    // Garante que a legenda não ultrapasse a altura do card
};

export const CategoryPercentageCard = ({ categories, totalIncome }: Props) => {
  const chartData = totalIncome > 0 
    ? categories.map(cat => ({
        ...cat,
        percentage: ((cat.value / totalIncome) * 100).toFixed(1)
      }))
    : [];

  return (
    <div className="genesi-card p-4 h-80 flex flex-col">
      <h3 className="text-lg font-semibold text-white mb-2">% de Gasto da Receita</h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          
          <Pie 
            data={chartData} 
            dataKey="value" 
            nameKey="name" 
            cx="40%" 
            cy="50%" 
            innerRadius={60} 
            outerRadius={80} 
            paddingAngle={0}
          >
            {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
          </Pie>

          <Tooltip 
            formatter={(value, name, props) => [`${props.payload.percentage}%`, name]} 
            contentStyle={{ backgroundColor: '#1f2937', 
                            border: '1px solid #4b5563', 
                            color: '#e5e7eb'}} 
          />
          
          {/* ✨ ALTERAÇÃO 2: Novas props na Legenda para posicioná-la na lateral */}
          <Legend 
            iconSize={10}
            layout="vertical" 
            verticalAlign="middle" 
            align="right" 
            wrapperStyle={legendWrapperStyle}
            formatter={(value) => <span className="text-white/80 text-xs">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};