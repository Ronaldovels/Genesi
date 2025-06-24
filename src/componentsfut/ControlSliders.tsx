
import { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { FinancialData } from '@/types/financial';

interface ControlSlidersProps {
  data: FinancialData;
  onUpdate: (updates: Partial<FinancialData>) => void;
  finalPatrimony: number;
  monthlyNeeded: number;
}

export const ControlSliders = ({ data, onUpdate, finalPatrimony, monthlyNeeded }: ControlSlidersProps) => {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<string>('');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleEdit = (field: string, currentValue: number) => {
    setEditingField(field);
    setTempValue(currentValue.toString());
  };

  const handleSave = (field: keyof FinancialData) => {
    const numericValue = parseFloat(tempValue.replace(/[^\d.,]/g, '').replace(',', '.'));
    if (!isNaN(numericValue)) {
      onUpdate({ [field]: numericValue });
    }
    setEditingField(null);
  };

  const SliderWithEdit = ({ 
    label, 
    field, 
    value, 
    min, 
    max, 
    step = 1, 
    format = (v: number) => v.toString(),
    suffix = ''
  }: {
    label: string;
    field: keyof FinancialData;
    value: number;
    min: number;
    max: number;
    step?: number;
    format?: (value: number) => string;
    suffix?: string;
  }) => (
    <div className="flex-1 flex flex-col p-4 rounded-lg hover:bg-slate-700/50 transition-colors border border-transparent hover:border-slate-600">
      <div className="flex justify-between items-center mb-3">
        <label className="text-sm font-medium text-slate-300">{label}</label>
        <div className="flex items-center gap-1">
          {editingField === field ? (
            <div className="flex items-center gap-1">
              <Input
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                className="w-20 h-6 text-sm bg-slate-600 border-slate-500 text-white p-1"
                onBlur={() => handleSave(field)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave(field)}
                autoFocus
              />
              <Button
                size="sm"
                onClick={() => handleSave(field)}
                className="h-6 px-2 text-xs bg-emerald-600 hover:bg-emerald-700"
              >
                ✓
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(field, value)}
              className="h-6 px-2 hover:bg-slate-600 text-sm text-white font-medium"
            >
              {format(value)}{suffix}
            </Button>
          )}
        </div>
      </div>
      <div className="flex-1 flex items-center min-h-[40px]">
        <Slider
          value={[value]}
          onValueChange={(newValue) => onUpdate({ [field]: newValue[0] })}
          min={min}
          max={max}
          step={step}
          className="w-full [&>span]:bg-slate-600 [&>span>span]:bg-emerald-500"
        />
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col gap-2">
      <SliderWithEdit
        label="Idade aposentadoria"
        field="retirementAge"
        value={data.retirementAge}
        min={30}
        max={80}
        suffix=" anos"
      />

      <SliderWithEdit
        label="Renda desejada"
        field="desiredIncome"
        value={data.desiredIncome}
        min={1000}
        max={20000}
        step={100}
        format={formatCurrency}
        suffix=""
      />

      <SliderWithEdit
        label="Outras fontes"
        field="otherIncomes"
        value={data.otherIncomes}
        min={0}
        max={10000}
        step={100}
        format={formatCurrency}
        suffix=""
      />

      <SliderWithEdit
        label="Investimento mensal"
        field="monthlyInvestment"
        value={data.monthlyInvestment}
        min={100}
        max={10000}
        step={50}
        format={formatCurrency}
        suffix=""
      />
    </div>
  );
};
