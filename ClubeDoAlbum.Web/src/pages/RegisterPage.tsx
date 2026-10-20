import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserAvatar } from '../components/UserAvatar';
import { processImageFile } from '../utils/imageUtils';
import { Disc, UserPlus, Camera, Upload, Trash2 } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const base64 = await processImageFile(file, 256);
      setAvatarUrl(base64);
    } catch (err: any) {
      alert(err.message || 'Erro ao processar imagem.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (senha.length < 6) {
      setError('A senha deve conter no mínimo 6 caracteres.');
      setLoading(false);
      return;
    }

    try {
      await register({
        nome: nome.trim(),
        email: email.trim(),
        senha,
        avatarUrl: avatarUrl.trim() || undefined,
      });
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao criar conta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full glass-panel border border-white/[0.08] rounded-3xl p-8 sm:p-10 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-950 via-zinc-900 to-black border border-white/10 flex items-center justify-center mx-auto shadow-lg">
            <Disc className="w-6 h-6 text-rose-500 animate-spin-slow" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-white uppercase tracking-tight">
            Criar Conta no Clube
          </h1>
          <p className="text-xs text-zinc-400 font-sans">
            Junte-se aos encontros para pontuar os álbuns da semana.
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
              Seu Nome / Apelido
            </label>
            <input
              type="text"
              placeholder="Como quer ser chamado pelos amigos"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              className="w-full bg-zinc-950/70 border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-rose-500 transition"
            />
          </div>

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
              placeholder="Mínimo 6 caracteres"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              className="w-full bg-zinc-950/70 border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-rose-500 transition"
            />
          </div>

          {/* Avatar Upload */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-mono font-semibold uppercase text-zinc-300 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-rose-400" /> Foto de Perfil (Opcional)
              </label>
              {avatarUrl && (
                <button
                  type="button"
                  onClick={() => setAvatarUrl('')}
                  className="text-[10px] font-mono text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" /> Remover
                </button>
              )}
            </div>

            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-zinc-950/70 border border-white/[0.08]">
              <UserAvatar name={nome || 'Novo Membro'} avatarUrl={avatarUrl} size="md" />

              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/jpg"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2 px-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-zinc-200 hover:text-white font-mono text-xs font-bold uppercase tracking-wider border border-white/[0.08] transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Upload className="w-3.5 h-3.5 text-rose-400" />
                  {uploading ? 'Carregando...' : 'Carregar Foto do Computador'}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 glass-button-primary disabled:opacity-50 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-lg flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <UserPlus className="w-4 h-4" />
            {loading ? 'Cadastrando...' : 'Finalizar Cadastro'}
          </button>
        </form>

        <div className="text-center pt-3 border-t border-white/[0.06]">
          <p className="text-xs text-zinc-400">
            Já possui cadastro?{' '}
            <Link to="/login" className="text-rose-400 hover:text-rose-300 font-bold underline">
              Faça login aqui
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
