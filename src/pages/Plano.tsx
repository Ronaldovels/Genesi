import React, { useState, useEffect, useContext } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieLabelRenderProps } from 'recharts';
import { Plus, TrendingUp } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { Skeleton } from '../components/ui/skeleton';

// Interfaces
interface CategoryData {
  name: string;
  value: number;
  color: string;
  limit: number;
}

interface RechartsPayload {
  payload: CategoryData;
  // Adicione outras propriedades se necessário
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: RechartsPayload[];
}

// Função para gerar cores HSL vibrantes e distintas
const generateColor = (index: number): string => {
  const hue = (index * 137.508) % 360; // Usando a golden angle para gerar matizes distintas
  return `hsl(${hue}, 70%, 50%)`;
};

const Plano = () => {
  const [viewMode, setViewMode] = useState<'pie' | 'bar'>('pie');
  const [categoriesData, setCategoriesData] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const authContext = useContext(AuthContext);

  if (!authContext) {
    throw new Error('AuthContext não foi encontrado');
  }
  const { selectedAccount } = authContext;

  useEffect(() => {
    const fetchCategorySummary = async () => {
      if (!selectedAccount) {
        setLoading(false);
        setCategoriesData([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(`/api/finance/category-summary/${selectedAccount._id}`, {
          headers: { 'ngrok-skip-browser-warning': 'true' }
        });
        
        const dataWithColors: CategoryData[] = response.data.map((item: { name: string, total: number, limit: number }, index: number) => ({
          name: item.name,
          value: item.total,
          limit: item.limit,
          color: generateColor(index),
        }));
        
        setCategoriesData(dataWithColors);

      } catch (err) {
        console.error("Erro ao buscar resumo de categorias:", err);
        setError("Não foi possível carregar os dados de categorias.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategorySummary();
  }, [selectedAccount]);

  const renderCustomizedLabel = (props: PieLabelRenderProps) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
    if (percent === undefined || percent < 0.05) return null;

    const RADIAN = Math.PI / 180;
    // @ts-expect-error - Recharts types can be tricky
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    // @ts-expect-error - Recharts types can be tricky
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    // @ts-expect-error - Recharts types can be tricky
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > (cx as number) ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="10"
        fontWeight="bold"
        className="sm:text-xs"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="genesi-card p-2 sm:p-3 border border-white/20 text-xs sm:text-sm">
          <p className="text-white font-semibold">{data.name}</p>
          <p className="text-genesi-blue">
            R$ {(data.value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      );
    }
    return null;
  };

  const renderContent = () => {
    if (loading) {
      return <Skeleton className="h-80 w-full" />;
    }

    if (error) {
      return <div className="text-center text-red-400">{error}</div>;
    }

    if (categoriesData.length === 0) {
      return <div className="text-center text-white/60">Nenhuma despesa categorizada encontrada para esta conta.</div>;
    }

    return (
      <ResponsiveContainer width="100%" height={320}>
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
      </ResponsiveContainer>
    );
  };

  const renderCategoryList = () => {
    if (loading) {
      return (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
      );
    }
    
    if (error || categoriesData.length === 0) {
      return null; // Não mostra a lista se houver erro ou não houver dados
    }

    return (
      <div className="space-y-3">
        {categoriesData.map((category) => (
          <div 
            key={category.name} 
            className="p-4 rounded-xl transition-all duration-300 hover:scale-[1.03]"
            style={{ 
              backgroundColor: category.color.replace(')', ', 0.3)').replace('hsl', 'hsla'),
              boxShadow: `0 0 15px -5px ${category.color.replace(')', ', 0.6)').replace('hsl', 'hsla')}`
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-white font-semibold text-base">{category.name}</span>
              <span className="text-white/90 font-bold text-base">
                R$ {(category.value || 0).toLocaleString('pt-BR')}
              </span>
            </div>
            <div className="text-left mt-2">
              <span className="text-white/60 text-xs">
                Limite: R$ {(category.limit || 0).toLocaleString('pt-BR')}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  }

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
      <div className="genesi-card h-[400px] flex flex-col justify-center">
        {renderContent()}
      </div>

      {/* Categories List */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        <div className="genesi-card">
          <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Categorias Atuais</h3>
          {renderCategoryList()}
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
