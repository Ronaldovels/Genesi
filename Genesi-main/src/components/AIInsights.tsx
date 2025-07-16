import React, { useContext, useEffect, useState, useCallback } from 'react';
import { Lightbulb, Sparkles, AlertTriangle, CheckCircle } from 'lucide-react';
import { AuthContext } from '@/contexts/AuthContext';
import axios from 'axios';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

const API_BASE_URL = import.meta.env.VITE_URL;

const meses = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

// Definir tipo para categoria
interface CategorySummary {
  _id: string;
  name: string;
  total: number;
  limit: number;
}

// Tipo para insight pontual
interface InsightPontual {
  id: string;
  type: string;
  icon: any;
  title: string;
  message: string;
  color: string;
  bgColor: string;
  date: string; // ISO string
  ignored?: boolean;
}

const AIInsights = () => {
  const { selectedAccount, user } = useContext(AuthContext)!;
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<any[]>([]);
  const [pontuais, setPontuais] = useState<InsightPontual[]>([]);
  const [showReport, setShowReport] = useState(false);
  const [reportMonth, setReportMonth] = useState<number>(new Date().getMonth() + 1);
  const [reportYear, setReportYear] = useState<number>(new Date().getFullYear());

  // Função para gerar insights pontuais a partir dos dados atuais e anteriores
  function gerarInsightsPontuais(
    catAtual: CategorySummary[],
    catAnterior: CategorySummary[],
    limiteMsgs: InsightPontual[],
    metaMsg: InsightPontual,
  ) {
    const insights: InsightPontual[] = [];
    // Para cada categoria do mês atual
    catAtual.forEach((cat) => {
      const anterior = catAnterior.find((c) => c.name === cat.name);
      // Limite ultrapassado já tratado
      // Primeiro gasto na categoria
      if (!anterior || anterior.total === 0) {
        if (cat.total > 0) {
          insights.push({
            id: `primeiro_${cat.name}`,
            type: 'info',
            icon: Lightbulb,
            title: 'Primeiro gasto na categoria',
            message: `Este é seu primeiro gasto registrado em ${cat.name}. Que tal acompanhar seus hábitos para economizar mais?`,
            color: 'text-blue-400',
            bgColor: 'bg-blue-400/10',
            date: new Date().toISOString(),
          });
        }
        return;
      }
      // Oportunidade de economia (ultrapassou 35%)
      const diff = cat.total - anterior.total;
      const perc = (diff / anterior.total) * 100;
      if (perc >= 35) {
        insights.push({
          id: `economia_${cat.name}`,
          type: 'tip',
          icon: Lightbulb,
          title: 'Oportunidade de Economia',
          message: `Você gastou ${perc.toFixed(0)}% a mais em ${cat.name} este mês. Considere planejar para economizar R$ ${diff.toFixed(0)}.`,
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-400/10',
          date: new Date().toISOString(),
        });
        return;
      }
      // Parabéns por economizar
      if (diff < 0) {
        insights.push({
          id: `parabens_${cat.name}`,
          type: 'success',
          icon: CheckCircle,
          title: 'Parabéns por economizar',
          message: `Você gastou ${Math.abs(perc).toFixed(0)}% menos em ${cat.name} este mês. Parabéns! Que tal planejar algo divertido para o fim de semana? Você ainda tem R$ ${(cat.limit - cat.total).toFixed(2)} do seu limite.`,
          color: 'text-green-400',
          bgColor: 'bg-green-400/10',
          date: new Date().toISOString(),
        });
        return;
      }
    });
    // Limite ultrapassado
    insights.push(...limiteMsgs);
    // Meta alcançada (exemplo)
    if (metaMsg) insights.push(metaMsg);
    return insights;
  }

  // Busca dados do mês atual e anterior
  const fetchInsights = useCallback(async () => {
    if (!selectedAccount) return;
    setLoading(true);
    try {
      // Dados do mês atual
      const catRes = await axios.get<CategorySummary[]>(`${API_BASE_URL}/api/finance/category-summary/${selectedAccount._id}`, {
        params: { month: selectedMonth, year: selectedYear }
      });
      // Dados do mês anterior
      let prevMonth = selectedMonth - 1;
      let prevYear = selectedYear;
      if (prevMonth < 1) { prevMonth = 12; prevYear -= 1; }
      const catPrevRes = await axios.get<CategorySummary[]>(`${API_BASE_URL}/api/finance/category-summary/${selectedAccount._id}`, {
        params: { month: prevMonth, year: prevYear }
      });
      // Investimentos do mês atual
      // (Ajuste a rota se necessário)
      // const investRes = await axios.get(`${API_BASE_URL}/api/investment/${selectedAccount._id}`, { params: { month: selectedMonth, year: selectedYear } });

      // --- Lógica dos insights ---
      // Oportunidade de Economia: para todas as categorias
      const economiaMsgs = catRes.data
        .map((catAtual) => {
          const catAnterior = catPrevRes.data.find((c) => c.name === catAtual.name);
          if (catAnterior && catAnterior.total > 0) {
            const diff = catAtual.total - catAnterior.total;
            const perc = (diff / catAnterior.total) * 100;
            if (perc >= 35) {
              return {
                type: 'tip',
                icon: Lightbulb,
                title: 'Oportunidade de Economia',
                message: `Você gastou ${perc.toFixed(0)}% a mais em ${catAtual.name} este mês. Considere planejar para economizar R$ ${diff.toFixed(0)}.`,
                color: 'text-yellow-400',
                bgColor: 'bg-yellow-400/10'
              };
            }
          }
          return null;
        })
        .filter(Boolean);
      // Meta Alcançada: exemplo fictício (ajuste conforme sua regra real)
      const metaMsg = {
        type: 'success',
        icon: CheckCircle,
        title: 'Meta Alcançada',
        message: 'Parabéns! Você atingiu sua meta de investimentos mensais com 5 dias de antecedência.',
        color: 'text-green-400',
        bgColor: 'bg-green-400/10'
      };
      // Atenção aos Gastos: exemplo com lazer
      const lazerAtual = catRes.data.find((c) => c.name.toLowerCase().includes('lazer'));
      const lazerAnterior = catPrevRes.data.find((c) => c.name.toLowerCase().includes('lazer'));
      let lazerMsg = null;
      if (lazerAtual && lazerAnterior && lazerAnterior.total > 0) {
        const diff = lazerAtual.total - lazerAnterior.total;
        const perc = (diff / lazerAnterior.total) * 100;
        if (perc > 20) {
          lazerMsg = {
            type: 'warning',
            icon: AlertTriangle,
            title: 'Atenção aos Gastos',
            message: `Seus gastos com lazer aumentaram ${perc.toFixed(0)}% comparado ao mês passado. Revise seu orçamento.`,
            color: 'text-orange-400',
            bgColor: 'bg-orange-400/10'
          };
        }
      }
      // Limite ultrapassado: para cada categoria
      const limiteMsgs = catRes.data
        .filter((cat) => cat.limit > 0 && cat.total > cat.limit)
        .map((cat) => ({
          type: 'danger',
          icon: AlertTriangle,
          title: 'Limite ultrapassado',
          message: `Você ultrapassou o limite da categoria ${cat.name} em R$ ${(cat.total - cat.limit).toFixed(2)}. Reveja seu orçamento.`,
          color: 'text-red-500',
          bgColor: 'bg-red-500/10'
        }));
      // Monta lista final
      const insightsArr = [...economiaMsgs, metaMsg, lazerMsg, ...limiteMsgs].filter(Boolean);
      setInsights(insightsArr);
    } catch (e) {
      setInsights([]);
    } finally {
      setLoading(false);
    }
  }, [selectedAccount, selectedMonth, selectedYear]);

  // Carregar insights pontuais do localStorage
  useEffect(() => {
    const key = `insights_pontuais_${selectedAccount?._id}_${selectedMonth}_${selectedYear}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      setPontuais(JSON.parse(saved));
    }
  }, [selectedAccount, selectedMonth, selectedYear]);

  // Salvar insights pontuais no localStorage
  useEffect(() => {
    const key = `insights_pontuais_${selectedAccount?._id}_${selectedMonth}_${selectedYear}`;
    localStorage.setItem(key, JSON.stringify(pontuais));
  }, [pontuais, selectedAccount, selectedMonth, selectedYear]);

  // Função para adicionar insight pontual (só se não existir para o evento)
  const addPontual = (insight: Omit<InsightPontual, 'id' | 'date'>) => {
    setPontuais((prev) => {
      const exists = prev.some(p => p.title === insight.title && p.message === insight.message);
      if (exists) return prev;
      return [
        ...prev,
        {
          ...insight,
          id: `${insight.title}_${insight.message}_${Date.now()}`,
          date: new Date().toISOString(),
        }
      ];
    });
  };

  // Exemplo: adicionar insights pontuais ao detectar eventos
  useEffect(() => {
    insights.forEach((insight: any) => {
      addPontual(insight);
    });
    // eslint-disable-next-line
  }, [insights]);

  // Função para ignorar insight
  const ignoreInsight = (id: string) => {
    setPontuais((prev) => prev.map(p => p.id === id ? { ...p, ignored: true } : p));
  };

  useEffect(() => {
    if (!selectedAccount) return;
    const gerar = async () => {
      setLoading(true);
      try {
        // Dados do mês atual
        const catRes = await axios.get<CategorySummary[]>(`${API_BASE_URL}/api/finance/category-summary/${selectedAccount._id}`, {
          params: { month: selectedMonth, year: selectedYear }
        });
        // Dados do mês anterior
        let prevMonth = selectedMonth - 1;
        let prevYear = selectedYear;
        if (prevMonth < 1) { prevMonth = 12; prevYear -= 1; }
        const catPrevRes = await axios.get<CategorySummary[]>(`${API_BASE_URL}/api/finance/category-summary/${selectedAccount._id}`, {
          params: { month: prevMonth, year: prevYear }
        });
        // Limite ultrapassado: para cada categoria
        const limiteMsgs = catRes.data
          .filter((cat) => cat.limit > 0 && cat.total > cat.limit)
          .map((cat) => ({
            id: `limite_${cat.name}`,
            type: 'danger',
            icon: AlertTriangle,
            title: 'Limite ultrapassado',
            message: `Você ultrapassou o limite da categoria ${cat.name} em R$ ${(cat.total - cat.limit).toFixed(2)}. Reveja seu orçamento.`,
            color: 'text-red-500',
            bgColor: 'bg-red-500/10',
            date: new Date().toISOString(),
          }));
        // Meta Alcançada (exemplo)
        const metaMsg = {
          id: 'meta_alcancada',
          type: 'success',
          icon: CheckCircle,
          title: 'Meta Alcançada',
          message: 'Parabéns! Você atingiu sua meta de investimentos mensais com 5 dias de antecedência.',
          color: 'text-green-400',
          bgColor: 'bg-green-400/10',
          date: new Date().toISOString(),
        };
        // Gerar insights pontuais
        const novos = gerarInsightsPontuais(catRes.data, catPrevRes.data, limiteMsgs, metaMsg);
        // Adicionar apenas os que ainda não existem
        setPontuais((prev) => {
          const idsExistentes = new Set(prev.map(p => p.id));
          return [
            ...prev,
            ...novos.filter(n => !idsExistentes.has(n.id))
          ];
        });
      } catch (e) {
        // erro
      } finally {
        setLoading(false);
      }
    };
    gerar();
    // eslint-disable-next-line
  }, [selectedAccount, selectedMonth, selectedYear]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  // Filtro de mês/ano
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
        <div className="ml-auto flex gap-2">
          <Select value={String(selectedMonth)} onValueChange={v => setSelectedMonth(Number(v))}>
            <SelectTrigger className="w-28">
              <SelectValue>{meses[selectedMonth-1]}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {meses.map((m, i) => (
                <SelectItem key={i+1} value={String(i+1)}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={String(selectedYear)} onValueChange={v => setSelectedYear(Number(v))}>
            <SelectTrigger className="w-20">
              <SelectValue>{selectedYear}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Linha do tempo dos insights pontuais */}
      <div className="mb-6">
        <h3 className="text-white font-semibold mb-2">Linha do tempo de insights</h3>
        <div className="space-y-3">
          {pontuais.filter(p => !p.ignored).length === 0 && (
            <div className="text-white/60">Nenhum insight gerado neste mês ainda.</div>
          )}
          {pontuais.filter(p => !p.ignored).map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.id} className={`flex items-center gap-3 p-3 rounded-lg border border-white/10 ${p.bgColor}`}>
                <div className={`p-2 rounded-lg bg-white/10 ${p.color}`}><Icon className="w-5 h-5" /></div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-white mb-0">{p.title}</h4>
                    <span className="text-xs text-white/50">{format(new Date(p.date), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}</span>
                  </div>
                  <p className="text-white/80 text-sm mb-0">{p.message}</p>
                </div>
                <button onClick={() => ignoreInsight(p.id)} className="ml-2 text-xs text-white/60 hover:text-red-400">Ignorar</button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Botão de relatório de insights */}
      <div className="mb-4 flex items-center gap-2">
        <button className="genesi-button bg-genesi-gradient hover:opacity-90 text-sm" onClick={() => setShowReport(true)}>
          Extrair relatório de insights
        </button>
        <Select value={String(reportMonth)} onValueChange={v => setReportMonth(Number(v))}>
          <SelectTrigger className="w-28">
            <SelectValue>{meses[reportMonth-1]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {meses.map((m, i) => (
              <SelectItem key={i+1} value={String(i+1)}>{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={String(reportYear)} onValueChange={v => setReportYear(Number(v))}>
          <SelectTrigger className="w-20">
            <SelectValue>{reportYear}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => (
              <SelectItem key={y} value={String(y)}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Modal/relatório de insights (layout inicial) */}
      {showReport && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#181f2a] rounded-lg p-8 w-full max-w-2xl shadow-lg relative">
            <button className="absolute top-2 right-2 text-white/60 hover:text-red-400" onClick={() => setShowReport(false)}>Fechar</button>
            <h2 className="text-xl font-bold text-white mb-4">Relatório de Insights - {meses[reportMonth-1]}/{reportYear}</h2>
            {/* Recalcular e exibir todos os insights do mês selecionado */}
            <RelatorioInsights
              accountId={selectedAccount?._id}
              month={reportMonth}
              year={reportYear}
            />
          </div>
        </div>
      )}

      {/* Insights do mês atual (carregamento e fallback) */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-white/60">Carregando insights...</div>
        ) : insights.length === 0 ? (
          <div className="text-white/60">Nenhum insight encontrado para este período.</div>
        ) : null}
      </div>
    </div>
  );
};

// (pode ser no mesmo arquivo, para simplificar)
function RelatorioInsights({ accountId, month, year }: { accountId: string, month: number, year: number }) {
  const [insights, setInsights] = useState<InsightPontual[]>([]);
  useEffect(() => {
    const gerar = async () => {
      // Buscar dados do mês e anterior, gerar insights igual ao useEffect principal
      const catRes = await axios.get<CategorySummary[]>(`${API_BASE_URL}/api/finance/category-summary/${accountId}`, {
        params: { month, year }
      });
      let prevMonth = month - 1;
      let prevYear = year;
      if (prevMonth < 1) { prevMonth = 12; prevYear -= 1; }
      const catPrevRes = await axios.get<CategorySummary[]>(`${API_BASE_URL}/api/finance/category-summary/${accountId}`, {
        params: { month: prevMonth, year: prevYear }
      });
      const limiteMsgs = catRes.data
        .filter((cat) => cat.limit > 0 && cat.total > cat.limit)
        .map((cat) => ({
          id: `limite_${cat.name}`,
          type: 'danger',
          icon: AlertTriangle,
          title: 'Limite ultrapassado',
          message: `Você ultrapassou o limite da categoria ${cat.name} em R$ ${(cat.total - cat.limit).toFixed(2)}. Reveja seu orçamento.`,
          color: 'text-red-500',
          bgColor: 'bg-red-500/10',
          date: new Date().toISOString(),
        }));
      const metaMsg = {
        id: 'meta_alcancada',
        type: 'success',
        icon: CheckCircle,
        title: 'Meta Alcançada',
        message: 'Parabéns! Você atingiu sua meta de investimentos mensais com 5 dias de antecedência.',
        color: 'text-green-400',
        bgColor: 'bg-green-400/10',
        date: new Date().toISOString(),
      };
      const todos = gerarInsightsPontuais(catRes.data, catPrevRes.data, limiteMsgs, metaMsg);
      setInsights(todos);
    };
    gerar();
  }, [accountId, month, year]);
  return (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {insights.length === 0 && <div className="text-white/60">Nenhum insight gerado neste mês.</div>}
      {insights.map((p) => {
        const Icon = p.icon;
        return (
          <div key={p.id} className={`flex items-center gap-3 p-3 rounded-lg border border-white/10 ${p.bgColor}`}>
            <div className={`p-2 rounded-lg bg-white/10 ${p.color}`}><Icon className="w-5 h-5" /></div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-white mb-0">{p.title}</h4>
              </div>
              <p className="text-white/80 text-sm mb-0">{p.message}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default AIInsights;
