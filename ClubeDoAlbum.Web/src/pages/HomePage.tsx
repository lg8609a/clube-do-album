import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { albumsApi, rankingApi, edicoesApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Album, RankingItem, Edicao, MembroIndicacoesStatus } from '../types';
import { AlbumCard } from '../components/AlbumCard';
import { TierBadge } from '../components/TierBadge';
import { SoundwaveVisualizer } from '../components/SoundwaveVisualizer';
import {
  Disc3,
  Flame,
  Trophy,
  ExternalLink,
  ArrowRight,
  Star,
  Plus,
  Users,
  Calendar,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Radio,
} from 'lucide-react';

interface HomePageProps {
  onOpenAddModal: () => void;
  onOpenCreateEdicaoModal: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onOpenAddModal,
  onOpenCreateEdicaoModal,
}) => {
  const { user } = useAuth();
  const [edicaoAtiva, setEdicaoAtiva] = useState<Edicao | null>(null);
  const [albunsSemana, setAlbunsSemana] = useState<Album[]>([]);
  const [membrosStatus, setMembrosStatus] = useState<MembroIndicacoesStatus[]>([]);
  const [topRanking, setTopRanking] = useState<RankingItem[]>([]);
  const [recentes, setRecentes] = useState<Album[]>([]);
  const [selectedAlbumIndex, setSelectedAlbumIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const ativa = await edicoesApi.getEdicaoAtiva().catch(() => null);
        const [semana, statusList, ranking, todos] = await Promise.all([
          albumsApi.getAlbums({ status: 'EstaSemana', edicaoId: ativa?.id }),
          edicoesApi.getMembrosStatus().catch(() => []),
          rankingApi.getRanking(true),
          albumsApi.getAlbums({ status: 'JaOuvido' }),
        ]);

        setEdicaoAtiva(ativa);
        const albunsDaSemana = semana && semana.length > 0 ? semana : (ativa ? ativa.albuns : []);
        setAlbunsSemana(albunsDaSemana);
        setMembrosStatus(statusList);
        setTopRanking(ranking.slice(0, 3));
        setRecentes(todos.slice(0, 4));
      } catch (err) {
        console.error('Erro ao carregar dados da Home:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center space-y-5">
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center animate-pulse">
            <Disc3 className="w-8 h-8 text-rose-500 animate-spin-slow" />
          </div>
          <div className="absolute -inset-2 bg-rose-500/20 blur-xl rounded-full -z-10" />
        </div>
        <p className="text-xs uppercase tracking-widest font-mono text-zinc-400">
          Sintonizando frequência do Clube do Álbum...
        </p>
      </div>
    );
  }

  const destaque = albunsSemana[selectedAlbumIndex] || albunsSemana[0];

  return (
    <div className="space-y-14 sm:space-y-20 pb-20">
      {/* 1. Header da Rodada Temática (Lettering Hovering in Vapour) */}
      <section className="relative overflow-hidden glass-panel rounded-3xl p-6 sm:p-10 border border-white/[0.08] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)]">
        {/* Subtle ambient lighting effect */}
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-fuchsia-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3">
              {/* Status pill with live pulse */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/60 border border-rose-500/40 text-rose-300 font-mono text-xs uppercase tracking-widest font-bold backdrop-blur-md shadow-[0_0_15px_rgba(225,29,72,0.2)]">
                <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                <span>Rodada Ativa no Clube</span>
              </div>

              {/* Title with hovering motion and specular shimmer */}
              {edicaoAtiva ? (
                <div>
                  <h1 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl text-white uppercase tracking-tight leading-[1.05] drop-shadow-[0_2px_20px_rgba(255,255,255,0.1)]">
                    Edição #{edicaoAtiva.numero}:{' '}
                    <span className="text-shimmer">{edicaoAtiva.tema}</span>
                  </h1>
                  {edicaoAtiva.descricao && (
                    <p className="text-xs sm:text-sm text-zinc-400 mt-2 max-w-2xl font-sans leading-relaxed">
                      {edicaoAtiva.descricao}
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <h1 className="font-display font-black text-3xl sm:text-5xl text-white uppercase tracking-tight leading-none text-shimmer">
                    Semana em Aberto
                  </h1>
                  <p className="text-xs sm:text-sm text-zinc-400 mt-2 max-w-xl">
                    Nenhuma semana temática ativa no momento. Crie um novo tema e convoque os amigos!
                  </p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {edicaoAtiva?.dataReuniao && (
                <div className="px-4 py-2.5 glass-button-secondary rounded-xl text-xs text-zinc-300 font-mono flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-rose-400" />
                  <span>Reunião: {new Date(edicaoAtiva.dataReuniao).toLocaleDateString('pt-BR')}</span>
                </div>
              )}

              <button
                onClick={onOpenCreateEdicaoModal}
                className="glass-button-secondary px-4 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider text-zinc-200 transition flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                {edicaoAtiva ? 'Mudar / Nova Edição' : 'Definir Tema'}
              </button>

              <button
                onClick={onOpenAddModal}
                className="glass-button-primary px-5 py-2.5 rounded-xl text-white font-mono font-bold text-xs uppercase tracking-wider transition flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                Indicar Disco (Até 2)
              </button>
            </div>
          </div>

          {/* Quotas dos Membros da Semana */}
          {membrosStatus.length > 0 && (
            <div className="pt-6 border-t border-white/[0.08] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-zinc-400">
                  <Users className="w-3.5 h-3.5 text-rose-400" />
                  <span>Indicações da Galera ({albunsSemana.length} discos na rodada)</span>
                </div>
                <span className="text-[11px] font-mono text-zinc-500">
                  Cota: 2 discos por membro
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {membrosStatus.map((m) => {
                  const completo = m.totalIndicados >= 2;
                  const parcial = m.totalIndicados === 1;

                  return (
                    <div
                      key={m.userId}
                      className={`flex items-center gap-3 p-2.5 rounded-xl border backdrop-blur-md transition-all duration-200 ${
                        completo
                          ? 'bg-emerald-950/20 border-emerald-500/30 text-zinc-200 shadow-[0_0_12px_rgba(16,185,129,0.1)]'
                          : parcial
                          ? 'bg-amber-950/20 border-amber-500/30 text-zinc-200 shadow-[0_0_12px_rgba(245,158,11,0.1)]'
                          : 'bg-white/[0.02] border-white/[0.06] text-zinc-500'
                      }`}
                    >
                      {m.avatarUrl ? (
                        <img
                          src={m.avatarUrl}
                          alt={m.nome}
                          className="w-8 h-8 rounded-lg object-cover shrink-0 border border-white/10"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-white/10 flex items-center justify-center font-bold text-white text-xs shrink-0">
                          {m.nome[0].toUpperCase()}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-white text-xs truncate leading-snug">
                          {m.nome}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            className={`font-mono font-bold text-[10px] ${
                              completo
                                ? 'text-emerald-400'
                                : parcial
                                ? 'text-amber-400'
                                : 'text-zinc-500'
                            }`}
                          >
                            {m.totalIndicados}/2
                          </span>
                          {completo ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                          ) : (
                            <div className="flex gap-1">
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  parcial ? 'bg-amber-400' : 'bg-zinc-700'
                                }`}
                              />
                              <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 2. Vinyl Showcase Hero (O Álbum em Destaque da Semana) */}
      <section className="relative overflow-hidden glass-panel rounded-3xl p-6 sm:p-12 border border-white/[0.09] shadow-[0_25px_70px_-20px_rgba(0,0,0,0.9)]">
        {albunsSemana.length > 0 && destaque ? (
          <div className="space-y-8">
            {/* Seletor rápido de discos caso haja múltiplos na semana */}
            {albunsSemana.length > 1 && (
              <div className="space-y-2.5 pb-2">
                <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                  <span className="uppercase tracking-wider">
                    Discos da Edição ({albunsSemana.length} selecionados):
                  </span>
                  <SoundwaveVisualizer isPlaying barCount={8} />
                </div>

                <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
                  {albunsSemana.map((a, idx) => (
                    <button
                      key={a.id}
                      onClick={() => setSelectedAlbumIndex(idx)}
                      className={`flex items-center gap-3 p-2 rounded-xl border text-xs transition-all duration-200 shrink-0 cursor-pointer ${
                        selectedAlbumIndex === idx
                          ? 'bg-rose-950/60 border-rose-500/60 text-white shadow-[0_0_16px_rgba(225,29,72,0.25)]'
                          : 'bg-white/[0.03] border-white/[0.06] text-zinc-400 hover:text-white hover:bg-white/[0.06]'
                      }`}
                    >
                      <img
                        src={a.capaUrl || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17'}
                        alt={a.titulo}
                        className="w-9 h-9 rounded-lg object-cover border border-white/10"
                      />
                      <div className="text-left">
                        <p className="font-bold truncate max-w-[130px] text-xs leading-tight">
                          {a.titulo}
                        </p>
                        <p className="text-[10px] text-zinc-400 font-mono truncate max-w-[130px]">
                          Por: {a.indicadoPor?.nome || 'Anônimo'}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Visualização de Destaque com Disco de Vinil 3D */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center pt-2">
              {/* Cover & Realistic Vinyl Record */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative group cursor-pointer">
                  {/* Vinyl Record Slipping Out */}
                  <div className="absolute -right-8 sm:-right-12 top-4 w-56 h-56 sm:w-68 sm:h-68 rounded-full vinyl-grooves border-2 border-zinc-800 shadow-[0_20px_50px_rgba(0,0,0,0.9)] flex items-center justify-center -z-0 group-hover:translate-x-8 transition-transform duration-700 ease-out">
                    {/* Rotating center label */}
                    <div className="w-24 h-24 rounded-full border-2 border-rose-900/60 bg-gradient-to-br from-rose-950 to-zinc-950 flex flex-col items-center justify-center text-center p-2 shadow-inner group-hover:animate-[spin-slow_12s_linear_infinite]">
                      <div className="w-5 h-5 rounded-full bg-black border border-white/20 mb-1" />
                      <span className="text-[7px] font-mono text-rose-300 uppercase tracking-widest font-black">
                        CLUBE DO ÁLBUM
                      </span>
                    </div>
                  </div>

                  {/* Album Cover with Specular Glaze */}
                  <div className="relative z-10 w-60 h-60 sm:w-76 sm:h-76 rounded-2xl overflow-hidden shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] border border-white/15 group-hover:scale-[1.02] transition-transform duration-500 ease-out">
                    <img
                      src={destaque.capaUrl || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17'}
                      alt={destaque.titulo}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-white/10 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Info and Actions */}
              <div className="lg:col-span-7 space-y-6">
                {/* Curator Highlight Pill */}
                {destaque.indicadoPor ? (
                  <div className="inline-flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-rose-950/60 via-zinc-900/80 to-transparent border border-rose-500/30 rounded-2xl shadow-[0_0_20px_rgba(225,29,72,0.15)] backdrop-blur-md">
                    {destaque.indicadoPor.avatarUrl ? (
                      <img
                        src={destaque.indicadoPor.avatarUrl}
                        alt={destaque.indicadoPor.nome}
                        className="w-10 h-10 rounded-xl object-cover border border-rose-500/50 shadow"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-800 to-zinc-950 border border-rose-500/40 flex items-center justify-center font-bold text-white text-sm shadow">
                        {destaque.indicadoPor.nome[0].toUpperCase()}
                      </div>
                    )}
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-rose-400 font-bold block">
                        Curadoria Oficial desta Semana
                      </span>
                      <span className="text-sm font-display font-black text-white">
                        {destaque.indicadoPor.nome}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 glass-panel rounded-xl text-xs text-zinc-400 font-mono">
                    <Users className="w-3.5 h-3.5 text-rose-400" />
                    <span>Indicação Coletiva</span>
                  </div>
                )}

                {/* Album Title & Artist */}
                <div className="space-y-1">
                  <h2 className="font-display font-black text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-tight">
                    {destaque.titulo}
                  </h2>
                  <p className="text-base sm:text-xl text-zinc-300 font-medium">
                    {destaque.artista}{' '}
                    {destaque.anoLancamento > 0 && (
                      <span className="text-zinc-500 font-mono text-base">
                        ({destaque.anoLancamento})
                      </span>
                    )}
                  </p>
                </div>

                {/* Status and Rating Preview */}
                <div className="flex flex-wrap items-center gap-4 pt-1">
                  {(destaque.totalAvaliacoes > 0 || destaque.notaMedia > 0) ? (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 bg-black/60 border border-white/10 px-4 py-2 rounded-2xl backdrop-blur-md shadow-inner">
                        <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                        <span className="text-2xl font-black font-mono text-white tabular-nums">
                          {destaque.notaMedia.toFixed(1)}
                        </span>
                        <span className="text-xs text-zinc-500 font-mono">/10</span>
                      </div>

                      <TierBadge classificacao={destaque.classificacao} size="lg" />

                      <span className="text-xs text-zinc-400 font-mono">
                        {Math.max(1, destaque.totalAvaliacoes)}{' '}
                        {Math.max(1, destaque.totalAvaliacoes) === 1 ? 'membro avaliou' : 'membros avaliaram'}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-zinc-300 bg-white/[0.03] border border-white/[0.08] px-4 py-2 rounded-xl font-mono">
                      <AlertCircle className="w-4 h-4 text-amber-400" />
                      <span>Aguardando as primeiras avaliações da rodada!</span>
                    </div>
                  )}
                </div>

                {/* Action CTAs */}
                <div className="flex flex-wrap items-center gap-3.5 pt-2">
                  <Link
                    to={`/album/${destaque.id}`}
                    className="glass-button-primary px-7 py-3.5 rounded-xl text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg"
                  >
                    Dar Minha Nota & Review
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  {destaque.spotifyUrl && (
                    <a
                      href={destaque.spotifyUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="glass-button-secondary px-5 py-3.5 rounded-xl text-zinc-200 hover:text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-2"
                    >
                      Ouvir no Spotify
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-20 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-white/[0.04] border border-white/10 mx-auto flex items-center justify-center">
              <Disc3 className="w-8 h-8 text-zinc-500" />
            </div>
            <h2 className="text-2xl font-display font-bold text-zinc-200">
              Nenhum disco em votação esta semana
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
              Cada membro do clube tem direito a indicar até 2 discos na rodada ativa. Seja o primeiro a indicar!
            </p>
            <button
              onClick={onOpenAddModal}
              className="glass-button-primary px-7 py-3 rounded-xl text-white font-mono font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer shadow-lg"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              Indicar Primeiro Disco da Semana
            </button>
          </div>
        )}
      </section>

      {/* 3. Grid com TODOS os Discos da Semana Atual */}
      {albunsSemana.length > 1 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-display font-black uppercase tracking-wider text-white">
                Todos os Discos Desta Semana ({albunsSemana.length})
              </h2>
              <p className="text-xs text-zinc-400">
                Ouça todas as recomendações dos membros para o encontro
              </p>
            </div>
            <span className="text-xs font-mono text-zinc-500">
              {albunsSemana.length} de {membrosStatus.length * 2} possíveis
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {albunsSemana.map((alb) => (
              <div
                key={alb.id}
                className="glass-panel glass-panel-hover rounded-2xl p-4 flex flex-col justify-between space-y-3 group"
              >
                <div className="space-y-3">
                  <div className="relative overflow-hidden rounded-xl aspect-square">
                    <img
                      src={alb.capaUrl || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17'}
                      alt={alb.titulo}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Curator badge floating on cover */}
                    {alb.indicadoPor && (
                      <div className="absolute bottom-2.5 left-2.5 right-2.5 p-2 bg-black/85 backdrop-blur-md rounded-xl flex items-center gap-2 border border-white/10 shadow-lg">
                        {alb.indicadoPor.avatarUrl ? (
                          <img
                            src={alb.indicadoPor.avatarUrl}
                            alt={alb.indicadoPor.nome}
                            className="w-5 h-5 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-rose-900 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                            {alb.indicadoPor.nome[0].toUpperCase()}
                          </div>
                        )}
                        <span className="text-[11px] font-bold text-zinc-200 truncate">
                          Por: {alb.indicadoPor.nome}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <Link
                      to={`/album/${alb.id}`}
                      className="font-display font-bold text-white text-base hover:text-rose-400 transition truncate block"
                    >
                      {alb.titulo}
                    </Link>
                    <p className="text-xs text-zinc-400 truncate">{alb.artista}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-white/[0.06] pt-3">
                  {alb.notaMedia > 0 ? (
                    <div className="flex items-center gap-1.5 font-mono">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span className="font-bold text-sm text-white tabular-nums">
                        {alb.notaMedia.toFixed(1)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-zinc-500 font-mono">Pendente</span>
                  )}

                  <Link
                    to={`/album/${alb.id}`}
                    className="glass-button-primary px-3 py-1.5 rounded-lg text-white text-xs font-mono font-bold uppercase transition"
                  >
                    Avaliar
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. Top 3 Hall da Fama (Podium Showcase) */}
      {topRanking.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                <Trophy className="w-4 h-4 text-amber-400" />
              </div>
              <h2 className="text-xl sm:text-2xl font-display font-black uppercase tracking-wider text-white">
                Hall da Fama (Top 3 Melhores Álbuns)
              </h2>
            </div>
            <Link
              to="/ranking"
              className="text-xs font-mono font-bold uppercase tracking-wider text-rose-400 hover:text-rose-300 transition flex items-center gap-1.5"
            >
              Ver Ranking Completo <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topRanking.map((item, idx) => {
              const medalStyles = [
                'border-amber-500/40 shadow-[0_0_24px_rgba(245,158,11,0.15)] text-amber-400', // #1 Gold
                'border-zinc-400/40 shadow-[0_0_24px_rgba(212,212,216,0.12)] text-zinc-300', // #2 Silver
                'border-amber-700/40 shadow-[0_0_24px_rgba(180,83,9,0.12)] text-amber-600',  // #3 Bronze
              ];

              return (
                <div
                  key={item.albumId}
                  className={`glass-panel glass-panel-hover rounded-2xl p-5 flex items-center gap-4 transition group relative overflow-hidden ${
                    medalStyles[idx] || ''
                  }`}
                >
                  <div className="font-display font-black text-3xl font-mono text-zinc-500 group-hover:text-white transition w-8 text-center shrink-0">
                    #{item.posicao}
                  </div>

                  <img
                    src={item.capaUrl || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17'}
                    alt={item.titulo}
                    className="w-18 h-18 rounded-xl object-cover shadow-lg shrink-0 border border-white/10"
                  />

                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/album/${item.albumId}`}
                      className="font-display font-bold text-white text-base hover:text-rose-400 transition truncate block"
                    >
                      {item.titulo}
                    </Link>
                    <p className="text-xs text-zinc-400 truncate">{item.artista}</p>
                    {item.indicadoPorNome && (
                      <p className="text-[11px] text-zinc-500 truncate mt-0.5 font-mono">
                        Por: <strong className="text-zinc-300">{item.indicadoPorNome}</strong>
                      </p>
                    )}

                    <div className="flex items-center gap-2 mt-2">
                      <span className="font-mono font-bold text-xs text-white tabular-nums">
                        {item.notaMedia.toFixed(1)}
                      </span>
                      <TierBadge classificacao={item.classificacao} size="xs" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 5. Últimos Álbuns Ouvidos */}
      {recentes.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
            <h2 className="text-xl sm:text-2xl font-display font-black uppercase tracking-wider text-white">
              Últimos Álbuns Ouvidos pelo Clube
            </h2>
            <Link
              to="/catalogo"
              className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 hover:text-white transition flex items-center gap-1.5"
            >
              Ver Catálogo Completo <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            {recentes.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
