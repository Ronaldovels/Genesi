
export interface FinancialData {
  currentAge: number;
  retirementAge: number;
  desiredIncome: number;
  otherIncomes: number;
  monthlyInvestment: number;
  accumulationRate: number;
  postRetirementRate: number;
}

export interface Project {
  id: string;
  name: string;
  type: ProjectType;
  startDate: string;
  totalValue: number;
  isTermProject: boolean;
  hasAirfare: boolean;
  repetition: 'mensal' | 'anual' | 'unica';
  repetitionCount: number;
  priority: 'Essencial' | 'Desejo' | 'Sonho';
  isActive: boolean;
}

export type ProjectType = 
  | 'Viagem' 
  | 'Veículo' 
  | 'Casa' 
  | 'Família' 
  | 'Eletrônico' 
  | 'Educação' 
  | 'Hobby' 
  | 'Profissional' 
  | 'Saúde' 
  | 'Outro';

export interface ChartData {
  age: number;
  patrimonioTotal: number;
  patrimonioPrincipal: number;
  aposentadoriaIdeal: number;
}

export interface TimeRange {
  label: string;
  value: number;
}
