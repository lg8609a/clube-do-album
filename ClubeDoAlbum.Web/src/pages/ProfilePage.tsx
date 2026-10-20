import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import { UserAvatar } from '../components/UserAvatar';
import { processImageFile } from '../utils/imageUtils';
import { User, Shield, Check, Lock, Camera, Upload, Trash2 } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [nome, setNome] = useState(user?.nome || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);

  // Senha
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [senhaSuccess, setSenhaSuccess] = useState(false);
  const [senhaError, setSenhaError] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="py-24 text-center text-zinc-500 text-xs font-mono">
        Faça login para acessar suas configurações de perfil.
      </div>
    );
  }

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

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await authApi.updateProfile({ nome, avatarUrl: avatarUrl || undefined });
      await refreshUser();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao atualizar perfil.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSenhaError(null);

    if (novaSenha.length < 6) {
      setSenhaError('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setSenhaError('As senhas digitadas não coincidem.');
      return;
    }

    try {
      await authApi.updatePassword({ novaSenha });
      setSenhaSuccess(true);
      setNovaSenha('');
      setConfirmarSenha('');
      setTimeout(() => setSenhaSuccess(false), 3000);
    } catch (err: any) {
      setSenhaError(err.response?.data?.message || 'Erro ao atualizar senha.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-10 pb-20">
      {/* Header */}
      <div className="border-b border-white/[0.08] pb-6 space-y-1">
        <div className="flex items-center gap-2 text-rose-400 font-mono text-xs uppercase tracking-widest font-bold">
          <User className="w-4 h-4" />
          <span>Configurações da Conta</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-display font-black text-white uppercase tracking-tight">
          Meu Perfil de Membro
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
          Personalize seu nome de exibição, foto de perfil e credenciais de acesso.
        </p>
      </div>

      {/* Profile Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-8 border border-white/[0.08] shadow-2xl">
        {/* User Badge Overview */}
        <div className="flex items-center gap-5 pb-6 border-b border-white/[0.06]">
          <UserAvatar
            name={user.nome}
            avatarUrl={avatarUrl || user.avatarUrl}
            size="lg"
            className="border-2 border-white/10 shadow-lg"
          />

          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-display font-bold text-white">{user.nome}</h2>
              {user.isAdmin && (
                <span className="flex items-center gap-1 text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full uppercase">
                  <Shield className="w-3 h-3" /> Admin
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-500 font-mono mt-0.5">{user.email}</p>
          </div>
        </div>

        {/* Update Profile Form */}
        <form onSubmit={handleUpdateProfile} className="space-y-5">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
            Informações Públicas
          </h3>

          {savedSuccess && (
            <div className="p-3.5 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-mono font-bold flex items-center gap-2">
              <Check className="w-4 h-4" /> Informações atualizadas com sucesso!
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[11px] font-mono font-medium text-zinc-400">
              Nome de Exibição no Clube
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              className="w-full bg-zinc-950/70 border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-rose-500 transition font-medium"
            />
          </div>

          {/* Avatar Upload */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-mono font-medium text-zinc-400 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-rose-400" /> Foto de Perfil (Avatar)
              </label>
              {avatarUrl && (
                <button
                  type="button"
                  onClick={() => setAvatarUrl('')}
                  className="text-[11px] font-mono text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer transition"
                >
                  <Trash2 className="w-3 h-3" /> Remover foto
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-zinc-950/70 border border-white/[0.08]">
              <UserAvatar name={nome || user.nome} avatarUrl={avatarUrl} size="lg" />

              <div className="flex-1 space-y-2 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
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
                    className="px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-zinc-200 hover:text-white font-mono text-xs font-bold uppercase tracking-wider border border-white/[0.12] transition cursor-pointer flex items-center gap-2 shadow-sm"
                  >
                    <Upload className="w-3.5 h-3.5 text-rose-400" />
                    {uploading ? 'Processando imagem...' : 'Escolher Foto do Computador'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="px-3 py-2 text-zinc-400 hover:text-zinc-200 text-xs font-mono transition cursor-pointer underline"
                  >
                    {showUrlInput ? 'Ocultar Link' : 'Ou colar link web'}
                  </button>
                </div>
                <p className="text-[10px] text-zinc-500 font-mono">
                  Selecione PNG, JPG ou WEBP. A imagem será recortada proporcionalmente em formato quadrado.
                </p>
              </div>
            </div>

            {showUrlInput && (
              <div className="pt-1.5 animate-in fade-in duration-200">
                <input
                  type="url"
                  placeholder="https://exemplo.com/sua-imagem.png"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full bg-zinc-950/70 border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-rose-500 transition font-mono"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="glass-button-primary px-6 py-2.5 text-white text-xs font-mono font-bold uppercase tracking-wider rounded-xl transition cursor-pointer shadow"
            >
              {saving ? 'Salvando...' : 'Salvar Perfil'}
            </button>
          </div>
        </form>

        {/* Change Password Form */}
        <form onSubmit={handleUpdatePassword} className="space-y-4 pt-6 border-t border-white/[0.08]">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
            <Lock className="w-3.5 h-3.5 text-rose-400" />
            <span>Alterar Senha de Acesso</span>
          </div>

          {senhaSuccess && (
            <div className="p-3.5 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-mono font-bold flex items-center gap-2">
              <Check className="w-4 h-4" /> Senha atualizada com sucesso!
            </div>
          )}

          {senhaError && (
            <div className="p-3.5 bg-rose-950/60 border border-rose-500/40 rounded-xl text-rose-300 text-xs font-mono">
              {senhaError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono font-medium text-zinc-400">Nova Senha</label>
              <input
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                className="w-full bg-zinc-950/70 border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-rose-500 transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono font-medium text-zinc-400">Confirmar Nova Senha</label>
              <input
                type="password"
                placeholder="Repita a nova senha"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                className="w-full bg-zinc-950/70 border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-rose-500 transition"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={!novaSenha}
              className="glass-button-secondary px-6 py-2.5 text-zinc-200 hover:text-white disabled:opacity-40 text-xs font-mono font-bold uppercase tracking-wider rounded-xl transition cursor-pointer"
            >
              Atualizar Senha
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
