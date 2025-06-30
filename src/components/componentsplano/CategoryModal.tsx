import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string, limit: number }) => void;
}

export const CategoryModal = ({ isOpen, onClose, onSubmit }: CategoryModalProps) => {
  const [name, setName] = useState('');
  const [limit, setLimit] = useState('');

  useEffect(() => {
    if(isOpen) {
      setName('');
      setLimit('');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericLimit = parseFloat(limit);
    if (!name.trim() || isNaN(numericLimit) || numericLimit < 0) {
      alert("Por favor, preencha todos os campos com valores válidos.");
      return;
    }
    onSubmit({ name: name.trim(), limit: numericLimit });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-slate-800 border-slate-700 text-white">
        <DialogHeader><DialogTitle>Adicionar Nova Categoria</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <label htmlFor="category-name" className="text-sm">Nome da Categoria</label>
            <Input id="category-name" value={name} onChange={(e) => setName(e.target.value)} className="mt-2 bg-slate-700 border-slate-600" placeholder="Ex: Educação" autoFocus/>
          </div>
          <div>
            <label htmlFor="category-limit" className="text-sm">Limite de Gasto (R$)</label>
            <Input id="category-limit" type="number" value={limit} onChange={(e) => setLimit(e.target.value)} className="mt-2 bg-slate-700 border-slate-600" placeholder="Ex: 500"/>
          </div>
          <DialogFooter className="pt-4">
            <Button type="submit" className="bg-genesi-green hover:bg-genesi-green-dark">Adicionar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};