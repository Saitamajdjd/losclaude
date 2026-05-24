import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../../services/api';

const AI_ERROR_MESSAGE = 'Não foi possível gerar a análise automática neste momento.';

function parseDragons(dragons) {
  if (!dragons) return [];
  if (Array.isArray(dragons)) return dragons;
  try {
    const parsed = JSON.parse(dragons);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return dragons.split(',').map((s) => s.trim()).filter(Boolean);
  }
}

function isAnalysisError(text) {
  if (!text) return false;
  return (
    text.includes(AI_ERROR_MESSAGE) ||
    text.includes('Análise indisponível') ||
    text.includes('Erro ao gerar análise com IA') ||
    text.includes('Insufficient Balance')
  );
}

function MatchStrategicSummary({ match }) {
  const isLoL = match.modality === 'League of Legends';
  const dragons = parseDragons(match.dragons);

  if (isLoL) {
    const hasData =
      match.towers_destroyed > 0 ||
      dragons.length > 0 ||
      match.barons > 0 ||
      match.match_duration;
    if (!hasData) return null;

    return (
      <div className="mb-4 p-4 rounded-lg bg-los-black/50 border border-gray-800 text-sm flex flex-wrap gap-x-6 gap-y-2">
        <span className="text-gray-500">
          Torres: <strong className="text-white">{match.towers_destroyed ?? 0}</strong>
        </span>
        <span className="text-gray-500">
          Barões: <strong className="text-white">{match.barons ?? 0}</strong>
        </span>
        {match.match_duration && (
          <span className="text-gray-500">
            Tempo: <strong className="text-white">{match.match_duration}</strong>
          </span>
        )}
        {dragons.length > 0 && (
          <span className="text-gray-500">
            Dragões:{' '}
            <strong className="text-los-orange">{dragons.join(', ')}</strong>
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="mb-4 p-4 rounded-lg bg-los-black/50 border border-los-orange/20 text-sm flex flex-wrap gap-x-6 gap-y-2">
      <span
        className={`font-bold uppercase ${match.booyah ? 'text-los-orange' : 'text-gray-500'}`}
      >
        Booyah: {match.booyah ? 'Sim' : 'Não'}
      </span>
      <span className="text-gray-500">
        Colocação final:{' '}
        <strong className="text-los-orange">#{match.team_placement ?? '-'}</strong>
      </span>
      <span className="text-gray-500">
        Eliminações do time:{' '}
        <strong className="text-los-orange">{match.team_eliminations ?? 0}</strong>
      </span>
    </div>
  );
}

function MatchAnalysis({ match, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [localAnalysis, setLocalAnalysis] = useState(match.ai_analysis);

  useEffect(() => {
    setLocalAnalysis(match.ai_analysis);
  }, [match.id, match.ai_analysis]);

  const analysis = localAnalysis ?? match.ai_analysis;
  const showRetry = isAnalysisError(analysis);

  const handleRetry = async () => {
    setLoading(true);
    try {
      const updated = await api.retryMatchAnalysis(match.id);
      setLocalAnalysis(updated.ai_analysis);
      onUpdate(updated);
    } catch (err) {
      setLocalAnalysis(`Erro ao gerar análise com IA: ${err.message || AI_ERROR_MESSAGE}`);
    } finally {
      setLoading(false);
    }
  };

  if (!analysis && !loading) return null;

  return (
    <div className="mt-4 p-4 rounded-lg bg-los-orange/10 border border-los-orange/30">
      <p className="text-xs font-bold text-los-orange uppercase mb-2 tracking-wider">
        Análise IA · OpenRouter
      </p>
      {loading ? (
        <p className="text-gray-400 text-sm animate-pulse">Gerando análise com IA...</p>
      ) : (
        <>
          <p
            className={`text-sm leading-relaxed whitespace-pre-wrap ${
              showRetry ? 'text-gray-400' : 'text-gray-300'
            }`}
          >
            {analysis}
          </p>
          {showRetry && (
            <button
              type="button"
              onClick={handleRetry}
              disabled={loading}
              className="mt-4 btn-primary text-sm py-2 px-4 disabled:opacity-50"
            >
              Tentar novamente
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default function MatchList({ matches, onMatchUpdate }) {
  return (
    <div className="card-glass p-6">
      <h2 className="font-display text-xl text-white uppercase mb-6">
        Partidas <span className="text-los-orange">({matches.length})</span>
      </h2>
      {matches.length === 0 ? (
        <p className="text-gray-500 text-center py-8">Nenhuma partida registrada.</p>
      ) : (
        <div className="space-y-6">
          {matches.map((match) => (
            <motion.article
              key={match.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-6 bg-los-dark rounded-xl border border-los-orange/20"
            >
              <div className="flex flex-wrap gap-4 justify-between mb-4">
                <div>
                  <span className="text-xs text-los-orange uppercase font-bold">{match.modality}</span>
                  {match.modality === 'League of Legends' ? (
                    <h3 className="text-xl font-bold text-white">
                      Placar: {match.score} — {match.result}
                    </h3>
                  ) : (
                    <h3 className="text-xl font-bold text-white">
                      Colocação final: #{match.team_placement ?? '-'}
                    </h3>
                  )}
                  <p className="text-xs text-gray-600">
                    {new Date(match.created_at).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>

              <MatchStrategicSummary match={match} />

              <div className="overflow-x-auto mb-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-500 text-left border-b border-gray-800">
                      <th className="py-2 pr-4">Jogador</th>
                      {match.modality === 'League of Legends' ? (
                        <>
                          <th className="py-2">K</th>
                          <th className="py-2">D</th>
                          <th className="py-2">A</th>
                        </>
                      ) : (
                        <th className="py-2">K</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {match.stats?.map((s) => (
                      <tr key={s.id} className="border-b border-gray-900">
                        <td className="py-2 pr-4 text-white">{s.nick}</td>
                        {match.modality === 'League of Legends' ? (
                          <>
                            <td className="py-2 text-los-orange">{s.kills}</td>
                            <td className="py-2">{s.deaths}</td>
                            <td className="py-2">{s.assists}</td>
                          </>
                        ) : (
                          <td className="py-2 text-los-orange">
                            {s.free_fire_kills ?? s.kills ?? 0}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <MatchAnalysis match={match} onUpdate={onMatchUpdate} />
            </motion.article>
          ))}
        </div>
      )}
    </div>
  );
}
