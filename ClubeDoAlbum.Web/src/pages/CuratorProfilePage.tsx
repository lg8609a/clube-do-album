import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { authApi, albumsApi, rankingApi, reviewsApi } from '../services/api';
import { Album, User, CuratorRankingItem, UserReviewDetail, TierClassificacao } from '../types';
import { UserAvatar } from '../components/UserAvatar';
import { TierBadge } from '../components/TierBadge';
import { CountryFlag } from '../components/CountryFlag';
import {
  ArrowLeft,
  Trophy,
  Star,
  Disc3,
  ThumbsUp,
  ThumbsDown,
  Calendar,
  ExternalLink,
  Search,
  MessageSquare,
  Sparkles,
  Shield,
  Clock,
  Layers,
} from 'lucide-react';

export const CuratorProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();

  const [member, setMember] = useState<User | null>(null);
  const [curatorStats, setCuratorStats] = useState<CuratorRankingItem | null>(null);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [reviews, setReviews] = useState<UserReviewDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros e ordenação
  const [activeTab, setActiveTab] = useState<'indicacoes' | 'avaliacoes'>('indicacoes');
  const [sortBy, setSortBy] = useState<'nota-desc' | 'nota-asc' | 'recentes' | 'nome'>('nota-desc');
  const [searchTerm, setSearchTerm] = useState('');

  const getTier = (nota: number): TierClassificacao => {
    if (nota < 2.0) return 'Absolute Porcaria';
    if (nota < 4.0) return 'Ruim';
    if (nota < 6.0) return 'Meia Boca';
    if (nota < 7.0) return 'Bom';
    if (nota < 8.0) return 'É o Aço';
    return 'Masterpiece';
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!userId) return;
      setLoading(true);
      setError(null);

      try {
        // 1. Tenta buscar o usuário diretamente ou na lista de curadores/usuários
        let targetUser: User | null = null;
        try {
          targetUser = await authApi.getUserById(userId);
        } catch {
          // Fallback gracioso: busca em getAllUsers
          const allUsers = await authApi.getAllUsers();
          targetUser = allUsers.find((u) => u.id === userId) || null;
        }

        // 2. Busca estatísticas do ranking de curadores
        try {
          const curators = await rankingApi.getCurators('desc');
          const foundCurator = curators.find((c) => c.userId === userId);
          if (foundCurator) {
            setCuratorStats(foundCurator);
            if (!targetUser) {
              targetUser = {
                id: foundCurator.userId,
                nome: foundCurator.nome,
                email: '',
                avatarUrl: foundCurator.avatarUrl,
                isAdmin: false,
              };
            }
          }
        } catch (err) {
          console.warn('Erro ao carregar dados do ranking:', err);
        }

        setMember(targetUser);

        // 3. Busca todos os álbuns indicados por este usuário
        try {
          const userAlbums = await albumsApi.getAlbums({ userId });
          setAlbums(userAlbums);
        } catch (err) {
          console.warn('Erro ao carregar álbuns do membro:', err);
        }

        // 4. Busca avaliações dadas pelo usuário
        try {
          const userReviews = await reviewsApi.getReviewsByUser(userId);
          setReviews(userReviews);
        } catch (err) {
          console.warn('Erro ao carregar resenhas do membro:', err);
        }
      } catch (err: any) {
        console.error('Erro geral ao carregar perfil:', err);
        setError('Não foi possível carregar o perfil deste membro.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center space-y-4">
        <Disc3 className="w-10 h-10 animate-spin-slow text-rose-500" />
        <p className="text-xs uppercase tracking-widest font-mono text-zinc-500">
          Carregando histórico do curador...
        </p>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="py-20 text-center max-w-md mx-auto space-y-4 glass-panel rounded-3xl p-8 border border-white/[0.08]">
        <h2 className="text-xl font-display font-bold text-white">Membro Não Encontrado</h2>
        <p className="text-xs text-zinc-400">
          {error || 'Não encontramos registros para o curador solicitado.'}
        </p>
        <Link
          to="/curadores"
          className="glass-button-primary inline-flex items-center gap-2 px-6 py-2.5 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar aos Curadores
        </Link>
      </div>
    );
  }

  // Filtragem e ordenação dos álbuns indicados
  const filteredAlbums = albums
    .filter((a) => {
      const q = searchTerm.toLowerCase();
      return a.titulo.toLowerCase().includes(q) || a.artista.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (sortBy === 'nota-desc') return b.notaMedia - a.notaMedia;
      if (sortBy === 'nota-asc') return a.notaMedia - b.notaMedia;
      if (sortBy === 'recentes') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'nome') return a.titulo.localeCompare(b.titulo);
      return 0;
    });

  // Estatísticas calculadas
  const totalIndicados = albums.length;
  const albunsAvaliados = albums.filter((a) => a.totalAvaliacoes > 0 || a.notaMedia > 0);
  const mediaCalculada =
    albunsAvaliados.length > 0
      ? Math.round((albunsAvaliados.reduce((acc, a) => acc + a.notaMedia, 0) / albunsAvaliados.length) * 10) / 10
      : curatorStats?.mediaDasIndicacoes || 0;

  const melhorAlbum =
    albunsAvaliados.length > 0
      ? [...albunsAvaliados].sort((a, b) => b.notaMedia - a.notaMedia)[0]
      : null;

  const piorAlbum =
    albunsAvaliados.length > 1
      ? [...albunsAvaliados].sort((a, b) => a.notaMedia - b.notaMedia)[0]
      : null;

  return (
    <div className="space-y-10 pb-24 max-w-6xl mx-auto">
      {/* Botão Voltar */}
      <div className="flex items-center justify-between">
        <Link
          to="/curadores"
          className="inline-flex items-center gap-2 text-xs font-mono font-bold text-zinc-400 hover:text-white uppercase tracking-wider transition group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Voltar para Curadores</span>
        </Link>

        {member.isAdmin && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/60 border border-rose-500/40 text-rose-300 font-mono text-[11px] font-bold">
            <Shield className="w-3.5 h-3.5 text-rose-400" />
            <span>Admin do Clube</span>
          </span>
        )}
      </div>

      {/* Header do Perfil do Membro */}
      <div className="glass-panel rounded-3xl p-6 sm:p-10 border border-white/[0.08] shadow-2xl relative overflow-hidden">
        {/* Glow de fundo */}
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-rose-600/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-start justify-between gap-8 sm:gap-10">
          {/* Avatar com tamanho de Capa de Álbum & Informações do Membro */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 min-w-0 flex-1">
            <div className="relative group shrink-0">
              <UserAvatar
                name={member.nome}
                avatarUrl={member.avatarUrl}
                size="2xl"
                className="border-2 border-white/20 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] shrink-0 group-hover:scale-[1.02] transition-transform duration-300"
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-black/40 via-transparent to-white/10 pointer-events-none" />
            </div>

            <div className="space-y-3 min-w-0 text-center sm:text-left flex-1">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <span className="text-[11px] font-mono uppercase tracking-widest text-rose-400 font-bold px-2.5 py-0.5 rounded-full bg-rose-950/40 border border-rose-500/30">
                  Curador Oficial
                </span>
                {curatorStats?.posicao && (
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold flex items-center gap-1">
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    {curatorStats.posicao}º Lugar no Ranking
                  </span>
                )}
                {member.isAdmin && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-950/60 border border-rose-500/40 text-rose-300 font-mono text-[11px] font-bold">
                    <Shield className="w-3.5 h-3.5 text-rose-400" />
                    <span>Admin</span>
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-black text-white uppercase tracking-tight truncate leading-tight">
                {member.nome}
              </h1>

              <p className="text-xs sm:text-sm text-zinc-400 font-mono max-w-xl">
                Histórico musical completo e histórico de indicações no Clube do Álbum
              </p>
            </div>
          </div>

          {/* Média Geral de Curadoria */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] shrink-0 shadow-lg w-full lg:w-auto">
            <div className="text-left sm:text-right">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 block font-bold">
                Média das Indicações
              </span>
              <div className="flex items-center gap-2 mt-1">
                <Star className="w-6 h-6 sm:w-7 sm:h-7 text-amber-400 fill-amber-400" />
                <span className="font-mono font-black text-3xl sm:text-5xl text-white tabular-nums">
                  {mediaCalculada.toFixed(1)}
                </span>
                <span className="text-xs text-zinc-500 font-mono">/10</span>
              </div>
            </div>

            <TierBadge classificacao={getTier(mediaCalculada)} size="lg" />
          </div>
        </div>

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-8 pt-6 border-t border-white/[0.06]">
          <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.04]">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">
              Discos Indicados
            </span>
            <p className="text-xl sm:text-2xl font-mono font-black text-white mt-0.5">
              {totalIndicados}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.04]">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">
              Discos Avaliados
            </span>
            <p className="text-xl sm:text-2xl font-mono font-black text-white mt-0.5">
              {albunsAvaliados.length}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.04]">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block flex items-center gap-1">
              <ThumbsUp className="w-3 h-3 text-emerald-400" /> Melhor Indicação
            </span>
            {melhorAlbum ? (
              <Link
                to={`/album/${melhorAlbum.id}`}
                className="text-xs sm:text-sm font-bold text-zinc-200 hover:text-emerald-300 transition truncate block mt-1"
                title={`${melhorAlbum.titulo} (${melhorAlbum.notaMedia.toFixed(1)})`}
              >
                {melhorAlbum.titulo}{' '}
                <span className="text-emerald-400 font-mono text-[11px]">
                  ({melhorAlbum.notaMedia.toFixed(1)})
                </span>
              </Link>
            ) : (
              <span className="text-xs text-zinc-500 font-mono block mt-1">-</span>
            )}
          </div>

          <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.04]">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block flex items-center gap-1">
              <ThumbsDown className="w-3 h-3 text-rose-400" /> Pior Indicação
            </span>
            {piorAlbum ? (
              <Link
                to={`/album/${piorAlbum.id}`}
                className="text-xs sm:text-sm font-bold text-zinc-400 hover:text-rose-300 transition truncate block mt-1"
                title={`${piorAlbum.titulo} (${piorAlbum.notaMedia.toFixed(1)})`}
              >
                {piorAlbum.titulo}{' '}
                <span className="text-rose-400 font-mono text-[11px]">
                  ({piorAlbum.notaMedia.toFixed(1)})
                </span>
              </Link>
            ) : (
              <span className="text-xs text-zinc-500 font-mono block mt-1">-</span>
            )}
          </div>
        </div>
      </div>

      {/* Navegação por Abas: Discos Indicados vs Resenhas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('indicacoes')}
            className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'indicacoes'
                ? 'bg-rose-950/70 text-rose-300 border border-rose-600/50 shadow-[0_0_15px_rgba(225,29,72,0.2)]'
                : 'text-zinc-400 hover:text-white bg-white/[0.03]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Discos Indicados ({albums.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('avaliacoes')}
            className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'avaliacoes'
                ? 'bg-rose-950/70 text-rose-300 border border-rose-600/50 shadow-[0_0_15px_rgba(225,29,72,0.2)]'
                : 'text-zinc-400 hover:text-white bg-white/[0.03]'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Avaliações Feitas ({reviews.length})</span>
          </button>
        </div>

        {/* Barra de Busca e Ordenação (Quando na aba de indicações) */}
        {activeTab === 'indicacoes' && (
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[200px] flex-1 sm:flex-initial">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filtrar por título ou banda..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500/50"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-white/[0.03] border border-white/[0.08] rounded-xl px-3 py-1.5 text-xs font-mono text-zinc-300 focus:outline-none focus:border-rose-500/50 cursor-pointer"
            >
              <option value="nota-desc" className="bg-zinc-900 text-white">
                Maior Nota (Melhores)
              </option>
              <option value="nota-asc" className="bg-zinc-900 text-white">
                Menor Nota (Piores)
              </option>
              <option value="recentes" className="bg-zinc-900 text-white">
                Mais Recentes
              </option>
              <option value="nome" className="bg-zinc-900 text-white">
                Título (A-Z)
              </option>
            </select>
          </div>
        )}
      </div>

      {/* Conteúdo da Aba 1: Histórico de Álbuns Indicados */}
      {activeTab === 'indicacoes' && (
        <section className="space-y-4">
          {filteredAlbums.length > 0 ? (
            <div className="space-y-3.5">
              {filteredAlbums.map((album, index) => {
                const rankNumber = sortBy === 'nota-desc' ? index + 1 : null;

                return (
                  <div
                    key={album.id}
                    className="glass-panel glass-panel-hover rounded-2xl p-4 sm:p-5 border border-white/[0.06] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                  >
                    {/* Lado Esquerdo: Posição, Capa, Título e Banda */}
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      {rankNumber !== null && (
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-black text-xs shrink-0 ${
                            rankNumber === 1
                              ? 'bg-gradient-to-br from-amber-300 to-amber-500 text-black shadow-md shadow-amber-400/20'
                              : rankNumber === 2
                              ? 'bg-zinc-300 text-black'
                              : rankNumber === 3
                              ? 'bg-amber-800 text-amber-200'
                              : 'bg-white/[0.04] text-zinc-500 border border-white/[0.08]'
                          }`}
                        >
                          #{rankNumber}
                        </div>
                      )}

                      <Link to={`/album/${album.id}`} className="shrink-0 group/cover">
                        <img
                          src={album.capaUrl || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17'}
                          alt={album.titulo}
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-white/10 group-hover/cover:scale-105 transition-transform"
                        />
                      </Link>

                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {album.edicaoTema && (
                            <span className="text-[10px] font-mono uppercase bg-white/[0.04] border border-white/[0.08] text-zinc-300 px-2.5 py-0.5 rounded-md">
                              {album.edicaoTema}
                            </span>
                          )}
                          <span
                            className={`text-[9px] font-mono uppercase font-bold px-2 py-0.5 rounded-md ${
                              album.status === 'EstaSemana'
                                ? 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
                                : 'bg-white/[0.02] text-zinc-500'
                            }`}
                          >
                            {album.status === 'EstaSemana' ? 'Semana Atual' : 'Já Ouvido'}
                          </span>
                        </div>

                        <Link
                          to={`/album/${album.id}`}
                          className="font-display font-bold text-base sm:text-lg text-white group-hover:text-rose-400 transition-colors truncate block"
                        >
                          {album.titulo}
                        </Link>

                        <p className="text-xs text-zinc-400 font-medium flex items-center gap-2 flex-wrap">
                          <span>{album.artista}</span>
                          {album.paisOrigem && <CountryFlag countryCode={album.paisOrigem} size="sm" />}
                          {album.anoLancamento > 0 && (
                            <span className="text-zinc-500 font-mono">({album.anoLancamento})</span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Lado Direito: Nota e Ações */}
                    <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-t-0 border-white/[0.06] pt-3 sm:pt-0">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 bg-black/60 border border-white/10 px-3.5 py-2 rounded-xl">
                          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                          <span className="font-mono font-black text-lg text-white tabular-nums">
                            {album.notaMedia > 0 ? album.notaMedia.toFixed(1) : '—'}
                          </span>
                        </div>

                        {album.notaMedia > 0 && (
                          <TierBadge classificacao={album.classificacao} size="sm" />
                        )}

                        <span className="text-[11px] font-mono text-zinc-500 hidden md:inline">
                          {album.totalAvaliacoes} {album.totalAvaliacoes === 1 ? 'voto' : 'votos'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {album.spotifyUrl && (
                          <a
                            href={album.spotifyUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/10 border border-white/[0.08] text-zinc-400 hover:text-white transition"
                            title="Ouvir no Spotify"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}

                        <Link
                          to={`/album/${album.id}`}
                          className="px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-rose-950/60 hover:text-rose-300 hover:border-rose-500/40 border border-white/[0.08] text-xs font-mono font-bold text-zinc-300 transition"
                        >
                          Ver Detalhes &rarr;
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-20 text-center glass-panel rounded-2xl space-y-3 border border-white/[0.06]">
              <Disc3 className="w-10 h-10 mx-auto text-zinc-600" />
              <h3 className="font-display font-bold text-sm text-zinc-200">
                Nenhum álbum encontrado
              </h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto font-mono">
                {searchTerm
                  ? 'Nenhum disco corresponde ao termo de busca digitado.'
                  : 'Este membro ainda não fez indicações de discos no clube.'}
              </p>
            </div>
          )}
        </section>
      )}

      {/* Conteúdo da Aba 2: Avaliações dadas por este membro */}
      {activeTab === 'avaliacoes' && (
        <section className="space-y-4">
          {reviews.length > 0 ? (
            <div className="space-y-3.5">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="glass-panel rounded-2xl p-4 sm:p-5 border border-white/[0.06] space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <Link to={`/album/${rev.albumId}`} className="shrink-0">
                        <img
                          src={rev.albumCapaUrl || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17'}
                          alt={rev.albumTitulo}
                          className="w-12 h-12 rounded-xl object-cover border border-white/10"
                        />
                      </Link>

                      <div className="min-w-0">
                        <Link
                          to={`/album/${rev.albumId}`}
                          className="font-display font-bold text-base text-white hover:text-rose-400 transition truncate block"
                        >
                          {rev.albumTitulo}
                        </Link>
                        <p className="text-xs text-zinc-400 font-mono truncate">
                          {rev.albumArtista}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-start sm:self-auto">
                      <div className="flex items-center gap-1.5 bg-black/60 border border-white/10 px-3.5 py-1.5 rounded-xl">
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        <span className="font-mono font-black text-base text-white tabular-nums">
                          {rev.nota.toFixed(1)}
                        </span>
                      </div>
                      <TierBadge classificacao={rev.albumClassificacao} size="xs" />
                    </div>
                  </div>

                  {rev.comentario && (
                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] text-xs text-zinc-300 font-sans leading-relaxed italic">
                      "{rev.comentario}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center glass-panel rounded-2xl space-y-3 border border-white/[0.06]">
              <MessageSquare className="w-10 h-10 mx-auto text-zinc-600" />
              <h3 className="font-display font-bold text-sm text-zinc-200">
                Nenhuma avaliação registrada
              </h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto font-mono">
                Este membro ainda não deu notas ou escreveu resenhas para os discos do clube.
              </p>
            </div>
          )}
        </section>
      )}
    </div>
  );
};
