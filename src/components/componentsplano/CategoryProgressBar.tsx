import React from 'react';

interface CategoryProgressBarProps {
  spent: number;
  limit: number;
  color: string;
}

export const CategoryProgressBar = ({ spent, limit, color }: CategoryProgressBarProps) => {
  // Calcula a porcentagem do limite que foi gasta.
  // Garante que não dê erro se o limite for 0.
  const percentage = limit > 0 ? (spent / limit) * 100 : 0;
  
  // Limita a largura da barra em 100% para não "estourar" visualmente se o gasto passar do limite.
  const fillPercentage = Math.min(percentage, 100);

  return (
    <div className="w-full bg-black/20 rounded-full h-2.5 overflow-hidden">
      <div
        className="h-2.5 rounded-full transition-all duration-500"
        style={{
          width: `${fillPercentage}%`,
          backgroundColor: color,
        }}
      />
    </div>
  );
};