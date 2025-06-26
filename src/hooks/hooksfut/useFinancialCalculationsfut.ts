import { useState, useMemo } from 'react';
import { FinancialData, Project, ChartData } from '@/types/financial';

export const useFinancialCalculations = () => {
  const [financialData, setFinancialData] = useState<FinancialData>({
    currentAge: 22,
    retirementAge: 51,
    desiredIncome: 5700,
    otherIncomes: 1300,
    monthlyInvestment: 1060,
    accumulationRate: 6,
    postRetirementRate: 4,
  });

  const [projects, setProjects] = useState<Project[]>([]);

  const chartData = useMemo(() => {
    const data: ChartData[] = [];
    const { currentAge, retirementAge, desiredIncome, otherIncomes, monthlyInvestment, accumulationRate, postRetirementRate } = financialData;
    
    // Calcular projetos ativos
    const activeProjects = projects.filter(p => p.isActive);
    
    // Calcular aposentadoria ideal (patrimônio necessário)
    const rendaLiquidaNecessaria = Math.max(0, desiredIncome - otherIncomes);
    const aposentadoriaIdeal = rendaLiquidaNecessaria > 0 ? (rendaLiquidaNecessaria * 12) / (postRetirementRate / 100) : 0;
    
    // Inicializar variáveis
    let patrimonioPrincipal = 0; // Soma total dos aportes
    let patrimonioTotal = 0; // Patrimônio com juros compostos
    
    // Gerar dados a partir da idade atual do usuário
    for (let age = currentAge; age <= 100; age++) {
      const yearsFromNow = age - currentAge;
      const currentYear = new Date().getFullYear() + yearsFromNow;
      
      if (age <= retirementAge) {
        // FASE DE ACUMULAÇÃO
        
        // A) Patrimônio principal investido (azul) - soma simples dos aportes
        patrimonioPrincipal += monthlyInvestment * 12;
        
        // B) Patrimônio total projetado (verde) - com juros compostos
        if (age === currentAge) {
          // Primeiro ano
          patrimonioTotal = monthlyInvestment * 12;
        } else {
          // Aplicar juros no patrimônio anterior e adicionar novos aportes
          patrimonioTotal = patrimonioTotal * (1 + accumulationRate / 100) + (monthlyInvestment * 12);
        }
        
        // Subtrair custos dos projetos ativos no ano específico
        let totalProjectCosts = 0;
        
        activeProjects.forEach(project => {
          const projectDate = project.startDate.split('/');
          const projectYear = parseInt(projectDate[2]);
          
          if (project.isTermProject) {
            // Deduzir o valor total apenas na data final (data inicial + quantidade de repetições)
            const finalYear = projectYear + (project.repetition === 'mensal' ? Math.ceil(project.repetitionCount / 12) : project.repetition === 'anual' ? project.repetitionCount : 0);
            if (currentYear === finalYear) {
              totalProjectCosts += project.totalValue;
            }
          } else {
            if (project.repetition === 'unica' && projectYear === currentYear) {
              totalProjectCosts += project.totalValue;
            } else if (project.repetition === 'anual') {
              // Para projetos anuais, verificar se está no período ativo
              if (currentYear >= projectYear && currentYear < projectYear + project.repetitionCount) {
                const annualCost = project.totalValue / project.repetitionCount;
                totalProjectCosts += annualCost;
              }
            }
          }
        });
        
        // Aplicar custos dos projetos
        patrimonioTotal = Math.max(0, patrimonioTotal - totalProjectCosts);
        patrimonioPrincipal = Math.max(0, patrimonioPrincipal - totalProjectCosts);
        
      } else {
        // FASE PÓS-APOSENTADORIA - apenas retiradas
        const retiradaAnual = rendaLiquidaNecessaria * 12;
        
        // Aplicar juros e subtrair retiradas
        patrimonioTotal = Math.max(0, patrimonioTotal * (1 + postRetirementRate / 100) - retiradaAnual);
        
        // Patrimônio principal não cresce mais após aposentadoria (mantém valor final)
      }
      
      data.push({
        age,
        patrimonioTotal: Math.max(0, patrimonioTotal),
        patrimonioPrincipal: Math.max(0, patrimonioPrincipal),
        aposentadoriaIdeal: aposentadoriaIdeal, // Valor constante
      });
    }
    
    return data;
  }, [financialData, projects]);

  const updateFinancialData = (updates: Partial<FinancialData>) => {
    setFinancialData(prev => ({ ...prev, ...updates }));
  };

  const addProject = (project: Omit<Project, 'id'>) => {
    const newProject = {
      ...project,
      id: Date.now().toString(),
    };
    setProjects(prev => [...prev, newProject]);
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const toggleProject = (id: string) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p));
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  // Cálculos derivados
  const retirementData = chartData.find(d => d.age === financialData.retirementAge);
  const finalPatrimony = retirementData?.patrimonioTotal || 0;
  const targetAge = chartData.find(d => d.patrimonioTotal >= d.aposentadoriaIdeal)?.age || 100;
  
  // Cálculo do aporte mensal necessário para atingir a aposentadoria ideal
  const rendaLiquidaNecessaria = Math.max(0, financialData.desiredIncome - financialData.otherIncomes);
  const patrimonioNecessario = rendaLiquidaNecessaria > 0 ? (rendaLiquidaNecessaria * 12) / (financialData.postRetirementRate / 100) : 0;
  const anosParaAposentadoria = financialData.retirementAge - financialData.currentAge;
  
  let monthlyNeeded = 0;
  if (anosParaAposentadoria > 0 && patrimonioNecessario > 0) {
    const fatorJurosCompostos = Math.pow(1 + financialData.accumulationRate / 100, anosParaAposentadoria);
    monthlyNeeded = (patrimonioNecessario * (financialData.accumulationRate / 100)) / ((fatorJurosCompostos - 1) * 12);
  }

  return {
    financialData,
    projects,
    chartData,
    updateFinancialData,
    addProject,
    updateProject,
    toggleProject,
    deleteProject,
    finalPatrimony,
    targetAge,
    monthlyNeeded,
  };
};
