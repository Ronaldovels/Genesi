import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  data: {
    entradas: number;
    saidas: number;
  };
}

export const IncomeVsExpenseCard = ({ data }: Props) => {
  const chartData = [
    { name: 'Receita', valor: data.entradas, fill: '#4ade80' }, // green-400
    { name: 'Despesa', valor: data.saidas, fill: '#f87171' }, // red-400
  ];

  return (
    <div className="genesi-card p-4 h-80 flex flex-col">
      <h3 className="text-lg font-semibold text-white mb-4">Receita vs. Despesa</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
          <XAxis type="number" stroke="#9ca3af" tickFormatter={(value) => `R$${value / 1000}k`} />
          <YAxis type="category" dataKey="name" stroke="#9ca3af" width={60} />
          <Tooltip cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563', color: '#e5e7eb' }} />
          <Bar dataKey="valor" barSize={35} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};