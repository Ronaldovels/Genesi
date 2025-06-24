import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Wish } from '../types';

// Pega a URL da API do arquivo de ambiente
const API_URL = import.meta.env.VITE_API_URL;

interface UseWishesReturn {
  wishes: Wish[];
  isLoading: boolean;
  error: string | null;
  fetchWishes: () => void;
  addWish: (nome: string, valor: number) => Promise<void>;
  deleteWish: (wishId: string) => Promise<void>;
  toggleWishNotification: (wishId: string, currentValue: boolean) => Promise<void>;
}

export const useWishes = (): UseWishesReturn => {
  const { user } = useAuth();
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWishes = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/api/wishes?userId=${user.id}`);
      setWishes(response.data);
    } catch (err) {
      setError('Falha ao buscar desejos.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const addWish = async (nome: string, valor: number) => {
    if (!user) return;
    try {
      const response = await axios.post(`${API_URL}/api/wishes`, {
        nome,
        valor,
        userId: user.id
      });
      setWishes(prevWishes => [...prevWishes, response.data]);
    } catch (err) {
      setError('Falha ao adicionar desejo.');
      console.error(err);
    }
  };

  const deleteWish = async (wishId: string) => {
    try {
      await axios.delete(`${API_URL}/api/wishes/${wishId}`);
      setWishes(prevWishes => prevWishes.filter(wish => wish._id !== wishId));
    } catch (err) {
      setError('Falha ao deletar desejo.');
      console.error(err);
    }
  };

  const toggleWishNotification = async (wishId: string, currentValue: boolean) => {
    try {
      await axios.patch(`${API_URL}/api/wishes/${wishId}`, {
        notificado: !currentValue
      });
      setWishes(prevWishes => 
        prevWishes.map(wish => 
          wish._id === wishId ? { ...wish, notificado: !currentValue } : wish
        )
      );
    } catch (err) {
      setError('Falha ao atualizar notificação.');
      console.error(err);
    }
  };
  
  // Efeito para buscar os desejos quando o usuário muda
  useEffect(() => {
    fetchWishes();
  }, [fetchWishes]);

  return { wishes, isLoading, error, fetchWishes, addWish, deleteWish, toggleWishNotification };
};

// /-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/
//
//   RESPONSABILIDADE:
//   - Gerencia todo o estado e a lógica relacionados aos "Desejos de Compra".
//   - Busca, adiciona, deleta e atualiza os desejos.
//
//   CONECTA-SE COM:
//   - API Backend: /api/wishes (GET, POST, DELETE, PATCH)
//   - Contexto: useAuth para obter o ID do usuário.
//   - Componentes: Qualquer componente que precise interagir com os desejos (ex: Sidebar.tsx, WishDialog.tsx).
//
// /-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/-/ 