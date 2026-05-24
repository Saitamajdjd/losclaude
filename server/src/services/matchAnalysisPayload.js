const { parseDragonsStored } = require('../utils/matchValidation');

function formatPlayerStats(stat, modality) {
  const player = {
    nick: stat.nick,
    funcao: stat.role,
  };

  if (modality === 'League of Legends') {
    player.kills = stat.kills ?? 0;
    player.deaths = stat.deaths ?? 0;
    player.assists = stat.assists ?? 0;
  } else if (modality === 'Free Fire') {
    player.kills = stat.free_fire_kills ?? stat.kills ?? 0;
  }

  return player;
}

function formatMatchForAI(matchData) {
  const { modality, score, result, stats } = matchData;
  const jogadores = (stats || []).map((s) => formatPlayerStats(s, modality));

  if (modality === 'League of Legends') {
    return {
      modalidade: modality,
      placar: score,
      resultado: result,
      jogadores,
      torres_destruidas: matchData.towers_destroyed ?? 0,
      dragoes_conquistados: parseDragonsStored(matchData.dragons),
      baroes_feitos: matchData.barons ?? 0,
      tempo_partida: matchData.match_duration || 'não informado',
    };
  }

  return {
    modalidade: modality,
    jogadores,
    colocacao_final_equipe: matchData.team_placement ?? null,
    booyah: Boolean(matchData.booyah),
    eliminacoes_totais_time: matchData.team_eliminations ?? 0,
  };
}

module.exports = { formatMatchForAI };
