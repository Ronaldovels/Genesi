import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

// Interface para as categorias que o modal receberá
interface CategoryOption {
  _id: string;
  name: string;
}

// Interface para as props do componente
interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { value: number; description: string; categoryId?: string }) => void;
  type: 'entrada' | 'saida';
  categories: CategoryOption[];
}

export const TransactionModal = ({ isOpen, onClose, onSubmit, type, categories }: TransactionModalProps) => {
  const [value, setValue] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);

  // Limpa o formulário quando o modal é aberto ou o tipo muda
  useEffect(() => {
    if (isOpen) {
      setValue('');
      setDescription('');
      setSelectedCategoryId(undefined);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericValue = parseFloat(value);
    
    // Validação: se for 'saida', a categoria é obrigatória
    if (!numericValue || numericValue <= 0 || !description.trim() || (type === 'saida' && !selectedCategoryId)) {
      alert('Por favor, preencha todos os campos corretamente.');
      return;
    }

    onSubmit({ 
      value: numericValue, 
      description: description.trim(), 
      categoryId: selectedCategoryId 
    });
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
                placeholder={isEntry ? "Ex: Salário, Venda" : "Ex: Aluguel, Supermercado"}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="value" className="text-right text-sm">
                Valor (R$)
              </label>
              <Input
                id="value"
                type="number"
                step="0.01"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="col-span-3 bg-slate-700 border-slate-600"
                placeholder="0,00"
              />
            </div>

            {/* Seletor de Categoria (só aparece para despesas) */}
            {!isEntry && (
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="category" className="text-right text-sm">
                  Categoria
                </label>
                <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                  <SelectTrigger className="col-span-3 bg-slate-700 border-slate-600">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.length > 0 ? (
                      categories.map(cat => (
                        <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
                      ))
                    ) : (
                      <div className="p-2 text-center text-sm text-gray-400">Nenhuma categoria adicionada.</div>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
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