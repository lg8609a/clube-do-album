import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { reviewsApi } from '../services/api';
import { UserReviewDetail } from '../types';
import { ScoreInput } from '../components/ScoreInput';
import { TierBadge } from '../components/TierBadge';
import { Disc3, Edit3, Check, Star, ArrowRight, MessageSquare } from 'lucide-react';

export const MyReviewsPage: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<UserReviewDetail[]>([]);
  const [loading, setLoading] = useState(true);

  // Editing state
  const [editingAlbumId, setEditingAlbumId] = useState<string | null>(null);
  const [editScore, setEditScore] = useState(8.0);
  const [editComment, setEditComment] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchMyReviews = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const data = await reviewsApi.getReviewsByUser(user.id);
      setItems(data);
    } catch (err) {
      console.error('Erro ao buscar minhas avaliações:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyReviews();
  }, [user]);

  const handleStartEdit = (item: UserReviewDetail) => {
    setEditingAlbumId(item.albumId);
    setEditScore(item.nota);
    setEditComment(item.comentario || '');
  };

  const handleSaveEdit = async (albumId: string) => {
    setSaving(true);
    try {
      await reviewsApi.createReview({
        albumId,
        nota: editScore,
        comentario: editComment.trim() || undefined,
      });

      setEditingAlbumId(null);
      await fetchMyReviews();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao atualizar avaliação.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="py-24 text-center space-y-4 max-w-md mx-auto glass-panel rounded-3xl p-8 border border-white/[0.08]">
        <h2 className="text-2xl font-display font-bold text-white">Acesse sua Conta</h2>
        <p className="text-xs text-zinc-400">
          Você precisa estar conectado para visualizar e gerenciar seu diário de avaliações.
        </p>
        <Link
          to="/login"
          className="glass-button-primary inline-block px-7 py-3 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition"
        >
          Fazer Login
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center space-y-4">
        <Disc3 className="w-10 h-10 animate-spin-slow text-rose-500" />
        <p className="text-xs uppercase tracking-widest font-mono text-zinc-500">
          Buscando seu histórico de avaliações...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-white/[0.08] pb-6 space-y-1">
        <div className="flex items-center gap-2 text-rose-400 font-mono text-xs uppercase tracking-widest font-bold">
          <MessageSquare className="w-4 h-4" />
          <span>Seu Diário Musical Pessoal</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-display font-black text-white uppercase tracking-tight">
          Minhas Avaliações & Notas
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
          Você já avaliou {items.length} {items.length === 1 ? 'disco' : 'discos'} no Clube do Álbum. Edite suas notas e resenhas a qualquer momento.
        </p>
      </div>

      {/* Reviews List */}
      {items.length > 0 ? (
        <div className="space-y-4">
          {items.map((rev) => {
            const isEditing = editingAlbumId === rev.albumId;

            return (
              <div
                key={rev.id}
                className="glass-panel rounded-2xl p-5 sm:p-6 transition-all space-y-4 border border-white/[0.06]"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Album Info */}
                  <div className="flex items-center gap-4">
                    <img
                      src={rev.albumCapaUrl || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17'}
                      alt={rev.albumTitulo}
                      className="w-16 h-16 rounded-xl object-cover border border-white/10 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/album/${rev.albumId}`}
                          className="font-display font-bold text-white text-base hover:text-rose-400 transition"
                        >
                          {rev.albumTitulo}
                        </Link>
                        {rev.albumClassificacao && (
                          <TierBadge classificacao={rev.albumClassificacao} size="xs" />
                        )}
                      </div>
                      <p className="text-xs text-zinc-400">
                        {rev.albumArtista} {rev.albumAnoLancamento ? `(${rev.albumAnoLancamento})` : ''}
                      </p>
                      <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                        Avaliado em: {new Date(rev.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>

                  {/* Score & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    <div className="flex items-center gap-1.5 bg-black/60 border border-white/10 px-3.5 py-1.5 rounded-xl">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="font-mono font-black text-lg text-white tabular-nums">
                        {rev.nota.toFixed(1)}
                      </span>
                      <span className="text-xs text-zinc-500 font-mono">/10</span>
                    </div>

                    <button
                      onClick={() => (isEditing ? setEditingAlbumId(null) : handleStartEdit(rev))}
                      className="glass-button-secondary px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold flex items-center gap-1.5 transition cursor-pointer text-zinc-200"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      {isEditing ? 'Fechar' : 'Editar'}
                    </button>
                  </div>
                </div>

                {/* Comment display */}
                {!isEditing && rev.comentario && (
                  <p className="text-xs text-zinc-300 bg-black/40 border border-white/[0.06] p-3.5 rounded-xl italic font-sans leading-relaxed">
                    "{rev.comentario}"
                  </p>
                )}

                {/* Inline Edit Form */}
                {isEditing && (
                  <div className="pt-4 border-t border-white/[0.08] space-y-4 animate-in fade-in">
                    <ScoreInput value={editScore} onChange={setEditScore} />

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono font-semibold uppercase text-zinc-400">
                        Comentário / Resenha
                      </label>
                      <textarea
                        rows={3}
                        value={editComment}
                        onChange={(e) => setEditComment(e.target.value)}
                        className="w-full bg-zinc-950/70 border border-white/[0.08] rounded-xl p-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-rose-500 resize-none font-sans"
                      />
                    </div>

                    <div className="flex justify-end gap-2.5">
                      <button
                        onClick={() => setEditingAlbumId(null)}
                        className="px-3.5 py-2 text-xs font-mono text-zinc-400 hover:text-white"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => handleSaveEdit(rev.albumId)}
                        disabled={saving}
                        className="glass-button-primary px-5 py-2 disabled:opacity-50 text-white text-xs font-mono font-bold uppercase rounded-xl flex items-center gap-1.5 transition shadow"
                      >
                        <Check className="w-3.5 h-3.5" />
                        {saving ? 'Salvando...' : 'Salvar Alterações'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-20 text-center glass-panel rounded-2xl border border-white/[0.06] space-y-3">
          <Disc3 className="w-10 h-10 mx-auto text-zinc-600" />
          <h3 className="font-display font-bold text-sm text-zinc-200">
            Você ainda não avaliou nenhum disco
          </h3>
          <p className="text-xs text-zinc-500 font-mono">
            Acesse o álbum da semana atual ou explore o catálogo para dar suas notas!
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-rose-400 hover:text-rose-300 uppercase pt-2"
          >
            Ir para a Semana Atual <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
};
