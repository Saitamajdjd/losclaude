import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { resolveImageUrl } from '../utils/imageUrl';

export default function PlayerDetailModal({ player, onClose }) {
  useEffect(() => {
    if (!player) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [player, onClose]);

  return (
    <AnimatePresence>
      {player && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="player-modal-title"
        >
          <motion.button
            type="button"
            className="absolute inset-0 bg-black/85 backdrop-blur-sm"
            aria-label="Fechar"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            className="relative w-full max-w-4xl max-h-[95vh] overflow-y-auto rounded-2xl border border-los-orange/40 bg-gradient-to-b from-los-card to-los-black shadow-glow"
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 bg-los-orange/25 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-los-orange/10 rounded-full blur-[80px] pointer-events-none" />

            <div className="relative grid md:grid-cols-2 gap-0">
              <div className="aspect-square md:aspect-auto md:min-h-[420px] bg-los-dark relative overflow-hidden">
                {player.image_url ? (
                  <img
                    src={resolveImageUrl(player.image_url)}
                    alt={player.nick}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full min-h-[280px] flex items-center justify-center bg-gradient-to-br from-los-orange/30 to-los-black">
                    <span className="font-display text-8xl text-los-orange font-black">
                      {player.nick[0]}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-los-black via-transparent to-transparent md:bg-gradient-to-r" />
              </div>

              <div className="p-6 md:p-10 flex flex-col">
                <p className="text-gray-500 text-sm uppercase tracking-wider mb-1">{player.real_name}</p>
                <h2
                  id="player-modal-title"
                  className="font-display text-4xl md:text-5xl text-los-orange font-black uppercase leading-tight mb-4"
                >
                  {player.nick}
                </h2>

                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="text-xs font-bold uppercase tracking-wider text-black bg-los-orange px-3 py-1.5 rounded">
                    {player.role}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-los-orange border border-los-orange/50 px-3 py-1.5 rounded">
                    {player.modality}
                  </span>
                </div>

                {player.description ? (
                  <p className="text-gray-300 text-base leading-relaxed flex-1 whitespace-pre-wrap">
                    {player.description}
                  </p>
                ) : (
                  <p className="text-gray-600 text-sm italic flex-1">
                    Este atleta ainda não possui descrição cadastrada.
                  </p>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className="mt-8 btn-outline w-full md:w-auto self-start"
                >
                  Voltar ao elenco
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
