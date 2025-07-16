import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface Category { name: string; value: number; color: string; }
interface Props {
  categories: Category[];
  totalIncome: number;
}

export const CategoryPercentageCard = ({ categories, totalIncome }: Props) => {
  const chartData = totalIncome > 0 
    ? categories.map(cat => ({
        ...cat,
        percentage: ((cat.value / totalIncome) * 100).toFixed(1)
      }))
    : [];

  return (
    <div className="genesi-card p-4 h-80 flex flex-col">
      <h3 className="text-lg font-semibold text-white">% de Gasto da Receita</h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
            {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
          </Pie>
          <Tooltip formatter={(value, name, props) => [`${props.payload.percentage}%`, name]} contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563' }} />
          <Legend formatter={(value) => <span className="text-white/80">{value}</span>} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};