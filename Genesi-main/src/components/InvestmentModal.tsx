import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';

interface InvestmentAccount {
  _id: string;
  name: string;
}

// ALTERADO: A função onSubmit agora espera os novos campos
interface InvestmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    investmentAccountId: string;
    name: string;
    ticker: string;
    type: string;
    currentValue: number;
    quantity: number;
    averagePrice: number;
  }) => void;
  investmentAccounts: InvestmentAccount[];
}

const investmentTypes = ['Renda Fixa', 'Ações', 'Fundos', 'Cripto', 'REITs', 'Outro'];

export const InvestmentModal = ({ isOpen, onClose, onSubmit, investmentAccounts }: InvestmentModalProps) => {
  // Estados do formulário
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [name, setName] = useState('');
  const [ticker, setTicker] = useState('');
  const [type, setType] = useState('');
  const [currentValue, setCurrentValue] = useState('');
  // NOVO: Estados para os novos campos
  const [quantity, setQuantity] = useState('');
  const [averagePrice, setAveragePrice] = useState('');


  useEffect(() => {
    if (isOpen) {
      if (investmentAccounts.length > 0) {
        setSelectedAccountId(investmentAccounts[0]._id);
      }
      setName('');
      setTicker('');
      setType('');
      setCurrentValue('');
      setQuantity(''); // Reseta os novos campos
      setAveragePrice(''); // Reseta os novos campos
    }
  }, [isOpen, investmentAccounts]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numericValue = parseFloat(currentValue);
    // Convertendo os novos campos para número (ou 0 se vazios)
    const numericQuantity = parseFloat(quantity) || 0;
    const numericAveragePrice = parseFloat(averagePrice) || 0;

    if (!selectedAccountId || !name.trim() || !type || !numericValue || numericValue <= 0) {
      toast.error('Por favor, preencha os campos obrigatórios.');
      return;
    }
    
    onSubmit({
      investmentAccountId: selectedAccountId,
      name: name.trim(),
      ticker: ticker.trim().toUpperCase(),
      type,
      currentValue: numericValue,
      quantity: numericQuantity, // Envia os novos dados
      averagePrice: numericAveragePrice, // Envia os novos dados
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-genesi-purple">Registrar Novo Investimento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <label className="text-sm">Carteira de Investimento</label>
            <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
              <SelectTrigger className="mt-2 bg-slate-700 border-slate-600"><SelectValue placeholder="Selecione a carteira" /></SelectTrigger>
              <SelectContent>{investmentAccounts.map(acc => <SelectItem key={acc._id} value={acc._id}>{acc.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm">Nome do Ativo</label>
            <Input value={name} onChange={e => setName(e.target.value)} className="mt-2 bg-slate-700 border-slate-600" placeholder="Ex: Tesouro Selic 2029"/>
          </div>
          <div>
            <label className="text-sm">Código / Ticker (Opcional)</label>
            <Input value={ticker} onChange={e => setTicker(e.target.value)} className="mt-2 bg-slate-700 border-slate-600" placeholder="Ex: PETR4, AAPL"/>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm">Tipo de Ativo</label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="mt-2 bg-slate-700 border-slate-600"><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
                <SelectContent>{investmentTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
             <div>
              <label className="text-sm">Quantidade (Opcional)</label>
              <Input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} className="mt-2 bg-slate-700 border-slate-600" placeholder="Ex: 100"/>
            </div>
          </div>
           <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm">Preço Médio (R$) (Opcional)</label>
                <Input type="number" value={averagePrice} onChange={e => setAveragePrice(e.target.value)} className="mt-2 bg-slate-700 border-slate-600" placeholder="0,00"/>
              </div>
              <div>
                <label className="text-sm">Valor Atual Total (R$)</label>
                <Input type="number" value={currentValue} onChange={e => setCurrentValue(e.target.value)} className="mt-2 bg-slate-700 border-slate-600" placeholder="0,00"/>
              </div>
          </div>
          <DialogFooter className="pt-4">
            <Button type="submit" className="bg-genesi-purple hover:bg-purple-600">Adicionar Investimento</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};