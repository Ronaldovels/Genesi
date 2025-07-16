import { useState } from 'react';
import { Project } from '@/types/financialfut';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AddContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (amount: number) => void;
  project: Project;
}

export const AddContributionModal = ({ isOpen, onClose, onSave, project }: AddContributionModalProps) => {
  const [amount, setAmount] = useState(0);

  const handleSave = () => {
    if (amount > 0) {
      onSave(amount);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle>Adicionar Aporte em "{project.name}"</DialogTitle>
          <DialogDescription>
            Insira o valor que você deseja alocar para este projeto.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">Valor do Aporte</Label>
            <Input 
              id="amount" 
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="col-span-3 bg-slate-700 border-slate-600"
              placeholder="R$ 0,00"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="text-white">Cancelar</Button>
          <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700">Adicionar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};