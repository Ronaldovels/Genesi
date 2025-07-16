import { useState, useEffect } from 'react';
import { Project } from '@/types/financialfut';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: Partial<Project>) => void;
  project: Project;
}

// Constantes para os campos de seleção
const PRIORITIES = ['Essencial', 'Desejo', 'Sonho'] as const;
const TYPES = ['Viagem', 'Veículo', 'Casa', 'Família', 'Eletrônico', 'Educação', 'Hobby', 'Profissional', 'Saúde', 'Outro'] as const;

export const EditProjectModal = ({ isOpen, onClose, onSave, project }: EditProjectModalProps) => {
  // Estados para todos os campos editáveis
  const [name, setName] = useState('');
  const [totalValue, setTotalValue] = useState(0);
  const [priority, setPriority] = useState<Project['priority']>('Desejo');
  const [type, setType] = useState<Project['type']>('Outro');
  const [startDate, setStartDate] = useState('');

  // Efeito para preencher o formulário com os dados do projeto quando ele é aberto
  useEffect(() => {
    if (project) {
      setName(project.name);
      setTotalValue(project.totalValue);
      setPriority(project.priority);
      setType(project.type);
      setStartDate(project.startDate);
    }
  }, [project, isOpen]);

  // Função para lidar com o salvamento das alterações
  const handleSubmit = () => {
    // Coleta todos os dados do estado para enviar as atualizações
    const updates: Partial<Project> = {
      name,
      totalValue,
      priority,
      type,
      startDate,
    };
    onSave(updates);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle>Editar Projeto</DialogTitle>
          <DialogDescription>
            Faça as alterações no seu projeto e clique em salvar.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* Campo Nome */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Nome</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              className="col-span-3 bg-slate-700 border-slate-600" 
            />
          </div>
          {/* Campo Valor Total */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="totalValue" className="text-right">Valor Total</Label>
            <Input 
              id="totalValue" 
              type="number" 
              value={totalValue} 
              onChange={(e) => setTotalValue(Number(e.target.value))} 
              className="col-span-3 bg-slate-700 border-slate-600" 
            />
          </div>

          {/* Campo Prioridade */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="priority" className="text-right">Prioridade</Label>
            <Select onValueChange={(value: Project['priority']) => setPriority(value)} value={priority}>
              <SelectTrigger className="col-span-3 bg-slate-700 border-slate-600">
                <SelectValue placeholder="Selecione a prioridade" />
              </SelectTrigger>
              <SelectContent>
                {PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Campo Tipo */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">Tipo</Label>
            <Select onValueChange={(value: Project['type']) => setType(value)} value={type}>
              <SelectTrigger className="col-span-3 bg-slate-700 border-slate-600">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          
          {/* Campo Data de Início */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="startDate" className="text-right">Data Início</Label>
            <Input 
              id="startDate" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)} 
              className="col-span-3 bg-slate-700 border-slate-600" 
              placeholder="DD/MM/AAAA"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="text-white">Cancelar</Button>
          <Button onClick={handleSubmit} className="bg-emerald-600 hover:bg-emerald-700">Salvar Alterações</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};