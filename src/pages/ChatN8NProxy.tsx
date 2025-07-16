import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Endpoint do proxy local para testes
const PROXY_URL = 'http://localhost:3001/api/chat-n8n';

const ChatN8NProxy = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ from: 'user' | 'bot'; text: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = input;
    setMessages((prev) => [...prev, { from: 'user', text: userMessage }]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch(PROXY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { from: 'bot', text: data.resposta || data.message || 'Resposta recebida.' },
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { from: 'bot', text: 'Erro ao conectar ao proxy local.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <div className="w-full bg-slate-900 flex flex-col h-full items-center justify-center min-h-screen">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-white font-bold text-2xl">A</span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Chat de Teste com Proxy Local</h2>
        <p className="text-slate-400 text-sm">
          Este chat usa um proxy local para evitar problemas de CORS durante o desenvolvimento.<br/>
          Quando for para produção, use a integração direta com o webhook do n8n.
        </p>
      </div>
      <div className="w-full max-w-2xl mb-2">
        <div className="flex flex-col gap-2">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={
                msg.from === 'user'
                  ? 'self-end bg-emerald-600 text-white rounded-lg px-4 py-2 max-w-[80%]' 
                  : 'self-start bg-slate-700 text-white rounded-lg px-4 py-2 max-w-[80%]'
              }
            >
              {msg.text}
            </div>
          ))}
          {loading && (
            <div className="self-start bg-slate-700 text-white rounded-lg px-4 py-2 max-w-[80%] opacity-70">
              Digitando...
            </div>
          )}
        </div>
      </div>
      <div className="w-full max-w-2xl">
        <div className="relative">
          <input
            type="text"
            placeholder="Digite sua pergunta..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleInputKeyDown}
            disabled={loading}
          />
          <Button 
            size="sm" 
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-emerald-600 hover:bg-emerald-700"
            onClick={sendMessage}
            disabled={loading}
          >
            <MessageCircle className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatN8NProxy; 