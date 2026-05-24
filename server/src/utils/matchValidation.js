const DRAGON_TYPES = ['Infernal', 'Oceano', 'Montanha', 'Nuvem', 'Hextec', 'Quimtec'];
const MAX_DRAGONS = 4;

function parseDragonsInput(dragons) {
  if (!dragons) return [];
  if (Array.isArray(dragons)) {
    return dragons.filter((d) => DRAGON_TYPES.includes(d)).slice(0, MAX_DRAGONS);
  }
  if (typeof dragons === 'string') {
    try {
      const parsed = JSON.parse(dragons);
      if (Array.isArray(parsed)) {
        return parsed.filter((d) => DRAGON_TYPES.includes(d)).slice(0, MAX_DRAGONS);
      }
    } catch {
      return dragons
        .split(',')
        .map((s) => s.trim())
        .filter((d) => DRAGON_TYPES.includes(d))
        .slice(0, MAX_DRAGONS);
    }
  }
  return [];
}

function parseDragonsStored(value) {
  return parseDragonsInput(value);
}

function nonNegativeInt(value, fallback = 0) {
  const n = parseInt(value, 10);
  if (Number.isNaN(n) || n < 0) return fallback;
  return n;
}

function normalizeStats(stats, modality) {
  const isLoL = modality === 'League of Legends';
  const isFreeFire = modality === 'Free Fire';

  return stats.map((stat) => ({
    player_id: parseInt(stat.player_id, 10),
    kills: isLoL ? nonNegativeInt(stat.kills) : 0,
    deaths: isLoL ? nonNegativeInt(stat.deaths) : 0,
    assists: isLoL ? nonNegativeInt(stat.assists) : 0,
    free_fire_kills: isFreeFire ? nonNegativeInt(stat.free_fire_kills ?? stat.kills) : 0,
    free_fire_placement: null,
  }));
}

function validateMatchBody(body) {
  const { modality, score, result, stats } = body;
  if (!modality || !stats?.length) {
    return { error: 'Modalidade e jogadores são obrigatórios' };
  }
  if (!stats.every((s) => s.player_id)) {
    return { error: 'Selecione um jogador em cada linha' };
  }

  if (modality === 'League of Legends') {
    if (!score || !result) {
      return { error: 'Modalidade, placar, resultado e estatísticas são obrigatórios' };
    }
    const dragons = parseDragonsInput(body.dragons);
    if (dragons.length > MAX_DRAGONS) {
      return { error: 'Selecione no máximo 4 dragões' };
    }
    return {
      data: {
        towers_destroyed: nonNegativeInt(body.towers_destroyed),
        dragons: dragons.length ? JSON.stringify(dragons) : null,
        barons: nonNegativeInt(body.barons),
        match_duration: body.match_duration?.trim() || null,
        booyah: false,
        team_eliminations: 0,
        stats: normalizeStats(stats, modality),
      },
    };
  }

  if (modality === 'Free Fire') {
    const teamPlacement = nonNegativeInt(body.team_placement, null);
    if (!teamPlacement || teamPlacement < 1) {
      return { error: 'Colocação final da equipe é obrigatória' };
    }
    return {
      data: {
        towers_destroyed: 0,
        dragons: null,
        barons: 0,
        match_duration: null,
        team_placement: teamPlacement,
        booyah: Boolean(body.booyah),
        team_eliminations: nonNegativeInt(body.team_eliminations),
        stats: normalizeStats(stats, modality),
      },
    };
  }

  return { error: 'Modalidade inválida' };
}

module.exports = {
  DRAGON_TYPES,
  MAX_DRAGONS,
  parseDragonsInput,
  parseDragonsStored,
  normalizeStats,
  validateMatchBody,
};
