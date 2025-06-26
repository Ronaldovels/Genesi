
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FinancialData } from '@/types/financial';
import { Settings } from 'lucide-react';

interface SettingsModalProps {
  data: FinancialData;
  onUpdate: (updates: Partial<FinancialData>) => void;
}

export const SettingsModal = ({ data, onUpdate }: SettingsModalProps) => {
  const [open, setOpen] = useState(false);
  const [accumulationRate, setAccumulationRate] = useState(data.accumulationRate.toString());
  const [postRetirementRate, setPostRetirementRate] = useState(data.postRetirementRate.toString());
  const [birthDate, setBirthDate] = useState('');

  // Calcular a idade baseada na data de nascimento
  const calculateAge = (birthDateString: string) => {
    if (!birthDateString) return data.currentAge;
    
    const birth = new Date(birthDateString);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  // Calcular data de nascimento baseada na idade atual
  const calculateBirthDate = (age: number) => {
    const today = new Date();
    const birthYear = today.getFullYear() - age;
    return `${birthYear}-01-01`;
  };

  // Inicializar data de nascimento quando o modal abrir
  useEffect(() => {
    if (open && !birthDate) {
      setBirthDate(calculateBirthDate(data.currentAge));
    }
  }, [open, data.currentAge, birthDate]);

  const handleBirthDateChange = (value: string) => {
    setBirthDate(value);
  };

  const handleSave = () => {
    const newAge = calculateAge(birthDate);
    
    onUpdate({
      currentAge: newAge,
      accumulationRate: parseFloat(accumulationRate) || data.accumulationRate,
      postRetirementRate: parseFloat(postRetirementRate) || data.postRetirementRate,
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8 border-slate-600 text-slate-300 hover:bg-slate-700">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Configurações</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="birthDate" className="text-slate-300">Data de nascimento</Label>
            <Input
              id="birthDate"
              type="date"
              value={birthDate}
              onChange={(e) => handleBirthDateChange(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currentAge" className="text-slate-300">Idade atual</Label>
            <Input
              id="currentAge"
              type="number"
              value={calculateAge(birthDate)}
              readOnly
              className="bg-slate-600 border-slate-500 text-slate-300 cursor-not-allowed"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="accumulation" className="text-slate-300">Taxa de juros real anual na fase de acumulação (%)</Label>
            <Input
              id="accumulation"
              type="number"
              step="0.1"
              value={accumulationRate}
              onChange={(e) => setAccumulationRate(e.target.value)}
              placeholder="6.0"
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="postRetirement" className="text-slate-300">Taxa de juros real anual após aposentadoria (%)</Label>
            <Input
              id="postRetirement"
              type="number"
              step="0.1"
              value={postRetirementRate}
              onChange={(e) => setPostRetirementRate(e.target.value)}
              placeholder="4.0"
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)} className="border-slate-600 text-slate-300 hover:bg-slate-700">
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700">
              Salvar configurações
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};