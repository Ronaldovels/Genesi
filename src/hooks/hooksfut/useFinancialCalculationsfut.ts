import { useState, useMemo, useEffect, useContext } from 'react';
import { FinancialData, Project, ChartData } from '@/types/financialfut';
import { AuthContext } from '@/contexts/AuthContext';
import axios from 'axios'
import { toast } from 'sonner';


const API_BASE_URL = import.meta.env.VITE_URL; 


export const useFinancialCalculations = () => {
  // Estado dos dados financeiros principais (continua local)
  const [financialData, setFinancialData] = useState<FinancialData>({
    currentAge: 22,
    retirementAge: 51,
    desiredIncome: 5700,
    otherIncomes: 1300,
    monthlyInvestment: 1060,
    accumulationRate: 6,
    postRetirementRate: 4,
  });

  // Estado dos projetos (agora populado pela API)
  const [projects, setProjects] = useState<Project[]>([]);
  
  // Pegamos o usuário do contexto para saber para quem buscar/salvar os projetos
  const { user } = useContext(AuthContext)!;

  // Efeito para buscar os projetos do usuário quando o hook é inicializado
  useEffect(() => {
    if (user?.id) {
      const fetchProjects = async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/api/projects/${user.id}`);
          // A API retorna o _id do mongo, mas o frontend pode usar 'id'. Mapeamos para garantir compatibilidade.
          const projectsWithId = response.data.map((p: any) => ({ ...p, id: p._id }));
          setProjects(projectsWithId);
        } catch (error) {
          console.error("Erro ao buscar projetos:", error);
          toast.error("Não foi possível carregar seus projetos.");
        }
      };
      fetchProjects();
    }
  }, [user]); // Roda sempre que o usuário (logado) mudar


  // O cálculo do gráfico não muda, ele apenas usará a lista de 'projects' vinda do backend
  const chartData = useMemo(() => {
    const data: ChartData[] = [];
    const { currentAge, retirementAge, desiredIncome, otherIncomes, monthlyInvestment, accumulationRate, postRetirementRate } = financialData;
    
    const activeProjects = projects.filter(p => p.isActive);
    
    const rendaLiquidaNecessaria = Math.max(0, desiredIncome - otherIncomes);
    const aposentadoriaIdeal = rendaLiquidaNecessaria > 0 ? (rendaLiquidaNecessaria * 12) / (postRetirementRate / 100) : 0;
    
    let patrimonioPrincipal = 0;
    let patrimonioTotal = 0;
    
    for (let age = currentAge; age <= 100; age++) {
      const yearsFromNow = age - currentAge;
      const currentYear = new Date().getFullYear() + yearsFromNow;
      
      if (age <= retirementAge) {
        if (age === currentAge) {
          patrimonioTotal = monthlyInvestment * 12;
        } else {
          patrimonioTotal = patrimonioTotal * (1 + accumulationRate / 100) + (monthlyInvestment * 12);
        }
        patrimonioPrincipal += monthlyInvestment * 12;
        
        let totalProjectCosts = 0;
        activeProjects.forEach(project => {
          const projectDate = project.startDate.split('/');
          const projectYear = parseInt(projectDate[2]);
          
          if (project.isTermProject) {
            const finalYear = projectYear + (project.repetition === 'mensal' ? Math.ceil(project.repetitionCount / 12) : project.repetition === 'anual' ? project.repetitionCount : 0);
            if (currentYear === finalYear) {
              totalProjectCosts += project.totalValue;
            }
          } else {
            if (project.repetition === 'unica' && projectYear === currentYear) {
              totalProjectCosts += project.totalValue;
            } else if (project.repetition === 'anual') {
              if (currentYear >= projectYear && currentYear < projectYear + project.repetitionCount) {
                const annualCost = project.totalValue / project.repetitionCount;
                totalProjectCosts += annualCost;
              }
            }
          }
        });
        
        patrimonioTotal = Math.max(0, patrimonioTotal - totalProjectCosts);
        patrimonioPrincipal = Math.max(0, patrimonioPrincipal - totalProjectCosts);
        
      } else {
        const retiradaAnual = rendaLiquidaNecessaria * 12;
        patrimonioTotal = Math.max(0, patrimonioTotal * (1 + postRetirementRate / 100) - retiradaAnual);
      }
      
      data.push({
        age,
        patrimonioTotal: Math.max(0, patrimonioTotal),
        patrimonioPrincipal: Math.max(0, patrimonioPrincipal),
        aposentadoriaIdeal: aposentadoriaIdeal,
      });
    }
    
    return data;
  }, [financialData, projects]);

  const updateFinancialData = (updates: Partial<FinancialData>) => {
    setFinancialData(prev => ({ ...prev, ...updates }));
  };

  // --- Funções de Projeto Refatoradas para usar a API ---

  const addProject = async (projectData: Project) => {
  if (!user?.id) {
    toast.error("Usuário não autenticado.");
    return;
  }
  try {
    // A MÁGICA ACONTECE AQUI:
    // Usamos a desestruturação para separar o 'id' do resto dos dados do projeto.
    const { id, ...restOfProject } = projectData;

    // O novo payload contém apenas os dados que o backend conhece, mais o ID do usuário.
    const payload = { 
      ...restOfProject, 
      user: user.id,
    };
    

    const response = await axios.post(`${API_BASE_URL}/api/projects`, payload);
    
    const newProjectFromApi = { ...response.data, id: response.data._id };
    setProjects(prev => [...prev, newProjectFromApi]);
    
    // A notificação de sucesso já está na página Futuro.tsx
    
  } catch (error) {
    console.error("Erro detalhado do Axios:", error);
    toast.error("Erro ao salvar o novo projeto.");
  }
};

// NOVO: Função para atualizar um projeto existente
const updateProject = async (id: string, updates: Partial<Project>) => {
  try {
    // Faz a chamada PUT para a sua API, conforme definido no backend
    const response = await axios.put(`${API_BASE_URL}/api/projects/${id}`, updates);
    
    // Converte o _id do MongoDB para id para manter a consistência no frontend
    const updatedProjectFromApi = { ...response.data, id: response.data._id };

    // Atualiza a lista de projetos no estado local
    setProjects(prev => 
      prev.map(p => (p.id === id ? updatedProjectFromApi : p))
    );
    
    // A notificação de sucesso já está no Index.tsx, então não precisa aqui.

  } catch (error) {
    console.error("Erro ao atualizar projeto:", error);
    toast.error("Não foi possível salvar as alterações do projeto.");
  }
};


  const toggleProject = async (id: string) => {
    try {
        const response = await axios.patch(`${API_BASE_URL}/api/projects/toggle/${id}`);
        const toggledProject = { ...response.data, id: response.data._id };
        setProjects(prev => prev.map(p => p.id === id ? toggledProject : p));
    } catch (error) {
        toast.error("Erro ao ativar/desativar o projeto.");
    }
  };

  const deleteProject = async (id: string) => {
    if(!window.confirm("Tem certeza que deseja deletar este projeto?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/projects/${id}`);
      setProjects(prev => prev.filter(p => p.id !== id)); // Usa o ID local para remover da lista
      toast.success("Projeto deletado com sucesso.");
    } catch (error) {
      toast.error("Erro ao deletar o projeto.");
    }
  };

  // Cálculos derivados (não mudam)
  const retirementData = chartData.find(d => d.age === financialData.retirementAge);
  const finalPatrimony = retirementData?.patrimonioTotal || 0;
  const targetAge = chartData.find(d => d.patrimonioTotal >= d.aposentadoriaIdeal)?.age || 100;
  
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
    updateProject,
    addProject,
    toggleProject,
    deleteProject,
    finalPatrimony,
    targetAge,
    monthlyNeeded,
  };
};