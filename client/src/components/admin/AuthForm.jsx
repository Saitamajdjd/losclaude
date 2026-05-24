import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export default function AuthForm({ mode }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const data =
        mode === 'login'
          ? await api.login({ email: form.email.trim(), password: form.password })
          : await api.register({
              name: form.name.trim(),
              email: form.email.trim(),
              password: form.password,
            });

      setSuccess(data.message || (mode === 'login' ? 'Login realizado!' : 'Cadastro realizado!'));
      login(data.token, data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {mode === 'register' && (
        <input
          className="input-field"
          placeholder="Nome completo"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
      )}
      <input
        type="email"
        className="input-field"
        placeholder="E-mail"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        required
        autoComplete="email"
      />
      <input
        type="password"
        className="input-field"
        placeholder="Senha (mínimo 6 caracteres)"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        required
        minLength={6}
        autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
      />
      {error && (
        <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/30 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
      {success && (
        <p className="text-green-400 text-sm bg-green-400/10 border border-green-400/30 rounded-lg px-3 py-2">
          {success}
        </p>
      )}
      <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
        {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Cadastrar'}
      </button>
    </form>
  );
}
