import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Plane, Car, Home, Users, Laptop, GraduationCap, Activity, Briefcase, Heart, Cloud, Target, PiggyBank, Info } from 'lucide-react';
import { Project, ProjectType } from '@/types/financialfut';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ProjectModalProps {
  onSave: (project: Project) => void;
  projectToEdit?: Project | null;
  onUpdate?: (id: string, updates: Partial<Project>) => void;
}

export const ProjectModal = ({ onSave, projectToEdit, onUpdate }: ProjectModalProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    type: ProjectType;
    startDate: string;
    totalValue: string;
    isTermProject: boolean;
    hasAirfare: boolean;
    repetition: 'mensal' | 'anual' | 'unica' | '';
    repetitionCount: string;
    priority: 'Essencial' | 'Desejo' | 'Sonho';
    id?: string;
  }>({
    name: '',
    type: 'Viagem',
    startDate: '',
    totalValue: '',
    isTermProject: false,
    hasAirfare: false,
    repetition: '',
    repetitionCount: '',
    priority: 'Essencial',
    id: undefined,
  });

  const tiposProjeto = [
    { label: 'Viagem', icon: Plane },
    { label: 'Veículo', icon: Car },
    { label: 'Casa', icon: Home },
    { label: 'Família', icon: Users },
    { label: 'Eletrônico', icon: Laptop },
    { label: 'Educação', icon: GraduationCap },
    { label: 'Hobby', icon: Activity },
    { label: 'Profissional', icon: Briefcase },
    { label: 'Saúde', icon: Heart },
    { label: 'Outro', icon: Cloud },
    { label: 'Ajuste da meta', icon: Target },
    { label: 'Aportes financeiros', icon: PiggyBank },
  ];

  const prioridades = ['Essencial', 'Desejo', 'Sonho'];

  useEffect(() => {
    if (projectToEdit) {
      setFormData({
        ...projectToEdit,
        totalValue: String(projectToEdit.totalValue),
        repetitionCount: String(projectToEdit.repetitionCount),
      });
      setOpen(true);
    }
  }, [projectToEdit]);

  // Atualiza data inicial automaticamente para daqui a 5 anos se for projeto a prazo
  useEffect(() => {
    if (formData.isTermProject) {
      const hoje = new Date();
      const novaData = new Date(hoje.getFullYear() + 5, hoje.getMonth(), hoje.getDate());
      const dia = String(novaData.getDate()).padStart(2, '0');
      const mes = String(novaData.getMonth() + 1).padStart(2, '0');
      const ano = novaData.getFullYear();
      setFormData(f => ({ ...f, startDate: `${dia}/${mes}/${ano}` }));
    }
  }, [formData.isTermProject]);

  // Valor mensal sugerido
  const valorMensal = formData.repetitionCount && formData.totalValue && Number(formData.repetitionCount) > 0
    ? (parseFloat(formData.totalValue.replace(/\D/g, '')) / Number(formData.repetitionCount))
    : 0;

  const isValid = formData.name && formData.startDate && formData.totalValue && (formData.repetition === 'mensal' || formData.repetition === 'anual' || formData.repetition === 'unica');

  const handleSave = () => {
    if (!isValid) return;
    if (formData.id && onUpdate) {
      const { repetition, ...rest } = formData;
      onUpdate(formData.id, {
        ...rest,
        repetition: (formData.repetition || 'unica') as 'mensal' | 'anual' | 'unica',
        totalValue: parseFloat(formData.totalValue.replace(/\D/g, '')),
        repetitionCount: formData.repetitionCount ? parseInt(formData.repetitionCount) : 1,
      });
    } else {
      onSave({
        ...formData,
        id: Date.now().toString(),
        repetition: (formData.repetition || 'unica') as 'mensal' | 'anual' | 'unica',
        totalValue: parseFloat(formData.totalValue.replace(/\D/g, '')),
        repetitionCount: formData.repetitionCount ? parseInt(formData.repetitionCount) : 1,
        isActive: true,
      });
    }
    setFormData({
      name: '',
      type: 'Viagem',
      startDate: '',
      totalValue: '',
      isTermProject: false,
      hasAirfare: false,
      repetition: '',
      repetitionCount: '',
      priority: 'Essencial',
      id: undefined,
    });
    setOpen(false);
  };

  return (
    <TooltipProvider>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium w-44 h-10">
            {projectToEdit ? 'Editar projeto' : 'Criar projeto'}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl w-full bg-white rounded-xl p-8 text-slate-900">
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-semibold mb-4">{projectToEdit ? 'Editar projeto' : 'Novo projeto'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            {/* Prioridade do projeto */}
            <div>
              <div className="mb-2 text-sm font-medium">Prioridade do projeto</div>
              <div className="flex gap-2">
                {prioridades.map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={`px-4 py-2 rounded border ${formData.priority === p ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white border-slate-300 text-slate-700'}`}
                    onClick={() => setFormData({ ...formData, priority: p as 'Essencial' | 'Desejo' | 'Sonho' })}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Tipo do projeto */}
            <div>
              <div className="mb-2 text-sm font-medium">Tipo do projeto</div>
              <div className="flex flex-wrap gap-3">
                {tiposProjeto.map((tp) => (
                  <button
                    key={tp.label}
                    type="button"
                    className={`flex flex-col items-center px-3 py-2 rounded border w-20 ${formData.type === tp.label ? 'bg-emerald-50 border-emerald-600 text-emerald-700' : 'bg-white border-slate-300 text-slate-700'}`}
                    onClick={() => setFormData({ ...formData, type: tp.label as ProjectType })}
                  >
                    <tp.icon className="mb-1" />
                    <span className="text-xs">{tp.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Nome e Data inicial */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="mb-1 text-sm">Nome do projeto</div>
                <Input
                  placeholder="Ex.: Viagem"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white"
                />
              </div>
              <div>
                <div className="mb-1 text-sm flex items-center gap-1">Data inicial
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-4 h-4 text-slate-400 cursor-pointer" />
                    </TooltipTrigger>
                    <TooltipContent>Data em que você começará a reservar dinheiro para o projeto. O cálculo considera a retirada a partir desta data.</TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  placeholder="DD/MM/AAAA"
                  value={formData.startDate}
                  onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full bg-white"
                />
              </div>
            </div>

            {/* Valor total e Projeto a prazo */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="mb-1 text-sm flex items-center gap-1">Valor total
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-4 h-4 text-slate-400 cursor-pointer" />
                    </TooltipTrigger>
                    <TooltipContent>Valor final que você deseja atingir para realizar o projeto.</TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  placeholder="R$ 0,00"
                  value={formData.totalValue}
                  onChange={e => setFormData({ ...formData, totalValue: e.target.value })}
                  className="w-full bg-white"
                />
                {valorMensal > 0 && (
                  <div className="text-xs text-slate-500 mt-1">Valor mensal sugerido: <span className="font-semibold text-emerald-700">{valorMensal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></div>
                )}
              </div>
              <div>
                <div className="mb-1 text-sm flex items-center gap-1">Projeto a prazo
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-4 h-4 text-slate-400 cursor-pointer" />
                    </TooltipTrigger>
                    <TooltipContent>Se selecionado, a data inicial será ajustada automaticamente para daqui a alguns anos (mínimo 5 anos). Ideal para projetos de longo prazo.</TooltipContent>
                  </Tooltip>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className={`px-4 py-2 rounded border ${formData.isTermProject ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white border-slate-300 text-slate-700'}`}
                    onClick={() => setFormData({ ...formData, isTermProject: true })}
                  >Sim</button>
                  <button
                    type="button"
                    className={`px-4 py-2 rounded border ${!formData.isTermProject ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white border-slate-300 text-slate-700'}`}
                    onClick={() => setFormData({ ...formData, isTermProject: false })}
                  >Não</button>
                </div>
              </div>
            </div>

            {/* Trecho aéreo */}
            <div>
              <div className="mb-1 text-sm flex items-center gap-1">Trecho aéreo
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-4 h-4 text-slate-400 cursor-pointer" />
                  </TooltipTrigger>
                  <TooltipContent>Marque se o projeto inclui custos com passagens aéreas.</TooltipContent>
                </Tooltip>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className={`px-4 py-2 rounded border ${formData.hasAirfare ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white border-slate-300 text-slate-700'}`}
                  onClick={() => setFormData({ ...formData, hasAirfare: true })}
                >Sim</button>
                <button
                  type="button"
                  className={`px-4 py-2 rounded border ${!formData.hasAirfare ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white border-slate-300 text-slate-700'}`}
                  onClick={() => setFormData({ ...formData, hasAirfare: false })}
                >Não</button>
              </div>
            </div>

            {/* Repetição e Quantidade */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="mb-1 text-sm flex items-center gap-1">Repetição
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-4 h-4 text-slate-400 cursor-pointer" />
                    </TooltipTrigger>
                    <TooltipContent>Com que frequência você fará a retirada para este projeto (mensal, anual, única).</TooltipContent>
                  </Tooltip>
                </div>
                <select
                  className="w-full border rounded px-2 py-2 bg-white"
                  value={formData.repetition}
                  onChange={e => setFormData({ ...formData, repetition: e.target.value as 'mensal' | 'anual' | 'unica' | '' })}
                >
                  <option value="">Escolha</option>
                  <option value="unica">Única</option>
                  <option value="mensal">Mensal</option>
                  <option value="anual">Anual</option>
                </select>
              </div>
              <div>
                <div className="mb-1 text-sm flex items-center gap-1">Quantidade de repetições
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-4 h-4 text-slate-400 cursor-pointer" />
                    </TooltipTrigger>
                    <TooltipContent>Número de vezes que a retirada será feita (ex: 12 meses, 5 anos, etc).</TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  placeholder="Digite a quantidade"
                  value={formData.repetitionCount}
                  onChange={e => setFormData({ ...formData, repetitionCount: e.target.value })}
                  className="w-full bg-white"
                  type="number"
                  min="1"
                  disabled={!formData.repetition || formData.repetition === 'unica'}
                />
                {valorMensal > 0 && (
                  <div className="text-xs text-slate-500 mt-1">Valor mensal sugerido: <span className="font-semibold text-emerald-700">{valorMensal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></div>
                )}
              </div>
            </div>

            {/* Botão de criar projeto */}
            <div className="flex justify-end">
              <Button
                onClick={handleSave}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-2 rounded"
                disabled={!isValid}
              >
                {projectToEdit ? 'Atualizar projeto' : 'Criar projeto'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};