import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SectionHeader from './SectionHeader';
import PlayerDetailModal from './PlayerDetailModal';
import { api } from '../services/api';
import { resolveImageUrl } from '../utils/imageUrl';

const MODALITIES = ['League of Legends', 'Free Fire'];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function PlayerCard({ player, onSelect }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onClick={() => onSelect(player)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(player);
        }
      }}
      role="button"
      tabIndex={0}
      className="card-glass overflow-hidden group hover:shadow-glow transition-shadow cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-los-orange"
    >
      <div className="aspect-[4/3] bg-los-dark relative overflow-hidden">
        {player.image_url ? (
          <img
            src={resolveImageUrl(player.image_url)}
            alt={player.nick}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
              e.target.parentElement?.querySelector('.img-fallback')?.classList.remove('hidden');
            }}
          />
        ) : null}
        <div
          className={`img-fallback w-full h-full flex items-center justify-center bg-gradient-to-br from-los-orange/20 to-los-black ${player.image_url ? 'hidden' : ''}`}
        >
          <span className="font-display text-6xl text-los-orange font-black">{player.nick[0]}</span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-los-black via-transparent to-transparent" />
        <span className="absolute bottom-3 left-3 text-xs font-bold uppercase tracking-wider text-los-orange bg-los-black/80 px-2 py-1 rounded">
          {player.modality}
        </span>
      </div>
      <div className="p-5">
        <p className="text-gray-500 text-sm">{player.real_name}</p>
        <h3 className="font-display text-2xl text-los-orange font-bold uppercase mt-1 mb-2">
          {player.nick}
        </h3>
        <p className="text-white font-semibold text-sm mb-3">{player.role}</p>
        {player.description && (
          <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">{player.description}</p>
        )}
      </div>
    </motion.article>
  );
}

function TeamContactForm() {
  const [form, setForm] = useState({
    email: '',
    modalidade: MODALITIES[0],
    mensagem: '',
  });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });

    if (!EMAIL_REGEX.test(form.email.trim())) {
      setFeedback({ type: 'error', message: 'Informe um e-mail válido.' });
      return;
    }
    if (!form.mensagem.trim()) {
      setFeedback({ type: 'error', message: 'Escreva sua mensagem antes de enviar.' });
      return;
    }

    setLoading(true);
    try {
      await api.contactTeam({
        email: form.email.trim(),
        modalidade: form.modalidade,
        mensagem: form.mensagem.trim(),
      });
      setFeedback({
        type: 'success',
        message: 'Mensagem enviada com sucesso! Em breve nossa equipe entrará em contato.',
      });
      setForm({ email: '', modalidade: MODALITIES[0], mensagem: '' });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Não foi possível enviar agora. Tente novamente em alguns minutos.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-16 card-glass p-8 md:p-10 border-los-orange/30 shadow-glow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 w-48 h-48 bg-los-orange/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="relative z-10">
        <h3 className="font-display text-2xl md:text-3xl text-white uppercase mb-3">
          Fale com nossas <span className="text-los-orange">equipes</span>
        </h3>
        <p className="text-gray-400 mb-8 max-w-2xl">
          Quer fazer parte da LOS, tirar dúvidas ou conversar com nosso time? Preencha o formulário
          e responderemos o mais breve possível.
        </p>
        <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-los-orange mb-2">
              E-mail *
            </label>
            <input
              type="email"
              className="input-field"
              placeholder="seu@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-los-orange mb-2">
              Modalidade *
            </label>
            <select
              className="input-field"
              value={form.modalidade}
              onChange={(e) => setForm({ ...form, modalidade: e.target.value })}
              required
            >
              {MODALITIES.map((mod) => (
                <option key={mod} value={mod}>
                  {mod}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-los-orange mb-2">
              Mensagem *
            </label>
            <textarea
              className="input-field min-h-[120px] resize-y"
              placeholder="Escreva sua mensagem para a equipe..."
              value={form.mensagem}
              onChange={(e) => setForm({ ...form, mensagem: e.target.value })}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full sm:w-auto disabled:opacity-50"
          >
            {loading ? 'Enviando...' : 'Enviar mensagem para nosso time'}
          </button>
        </form>
        {feedback.message && (
          <p
            className={`mt-4 text-sm rounded-lg px-4 py-3 border ${
              feedback.type === 'success'
                ? 'text-green-400 bg-green-400/10 border-green-400/30'
                : 'text-red-400 bg-red-400/10 border-red-400/30'
            }`}
          >
            {feedback.message}
          </p>
        )}
      </div>
    </div>
  );
}

export default function ElencoLos() {
  const [modality, setModality] = useState(MODALITIES[0]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState(null);

  useEffect(() => {
    api
      .getPlayers()
      .then(setPlayers)
      .catch(() => setPlayers([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = players.filter((p) => p.modality === modality);

  return (
    <section id="elenco-los" className="py-20 md:py-28 px-4">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          tag="Elenco LOS"
          title="Conheça nosso elenco"
          subtitle="Conheça os atletas cadastrados em cada modalidade da organização."
        />

        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {MODALITIES.map((mod) => (
            <button
              key={mod}
              type="button"
              onClick={() => setModality(mod)}
              className={`px-6 py-2.5 rounded-lg font-bold uppercase text-sm tracking-wider transition-all ${
                modality === mod
                  ? 'bg-los-orange text-black shadow-glow-sm'
                  : 'bg-los-card text-gray-400 border border-gray-800 hover:border-los-orange/50 hover:text-white'
              }`}
            >
              {mod}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-center text-gray-500 py-12">Carregando elenco...</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 card-glass max-w-lg mx-auto">
            <p className="text-gray-400 text-lg">
              Ainda não há jogadores cadastrados em{' '}
              <strong className="text-los-orange">{modality}</strong>.
            </p>
            <p className="text-gray-600 text-sm mt-2">
              Novos atletas aparecerão aqui assim que forem adicionados na área Admin.
            </p>
          </div>
        ) : (
          <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {filtered.map((player) => (
                <PlayerCard key={player.id} player={player} onSelect={setSelectedPlayer} />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        <TeamContactForm />

        <PlayerDetailModal player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
      </div>
    </section>
  );
}
