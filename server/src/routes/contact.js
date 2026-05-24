const express = require('express');
const env = require('../config/env');

const router = express.Router();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MODALITIES = ['League of Legends', 'Free Fire'];

async function handleTeamContact(req, res) {
  const email = String(req.body.email || '').trim();
  const modalidade = String(req.body.modalidade || '').trim();
  const mensagem = String(req.body.mensagem || '').trim();

  if (!email || !EMAIL_REGEX.test(email)) {
    return res.status(400).json({ error: 'Informe um e-mail válido' });
  }
  if (!MODALITIES.includes(modalidade)) {
    return res.status(400).json({ error: 'Selecione uma modalidade válida' });
  }
  if (!mensagem) {
    return res.status(400).json({ error: 'A mensagem é obrigatória' });
  }

  if (!env.n8n.webhookUrl) {
    return res.status(503).json({ error: 'Serviço de contato indisponível no momento' });
  }

  const payload = {
    email,
    modalidade,
    mensagem,
    origem: 'home_elenco_los',
    enviadoEm: new Date().toISOString(),
  };

  const response = await fetch(env.n8n.webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Webhook retornou status ${response.status}`);
  }

  return res.json({ message: 'Mensagem enviada com sucesso' });
}

router.post('/team', async (req, res) => {
  try {
    await handleTeamContact(req, res);
  } catch (err) {
    console.error('Contato equipe:', err);
    res.status(500).json({ error: 'Não foi possível enviar agora. Tente novamente em alguns minutos.' });
  }
});

router.post('/lol-team', async (req, res) => {
  req.body.modalidade = req.body.modalidade || 'League of Legends';
  req.body.mensagem = req.body.mensagem || 'Contato via formulário legado';
  try {
    await handleTeamContact(req, res);
  } catch (err) {
    console.error('Contato LoL:', err);
    res.status(500).json({ error: 'Não foi possível enviar agora. Tente novamente em alguns minutos.' });
  }
});

module.exports = router;
