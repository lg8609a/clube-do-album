import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Disc, LogIn } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(email.trim(), senha);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'E-mail ou senha incorretos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full glass-panel border border-white/[0.08] rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-950 via-zinc-900 to-black border border-white/10 flex items-center justify-center mx-auto shadow-lg">
            <Disc className="w-6 h-6 text-rose-500 animate-spin-slow" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-white uppercase tracking-tight">
            Entrar no Clube
          </h1>
          <p className="text-xs text-zinc-400 font-sans">
            Acesse para votar no disco da semana e acompanhar as notas.
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-950/60 border border-rose-500/40 rounded-xl text-rose-300 text-xs font-mono">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono font-semibold uppercase text-zinc-300">
              E-mail
            </label>
            <input
              type="email"
              placeholder="seu.email@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-zinc-950/70 border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-rose-500 transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-mono font-semibold uppercase text-zinc-300">
              Senha
            </label>
            <input
              type="password"
              placeholder="Sua senha secreta"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              className="w-full bg-zinc-950/70 border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-rose-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 glass-button-primary disabled:opacity-50 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <LogIn className="w-4 h-4" />
            {loading ? 'Entrando...' : 'Entrar na Conta'}
          </button>
        </form>

        <div className="text-center pt-3 border-t border-white/[0.06]">
          <p className="text-xs text-zinc-400">
            Ainda não tem conta no clube?{' '}
            <Link to="/registro" className="text-rose-400 hover:text-rose-300 font-bold underline">
              Cadastre-se aqui
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
