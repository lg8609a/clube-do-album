import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { albumsApi, reviewsApi } from '../services/api';
import { AlbumDetail } from '../types';
import { useAuth } from '../context/AuthContext';
import { TierBadge } from '../components/TierBadge';
import { ScoreInput } from '../components/ScoreInput';
import {
  Disc3,
  Star,
  ExternalLink,
  ArrowLeft,
  MessageSquare,
  Check,
  LogIn,
  Radio,
  Calendar,
  Trash2,
} from 'lucide-react';

export const AlbumDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [album, setAlbum] = useState<AlbumDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Review Form
  const [userScore, setUserScore] = useState(8.0);
  const [userComment, setUserComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const loadAlbum = async () => {
    if (!id) return;
    try {
      const data = await albumsApi.getAlbumById(id);
      setAlbum(data);

      // Pre-fill user review if already exists
      if (user) {
        const myReview = data.avaliacoes.find((av) => av.usuario.id === user.id);
        if (myReview) {
          setUserScore(myReview.nota);
          setUserComment(myReview.comentario || '');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Álbum não encontrado.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlbum();
  }, [id, user]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!album) return;

    setSubmittingReview(true);
    setReviewSuccess(false);

    try {
      await reviewsApi.createReview({
        albumId: album.id,
        nota: userScore,
        comentario: userComment.trim() || undefined,
      });

      setReviewSuccess(true);
      await loadAlbum();
      setTimeout(() => setReviewSuccess(false), 4000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao registrar avaliação.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!album) return;
    const novoStatus = album.status === 'EstaSemana' ? 'JaOuvido' : 'EstaSemana';
    try {
      await albumsApi.updateStatus(album.id, novoStatus);
      await loadAlbum();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao alterar status.');
    }
  };

  const handleDeleteAlbum = async () => {
    if (!album) return;
    const confirmDelete = window.confirm(
      `Tem certeza que deseja excluir o álbum "${album.titulo}" de ${album.artista}?\n\nEsta ação apagará o álbum e todas as avaliações dele do sistema permanentemente.`
    );
    if (!confirmDelete) return;

    try {
      setDeleting(true);
      await albumsApi.deleteAlbum(album.id);
      navigate('/');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao excluir o álbum.');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center space-y-4">
        <Disc3 className="w-12 h-12 animate-spin-slow text-rose-500" />
        <p className="text-xs uppercase tracking-widest font-mono text-zinc-500">
          Carregando dados do disco...
        </p>
      </div>
    );
  }

  if (error || !album) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-rose-400 font-bold">{error || 'Álbum não encontrado.'}</p>
        <Link
          to="/"
          className="text-xs uppercase font-mono font-bold text-zinc-400 hover:text-white underline"
        >
          Voltar para o início
        </Link>
      </div>
    );
  }

  const existingReview = user ? album.avaliacoes.find((av) => av.usuario.id === user.id) : null;

  return (
    <div className="space-y-12 pb-20 max-w-5xl mx-auto">
      {/* Back Button */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-400 hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar ao Início
      </Link>

      {/* Main Album Header Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden border border-white/[0.08]">
        {/* Ambient blurred glow from album cover */}
        {album.capaUrl && (
          <div
            className="absolute -top-24 -right-24 w-96 h-96 bg-cover bg-center opacity-15 blur-3xl pointer-events-none"
            style={{ backgroundImage: `url(${album.capaUrl})` }}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start relative z-10">
          {/* Cover Art */}
          <div className="md:col-span-5 flex justify-center">
            <div className="relative group">
              <img
                src={album.capaUrl}
                alt={album.titulo}
                className="w-64 h-64 sm:w-80 sm:h-80 rounded-2xl object-cover shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/10 group-hover:scale-[1.02] transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-white/10 rounded-2xl pointer-events-none" />
            </div>
          </div>

          {/* Details */}
          <div className="md:col-span-7 space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`text-[10px] font-mono uppercase font-bold px-3 py-1 rounded-full tracking-wider border backdrop-blur-md ${
                  album.status === 'EstaSemana'
                    ? 'bg-rose-950/80 text-rose-300 border-rose-500/40 shadow-[0_0_12px_rgba(225,29,72,0.2)]'
                    : 'bg-white/[0.04] text-zinc-300 border-white/[0.08]'
                }`}
              >
                {album.status === 'EstaSemana' ? 'Semana Atual' : 'Já Ouvido'}
              </span>

              {album.edicaoTema && (
                <span className="text-[10px] font-mono uppercase bg-white/[0.04] border border-white/[0.08] text-zinc-300 px-3 py-1 rounded-full">
                  {album.edicaoTema}
                </span>
              )}
            </div>

            <div>
              <h1 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-tight">
                {album.titulo}
              </h1>
              <p className="text-lg sm:text-xl text-zinc-300 font-medium mt-1">
                {album.artista}{' '}
                {album.anoLancamento > 0 && (
                  <span className="text-zinc-500 font-mono text-base">
                    ({album.anoLancamento})
                  </span>
                )}
              </p>
            </div>

            {/* Score & Tier Display */}
            <div className="flex flex-wrap items-center gap-4 py-1">
              <div className="flex items-center gap-2 bg-black/60 border border-white/10 px-4 py-2 rounded-2xl backdrop-blur-md">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                <span className="text-3xl font-black font-mono text-white tabular-nums">
                  {album.notaMedia.toFixed(1)}
                </span>
                <span className="text-xs text-zinc-500 font-mono">/10</span>
              </div>

              <TierBadge classificacao={album.classificacao} size="lg" />

              <span className="text-xs text-zinc-400 font-mono">
                {album.totalAvaliacoes} {album.totalAvaliacoes === 1 ? 'avaliação' : 'avaliações'}
              </span>
            </div>

            {/* Curator Highlight */}
            {album.indicadoPor ? (
              <div className="flex items-center gap-3 p-3 bg-white/[0.03] border border-white/[0.08] rounded-2xl max-w-sm backdrop-blur-md shadow-sm">
                {album.indicadoPor.avatarUrl ? (
                  <img
                    src={album.indicadoPor.avatarUrl}
                    alt={album.indicadoPor.nome}
                    className="w-10 h-10 rounded-xl object-cover border border-white/10"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-900 to-zinc-950 border border-white/10 flex items-center justify-center font-bold text-white text-sm">
                    {album.indicadoPor.nome[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400 font-bold block">
                    Curadoria Oficial
                  </span>
                  <span className="text-sm font-display font-black text-white">
                    Indicado por {album.indicadoPor.nome}
                  </span>
                </div>
              </div>
            ) : null}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {album.spotifyUrl && (
                <a
                  href={album.spotifyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="glass-button-secondary px-5 py-2.5 rounded-xl text-zinc-200 hover:text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-2"
                >
                  Ouvir no Spotify
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}

              {user?.isAdmin && (
                <>
                  <button
                    onClick={handleToggleStatus}
                    className="px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 font-mono font-bold text-xs uppercase tracking-wider transition cursor-pointer border border-white/[0.08]"
                  >
                    Mudar p/ {album.status === 'EstaSemana' ? 'Já Ouvido' : 'Esta Semana'}
                  </button>
                  <button
                    onClick={handleDeleteAlbum}
                    disabled={deleting}
                    className="px-4 py-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 hover:text-rose-200 font-mono font-bold text-xs uppercase tracking-wider transition cursor-pointer border border-rose-500/30 flex items-center gap-1.5 disabled:opacity-50"
                    title="Excluir álbum do sistema"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {deleting ? 'Excluindo...' : 'Excluir Álbum'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Review Submission Section */}
      <section className="glass-panel rounded-3xl p-6 sm:p-10 shadow-xl space-y-6 border border-white/[0.08]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
          <div>
            <h2 className="text-lg font-display font-bold uppercase tracking-wider text-white">
              {existingReview ? 'Sua Avaliação (Já Registrada)' : 'Avaliar este Álbum'}
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              {existingReview
                ? 'Você pode atualizar sua nota e resenha sempre que quiser.'
                : 'Dê sua nota de 0 a 10 e deixe suas impressões sinceras sobre o disco.'}
            </p>
          </div>
          {existingReview && (
            <span className="text-xs font-mono font-bold text-amber-300 bg-amber-950/40 border border-amber-500/30 px-3 py-1.5 rounded-xl self-start sm:self-auto">
              Sua nota: {existingReview.nota.toFixed(1)}
            </span>
          )}
        </div>

        {user ? (
          <form onSubmit={handleReviewSubmit} className="space-y-6">
            {reviewSuccess && (
              <div className="p-3.5 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-mono font-bold flex items-center gap-2">
                <Check className="w-4 h-4" /> Sua avaliação foi salva com sucesso!
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              <div className="md:col-span-5">
                <ScoreInput value={userScore} onChange={setUserScore} />
              </div>

              <div className="md:col-span-7 space-y-2">
                <label className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300 block">
                  Sua Resenha / Comentário (Opcional)
                </label>
                <textarea
                  rows={5}
                  placeholder="O que achou dos riffs, da produção, das faixas de destaque? Solte o verbo..."
                  value={userComment}
                  onChange={(e) => setUserComment(e.target.value)}
                  className="w-full bg-zinc-950/70 border border-white/[0.08] rounded-2xl p-4 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition resize-none font-sans"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submittingReview}
                className="glass-button-primary px-7 py-3 rounded-xl text-white font-mono font-bold text-xs uppercase tracking-wider cursor-pointer shadow-lg disabled:opacity-50"
              >
                {submittingReview
                  ? 'Salvando...'
                  : existingReview
                  ? 'Atualizar Avaliação'
                  : 'Registrar Avaliação'}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-8 bg-white/[0.02] border border-white/[0.06] rounded-2xl text-center space-y-4">
            <p className="text-xs text-zinc-400">Você precisa estar conectado para avaliar este álbum.</p>
            <Link
              to="/login"
              className="glass-button-primary inline-flex items-center gap-2 px-6 py-2.5 text-white text-xs font-mono font-bold uppercase tracking-wider rounded-xl transition"
            >
              <LogIn className="w-4 h-4" /> Fazer Login no Clube
            </Link>
          </div>
        )}
      </section>

      {/* Friends Reviews List */}
      <section className="space-y-6">
        <div className="flex items-center gap-2.5">
          <MessageSquare className="w-5 h-5 text-rose-400" />
          <h2 className="text-xl font-display font-black uppercase tracking-wider text-white">
            Avaliações dos Amigos ({album.avaliacoes.length})
          </h2>
        </div>

        {album.avaliacoes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {album.avaliacoes.map((rev) => (
              <div
                key={rev.id}
                className="glass-panel rounded-2xl p-5 space-y-3 flex flex-col justify-between border border-white/[0.06]"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {rev.usuario.avatarUrl ? (
                        <img
                          src={rev.usuario.avatarUrl}
                          alt={rev.usuario.nome}
                          className="w-8 h-8 rounded-full object-cover border border-white/10"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-200 text-xs font-bold flex items-center justify-center border border-white/10">
                          {rev.usuario.nome[0].toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-xs text-white leading-tight">{rev.usuario.nome}</p>
                        <p className="text-[10px] text-zinc-500 font-mono">
                          {new Date(rev.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 bg-black/60 border border-white/10 px-3 py-1 rounded-xl">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span className="font-mono font-bold text-sm text-white tabular-nums">
                        {rev.nota.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  {rev.comentario ? (
                    <p className="text-xs text-zinc-300 leading-relaxed font-sans pt-1">
                      "{rev.comentario}"
                    </p>
                  ) : (
                    <p className="text-[11px] text-zinc-600 italic font-mono">Sem resenha escrita.</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center glass-panel rounded-2xl text-zinc-500 text-xs font-mono">
            Nenhum membro avaliou este álbum ainda. Seja o primeiro a votar!
          </div>
        )}
      </section>
    </div>
  );
};
