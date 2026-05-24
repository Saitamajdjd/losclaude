import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../../services/api';
import { resolveImageUrl } from '../../utils/imageUrl';

const MODALITIES = ['League of Legends', 'Free Fire'];
const EMPTY_FORM = {
  real_name: '',
  nick: '',
  role: '',
  modality: MODALITIES[0],
  description: '',
};

export default function PlayerForm({ editingPlayer, onCancelEdit, onSuccess, onError }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const isEditing = Boolean(editingPlayer);

  useEffect(() => {
    if (editingPlayer) {
      setForm({
        real_name: editingPlayer.real_name || '',
        nick: editingPlayer.nick || '',
        role: editingPlayer.role || '',
        modality: editingPlayer.modality || MODALITIES[0],
        description: editingPlayer.description || '',
      });
      setImage(null);
      setPreview(editingPlayer.image_url ? resolveImageUrl(editingPlayer.image_url) : null);
    } else {
      setForm(EMPTY_FORM);
      setImage(null);
      setPreview(null);
    }
  }, [editingPlayer]);

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith('blob:')) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const setImageFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setImage(file);
    setPreview((prev) => {
      if (prev && prev.startsWith('blob:')) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  };

  const handlePaste = (e) => {
    const item = [...e.clipboardData.items].find((i) => i.type.startsWith('image/'));
    if (item) {
      e.preventDefault();
      const file = item.getAsFile();
      if (file) setImageFile(file);
    }
  };

  const clearImage = () => {
    setImage(null);
    if (isEditing && editingPlayer.image_url) {
      setPreview(resolveImageUrl(editingPlayer.image_url));
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (image) fd.append('image', image, image.name || 'foto.jpg');

      if (isEditing) {
        const updated = await api.updatePlayer(editingPlayer.id, fd);
        onSuccess(updated);
      } else {
        await api.createPlayer(fd);
        setForm(EMPTY_FORM);
        setImage(null);
        setPreview(null);
        onSuccess();
      }
    } catch (err) {
      onError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div className="card-glass p-6" onPaste={handlePaste}>
      <div className="flex items-center justify-between gap-4 mb-6">
        <h2 className="font-display text-xl text-los-orange uppercase">
          {isEditing ? 'Editar Jogador' : 'Cadastrar Jogador'}
        </h2>
        {isEditing && (
          <button type="button" onClick={onCancelEdit} className="text-sm text-gray-500 hover:text-white">
            Cancelar edição
          </button>
        )}
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="input-field"
          placeholder="Nome real"
          value={form.real_name}
          onChange={(e) => setForm({ ...form, real_name: e.target.value })}
          required
        />
        <input
          className="input-field"
          placeholder="Nick"
          value={form.nick}
          onChange={(e) => setForm({ ...form, nick: e.target.value })}
          required
        />
        <input
          className="input-field"
          placeholder="Função (ex: Top, Suporte, Rusher)"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          required
        />
        <select
          className="input-field"
          value={form.modality}
          onChange={(e) => setForm({ ...form, modality: e.target.value })}
        >
          {MODALITIES.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <textarea
          className="input-field min-h-[80px]"
          placeholder="Descrição (opcional)"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <motion.div className="border border-dashed border-los-orange/40 rounded-xl p-4 bg-los-dark/50">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">
            Foto do jogador — clique, arraste ou cole (Ctrl+V)
            {isEditing && ' · deixe em branco para manter a foto atual'}
          </p>
          {preview ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative mb-3"
            >
              <img
                src={preview}
                alt="Prévia"
                className="w-full max-h-48 object-cover rounded-lg border border-los-orange/30"
              />
              {image && (
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute top-2 right-2 px-2 py-1 text-xs bg-black/70 text-red-400 rounded"
                >
                  Remover nova foto
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-32 flex items-center justify-center rounded-lg bg-los-black/50 border border-gray-800 mb-3"
            >
              <span className="text-gray-600 text-sm">Nenhuma imagem selecionada</span>
            </motion.div>
          )}
          <input
            type="file"
            accept="image/*"
            className="input-field file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-los-orange file:text-black file:font-bold"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          />
        </motion.div>

        <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
          {loading ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Cadastrar'}
        </button>
      </form>
    </motion.div>
  );
}
