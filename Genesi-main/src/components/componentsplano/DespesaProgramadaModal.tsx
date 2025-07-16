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

// Interface de dados da despesa
export interface DespesaProgramadaData {
  _id?: string;
  name: string;
  value: number;
  billingDay: number;
  category: string; // ID da categoria
  type: 'FIXA' | 'FIXA_TEMPORARIA' | 'RECORRENTE';
  frequency?: 'DIARIA' | 'SEMANAL' | 'MENSAL' | 'ANUAL';
  endDate?: string;
}

// Props do modal
interface DespesaProgramadaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DespesaProgramadaData) => void;
  editingExpense?: DespesaProgramadaData & { category?: SimpleCategory }; // A categoria agora é opcional para evitar erros
  categories: SimpleCategory[];
}

export const DespesaProgramadaModal = ({ isOpen, onClose, onSubmit, editingExpense, categories }: DespesaProgramadaModalProps) => {
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [billingDay, setBillingDay] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [type, setType] = useState<'FIXA' | 'FIXA_TEMPORARIA' | 'RECORRENTE'>('FIXA');
  const [frequency, setFrequency] = useState<'DIARIA' | 'SEMANAL' | 'MENSAL' | 'ANUAL'>('MENSAL');
  const [endDate, setEndDate] = useState('');

  const isEditing = !!editingExpense;

  useEffect(() => {
    if (isOpen) {
      if (isEditing && editingExpense) {
        setName(editingExpense.name);
        setValue(String(editingExpense.value));
        setBillingDay(String(editingExpense.billingDay));
        // CORREÇÃO: Usando optional chaining (?.) para evitar o erro se 'category' for undefined.
        // Se não houver categoria, define como string vazia.
        setCategoryId(editingExpense.category?._id || ''); 
        setType(editingExpense.type);
        setFrequency(editingExpense.frequency || 'MENSAL');
        setEndDate(editingExpense.endDate ? new Date(editingExpense.endDate).toISOString().split('T')[0] : '');
      } else {
        // Reseta o formulário
        setName('');
        setValue('');
        setBillingDay('');
        setCategoryId('');
        setType('FIXA');
        setFrequency('MENSAL');
        setEndDate('');
      }
    }
  }, [isOpen, editingExpense, isEditing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericValue = parseFloat(value);
    const numericBillingDay = parseInt(billingDay, 10);

    if (!name.trim() || !categoryId || isNaN(numericValue) || numericValue <= 0 || isNaN(numericBillingDay) || numericBillingDay < 1 || numericBillingDay > 31) {
      alert("Por favor, preencha todos os campos, incluindo a categoria e um dia de cobrança válido.");
      return;
    }
    
    const data: DespesaProgramadaData = {
      _id: editingExpense?._id,
      name: name.trim(),
      value: numericValue,
      billingDay: numericBillingDay,
      category: categoryId,
      type,
    };
    
    if (type === 'FIXA' || type === 'FIXA_TEMPORARIA') { data.frequency = frequency; }
    if (type === 'FIXA_TEMPORARIA') {
        if (!endDate) { alert('A data de término é obrigatória para despesas temporárias.'); return; }
        data.endDate = endDate;
    }
    onSubmit(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Despesa' : 'Adicionar Nova Despesa Programada'}</DialogTitle>
          <DialogDescription>
            Programe despesas que se repetem para um melhor controle financeiro.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome (Ex: Aluguel, Netflix)" autoFocus />
          <div className="grid grid-cols-2 gap-4">
            <Input type="number" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Valor (R$)" />
            <Input type="number" value={billingDay} onChange={(e) => setBillingDay(e.target.value)} placeholder="Dia da Cobrança" />
          </div>

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
          
          <Select onValueChange={(v) => setType(v as any)} value={type}>
            <SelectTrigger><SelectValue placeholder="Tipo de Despesa" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="FIXA">Fixa</SelectItem>
              <SelectItem value="FIXA_TEMPORARIA">Fixa Temporária</SelectItem>
              <SelectItem value="RECORRENTE">Recorrente (Atalho)</SelectItem>
            </SelectContent>
          </Select>
          
          {(type === 'FIXA' || type === 'FIXA_TEMPORARIA') && (
            <Select onValueChange={(v) => setFrequency(v as any)} value={frequency}>
                <SelectTrigger><SelectValue placeholder="Frequência" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="DIARIA">Diária</SelectItem>
                    <SelectItem value="SEMANAL">Semanal</SelectItem>
                    <SelectItem value="MENSAL">Mensal</SelectItem>
                    <SelectItem value="ANUAL">Anual</SelectItem>
                </SelectContent>
            </Select>
          )}

          {type === 'FIXA_TEMPORARIA' && ( <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="text-white/80"/> )}

          <DialogFooter className="pt-4">
            <Button type="submit" className="bg-genesi-blue hover:bg-blue-600">{isEditing ? 'Salvar Alterações' : 'Adicionar Despesa'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};