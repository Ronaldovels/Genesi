import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Project } from '@/types/financialfut';
import { PlusCircle, Edit, Trash2, Home, Plane, Building, Heart, Smartphone, GraduationCap, Gamepad2, Briefcase, Activity } from 'lucide-react';
import { EditProjectModal } from './EditProjectModal';
import { AddContributionModal } from './AddContributionModal';

interface ProjectsListProps {
  projects: Project[];
  onToggle: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Project>) => void;
  onDelete: (id: string) => void;
}

const PRIORITIES = ['Essencial', 'Desejo', 'Sonho'] as const;
type Priority = typeof PRIORITIES[number];

export const ProjectsList = ({ projects, onToggle, onUpdate, onDelete }: ProjectsListProps) => {
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [contributionProject, setContributionProject] = useState<Project | null>(null);
  const [activePriority, setActivePriority] = useState<Priority | 'Todas'>('Todas');

  const projectToEdit = editingProject
    ? projects.find(p => p.id === editingProject)
    : undefined;

  const handleSaveChanges = (updates: Partial<Project>) => {
    if (editingProject) {
      onUpdate(editingProject, updates);
      setEditingProject(null);
    }
  };

  const handleSaveContribution = (amount: number) => {
    if (!contributionProject) return;
    const newAllocatedValue = contributionProject.allocatedValue + amount;
    onUpdate(contributionProject.id, { allocatedValue: newAllocatedValue });
    setContributionProject(null);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Essencial': return 'bg-emerald-600';
      case 'Desejo': return 'bg-yellow-500';
      case 'Sonho': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Viagem': return <Plane className="h-4 w-4" />;
      case 'Veículo': return <Building className="h-4 w-4" />;
      case 'Casa': return <Home className="h-4 w-4" />;
      case 'Família': return <Heart className="h-4 w-4" />;
      case 'Eletrônico': return <Smartphone className="h-4 w-4" />;
      case 'Educação': return <GraduationCap className="h-4 w-4" />;
      case 'Hobby': return <Gamepad2 className="h-4 w-4" />;
      case 'Profissional': return <Briefcase className="h-4 w-4" />;
      case 'Saúde': return <Activity className="h-4 w-4" />;
      default: return <Building className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Viagem': return 'text-emerald-400 bg-emerald-900/30';
      case 'Veículo': return 'text-blue-400 bg-blue-900/30';
      case 'Casa': return 'text-cyan-400 bg-cyan-900/30';
      case 'Família': return 'text-pink-400 bg-pink-900/30';
      case 'Eletrônico': return 'text-yellow-400 bg-yellow-900/30';
      case 'Educação': return 'text-orange-400 bg-orange-900/30';
      case 'Hobby': return 'text-purple-400 bg-purple-900/30';
      case 'Profissional': return 'text-indigo-400 bg-indigo-900/30';
      case 'Saúde': return 'text-green-400 bg-green-900/30';
      default: return 'text-gray-400 bg-gray-900/30';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return dateString;
  };

  const grouped = PRIORITIES.map(priority => {
    const filtered = projects.filter(p => p.priority === priority);
    const total = filtered.reduce((sum, p) => sum + (p.isActive ? p.totalValue : 0), 0);
    const allActive = filtered.length > 0 && filtered.every(p => p.isActive);
    return { priority, projects: filtered, total, allActive };
  });

  const prioritiesToShow = activePriority === 'Todas' ? PRIORITIES : [activePriority];

  return (
    <div className="space-y-4 bg-slate-900 rounded-xl p-6">
      {/* Filtros de prioridade */}
      <div className="flex gap-2 mb-4">
        <button
          className={`px-4 py-1 rounded ${activePriority === 'Todas' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'}`}
          onClick={() => setActivePriority('Todas')}
        >Todas</button>
        {PRIORITIES.map(p => (
          <button
            key={p}
            className={`px-4 py-1 rounded ${activePriority === p ? getPriorityColor(p) + ' text-white' : 'bg-slate-200 text-slate-700'}`}
            onClick={() => setActivePriority(p)}
          >{p}</button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {grouped.filter(g => prioritiesToShow.includes(g.priority)).map(group => (
          <div key={group.priority} className="bg-slate-800 rounded-lg p-4 border border-slate-700 flex flex-col">
            {/* Header da prioridade */}
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="font-semibold text-white text-base">{group.priority}</span>
                <div className="text-xs text-slate-300">{formatCurrency(group.total)}</div>
              </div>
              <Switch
                checked={group.allActive}
                onCheckedChange={() => {
                  group.projects.forEach(p => onToggle(p.id));
                }}
              />
            </div>
            {/* Lista de projetos da prioridade */}
            <div className="space-y-3">
              {group.projects.map((project) => {
                const currentAmount = project.allocatedValue;
                const progressPercentage = project.totalValue > 0
                  ? (project.allocatedValue / project.totalValue) * 100
                  : 0;

                return (
                  <div key={project.id} className="bg-slate-900 rounded-lg p-3 border border-slate-700 shadow-sm">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg ${getTypeColor(project.type)}`}>
                          {getTypeIcon(project.type)}
                        </div>
                        <div>
                          <h3 className="font-medium text-white text-sm">{project.name}</h3>
                          <p className="text-slate-400 text-xs">{formatDate(project.startDate)}</p>
                        </div>
                      </div>
                      <Switch checked={project.isActive} onCheckedChange={() => onToggle(project.id)} />
                    </div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Alocado: {formatCurrency(currentAmount)}</span>
                      <span>{Math.min(100, progressPercentage).toFixed(0)}%</span>
                    </div>
                    <div
                      className="w-full bg-slate-700 rounded-full h-1.5 mb-2"
                      // 1. Aqui definimos a variável --progress-width com o valor da sua porcentagem
                      style={{ '--progress-width': `${Math.min(100, progressPercentage)}%` } as React.CSSProperties}
                    >
                      <div className="progress-bar-container">
                        <div
                          className="progress-bar-inner"
                          style={{ width: `${Math.min(100, progressPercentage)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500">{formatCurrency(project.totalValue)}</span>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setContributionProject(project)}
                          className="h-7 w-7 p-0 text-emerald-400 hover:text-emerald-500"
                          title="Adicionar Aporte"
                        >
                          <PlusCircle className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingProject(project.id)}
                          className="h-7 w-7 p-0 text-slate-400 hover:text-white"
                          title="Editar Projeto"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(project.id)}
                          className="h-7 w-7 p-0 text-red-400 hover:text-red-500"
                          title="Deletar Projeto"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {group.projects.length === 0 && (
                <div className="text-center py-4 text-slate-400 text-xs">Nenhum projeto nesta categoria.</div>
              )}
            </div>
          </div>
        ))}
      </div>
      {projects.length === 0 && (
        <div className="text-center py-8 text-slate-400">
          <p className="text-base">Nenhum projeto cadastrado ainda.</p>
          <p className="text-sm">Clique no botão + Novo Projeto para adicionar seu primeiro projeto.</p>
        </div>
      )}

      {/* Renderização condicional do modal de Aporte */}
      {contributionProject && (
        <AddContributionModal
          isOpen={!!contributionProject}
          onClose={() => setContributionProject(null)}
          onSave={handleSaveContribution}
          project={contributionProject}
        />
      )}

      {/* Renderização condicional do modal de Edição */}
      {projectToEdit && (
        <EditProjectModal
          isOpen={!!projectToEdit}
          onClose={() => setEditingProject(null)}
          onSave={handleSaveChanges}
          project={projectToEdit}
        />
      )}
    </div>
  );
};