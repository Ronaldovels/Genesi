import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { value: number; description: string }) => void;
  type: 'entrada' | 'saida';
}

export const TransactionModal = ({ isOpen, onClose, onSubmit, type }: TransactionModalProps) => {
  const [value, setValue] = useState('');
  const [description, setDescription] = useState('');

  // Limpa o formulário quando o modal é fechado ou o tipo muda
  useEffect(() => {
    if (isOpen) {
      setValue('');
      setDescription('');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericValue = parseFloat(value);
    if (!numericValue || numericValue <= 0 || !description) {
      // Você pode adicionar uma notificação de erro aqui (com o 'sonner' de ontem)
      alert('Por favor, preencha todos os campos corretamente.');
      return;
    }
    onSubmit({ value: numericValue, description });
  };

  const isEntry = type === 'entrada';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className={isEntry ? 'text-genesi-green' : 'text-genesi-orange'}>
            {isEntry ? 'Adicionar Nova Receita' : 'Registrar Nova Despesa'}
          </DialogTitle>
          <DialogDescription>
            Preencha os detalhes abaixo para registrar a transação.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="description" className="text-right text-sm">
                Descrição
              </label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3 bg-slate-700 border-slate-600"
                placeholder="Ex: Salário, Aluguel"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="value" className="text-right text-sm">
                Valor (R$)
              </label>
              <Input
                id="value"
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="col-span-3 bg-slate-700 border-slate-600"
                placeholder="0,00"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              className={isEntry 
                ? 'bg-genesi-green hover:bg-genesi-green-dark' 
                : 'bg-genesi-orange hover:bg-orange-600'
              }
            >
              {isEntry ? 'Adicionar Receita' : 'Registrar Despesa'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};