const OpenAI = require('openai');
const env = require('../config/env');
const { formatMatchForAI } = require('./matchAnalysisPayload');

const SYSTEM_PROMPT =
  'Você é um analista profissional de esports especializado em League of Legends e Free Fire. Analise a partida usando os nicks dos jogadores. Destaque o jogador clutch da partida, explique por que ele foi decisivo, avalie o desempenho coletivo, os pontos fortes, os problemas e o que o time pode melhorar para a próxima partida. Responda em português do Brasil, com linguagem clara, profissional e envolvente.';

const AI_ERROR_MESSAGE = 'Não foi possível gerar a análise automática neste momento.';

function buildUserPrompt(matchData) {
  const formatted = formatMatchForAI(matchData);
  const isLoL = matchData.modality === 'League of Legends';

  const focusLoL = `
Foco League of Legends:
- Use torres destruídas, dragões conquistados, barões e tempo de partida na análise
- Avalie domínio de objetivos e macro game
- Comente se a vitória/derrota veio mais por luta, objetivos, controle de mapa ou vantagem individual
- Analise desempenho individual (KDA), jogador clutch e o que melhorar na próxima partida`;

  const focusFF = `
Foco Free Fire:
- Use Booyah, eliminações totais do time e colocação final da equipe
- NÃO mencione abates individuais por jogador (só o total do time)
- Avalie desempenho coletivo, agressividade e sobrevivência
- Comente se a equipe jogou por eliminação ou posicionamento
- Sugira pontos de melhoria para a próxima partida`;

  return `Analise esta partida com profundidade:

${JSON.stringify(formatted, null, 2)}

Instruções obrigatórias:
- Use SOMENTE os nicks dos jogadores (nunca nomes reais)
- Identifique e destaque o jogador clutch (LoL) ou destaque coletivo (Free Fire)
- Avalie o desempenho coletivo do time
- Liste pontos fortes e pontos fracos
- Sugira melhorias concretas para a próxima partida
- Escreva no mínimo 3 e no máximo 5 parágrafos curtos, bem desenvolvidos
${isLoL ? focusLoL : focusFF}`;
}

function getClient() {
  return new OpenAI({
    apiKey: env.openrouter.apiKey,
    baseURL: env.openrouter.apiUrl,
  });
}

function isConfigured() {
  return Boolean(env.openrouter.apiKey);
}

function logOpenRouterConfig() {
  console.log('Modelo OpenRouter:', process.env.OPENROUTER_MODEL);
  console.log('OpenRouter Key carregada:', !!process.env.OPENROUTER_API_KEY);
}

function logOpenRouterError(err) {
  console.error('Erro OpenRouter:', err.response?.data || err.message);
}

async function analyzeMatch(matchData) {
  logOpenRouterConfig();

  if (!isConfigured()) {
    throw new Error('OPENROUTER_API_KEY não configurada no .env');
  }

  const model = env.openrouter.model;
  const client = getClient();

  try {
    const response = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserPrompt(matchData) },
      ],
      temperature: 0.75,
      max_tokens: 2200,
    });

    const content = response.choices?.[0]?.message?.content?.trim();
    if (!content) {
      throw new Error('OpenRouter: resposta sem conteúdo');
    }
    return content;
  } catch (err) {
    logOpenRouterError(err);
    throw err;
  }
}

async function testOpenRouter() {
  logOpenRouterConfig();

  if (!isConfigured()) {
    throw new Error('OPENROUTER_API_KEY não configurada no .env');
  }

  const client = getClient();
  const response = await client.chat.completions.create({
    model: env.openrouter.model,
    messages: [{ role: 'user', content: 'Responda apenas: OK' }],
    temperature: 0,
    max_tokens: 16,
  });

  const content = response.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error('OpenRouter: resposta de teste sem conteúdo');
  }
  return content;
}

module.exports = { analyzeMatch, AI_ERROR_MESSAGE, isConfigured, logOpenRouterConfig, testOpenRouter };
