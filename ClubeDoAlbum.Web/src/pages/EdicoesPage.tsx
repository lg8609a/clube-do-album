import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { edicoesApi } from '../services/api';
import { Edicao, Album } from '../types';
import { TierBadge } from '../components/TierBadge';
import { UserAvatar } from '../components/UserAvatar';
import { EditDataReuniaoModal } from '../components/EditDataReuniaoModal';
import { useAuth } from '../context/AuthContext';
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
  Pencil,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface EdicoesPageProps {
  onOpenCreateModal: () => void;
}

interface AlbumRowItemProps {
  album: Album;
  position: number;
  isActiveEdition?: boolean;
}

const AlbumRowItem: React.FC<AlbumRowItemProps> = ({ album, position, isActiveEdition = false }) => {
  return (
    <div className="glass-panel glass-panel-hover rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3 sm:gap-4 border border-white/[0.06] transition-all group">
      {/* Esquerda: Posição + Capa + Título + Artista + Curador */}
      <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
        {/* Posição no ranking */}
        <div
          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center font-mono font-black text-xs shrink-0 border ${
            position === 1
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.25)]'
              : position === 2
              ? 'bg-slate-300/20 text-slate-200 border-slate-300/40'
              : position === 3
              ? 'bg-amber-700/20 text-amber-500 border-amber-700/40'
              : 'bg-white/[0.03] text-zinc-500 border-white/[0.06]'
          }`}
          title={`Posição #${position} no ranking da semana`}
        >
          #{position}
        </div>

        {/* Capa do Álbum */}
        <Link to={`/album/${album.id}`} className="shrink-0 group/cover">
          <img
            src={album.capaUrl || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17'}
            alt={album.titulo}
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover border border-white/10 group-hover/cover:scale-105 transition-transform"
          />
        </Link>

        {/* Metadados: Título, Artista, Ano e Curador */}
        <div className="min-w-0 flex-1">
          <Link
            to={`/album/${album.id}`}
            className="font-display font-bold text-white text-sm sm:text-base hover:text-rose-400 transition truncate block leading-snug"
            title={`${album.titulo} - ${album.artista}`}
          >
            {album.titulo}
          </Link>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-zinc-400 mt-0.5">
            <span className="truncate text-zinc-300 font-medium">{album.artista}</span>
            {album.anoLancamento ? (
              <span className="text-zinc-600 font-mono text-[11px] hidden sm:inline">
                ({album.anoLancamento})
              </span>
            ) : null}

            {album.indicadoPor && (
              <>
                <span className="text-zinc-600 hidden sm:inline">•</span>
                <Link
                  to={`/curador/${album.indicadoPor.id}`}
                  className="inline-flex items-center gap-1.5 text-[11px] text-zinc-400 hover:text-rose-300 transition group/curator"
                  title={`Ver histórico de indicações de ${album.indicadoPor.nome}`}
                >
                  <UserAvatar
                    name={album.indicadoPor.nome}
                    avatarUrl={album.indicadoPor.avatarUrl}
                    size="xs"
                    className="!w-3.5 !h-3.5 !rounded-full"
                  />
                  <span className="truncate">
                    Por: <strong className="text-zinc-300 group-hover/curator:text-rose-200">{album.indicadoPor.nome}</strong>
                  </span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Direita: Nota Média + TierBadge + Botão de Ação */}
      <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
        {album.notaMedia > 0 ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 font-mono bg-black/60 border border-white/10 px-2.5 py-1.5 rounded-xl">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span className="font-bold text-xs sm:text-sm text-white tabular-nums">
                {album.notaMedia.toFixed(1)}
              </span>
            </div>
            <div className="hidden sm:block">
              <TierBadge classificacao={album.classificacao} size="xs" />
            </div>
          </div>
        ) : (
          <span className="text-[10px] sm:text-xs text-zinc-500 font-mono px-2 py-1 bg-white/[0.02] border border-white/[0.04] rounded-lg">
            Aguardando notas
          </span>
        )}

        <Link
          to={`/album/${album.id}`}
          className="glass-button-secondary px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-xl text-[11px] font-mono font-bold text-rose-300 hover:text-white uppercase tracking-wider flex items-center gap-1 transition"
        >
          <span>{isActiveEdition ? 'Avaliar' : 'Ver'}</span>
          <span className="text-rose-400 group-hover:translate-x-0.5 transition-transform">&rarr;</span>
        </Link>
      </div>
    </div>
  );
};

export const EdicoesPage: React.FC<EdicoesPageProps> = ({ onOpenCreateModal }) => {
  const [edicoes, setEdicoes] = useState<Edicao[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [closingId, setClosingId] = useState<string | null>(null);
  const [editingEdicao, setEditingEdicao] = useState<Edicao | null>(null);
  const [isAtivaExpanded, setIsAtivaExpanded] = useState(false);
  const [expandedEdicaoIds, setExpandedEdicaoIds] = useState<Record<string, boolean>>({});

  const toggleEdicaoExpanded = (id: string) => {
    setExpandedEdicaoIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const formatarData = (dataStr?: string | null) => {
    if (!dataStr) return '';
    const clean = dataStr.split('T')[0];
    const parts = clean.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return new Date(dataStr).toLocaleDateString('pt-BR');
  };

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
              {edicaoAtiva.dataReuniao ? (
                user?.isAdmin ? (
                  <button
                    onClick={() => setEditingEdicao(edicaoAtiva)}
                    className="px-3 py-1.5 glass-button-secondary rounded-xl text-xs text-zinc-300 hover:text-white flex items-center gap-1.5 font-mono border border-white/[0.08] hover:border-rose-500/40 transition cursor-pointer group"
                    title="Clique para alterar a data da reunião"
                  >
                    <Calendar className="w-3.5 h-3.5 text-rose-400 group-hover:scale-110 transition-transform" />
                    <span>Reunião: {formatarData(edicaoAtiva.dataReuniao)}</span>
                    <Pencil className="w-3 h-3 text-zinc-500 group-hover:text-rose-400 transition-colors ml-0.5" />
                  </button>
                ) : (
                  <div className="px-3 py-1.5 glass-button-secondary rounded-xl text-xs text-zinc-300 flex items-center gap-1.5 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-rose-400" />
                    <span>Reunião: {formatarData(edicaoAtiva.dataReuniao)}</span>
                  </div>
                )
              ) : (
                user?.isAdmin && (
                  <button
                    onClick={() => setEditingEdicao(edicaoAtiva)}
                    className="px-3 py-1.5 glass-button-secondary rounded-xl text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1.5 font-mono border border-dashed border-white/20 hover:border-rose-500/40 transition cursor-pointer"
                    title="Definir data para a reunião desta semana"
                  >
                    <Calendar className="w-3.5 h-3.5 text-rose-400" />
                    <span>+ Agendar</span>
                  </button>
                )
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

          {/* Álbuns da Semana Ativa (Linhas Únicas Expansíveis) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono uppercase text-zinc-400">
              <span className="flex items-center gap-2">
                <span>Discos em Votação ({edicaoAtiva.albuns.length} indicados)</span>
                {edicaoAtiva.albuns.length > 3 && (
                  <span className="text-[10px] text-zinc-500 font-normal lowercase">
                    ({isAtivaExpanded ? 'exibindo todos' : 'exibindo top 3'})
                  </span>
                )}
              </span>
              <span>Regra: até 2 por membro</span>
            </div>

            {edicaoAtiva.albuns.length > 0 ? (
              <div className="space-y-2.5">
                {[...edicaoAtiva.albuns]
                  .sort((a, b) => b.notaMedia - a.notaMedia)
                  .slice(0, isAtivaExpanded ? undefined : 3)
                  .map((alb, idx) => (
                    <AlbumRowItem
                      key={alb.id}
                      album={alb}
                      position={idx + 1}
                      isActiveEdition={true}
                    />
                  ))}

                {edicaoAtiva.albuns.length > 3 && (
                  <button
                    onClick={() => setIsAtivaExpanded(!isAtivaExpanded)}
                    className="w-full py-3 px-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] hover:border-rose-500/30 text-zinc-300 hover:text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer group shadow-sm mt-1"
                  >
                    {isAtivaExpanded ? (
                      <>
                        <ChevronUp className="w-4 h-4 text-rose-400 group-hover:-translate-y-0.5 transition-transform" />
                        <span>Recolher para o Top 3</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4 text-rose-400 group-hover:translate-y-0.5 transition-transform" />
                        <span>
                          Ver todos os {edicaoAtiva.albuns.length} álbuns da edição (+{edicaoAtiva.albuns.length - 3} álbuns)
                        </span>
                      </>
                    )}
                  </button>
                )}
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
              const sortedAlbuns = [...ed.albuns].sort((a, b) => b.notaMedia - a.notaMedia);
              const isExpanded = !!expandedEdicaoIds[ed.id];
              const displayedAlbuns = isExpanded ? sortedAlbuns : sortedAlbuns.slice(0, 3);
              const vencedor = sortedAlbuns.length > 0 ? sortedAlbuns[0] : null;

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
                            <Link
                              to={`/curador/${vencedor.indicadoPor.id}`}
                              className="text-[11px] text-zinc-400 font-mono hover:text-rose-300 transition block"
                              title={`Ver histórico de indicações de ${vencedor.indicadoPor.nome}`}
                            >
                              Curadoria: <strong className="text-zinc-200 hover:text-rose-200">{vencedor.indicadoPor.nome}</strong>
                            </Link>
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

                  {/* Lista de Álbuns da Edição (Linhas Únicas Expansíveis) */}
                  {sortedAlbuns.length > 0 && (
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-[11px] font-mono uppercase text-zinc-400 pb-1">
                        <span className="flex items-center gap-2">
                          <span>Classificação Final ({sortedAlbuns.length} álbuns)</span>
                          {sortedAlbuns.length > 3 && (
                            <span className="text-zinc-500 lowercase">
                              ({isExpanded ? 'exibindo todos' : 'exibindo top 3'})
                            </span>
                          )}
                        </span>
                        <span className="text-[10px] text-zinc-500">Ordenado por nota média</span>
                      </div>

                      {displayedAlbuns.map((alb, idx) => (
                        <AlbumRowItem
                          key={alb.id}
                          album={alb}
                          position={idx + 1}
                          isActiveEdition={false}
                        />
                      ))}

                      {sortedAlbuns.length > 3 && (
                        <button
                          onClick={() => toggleEdicaoExpanded(ed.id)}
                          className="w-full py-2.5 px-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.06] hover:border-white/10 text-zinc-400 hover:text-zinc-200 font-mono text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer group mt-1"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="w-4 h-4 text-rose-400 group-hover:-translate-y-0.5 transition-transform" />
                              <span>Recolher para o Top 3</span>
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4 text-rose-400 group-hover:translate-y-0.5 transition-transform" />
                              <span>
                                Ver todos os {sortedAlbuns.length} álbuns (+{sortedAlbuns.length - 3} álbuns)
                              </span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  )}
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
      {/* Modal para alterar data da reunião (Admin) */}
      <EditDataReuniaoModal
        isOpen={!!editingEdicao}
        onClose={() => setEditingEdicao(null)}
        edicao={editingEdicao}
        onSuccess={(edicaoAtualizada) => {
          setEdicoes((prev) =>
            prev.map((e) => (e.id === edicaoAtualizada.id ? edicaoAtualizada : e))
          );
        }}
      />
    </div>
  );
};
