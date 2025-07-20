import React, { useState } from 'react';
import { Plus, ChevronDown, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ChatHistory {
  id: string;
  title: string;
  date: string;
}

const ChatSidebar = () => {
  const [chatHistory] = useState<ChatHistory[]>([
    { id: '1', title: 'Planejamento para aposentadoria', date: '2 dias atrás' },
    { id: '2', title: 'Investimentos para iniciantes', date: '1 semana atrás' },
    { id: '3', title: 'Declaração IR 2024', date: '2 semanas atrás' },
  ]);

  const quickAccessOptions = [
    {
      id: 1,
      title: 'Me ajude a declarar meu Imposto de renda',
      icon: '📋'
    },
    {
      id: 2,
      title: 'Fazer planejamento estratégico para minhas finanças',  
      icon: '💰'
    },
    {
      id: 3,
      title: 'Receber dicas personalizadas sobre investimentos',
      icon: '📈'
    }
  ];

  const handleQuickAccess = (option: typeof quickAccessOptions[0]) => {
    console.log('Iniciando chat:', option.title);
  };

  const handleNewChat = () => {
    console.log('Novo chat iniciado');
  };

  return (
    <div className="w-full bg-slate-900 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <span className="text-white font-semibold">Adam-O</span>
        </div>
        
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-700">
                Past chats
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-slate-800 border-slate-700 w-64">
              {chatHistory.map((chat) => (
                <DropdownMenuItem key={chat.id} className="text-slate-300 hover:bg-slate-700">
                  <div className="flex flex-col">
                    <span className="text-sm">{chat.title}</span>
                    <span className="text-xs text-slate-500">{chat.date}</span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleNewChat}
            className="text-slate-300 hover:text-white hover:bg-slate-700"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Chat Content */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 max-w-4xl mx-auto w-full">
        {/* Welcome Message */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">A</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Como posso ajudar?</h2>
          <p className="text-slate-400 text-sm">
            Sou o Adam, seu assistente financeiro. Escolha uma das opções abaixo ou digite sua pergunta.
          </p>
        </div>

        {/* Quick Access Cards */}
        <div className="space-y-3 w-full max-w-2xl">
          {quickAccessOptions.map((option) => (
            <Card 
              key={option.id}
              className="bg-slate-800 border-slate-700 hover:bg-slate-750 transition-colors cursor-pointer p-4"
              onClick={() => handleQuickAccess(option)}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{option.icon}</span>
                <span className="text-slate-300 text-sm flex-1">{option.title}</span>
              </div>
            </Card>
          ))}
        </div>

        {/* Chat Input */}
        <div className="w-full max-w-2xl mt-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Digite sua pergunta..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            <Button 
              size="sm" 
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-emerald-600 hover:bg-emerald-700"
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar; 