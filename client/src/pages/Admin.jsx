import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import AuthForm from '../components/admin/AuthForm';
import PlayerForm from '../components/admin/PlayerForm';
import MatchForm from '../components/admin/MatchForm';
import PlayerList from '../components/admin/PlayerList';
import MatchList from '../components/admin/MatchList';

function AdminDashboard() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState('players');
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [editingPlayer, setEditingPlayer] = useState(null);

  const loadData = async () => {
    try {
      const [p, m] = await Promise.all([api.getPlayers(), api.getMatches()]);
      setPlayers(p);
      setMatches(m);
    } catch (err) {
      setMessageType('error');
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showMsg = (text, type = 'success') => {
    setMessageType(type);
    setMessage(text);
    setTimeout(() => setMessage(''), 4000);
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl text-white uppercase">
              Painel <span className="text-los-orange">Admin</span>
            </h1>
            <p className="text-gray-500">Olá, {user?.name}</p>
          </div>
          <button type="button" onClick={logout} className="btn-outline py-2 px-4 text-xs self-start">
            Sair
          </button>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-lg border ${
              messageType === 'error'
                ? 'bg-red-400/10 border-red-400/40 text-red-400'
                : 'bg-los-orange/20 border-los-orange text-los-orange-light'
            }`}
          >
            {message}
          </div>
        )}

        <div className="flex gap-2 mb-8 flex-wrap">
          {[
            { id: 'players', label: 'Jogadores' },
            { id: 'matches', label: 'Partidas' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`px-6 py-2 rounded-lg font-bold uppercase text-sm tracking-wider transition-all ${
                tab === t.id
                  ? 'bg-los-orange text-black shadow-glow-sm'
                  : 'bg-los-card text-gray-400 hover:text-white border border-gray-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-gray-500 text-center py-20">Carregando...</p>
        ) : tab === 'players' ? (
          <div className="grid lg:grid-cols-2 gap-8">
            <PlayerForm
              editingPlayer={editingPlayer}
              onCancelEdit={() => setEditingPlayer(null)}
              onSuccess={(updated) => {
                if (updated) {
                  setPlayers((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
                  setEditingPlayer(null);
                  showMsg('Jogador atualizado com sucesso!');
                } else {
                  showMsg('Jogador cadastrado!');
                  loadData();
                }
              }}
              onError={(e) => showMsg(e.message, 'error')}
            />
            <PlayerList
              players={players}
              onEdit={(player) => {
                setEditingPlayer(player);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onDelete={async (id) => {
                try {
                  await api.deletePlayer(id);
                  setPlayers((prev) => prev.filter((p) => p.id !== id));
                  if (editingPlayer?.id === id) setEditingPlayer(null);
                  showMsg('Jogador removido');
                } catch (e) {
                  showMsg(e.message, 'error');
                }
              }}
            />
          </div>
        ) : (
          <div className="space-y-8">
            <MatchForm
              players={players}
              onSuccess={() => {
                showMsg('Partida registrada com análise IA!');
                loadData();
              }}
              onError={(e) => showMsg(e.message, 'error')}
            />
            <MatchList
              matches={matches}
              onMatchUpdate={(updated) => {
                setMatches((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function ProtectedAdmin() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="pt-32 text-center text-gray-500">Carregando...</div>;
  if (!isAuthenticated) return <AuthScreen />;
  return <AdminDashboard />;
}

function AuthScreen() {
  const [mode, setMode] = useState('login');

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl text-white uppercase mb-2">
            Acesso <span className="text-los-orange">Admin</span>
          </h1>
          <p className="text-gray-500 text-sm">Autenticação JWT</p>
        </div>
        <div className="card-glass p-8">
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-2 rounded font-bold text-sm uppercase ${
                mode === 'login' ? 'bg-los-orange text-black' : 'text-gray-500'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 py-2 rounded font-bold text-sm uppercase ${
                mode === 'register' ? 'bg-los-orange text-black' : 'text-gray-500'
              }`}
            >
              Cadastro
            </button>
          </div>
          <AuthForm mode={mode} />
        </div>
      </motion.div>
    </div>
  );
}

export default function Admin() {
  return (
    <Routes>
      <Route path="/" element={<ProtectedAdmin />} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}
