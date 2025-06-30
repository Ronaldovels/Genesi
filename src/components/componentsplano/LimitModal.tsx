import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface LimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (limit: number) => void;
  categoryName: string;
  currentLimit: number;
}

export const LimitModal = ({ isOpen, onClose, onSubmit, categoryName, currentLimit }: LimitModalProps) => {
  const [limit, setLimit] = useState(currentLimit.toString());

  useEffect(() => {
    if (isOpen) setLimit(currentLimit.toString());
  }, [isOpen, currentLimit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericLimit = parseFloat(limit);
    if (isNaN(numericLimit) || numericLimit < 0) {
      alert('Por favor, insira um limite válido.');
      return;
    }
    onSubmit(numericLimit);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle>Editar Limite para "{categoryName}"</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="py-4">
            <label htmlFor="limit" className="text-sm">Novo Limite de Gasto (R$)</label>
            <Input id="limit" type="number" step="50" value={limit} onChange={(e) => setLimit(e.target.value)} className="mt-2 bg-slate-700 border-slate-600" autoFocus/>
          </div>
          <DialogFooter>
            <Button type="submit" className="bg-genesi-blue hover:bg-blue-600">Salvar Limite</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};