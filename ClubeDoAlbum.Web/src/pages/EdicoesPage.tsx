import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { edicoesApi } from '../services/api';
import { Edicao } from '../types';
import { TierBadge } from '../components/TierBadge';
import {
  Calendar,
  Sparkles,
  Disc3,
  Trophy,
  Plus,
  CheckCircle2,
  Star,
  Users,
  Radio,
} from 'lucide-react';

interface EdicoesPageProps {
  onOpenCreateModal: () => void;
}

export const EdicoesPage: React.FC<EdicoesPageProps> = ({ onOpenCreateModal }) => {
  const [edicoes, setEdicoes] = useState<Edicao[]>([]);
  const [loading, setLoading] = useState(true);
  const [closingId, setClosingId] = useState<string | null>(null);

  const fetchEdicoes = async () => {
    try {
      const data = await edicoesApi.getEdicoes();
      setEdicoes(data);
    } catch (err) {
      console.error('Erro ao buscar edições:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEdicoes();
  }, []);

  const handleEncerrarEdicao = async (id: string, tema: string) => {
    if (
      !confirm(
        `Tem certeza que deseja encerrar a "${tema}"? Todos os álbuns desta semana serão arquivados como ouvidos e as notas consolidadas.`
      )
    ) {
      return;
    }

    setClosingId(id);
    try {
      await edicoesApi.encerrarEdicao(id);
      await fetchEdicoes();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erro ao encerrar a edição.');
    } finally {
      setClosingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center space-y-4">
        <Disc3 className="w-10 h-10 animate-spin-slow text-rose-500" />
        <p className="text-xs uppercase tracking-widest font-mono text-zinc-500">
          Carregando arquivo de edições...
        </p>
      </div>
    );
  }

  const edicaoAtiva = edicoes.find((e) => e.status === 'EmAndamento');
  const edicoesFinalizadas = edicoes.filter((e) => e.status !== 'EmAndamento');

  return (
    <div className="space-y-12 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-rose-400 font-mono text-xs uppercase tracking-widest font-bold">
            <Sparkles className="w-4 h-4" />
            <span>Arquivo de Reuniões & Temas</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-display font-black text-white uppercase tracking-tight">
            Edições & Semanas Temáticas
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            Acompanhe o histórico de todas as rodadas temáticas, encontros e os discos debatidos em cada semana.
          </p>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="glass-button-primary px-5 py-2.5 rounded-xl text-white font-mono font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer self-start sm:self-auto shadow-lg"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          Nova Semana Temática
        </button>
      </div>

      {/* Edição Ativa em Andamento */}
      {edicaoAtiva && (
        <section className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6 border border-rose-500/30 shadow-[0_0_30px_rgba(225,29,72,0.12)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                  Edição Ativa / Votação Aberta
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-display font-black text-white mt-1">
                Edição #{edicaoAtiva.numero}: {edicaoAtiva.tema}
              </h2>
              {edicaoAtiva.descricao && (
                <p className="text-xs text-zinc-400 mt-1 max-w-2xl">{edicaoAtiva.descricao}</p>
              )}
            </div>

            <div className="flex items-center gap-3">
              {edicaoAtiva.dataReuniao && (
                <div className="px-3 py-1.5 glass-button-secondary rounded-xl text-xs text-zinc-300 flex items-center gap-1.5 font-mono">
                  <Calendar className="w-3.5 h-3.5 text-rose-400" />
                  <span>Reunião: {new Date(edicaoAtiva.dataReuniao).toLocaleDateString('pt-BR')}</span>
                </div>
              )}

              <button
                onClick={() => handleEncerrarEdicao(edicaoAtiva.id, edicaoAtiva.tema)}
                disabled={closingId === edicaoAtiva.id}
                className="px-4 py-2 bg-white/[0.04] hover:bg-rose-950/40 text-zinc-300 hover:text-rose-200 border border-white/[0.08] hover:border-rose-500/40 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition cursor-pointer"
              >
                {closingId === edicaoAtiva.id ? 'Encerrando...' : 'Encerrar Semana'}
              </button>
            </div>
          </div>

          {/* Álbuns da Semana Ativa */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono uppercase text-zinc-400">
              <span>Discos em Votação ({edicaoAtiva.albuns.length} indicados)</span>
              <span>Regra: até 2 por membro</span>
            </div>

            {edicaoAtiva.albuns.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {edicaoAtiva.albuns.map((alb) => (
                  <div
                    key={alb.id}
                    className="glass-panel glass-panel-hover rounded-2xl p-4 flex gap-4 border border-white/[0.06]"
                  >
                    <img
                      src={alb.capaUrl || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17'}
                      alt={alb.titulo}
                      className="w-20 h-20 rounded-xl object-cover border border-white/10 shrink-0"
                    />
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <Link
                          to={`/album/${alb.id}`}
                          className="font-display font-bold text-white text-sm hover:text-rose-400 transition truncate block"
                        >
                          {alb.titulo}
                        </Link>
                        <p className="text-xs text-zinc-400 truncate">{alb.artista}</p>

                        {/* Quem Indicou */}
                        {alb.indicadoPor && (
                          <div className="flex items-center gap-1.5 mt-2">
                            {alb.indicadoPor.avatarUrl ? (
                              <img
                                src={alb.indicadoPor.avatarUrl}
                                alt={alb.indicadoPor.nome}
                                className="w-4 h-4 rounded-full object-cover"
                              />
                            ) : (
                              <Users className="w-3.5 h-3.5 text-rose-400" />
                            )}
                            <span className="text-[11px] text-zinc-400 truncate">
                              Por: <strong className="text-zinc-200">{alb.indicadoPor.nome}</strong>
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        {alb.notaMedia > 0 ? (
                          <div className="flex items-center gap-1.5 font-mono">
                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                            <span className="font-bold text-xs text-white tabular-nums">
                              {alb.notaMedia.toFixed(1)}
                            </span>
                            <TierBadge classificacao={alb.classificacao} size="xs" />
                          </div>
                        ) : (
                          <span className="text-[10px] text-zinc-500 font-mono">Aguardando notas</span>
                        )}

                        <Link
                          to={`/album/${alb.id}`}
                          className="text-[11px] font-mono font-bold text-rose-400 hover:text-rose-300 uppercase"
                        >
                          Avaliar &rarr;
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-500 italic py-4 font-mono">
                Nenhum álbum foi indicado para esta semana ainda. Cada membro pode indicar até 2 discos!
              </p>
            )}
          </div>
        </section>
      )}

      {/* Arquivo de Edições Anteriores */}
      <section className="space-y-6">
        <h2 className="text-xl sm:text-2xl font-display font-black uppercase tracking-wider text-white">
          Semanas Temáticas Anteriores ({edicoesFinalizadas.length})
        </h2>

        {edicoesFinalizadas.length > 0 ? (
          <div className="space-y-6">
            {edicoesFinalizadas.map((ed) => {
              const vencedor = ed.albuns.length > 0 ? ed.albuns[0] : null;

              return (
                <div
                  key={ed.id}
                  className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6 border border-white/[0.08]"
                >
                  {/* Edição Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-rose-400 uppercase">
                          Edição #{ed.numero}
                        </span>
                        <span className="text-zinc-600">•</span>
                        <span className="text-xs text-zinc-400 flex items-center gap-1 font-mono">
                          <CheckCircle2 className="w-3.5 h-3.5 text-zinc-500" /> Encerrada
                        </span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-display font-black text-white mt-1">
                        {ed.tema}
                      </h3>
                      {ed.descricao && <p className="text-xs text-zinc-400 mt-1">{ed.descricao}</p>}
                    </div>

                    <div className="flex items-center gap-3">
                      {ed.dataReuniao && (
                        <span className="text-xs text-zinc-400 font-mono">
                          Reunião: {new Date(ed.dataReuniao).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                      {ed.notaMediaGeral && (
                        <div className="px-3.5 py-1.5 bg-black/60 border border-white/10 rounded-xl text-xs font-mono text-zinc-300">
                          Média Geral:{' '}
                          <strong className="text-white text-sm font-bold tabular-nums">
                            {ed.notaMediaGeral.toFixed(1)}
                          </strong>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Vencedor da Semana Destaque */}
                  {vencedor && vencedor.notaMedia > 0 && (
                    <div className="p-4 bg-gradient-to-r from-amber-950/40 via-zinc-900/60 to-transparent border border-amber-500/30 rounded-2xl flex items-center justify-between gap-4 backdrop-blur-md">
                      <div className="flex items-center gap-3.5">
                        <div className="p-2.5 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30 shadow">
                          <Trophy className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                            Vencedor da Semana
                          </p>
                          <Link
                            to={`/album/${vencedor.id}`}
                            className="font-display font-bold text-white text-base hover:text-amber-300 transition"
                          >
                            {vencedor.titulo} - {vencedor.artista}
                          </Link>
                          {vencedor.indicadoPor && (
                            <p className="text-[11px] text-zinc-400 font-mono">
                              Curadoria: <strong className="text-zinc-200">{vencedor.indicadoPor.nome}</strong>
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <span className="font-mono font-black text-xl text-white tabular-nums">
                          {vencedor.notaMedia.toFixed(1)}
                        </span>
                        <TierBadge classificacao={vencedor.classificacao} size="sm" />
                      </div>
                    </div>
                  )}

                  {/* Grid de Álbuns que participaram */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {ed.albuns.map((alb, idx) => (
                      <div
                        key={alb.id}
                        className="glass-panel glass-panel-hover rounded-2xl p-3 flex flex-col justify-between space-y-3 border border-white/[0.05]"
                      >
                        <div className="flex gap-3">
                          <img
                            src={alb.capaUrl || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17'}
                            alt={alb.titulo}
                            className="w-16 h-16 rounded-xl object-cover border border-white/10 shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] font-mono text-zinc-500">#{idx + 1}</span>
                            <Link
                              to={`/album/${alb.id}`}
                              className="font-display font-bold text-white text-xs hover:text-rose-400 transition truncate block"
                            >
                              {alb.titulo}
                            </Link>
                            <p className="text-[11px] text-zinc-400 truncate">{alb.artista}</p>

                            {alb.indicadoPor && (
                              <p className="text-[10px] text-zinc-400 mt-1 truncate font-mono">
                                Por: <strong className="text-zinc-300">{alb.indicadoPor.nome}</strong>
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-white/[0.06] pt-2 text-xs">
                          {alb.notaMedia > 0 ? (
                            <div className="flex items-center gap-1 font-mono">
                              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                              <strong className="text-white tabular-nums">{alb.notaMedia.toFixed(1)}</strong>
                            </div>
                          ) : (
                            <span className="text-[10px] text-zinc-500 font-mono">Sem nota</span>
                          )}

                          <Link
                            to={`/album/${alb.id}`}
                            className="text-[10px] font-mono font-bold text-zinc-400 hover:text-white uppercase"
                          >
                            Ver Resenhas &rarr;
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-20 text-center glass-panel rounded-2xl space-y-3 border border-white/[0.06]">
            <Disc3 className="w-10 h-10 mx-auto text-zinc-600" />
            <h3 className="font-display font-bold text-sm text-zinc-200">
              Nenhuma semana temática arquivada ainda
            </h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto font-mono">
              Quando você criar uma semana temática e finalizá-la após o debate dos amigos, ela será catalogada aqui.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};
