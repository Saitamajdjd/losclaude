import { motion } from 'framer-motion';
import { resolveImageUrl } from '../../utils/imageUrl';

export default function PlayerList({ players, onEdit, onDelete }) {
  return (
    <div className="card-glass p-6">
      <h2 className="font-display text-xl text-white uppercase mb-6">
        Jogadores <span className="text-los-orange">({players.length})</span>
      </h2>
      {players.length === 0 ? (
        <p className="text-gray-500 text-center py-8">Nenhum jogador cadastrado.</p>
      ) : (
        <ul className="space-y-4 max-h-[600px] overflow-y-auto">
          {players.map((p) => (
            <motion.li
              key={p.id}
              layout
              className="flex gap-4 p-4 bg-los-dark rounded-lg border border-gray-800"
            >
              {p.image_url ? (
                <img
                  src={resolveImageUrl(p.image_url)}
                  alt={p.nick}
                  className="w-14 h-14 rounded-lg object-cover border border-los-orange/30"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-14 h-14 rounded-lg bg-los-orange/20 flex items-center justify-center font-display text-los-orange font-bold">
                  {p.nick[0]}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white truncate">{p.nick}</p>
                <p className="text-sm text-gray-500">
                  {p.real_name} · {p.role}
                </p>
                <span className="text-xs text-los-orange uppercase">{p.modality}</span>
              </div>
              <div className="flex flex-col gap-2 self-start">
                <button
                  type="button"
                  onClick={() => onEdit(p)}
                  className="text-los-orange hover:text-los-orange-light text-sm font-semibold"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(p.id)}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  Remover
                </button>
              </div>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}
