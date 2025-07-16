import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';
const app = express();
app.use(express.json());
app.use(cors());

app.post('/api/chat-n8n', async (req, res) => {
    console.log('Recebido do frontend:', req.body);
  try {
    console.log('Enviando para n8n...');
    const response = await fetch('https://gudrade.app.n8n.cloud/webhook/b5304be5-6093-43bc-b167-5f70b554b5bc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
      message: userMessage,
      sessionId: 'usuario-teste'
    });

    const data = await response.json();
    res.set('Access-Control-Allow-Origin', '*');
    res.json(data);
  } catch (e) {
    res.status(500).json({ erro: 'Falha ao conectar ao n8n' });
  }
});

app.listen(3001, () => console.log('Proxy rodando na porta 3001'));