import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { rankingApi } from '../services/api';
import { RankingItem, TierClassificacao } from '../types';
import { TierBadge } from '../components/TierBadge';
import { Trophy, Star, Disc3, MessageSquare } from 'lucide-react';

export const RankingPage: React.FC = () => {
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTier, setSelectedTier] = useState<string>('all');

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const data = await rankingApi.getRanking(true);
        setRanking(data);
      } catch (err) {
        console.error('Erro ao buscar ranking:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRanking();
  }, []);

  const tiers: TierClassificacao[] = [
    'Masterpiece',
    'É o Aço',
    'Bom',
    'Meia Boca',
    'Ruim',
    'Absolute Porcaria',
  ];

  const filteredRanking = ranking.filter(
    (item) => selectedTier === 'all' || item.classificacao === selectedTier
  );

  if (loading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center space-y-4">
        <Disc3 className="w-12 h-12 animate-spin-slow text-amber-500" />
        <p className="text-xs uppercase tracking-widest font-mono text-zinc-500">
          Calculando médias do ranking geral...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b border-white/[0.08] pb-6 space-y-2">
        <div className="flex items-center gap-2 text-amber-400 font-mono text-xs uppercase tracking-widest font-bold">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>Tabela Geral Consolidada</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-display font-black text-white uppercase tracking-tight">
          O Grande Ranking de Notas
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
          Classificação de todos os álbuns avaliados pelos membros do clube, ordenados rigorosamente da maior média para a menor.
        </p>
      </div>

      {/* Tier Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <button
          onClick={() => setSelectedTier('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition cursor-pointer ${
            selectedTier === 'all'
              ? 'bg-white text-black shadow-lg shadow-white/10'
              : 'glass-button-secondary text-zinc-400 hover:text-white'
          }`}
        >
          Todos ({ranking.length})
        </button>

        {tiers.map((tier) => {
          const count = ranking.filter((r) => r.classificacao === tier).length;
          return (
            <button
              key={tier}
              onClick={() => setSelectedTier(tier)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
                selectedTier === tier
                  ? 'bg-white/[0.12] text-white border border-white/25 shadow-md'
                  : 'glass-button-secondary text-zinc-400 hover:text-white'
              }`}
            >
              <span>{tier}</span>
              <span className="text-[10px] opacity-60 font-mono">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Ranking List Table */}
      <div className="space-y-3">
        {filteredRanking.map((item, index) => {
          const isTop3 = index < 3 && selectedTier === 'all';
          return (
            <Link
              key={item.albumId}
              to={`/album/${item.albumId}`}
              className={`group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl glass-panel glass-panel-hover transition-all duration-300 ${
                isTop3
                  ? index === 0
                    ? 'border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.12)]'
                    : index === 1
                    ? 'border-zinc-400/30 shadow-[0_0_20px_rgba(212,212,216,0.1)]'
                    : 'border-amber-700/30 shadow-[0_0_20px_rgba(180,83,9,0.1)]'
                  : 'border-white/[0.06]'
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Position badge */}
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-display font-black text-sm shrink-0 ${
                    index === 0 && selectedTier === 'all'
                      ? 'bg-gradient-to-br from-amber-300 to-amber-500 text-black shadow-lg shadow-amber-500/30'
                      : index === 1 && selectedTier === 'all'
                      ? 'bg-gradient-to-br from-zinc-200 to-zinc-400 text-black shadow-lg shadow-zinc-300/20'
                      : index === 2 && selectedTier === 'all'
                      ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-white shadow-lg shadow-amber-800/20'
                      : 'bg-white/[0.04] text-zinc-400 border border-white/[0.08]'
                  }`}
                >
                  {item.posicao}º
                </div>

                {/* Album Cover Thumbnail */}
                <img
                  src={item.capaUrl}
                  alt={item.titulo}
                  className="w-14 h-14 rounded-xl object-cover shrink-0 border border-white/10 group-hover:scale-105 transition-transform duration-300"
                />

                {/* Title & Artist */}
                <div className="min-w-0">
                  <h3 className="font-display font-bold text-white text-base group-hover:text-rose-400 transition-colors truncate">
                    {item.titulo}
                  </h3>
                  <p className="text-zinc-400 text-xs truncate">
                    {item.artista} {item.anoLancamento > 0 && `• ${item.anoLancamento}`}
                  </p>
                  {item.indicadoPorNome && (
                    <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                      Curadoria: <strong className="text-zinc-300">{item.indicadoPorNome}</strong>
                    </p>
                  )}
                </div>
              </div>

              {/* Score and Tier */}
              <div className="flex items-center justify-between sm:justify-end gap-5 border-t sm:border-t-0 pt-2.5 sm:pt-0 border-white/[0.06]">
                <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-mono">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{item.totalAvaliacoes} {item.totalAvaliacoes === 1 ? 'voto' : 'votos'}</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 bg-black/60 border border-white/10 px-3.5 py-1.5 rounded-xl">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="font-mono font-black text-lg text-white tabular-nums">
                      {item.notaMedia.toFixed(1)}
                    </span>
                  </div>

                  <TierBadge classificacao={item.classificacao} size="sm" />
                </div>
              </div>
            </Link>
          );
        })}

        {filteredRanking.length === 0 && (
          <div className="py-20 text-center text-zinc-500 text-xs font-mono glass-panel rounded-2xl">
            Nenhum álbum encontrado nesta classificação de notas.
          </div>
        )}
      </div>
    </div>
  );
};
