import React, { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FinancialData } from '@/types/financialfut';

// Interface das props do componente principal
interface ControlSlidersProps {
  data: FinancialData;
  onUpdate: (updates: Partial<FinancialData>) => void;
  finalPatrimony: number; // Adicione esta linha (pode usar 'any', mas 'number' é melhor)
  monthlyNeeded: number;  // Adicione esta linha também
}

// Interface das props do nosso sub-componente
interface SliderWithEditProps {
  label: string;
  field: keyof FinancialData;
  value: number;
  min: number;
  max: number;
  step?: number;
  format?: (value: number) => string;
  suffix?: string;
  onUpdate: (field: keyof FinancialData, value: number) => void;
}

// ====================================================================
// PASSO 1: Criar o sub-componente do Slider com "React.memo"
// "memo" é um otimizador que impede re-renderizações desnecessárias,
// o que é CRUCIAL para não interromper o gesto de arrastar.
// ====================================================================
const SliderWithEdit = React.memo(({
  label, field, value, min, max, step = 1, format = (v) => v.toString(), suffix = '', onUpdate
}: SliderWithEditProps) => {

  const [editing, setEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value.toString());

  const handleSave = () => {
    const numericValue = parseFloat(tempValue.replace(/[^\d.,]/g, '').replace(',', '.'));
    if (!isNaN(numericValue)) {
      onUpdate(field, numericValue);
    }
    setEditing(false);
  };

  return (
    <div className="flex flex-col p-3 rounded-lg hover:bg-slate-700/50 transition-colors">
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm text-slate-300">{label}</label>
        {editing ? (
          <div className="flex items-center gap-1">
            <Input
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className="w-24 h-7 text-sm bg-slate-600 border-slate-500 text-white p-1"
              onBlur={handleSave}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              autoFocus
            />
            <Button size="sm" onClick={handleSave} className="h-7 px-2 text-xs bg-emerald-600 hover:bg-emerald-700">✓</Button>
          </div>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => { setEditing(true); setTempValue(value.toString()); }} className="h-7 px-2 hover:bg-slate-600 text-sm text-white font-medium">
            {format(value)}{suffix}
          </Button>
        )}
      </div>
      {/* Container do Slider simplificado - A CHAVE! */}
      <div className="min-h-[30px] flex items-center">
        <Slider
          value={[value]}
          onValueChange={([newValue]) => onUpdate(field, newValue)}
          min={min}
          max={max}
          step={step}
        />
      </div>
    </div>
  );
});
SliderWithEdit.displayName = 'SliderWithEdit'; // Boa prática para debug

// ====================================================================
// PASSO 2: Montar o componente principal que gerencia o estado
// ====================================================================
export const ControlSliders = ({ data, onUpdate }: ControlSlidersProps) => {
  // Criamos um estado LOCAL para ter controle e performance.
  const [localData, setLocalData] = useState(data);

  // Sincronizamos o estado local se os dados externos mudarem.
  useEffect(() => {
    setLocalData(data);
  }, [data]);

  // Função que atualiza o estado local E o estado global.
  const handleUpdate = (field: keyof FinancialData, value: number) => {
    // Atualiza o estado global para o resto do app (gráfico, etc)
    onUpdate({ [field]: value });
    // Atualiza o estado local para uma resposta visual imediata e suave
    setLocalData(prev => ({ ...prev, [field]: value }));
  };

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <div className="h-full flex flex-col gap-2">
      <SliderWithEdit label="Idade aposentadoria" field="retirementAge" value={localData.retirementAge} min={30} max={80} suffix=" anos" onUpdate={handleUpdate} />
      <SliderWithEdit label="Renda desejada" field="desiredIncome" value={localData.desiredIncome} min={1000} max={20000} step={100} format={formatCurrency} onUpdate={handleUpdate} />
      <SliderWithEdit label="Outras fontes" field="otherIncomes" value={localData.otherIncomes} min={0} max={10000} step={100} format={formatCurrency} onUpdate={handleUpdate} />
      <SliderWithEdit label="Investimento mensal" field="monthlyInvestment" value={localData.monthlyInvestment} min={100} max={10000} step={50} format={formatCurrency} onUpdate={handleUpdate} />
    </div>
  );
};