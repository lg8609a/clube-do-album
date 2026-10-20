import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { rankingApi } from '../services/api';
import { CuratorRankingItem } from '../types';
import { TierBadge } from '../components/TierBadge';
import { Trophy, Users, Disc3, ThumbsUp, ThumbsDown, Star, Skull } from 'lucide-react';

export const CuratorsPage: React.FC = () => {
  const [curators, setCurators] = useState<CuratorRankingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordem, setOrdem] = useState<'desc' | 'asc'>('desc');

  useEffect(() => {
    const fetchCurators = async () => {
      setLoading(true);
      try {
        const data = await rankingApi.getCurators(ordem);
        setCurators(data);
      } catch (err) {
        console.error('Erro ao buscar curadores:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCurators();
  }, [ordem]);

  return (
    <div className="space-y-8 pb-20 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-white/[0.08] pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-rose-400 font-mono text-xs uppercase tracking-widest font-bold">
            <Users className="w-4 h-4" />
            <span>Ranking de Curadoria dos Membros</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-display font-black text-white uppercase tracking-tight">
            Quem tem o melhor gosto musical?
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-xl leading-relaxed">
            Média ponderada de todas as notas obtidas pelas indicações de cada amigo do clube.
          </p>
        </div>

        {/* Toggle Mode */}
        <div className="flex bg-white/[0.03] border border-white/[0.08] p-1 rounded-2xl backdrop-blur-md self-start sm:self-auto">
          <button
            onClick={() => setOrdem('desc')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
              ordem === 'desc'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            Hall da Fama (Melhores)
          </button>
          <button
            onClick={() => setOrdem('asc')}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
              ordem === 'asc'
                ? 'bg-rose-950/70 text-rose-300 border border-rose-600/50 shadow-[0_0_15px_rgba(225,29,72,0.25)]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Skull className="w-3.5 h-3.5 text-rose-400" />
            Troféu Podrinho (Piores)
          </button>
        </div>
      </div>

      {loading ? (
        <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
          <Disc3 className="w-10 h-10 animate-spin-slow text-rose-500" />
          <p className="text-xs uppercase tracking-widest font-mono text-zinc-500">
            Calculando médias dos curadores...
          </p>
        </div>
      ) : curators.length > 0 ? (
        <div className="space-y-4">
          {curators.map((c, index) => {
            const isWinner = index === 0;
            return (
              <div
                key={c.userId}
                className={`glass-panel glass-panel-hover rounded-2xl p-5 sm:p-6 transition-all duration-300 ${
                  isWinner && ordem === 'desc'
                    ? 'border-amber-500/40 shadow-[0_0_25px_rgba(245,158,11,0.15)]'
                    : isWinner && ordem === 'asc'
                    ? 'border-rose-600/50 shadow-[0_0_25px_rgba(225,29,72,0.2)]'
                    : 'border-white/[0.06]'
                }`}
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  {/* Position & Member Info */}
                  <div className="md:col-span-5 flex items-center gap-4">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center font-display font-black text-base shrink-0 ${
                        index === 0 && ordem === 'desc'
                          ? 'bg-gradient-to-br from-amber-300 to-amber-500 text-black shadow-lg shadow-amber-400/25'
                          : index === 0 && ordem === 'asc'
                          ? 'bg-gradient-to-br from-rose-700 to-rose-950 text-white shadow-lg shadow-rose-900/40'
                          : 'bg-white/[0.04] text-zinc-400 border border-white/[0.08]'
                      }`}
                    >
                      {c.posicao}º
                    </div>

                    {c.avatarUrl ? (
                      <img
                        src={c.avatarUrl}
                        alt={c.nome}
                        className="w-12 h-12 rounded-xl object-cover border border-white/10"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 text-zinc-200 font-display font-bold flex items-center justify-center border border-white/10">
                        {c.nome[0].toUpperCase()}
                      </div>
                    )}

                    <div className="min-w-0">
                      <h3 className="font-display font-bold text-base text-white truncate leading-snug">
                        {c.nome}
                      </h3>
                      <p className="text-xs text-zinc-400 font-mono">
                        {c.totalAlbunsAvaliados} {c.totalAlbunsAvaliados === 1 ? 'disco avaliado' : 'discos avaliados'}
                      </p>
                    </div>
                  </div>

                  {/* Curator Average Score */}
                  <div className="md:col-span-3 flex items-center md:justify-center gap-3">
                    <div className="flex items-center gap-1.5 bg-black/60 border border-white/10 px-4 py-2 rounded-xl">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="font-mono font-black text-xl text-white tabular-nums">
                        {c.mediaDasIndicacoes.toFixed(1)}
                      </span>
                    </div>

                    <TierBadge classificacao={c.classificacaoCurador} size="sm" />
                  </div>

                  {/* Best & Worst Pick Highlights */}
                  <div className="md:col-span-4 flex flex-col gap-2 border-t md:border-t-0 md:border-l border-white/[0.06] pt-3 md:pt-0 md:pl-6 text-xs">
                    {c.melhorAlbumIndicado && (
                      <Link
                        to={`/album/${c.melhorAlbumIndicado.albumId}`}
                        className="flex items-center gap-2 group truncate hover:text-white text-zinc-400 transition"
                      >
                        <ThumbsUp className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="text-xs font-bold text-zinc-200 truncate group-hover:text-emerald-300">
                          {c.melhorAlbumIndicado.titulo}
                        </span>
                        <span className="font-mono font-bold text-emerald-400 text-xs shrink-0 tabular-nums">
                          ({c.melhorAlbumIndicado.notaMedia.toFixed(1)})
                        </span>
                      </Link>
                    )}

                    {c.piorAlbumIndicado && c.piorAlbumIndicado.albumId !== c.melhorAlbumIndicado?.albumId && (
                      <Link
                        to={`/album/${c.piorAlbumIndicado.albumId}`}
                        className="flex items-center gap-2 group truncate hover:text-white text-zinc-400 transition"
                      >
                        <ThumbsDown className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <span className="text-xs text-zinc-400 truncate group-hover:text-rose-300">
                          {c.piorAlbumIndicado.titulo}
                        </span>
                        <span className="font-mono font-bold text-rose-400 text-xs shrink-0 tabular-nums">
                          ({c.piorAlbumIndicado.notaMedia.toFixed(1)})
                        </span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-20 text-center text-zinc-500 text-xs font-mono glass-panel rounded-2xl">
          Nenhum curador com discos avaliados até o momento.
        </div>
      )}
    </div>
  );
};
