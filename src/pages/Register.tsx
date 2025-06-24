import React, { useState } from 'react';
<<<<<<< HEAD
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Sparkles, User, Mail, Lock, Phone } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';
=======
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Sparkles, Mail, Lock, User, Phone } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_URL;
>>>>>>> 3658fd0 (Atualizado)

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
<<<<<<< HEAD
  const [whatsapp, setWhatsapp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !whatsapp) {
      toast({
        title: "Erro de Validação",
        description: "Todos os campos são obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    
    const success = await register(name, email, password, whatsapp, setIsLoading);
    
    if (success) {
      navigate('/login');
=======
  const [confirmPassword, setConfirmPassword] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password || !confirmPassword || !whatsapp) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive"
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive"
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/register`, {
        name,
        email,
        password,
        whatsapp
      });

      if (response.status === 201) {
        toast({
          title: "Sucesso!",
          description: "Conta criada com sucesso. Agora você pode fazer o login.",
        });
        navigate('/login'); // Redireciona para o login
      } else {
        throw new Error('Não foi possível criar a conta.');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Erro ao registrar:", error.response?.data || error.message);
        const errorMessage = error.response?.data?.message || "Erro ao criar conta. Tente novamente.";
        toast({
          title: "Erro",
          description: errorMessage,
          variant: "destructive"
        });
      } else {
        console.error("Erro inesperado:", error);
        toast({
          title: "Erro Inesperado",
          description: "Ocorreu um erro. Por favor, tente mais tarde.",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
>>>>>>> 3658fd0 (Atualizado)
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="w-full max-w-md animate-fade-in">
<<<<<<< HEAD
=======
        {/* Logo */}
>>>>>>> 3658fd0 (Atualizado)
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-genesi-gradient rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Criar Conta</h1>
<<<<<<< HEAD
          <p className="text-white/60">Comece a transformar sua vida financeira</p>
        </div>

        <div className="genesi-card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-white/80 mb-2">Nome Completo</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" className="genesi-input w-full pl-10" required />
              </div>
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" className="genesi-input w-full pl-10" required />
=======
          <p className="text-white/60">Junte-se à Genesi e transforme suas finanças</p>
        </div>

        {/* Form */}
        <div className="genesi-card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-white/80 mb-2">
                Nome Completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome completo"
                  className="genesi-input w-full pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="genesi-input w-full pl-10"
                  required
                />
>>>>>>> 3658fd0 (Atualizado)
              </div>
            </div>

            <div>
<<<<<<< HEAD
              <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-2">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="genesi-input w-full pl-10" required />
=======
              <label htmlFor="password" className="block text-sm font-medium text-white/80 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="genesi-input w-full pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/60"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
>>>>>>> 3658fd0 (Atualizado)
              </div>
            </div>

            <div>
<<<<<<< HEAD
              <label htmlFor="whatsapp" className="block text-sm font-medium text-white/80 mb-2">WhatsApp</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                <input id="whatsapp" type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="(XX) XXXXX-XXXX" className="genesi-input w-full pl-10" required />
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="genesi-button w-full">
=======
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/80 mb-2">
                Confirmar Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="genesi-input w-full pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/60"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="whatsapp" className="block text-sm font-medium text-white/80 mb-2">
                WhatsApp
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  id="whatsapp"
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="Seu número com DDD, ex: 5511999999999"
                  className="genesi-input w-full pl-10"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="genesi-button w-full"
            >
>>>>>>> 3658fd0 (Atualizado)
              {isLoading ? 'Criando conta...' : 'Criar Conta'}
            </button>

            <div className="text-center">
              <span className="text-white/60">Já tem uma conta? </span>
<<<<<<< HEAD
              <Link to="/login" className="text-genesi-blue hover:text-genesi-blue-light font-semibold transition-colors">
                Fazer Login
=======
              <Link 
                to="/login" 
                className="text-genesi-blue hover:text-genesi-blue-light font-semibold transition-colors"
              >
                Fazer login
>>>>>>> 3658fd0 (Atualizado)
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
