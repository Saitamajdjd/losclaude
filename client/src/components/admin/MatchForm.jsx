import { useState } from 'react';
import { api } from '../../services/api';

const MODALITIES = ['League of Legends', 'Free Fire'];
const RESULTS = ['Vitória', 'Derrota', 'Empate'];
const DRAGON_TYPES = ['Infernal', 'Oceano', 'Montanha', 'Nuvem', 'Hextec', 'Quimtec'];
const MAX_DRAGONS = 4;

const initialLoL = {
  towers_destroyed: 0,
  barons: 0,
  match_duration: '',
  selectedDragons: [],
};

const initialFF = {
  team_placement: '',
  booyah: false,
  team_eliminations: 0,
};

function emptyStat(playerId = '') {
  return {
    player_id: playerId,
    kills: 0,
    free_fire_kills: 0,
    deaths: 0,
    assists: 0,
  };
}

export default function MatchForm({ players, onSuccess, onError }) {
  const [modality, setModality] = useState(MODALITIES[0]);
  const [score, setScore] = useState('');
  const [result, setResult] = useState(RESULTS[0]);
  const [stats, setStats] = useState([emptyStat()]);
  const [lolFields, setLolFields] = useState(initialLoL);
  const [ffFields, setFfFields] = useState(initialFF);
  const [loading, setLoading] = useState(false);

  const filteredPlayers = players.filter((p) => p.modality === modality);
  const isLoL = modality === 'League of Legends';

  const handleModalityChange = (value) => {
    setModality(value);
    setStats([emptyStat()]);
    setLolFields(initialLoL);
    setFfFields(initialFF);
  };

  const updateStat = (index, field, value) => {
    const next = [...stats];
    next[index] = { ...next[index], [field]: value };
    setStats(next);
  };

  const toggleDragon = (dragon) => {
    setLolFields((prev) => {
      const selected = prev.selectedDragons.includes(dragon)
        ? prev.selectedDragons.filter((d) => d !== dragon)
        : prev.selectedDragons.length < MAX_DRAGONS
          ? [...prev.selectedDragons, dragon]
          : prev.selectedDragons;
      return { ...prev, selectedDragons: selected };
    });
  };

  const addRow = () => setStats([...stats, emptyStat()]);
  const removeRow = (i) => setStats(stats.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stats.every((s) => s.player_id)) {
      onError(new Error('Selecione um jogador em cada linha'));
      return;
    }

    setLoading(true);
    try {
      const body = {
        modality,
        stats: stats.map((s) => ({
          player_id: parseInt(s.player_id, 10),
          ...(isLoL
            ? {
                kills: parseInt(s.kills, 10) || 0,
                deaths: parseInt(s.deaths, 10) || 0,
                assists: parseInt(s.assists, 10) || 0,
              }
            : {
                free_fire_kills: parseInt(s.free_fire_kills ?? s.kills, 10) || 0,
              }),
        })),
      };

      if (isLoL) {
        body.score = score;
        body.result = result;
        body.towers_destroyed = parseInt(lolFields.towers_destroyed, 10) || 0;
        body.barons = parseInt(lolFields.barons, 10) || 0;
        body.match_duration = lolFields.match_duration.trim();
        body.dragons = lolFields.selectedDragons;
      } else {
        body.team_placement = parseInt(ffFields.team_placement, 10) || null;
        body.booyah = ffFields.booyah;
        body.team_eliminations = parseInt(ffFields.team_eliminations, 10) || 0;
      }

      await api.createMatch(body);
      setScore('');
      setStats([emptyStat()]);
      setLolFields(initialLoL);
      setFfFields(initialFF);
      onSuccess();
    } catch (err) {
      onError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-glass p-6">
      <h2 className="font-display text-xl text-los-orange uppercase mb-2">Registrar Partida</h2>
      <p className="text-gray-500 text-sm mb-6">A análise com IA (OpenRouter) será gerada automaticamente.</p>

      {players.length === 0 ? (
        <p className="text-amber-400">Cadastre jogadores antes de registrar partidas.</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid sm:grid-cols-3 gap-4">
            <select
              className="input-field"
              value={modality}
              onChange={(e) => handleModalityChange(e.target.value)}
            >
              {MODALITIES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            {isLoL && (
              <>
                <input
                  className="input-field"
                  placeholder="Placar (ex: 2x1)"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  required
                />
                <select className="input-field" value={result} onChange={(e) => setResult(e.target.value)}>
                  {RESULTS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>

          {isLoL ? (
            <div className="p-5 bg-los-dark rounded-xl border border-los-orange/20 space-y-5">
              <h3 className="text-white font-bold uppercase text-sm tracking-wider">
                Objetivos — League of Legends
              </h3>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-los-orange uppercase mb-2 font-bold">
                    Torres destruídas
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="input-field"
                    value={lolFields.towers_destroyed}
                    onChange={(e) =>
                      setLolFields({ ...lolFields, towers_destroyed: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs text-los-orange uppercase mb-2 font-bold">
                    Barões feitos
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="input-field"
                    value={lolFields.barons}
                    onChange={(e) => setLolFields({ ...lolFields, barons: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs text-los-orange uppercase mb-2 font-bold">
                    Tempo de partida
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="28:35 ou 32min"
                    value={lolFields.match_duration}
                    onChange={(e) =>
                      setLolFields({ ...lolFields, match_duration: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <label className="text-xs text-los-orange uppercase font-bold">
                    Dragões conquistados
                  </label>
                  <span className="text-xs text-gray-500">
                    Dragões selecionados: {lolFields.selectedDragons.length}/{MAX_DRAGONS}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {DRAGON_TYPES.map((dragon) => {
                    const selected = lolFields.selectedDragons.includes(dragon);
                    const disabled =
                      !selected && lolFields.selectedDragons.length >= MAX_DRAGONS;
                    return (
                      <button
                        key={dragon}
                        type="button"
                        onClick={() => toggleDragon(dragon)}
                        disabled={disabled}
                        className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide transition-all border ${
                          selected
                            ? 'bg-los-orange text-black border-los-orange shadow-glow-sm'
                            : disabled
                              ? 'bg-los-black/50 text-gray-600 border-gray-800 cursor-not-allowed'
                              : 'bg-los-card text-gray-400 border-gray-800 hover:border-los-orange/50 hover:text-white'
                        }`}
                      >
                        {dragon}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-5 bg-los-dark rounded-xl border border-los-orange/30 space-y-5 shadow-glow-sm">
              <h3 className="text-white font-bold uppercase text-sm tracking-wider">
                Dados coletivos — Free Fire
              </h3>

              <div>
                <label className="block text-xs text-los-orange uppercase mb-2 font-bold">
                  Colocação final da equipe
                </label>
                <input
                  type="number"
                  min="1"
                  className="input-field"
                  placeholder="Ex: 1"
                  value={ffFields.team_placement}
                  onChange={(e) => setFfFields({ ...ffFields, team_placement: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-los-orange uppercase mb-3 font-bold">Booyah?</label>
                <div className="flex gap-3">
                  {[
                    { label: 'Sim', value: true },
                    { label: 'Não', value: false },
                  ].map((opt) => (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => setFfFields({ ...ffFields, booyah: opt.value })}
                      className={`flex-1 py-4 rounded-xl font-display text-lg uppercase tracking-wider transition-all border-2 ${
                        ffFields.booyah === opt.value
                          ? 'bg-los-orange text-black border-los-orange shadow-glow'
                          : 'bg-los-black text-gray-500 border-gray-800 hover:border-los-orange/40'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-los-orange uppercase mb-2 font-bold">
                  Eliminações totais do time
                </label>
                <input
                  type="number"
                  min="0"
                  className="input-field"
                  placeholder="Total de abates do esquadrão"
                  value={ffFields.team_eliminations}
                  onChange={(e) =>
                    setFfFields({ ...ffFields, team_eliminations: e.target.value })
                  }
                />
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-white font-bold uppercase text-sm tracking-wider">
                {isLoL ? 'Estatísticas individuais (KDA)' : 'Jogadores e kills'}
              </h3>
              <button
                type="button"
                onClick={addRow}
                className="text-los-orange text-sm font-bold hover:underline"
              >
                + Jogador
              </button>
            </div>

            {stats.map((stat, i) => (
              <div
                key={i}
                className="p-4 bg-los-dark rounded-lg border border-gray-800 grid gap-3 sm:grid-cols-2 lg:grid-cols-6"
              >
                <select
                  className="input-field lg:col-span-2"
                  value={stat.player_id}
                  onChange={(e) => updateStat(i, 'player_id', e.target.value)}
                  required
                >
                  <option value="">Jogador</option>
                  {filteredPlayers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nick} ({p.role})
                    </option>
                  ))}
                </select>
                {isLoL && (
                  <>
                    <input
                      type="number"
                      min="0"
                      className="input-field"
                      placeholder="Kills"
                      value={stat.kills}
                      onChange={(e) => updateStat(i, 'kills', e.target.value)}
                    />
                    <input
                      type="number"
                      min="0"
                      className="input-field"
                      placeholder="Deaths"
                      value={stat.deaths}
                      onChange={(e) => updateStat(i, 'deaths', e.target.value)}
                    />
                    <input
                      type="number"
                      min="0"
                      className="input-field"
                      placeholder="Assists"
                      value={stat.assists}
                      onChange={(e) => updateStat(i, 'assists', e.target.value)}
                    />
                  </>
                )}
                {!isLoL && (
                  <input
                    type="number"
                    min="0"
                    className="input-field"
                    placeholder="Kills"
                    value={stat.free_fire_kills}
                    onChange={(e) => updateStat(i, 'free_fire_kills', e.target.value)}
                  />
                )}
                {stats.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRow(i)}
                    className="text-red-400 text-sm sm:col-span-2 lg:col-span-1"
                  >
                    Remover
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || filteredPlayers.length === 0}
            className="btn-primary w-full disabled:opacity-50"
          >
            {loading ? 'Analisando com IA...' : 'Registrar e Analisar'}
          </button>
        </form>
      )}
    </div>
  );
}
