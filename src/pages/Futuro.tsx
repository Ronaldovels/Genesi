
import { useFinancialCalculations } from '@/hooks/hooksfut/useFinancialCalculationsfut';
import { FinancialChart } from '@/components/componentsfut/FinancialChart';
import { ControlSliders } from '@/components/componentsfut/ControlSliders';
import { SettingsModal } from '@/components/componentsfut/SettingsModal';
import { ProjectModal } from '@/components/componentsfut/ProjectModal';
import { ProjectsList } from '@/components/componentsfut/ProjectsList';
import { toast } from 'sonner';

const Index = () => {
  const {
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
  } = useFinancialCalculations();

  const handleAddProject = (project: any) => {
    addProject(project);
    toast.success('Projeto adicionado com sucesso!');
  };

  const handleUpdateProject = (id: string, updates: any) => {
    updateProject(id, updates);
    toast.success('Projeto atualizado!');
  };

  const handleDeleteProject = (id: string) => {
    deleteProject(id);
    toast.success('Projeto removido!');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Seção principal com gráfico e controles - altura reduzida */}
      <div className="h-[85vh] flex w-full">
        {/* Gráfico - flex-1 para ocupar espaço restante */}
        <div className="flex-1 bg-slate-800 p-6 flex flex-col">
          <div className="mb-4">
            <h2 className="text-xl font-medium text-white">Independência financeira</h2>
          </div>
          
          {/* Controles de período na parte superior direita do gráfico */}
          <div className="flex justify-end mb-4">
            <div className="flex gap-2 items-center">
              <span className="text-sm text-slate-400 mr-2">Período:</span>
              {[
                { label: '2 anos', value: 2 },
                { label: '5 anos', value: 5 },
                { label: '10 anos', value: 10 },
                { label: 'Máximo', value: 0 },
              ].map((range) => (
                <button
                  key={range.value}
                  className="h-8 px-3 text-xs bg-slate-600 border border-slate-500 text-white hover:bg-slate-500 rounded"
                >
                  {range.label}
                </button>
              ))}
              <SettingsModal data={financialData} onUpdate={updateFinancialData} />
            </div>
          </div>
          
          <div className="flex-1">
            <FinancialChart data={chartData} currentAge={financialData.currentAge} />
          </div>
        </div>

        {/* Controles - largura fixa */}
        <div className="w-80 bg-slate-800 p-6 flex flex-col">
          {/* Mensagem de investimento necessário */}
          <div className="mb-6">
            <div className="bg-emerald-900/30 p-4 rounded-lg border border-emerald-700/50">
              <p className="text-sm text-emerald-300 mb-1">
                Você precisa investir <strong className="text-emerald-200">{formatCurrency(monthlyNeeded)}/mês</strong>
              </p>
              <p className="text-sm text-emerald-300">
                para chegar na sua aposentadoria ideal com{' '}
                <strong className="text-emerald-200">{formatCurrency(finalPatrimony)}</strong> acumulados.
              </p>
            </div>
          </div>

          {/* Controles - ocupando o resto do espaço */}
          <div className="flex-1">
            <ControlSliders
              data={financialData}
              onUpdate={updateFinancialData}
              finalPatrimony={finalPatrimony}
              monthlyNeeded={monthlyNeeded}
            />
          </div>
        </div>
      </div>

      {/* Seção de projetos - posicionada abaixo da seção principal */}
      <div className="px-6 py-6 bg-slate-900">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-medium text-white">Meus Projetos</h2>
          <ProjectModal onSave={handleAddProject} />
        </div>
        <ProjectsList
          projects={projects}
          onToggle={toggleProject}
          onUpdate={handleUpdateProject}
          onDelete={handleDeleteProject}
        />
      </div>
    </div>
  );
};

export default Index;