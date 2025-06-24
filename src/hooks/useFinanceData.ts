import { useState, useEffect, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import { useAuth } from '../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL;

interface FinanceData {
  entradas: number;
  saidas: number;
  saldo: number;
}

interface UseFinanceDataReturn {
  financeData: FinanceData | null;
  isLoading: boolean;
  error: string | null;
}

export const useFinanceData = (): UseFinanceDataReturn => {
  const { user } = useAuth();
  const [financeData, setFinanceData] = useState<FinanceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFinanceData = async () => {
      // Se não houver usuário, não faz nada.
      if (!user) {
        setIsLoading(false);
        return;
      }

      // Inicia o carregamento
      setIsLoading(true);
      setError(null);

      try {
        const response = await axios.get(`${API_URL}/api/finance/saldo/${user.id}`);
        setFinanceData(response.data);
      } catch (err) {
        // Define uma mensagem de erro clara
        const axiosError = err as AxiosError<{ message: string }>;
        const errorMessage = axiosError.response?.data?.message || 'Falha ao buscar dados financeiros.';
        setError(errorMessage);
        console.error("Erro em useFinanceData:", err);
        setFinanceData(null);
      } finally {
        // Finaliza o carregamento
        setIsLoading(false);
      }
    };

    fetchFinanceData();
  }, [user]); // A dependência é apenas o 'user'. O fetch é re-executado quando o usuário muda.

  return { financeData, isLoading, error };
};

// /-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/
//
//   RESPONSABILIDADE:
//   - Gerencia a busca e o estado dos dados financeiros principais (saldo, entradas, saídas).
//
//   CONECTA-SE COM:
//   - API Backend: /api/finance/saldo/:usuarioId
//   - Contexto: useAuth para obter o ID do usuário (whatsapp).
//   - Componentes: Dashboard.tsx
//
// /-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/ 