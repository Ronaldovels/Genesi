export interface Wish {
  _id: string;
  nome: string;
  valor: number;
  userId: string;
  notificado?: boolean;
  descricao_produto: string;
  limite_preco: number;
  modo: string;
  preco_medio_base: number;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
} 