import AIInsights from '@/components/AIInsights';

const InsightsPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Insights da IA</h1>
      <p className="text-white/60 text-sm sm:text-base mb-6">Análises e sugestões personalizadas para otimizar suas finanças.</p>
      <AIInsights />
    </div>
  );
};

export default InsightsPage; 