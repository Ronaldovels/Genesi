import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Interface para a lista de categorias que o modal receberá
interface SimpleCategory {
  _id: string;
  name: string;
}

// Interface genérica para transações programadas
export interface TransacaoProgramadaData {
  _id?: string;
  name: string;
  value: number;
  billingDay: number;
  category?: string; // Categoria é opcional, usada apenas para saídas
  type: 'entrada' | 'saida'; // Define se é entrada ou saída
  frequency?: 'DIARIA' | 'SEMANAL' | 'MENSAL' | 'ANUAL';
  endDate?: string;
}

// Props do modal, agora mais genéricas
interface TransacaoProgramadaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TransacaoProgramadaData) => void;
  // Prop para dizer ao modal qual tipo de transação criar
  transactionType: 'entrada' | 'saida'; 
  editingTransaction?: TransacaoProgramadaData & { category?: SimpleCategory };
  categories: SimpleCategory[];
}

export const TransacaoProgramadaModal = ({ isOpen, onClose, onSubmit, transactionType, editingTransaction, categories }: TransacaoProgramadaModalProps) => {
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [billingDay, setBillingDay] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [frequency, setFrequency] = useState<'DIARIA' | 'SEMANAL' | 'MENSAL' | 'ANUAL'>('MENSAL');
  const [endDate, setEndDate] = useState('');

  const isEditing = !!editingTransaction;
  // Título do modal muda dinamicamente
  const modalTitle = transactionType === 'entrada' ? 'Entrada Programada' : 'Despesa Programada';

  useEffect(() => {
    if (isOpen) {
      if (isEditing && editingTransaction) {
        setName(editingTransaction.name);
        setValue(String(editingTransaction.value));
        setBillingDay(String(editingTransaction.billingDay));
        // Lida com a categoria de forma segura, mesmo que não exista
        setCategoryId(editingTransaction.category?._id || '');
        setFrequency(editingTransaction.frequency || 'MENSAL');
        setEndDate(editingTransaction.endDate ? new Date(editingTransaction.endDate).toISOString().split('T')[0] : '');
      } else {
        // Reseta o formulário
        setName('');
        setValue('');
        setBillingDay('');
        setCategoryId('');
        setFrequency('MENSAL');
        setEndDate('');
      }
    }
  }, [isOpen, editingTransaction, isEditing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericValue = parseFloat(value);
    const numericBillingDay = parseInt(billingDay, 10);

    // Validação
    if (!name.trim() || isNaN(numericValue) || numericValue <= 0 || isNaN(numericBillingDay) || numericBillingDay < 1 || numericBillingDay > 31) {
      alert("Por favor, preencha nome, valor e um dia do mês válido (1-31).");
      return;
    }

    // Validação de categoria apenas para despesas
    if (transactionType === 'saida' && !categoryId) {
        alert("Por favor, selecione uma categoria para a despesa.");
        return;
    }
    
    const data: TransacaoProgramadaData = {
      _id: editingTransaction?._id,
      name: name.trim(),
      value: numericValue,
      billingDay: numericBillingDay,
      type: transactionType, // Define o tipo com base na prop
      frequency: frequency,
      // Adiciona a categoria apenas se for uma despesa (saída)
      ...(transactionType === 'saida' && { category: categoryId }),
      // Adiciona data final se necessário (lógica pode ser ajustada)
      ...(frequency !== 'MENSAL' && { endDate: endDate }),
    };

    onSubmit(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar' : 'Adicionar'} {modalTitle}</DialogTitle>
          <DialogDescription>
            Programe suas transações recorrentes para um melhor controle financeiro.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={transactionType === 'entrada' ? 'Nome (Ex: Salário)' : 'Nome (Ex: Aluguel)'} autoFocus />
          <div className="grid grid-cols-2 gap-4">
            <Input type="number" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Valor (R$)" />
            <Input type="number" value={billingDay} onChange={(e) => setBillingDay(e.target.value)} placeholder="Dia do Mês" />
          </div>

          {/* Campo de Categoria aparece apenas para despesas */}
          {transactionType === 'saida' && (
            <Select onValueChange={setCategoryId} value={categoryId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.length > 0 ? (
                    categories.map(cat => (
                        <SelectItem key={cat._id} value={cat._id}>{cat.name}</SelectItem>
                    ))
                ) : (
                    <div className="p-2 text-center text-sm text-slate-400">Nenhuma categoria encontrada.</div>
                )}
              </SelectContent>
            </Select>
          )}
          
          <Select onValueChange={(v) => setFrequency(v as any)} value={frequency}>
              <SelectTrigger><SelectValue placeholder="Frequência" /></SelectTrigger>
              <SelectContent>
                  <SelectItem value="DIARIA">Diária</SelectItem>
                  <SelectItem value="SEMANAL">Semanal</SelectItem>
                  <SelectItem value="MENSAL">Mensal</SelectItem>
                  <SelectItem value="ANUAL">Anual</SelectItem>
              </SelectContent>
          </Select>
          
          <DialogFooter className="pt-4">
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">{isEditing ? 'Salvar Alterações' : 'Adicionar'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};