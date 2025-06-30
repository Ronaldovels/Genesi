import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';

interface Category { name: string; value: number; limit: number; }
interface Props {
  categories: Category[];
}

export const PlannedVsActualCard = ({ categories }: Props) => {
  const totalSpent = categories.reduce((sum, cat) => sum + cat.value, 0);
  const totalLimit = categories.reduce((sum, cat) => sum + cat.limit, 0);
  const percentage = totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0;
  
  const radialData = [{ name: 'Total', value: percentage }];

  return (
    <div className="genesi-card p-4 h-80 flex flex-col">
      <h3 className="text-lg font-semibold text-white mb-4">Planejado vs. Realizado</h3>
      <div className="flex-1 grid grid-cols-3 gap-4">
        <div className="col-span-2">
           <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categories} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #4b5563' }} />
              <Legend formatter={(value) => <span className="text-white/80 capitalize">{value}</span>} />
              <Bar dataKey="limit" name="Limite" fill="#4f46e5" />
              <Bar dataKey="value" name="Gasto" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="col-span-1 flex flex-col items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
             <RadialBarChart innerRadius="70%" outerRadius="85%" data={radialData} startAngle={90} endAngle={-270} barSize={15}>
                <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                <RadialBar background dataKey="value" cornerRadius={10} fill="#22c55e" />
                <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-xl font-bold fill-white">
                  {`${percentage.toFixed(0)}%`}
                </text>
             </RadialBarChart>
          </ResponsiveContainer>
           <p className="text-center text-xs text-white/70 -mt-4">do planejado</p>
        </div>
      </div>
    </div>
  );
};