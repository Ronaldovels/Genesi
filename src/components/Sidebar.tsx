import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, PieChart, Target, TrendingUp, MessageSquare, Mic, LogOut, Sparkles, Heart, PlusCircle, Lightbulb } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Switch } from './ui/switch';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import axios from 'axios';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [openWishDialog, setOpenWishDialog] = useState(false);
  const [wishes, setWishes] = useState([]);
  const [loadingWishes, setLoadingWishes] = useState(false);
  const [wishError, setWishError] = useState('');

  const [openCreateAccountDialog, setOpenCreateAccountDialog] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [createAccountError, setCreateAccountError] = useState('');

  const navigationItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/plano', icon: PieChart, label: 'Plano' },
    { path: '/futuro', icon: Target, label: 'Futuro' },
    { path: '/investimentos', icon: TrendingUp, label: 'Investimentos' },
    { path: '/insights', icon: Lightbulb, label: 'Insights' },
  ];

  const integrationItems = [
    { 
      icon: MessageSquare, 
      label: 'Conectar ao WhatsApp', 
      action: () => window.open('https://wa.me/qr/FA336KMO3ST3N1', '_blank')
    },
    { icon: Mic, label: 'Conectar à Alexa', action: () => console.log('Alexa integration') },
  ];

  const fetchWishes = async () => {
    if (!user?.whatsapp) {
      setWishError('Usuário não autenticado.');
      return;
    }
    setLoadingWishes(true);
    setWishError('');
    try {
      const API_BASE_URL = import.meta.env.VITE_URL;
      const res = await fetch(`${API_BASE_URL}/api/wishes/${user.whatsapp}`, { cache: 'no-store' });
      if (!res.ok) throw new Error('Erro ao buscar desejos');
      const data = await res.json();
      setWishes(data || []);
    } catch (err) {
      setWishError('Erro ao buscar desejos');
    } finally {
      setLoadingWishes(false);
    }
  };

  useEffect(() => {
    if (openWishDialog) fetchWishes();
  }, [openWishDialog, user]);

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleToggleNotificado = async (wishId, currentValue) => {
    try {
      await fetch(`/api/wishes/${wishId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificado: !currentValue })
      });
      fetchWishes(); // Atualiza a lista após alteração
    } catch (err) {
      // Pode adicionar um toast de erro se quiser
    }
  };

  const handleCreateAccount = async () => {
    if (!user?.id || !newAccountName.trim()) {
      setCreateAccountError('O nome da conta é obrigatório.');
      return;
    }
    setCreateAccountError('');
    try {
      const API_BASE_URL = import.meta.env.VITE_URL;
      await axios.post(`${API_BASE_URL}/api/accounts`, {
        userId: user.id,
        name: newAccountName
      });
      setOpenCreateAccountDialog(false);
      setNewAccountName('');
      // Idealmente, aqui você invalidaria o cache de contas para o dashboard recarregar
      // Por enquanto, um reload da página resolveria: window.location.reload();
    } catch (error: any) {
      if (error.response?.data?.message) {
        setCreateAccountError(error.response.data.message);
      } else {
        setCreateAccountError('Erro ao criar conta.');
      }
    }
  };

  return (
    <div className="w-64 sm:w-72 lg:w-64 h-full bg-slate-900/50 backdrop-blur-md border-r border-white/10 flex flex-col">
      {/* Logo */}
      <div className="p-4 sm:p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-genesi-gradient rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-white">Genesi</h1>
            <p className="text-xs sm:text-sm text-white/60">IA Financeira</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 sm:p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={`nav-item w-full ${isActive ? 'active' : ''}`}
            >
              <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">{item.label}</span>
            </button>
          );
        })}
        <Dialog open={openWishDialog} onOpenChange={setOpenWishDialog}>
          <DialogTrigger asChild>
            <button
              className={`nav-item w-full`}
              type="button"
              onClick={() => setOpenWishDialog(true)}
            >
              <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Desejos</span>
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Meus Desejos de Compra</DialogTitle>
            </DialogHeader>
            {loadingWishes ? (
              <div className="text-center py-4">Carregando...</div>
            ) : wishError ? (
              <div className="text-red-500 text-center py-4">{wishError}</div>
            ) : wishes.length === 0 ? (
              <div className="text-center py-4">Nenhum desejo cadastrado.</div>
            ) : (
              <ul className="divide-y divide-gray-200 max-h-72 overflow-y-auto">
                {wishes.map((wish, idx) => (
                  <li key={wish._id || idx} className={`py-2 px-2 rounded ${wish.notificado ? 'bg-green-900/40' : ''} flex items-center justify-between`}>
                    <div>
                      <div className="font-medium">{wish.descricao_produto}</div>
                      {wish.limite_preco && (
                        <div className="text-xs text-gray-400">Limite: R$ {wish.limite_preco}</div>
                      )}
                      {wish.modo && (
                        <div className="text-xs text-blue-400">Modo: {wish.modo.replace('_', ' ')}</div>
                      )}
                      {wish.preco_medio_base !== undefined && wish.preco_medio_base !== null && (
                        <div className="text-xs text-green-400">Preço médio base: R$ {wish.preco_medio_base}</div>
                      )}
                      <div className="text-xs text-gray-400">Criado em: {wish.createdAt ? new Date(wish.createdAt).toLocaleDateString() : '-'}</div>
                    </div>
                    <Switch checked={wish.notificado} onCheckedChange={() => handleToggleNotificado(wish._id, wish.notificado)} />
                  </li>
                ))}
              </ul>
            )}
          </DialogContent>
        </Dialog>

        {/* Create Account Dialog Trigger */}
        <Dialog open={openCreateAccountDialog} onOpenChange={setOpenCreateAccountDialog}>
          <DialogTrigger asChild>
            <button className="nav-item w-full" type="button">
              <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-sm sm:text-base">Criar Conta</span>
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Conta</DialogTitle>
              <DialogDescription>
                Dê um nome para sua nova conta. Você pode ter no máximo 2 contas.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Label htmlFor="account-name">Nome da Conta</Label>
              <Input
                id="account-name"
                value={newAccountName}
                onChange={(e) => setNewAccountName(e.target.value)}
                placeholder="Ex: Conta de Investimentos"
              />
              {createAccountError && <p className="text-red-500 text-sm">{createAccountError}</p>}
            </div>
            <DialogFooter>
              <Button onClick={handleCreateAccount}>Criar Conta</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </nav>

      {/* Integrations */}
      <div className="p-3 sm:p-4 border-t border-white/10">
        <h3 className="text-xs sm:text-sm font-semibold text-white/60 mb-3 uppercase tracking-wider">
          Integrações
        </h3>
        <div className="space-y-2">
          {integrationItems.map((item, index) => {
            const Icon = item.icon;
            
            return (
              <button
                key={index}
                onClick={item.action}
                className="nav-item w-full"
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-xs sm:text-sm">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Logout */}
      <div className="p-3 sm:p-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="nav-item w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-sm sm:text-base">Sair</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
