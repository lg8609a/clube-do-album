import React, { useEffect, useState } from 'react';
import { albumsApi, spotifyApi, edicoesApi, authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { SpotifySearchResult, Edicao, MembroIndicacoesStatus, User } from '../types';
import { X, Search, Plus, Trash2, Check, Music, User as UserIcon, Sparkles, AlertCircle } from 'lucide-react';
import { ScoreInput } from './ScoreInput';

interface AddAlbumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onOpenCreateEdicao?: () => void;
}

export const AddAlbumModal: React.FC<AddAlbumModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onOpenCreateEdicao,
}) => {
  const { user } = useAuth();
  const [mode, setMode] = useState<'semana' | 'retroativo'>('semana');

  // Active edition and users
  const [edicaoAtiva, setEdicaoAtiva] = useState<Edicao | null>(null);
  const [membros, setMembros] = useState<User[]>([]);
  const [membrosStatus, setMembrosStatus] = useState<MembroIndicacoesStatus[]>([]);
  const [indicadoPorUserId, setIndicadoPorUserId] = useState<string>('');

  // Spotify Search
  const [searchInput, setSearchInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<SpotifySearchResult[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<SpotifySearchResult | null>(null);

  // Retroativo Fields
  const [indicadoPorNome, setIndicadoPorNome] = useState('');
  const [temaEdicao, setTemaEdicao] = useState('');
  const [dataReuniao, setDataReuniao] = useState('');
  const [reviewsList, setReviewsList] = useState<
    Array<{ nomeUsuario: string; nota: number; comentario: string }>
  >([]);

  // Current review to add in retroativo list
  const [novoAmigoNome, setNovoAmigoNome] = useState('');
  const [novaNota, setNovaNota] = useState(8.0);
  const [novoComentario, setNovoComentario] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const loadContext = async () => {
        try {
          const [ativa, usersList, statusList] = await Promise.all([
            edicoesApi.getEdicaoAtiva().catch(() => null),
            authApi.getAllUsers().catch(() => []),
            edicoesApi.getMembrosStatus().catch(() => []),
          ]);
          setEdicaoAtiva(ativa);
          setMembros(usersList);
          setMembrosStatus(statusList);

          if (user) {
            setIndicadoPorUserId(user.id);
          } else if (usersList.length > 0) {
            setIndicadoPorUserId(usersList[0].id);
          }
        } catch (err) {
          console.error('Erro ao carregar contexto do modal:', err);
        }
      };

      loadContext();
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  // Verifica cota do membro selecionado
  const selectedMemberStatus = membrosStatus.find((m) => m.userId === indicadoPorUserId);
  const atingiuLimite = selectedMemberStatus ? selectedMemberStatus.totalIndicados >= 2 : false;

  const handleSearchSpotify = async () => {
    if (!searchInput.trim()) return;
    setIsSearching(true);
    setSearchError(null);
    try {
      const query = searchInput.trim();
      if (query.includes('open.spotify.com/album/') || query.includes('spotify:album:')) {
        const album = await spotifyApi.resolve(query);
        setSelectedAlbum(album);
        setSearchResults([]);
      } else {
        const results = await spotifyApi.search(query, 10);
        if (results.length === 0) {
          setSearchError(`Nenhum álbum encontrado no Spotify para "${query}". Tente outro termo.`);
          setSearchResults([]);
          setSelectedAlbum(null);
        } else {
          setSearchResults(results);
          setSelectedAlbum(results[0]);
        }
      }
    } catch (err: any) {
      setSearchError(err.response?.data?.message || 'Nenhum álbum encontrado com este nome ou link.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddReviewToRetroList = () => {
    if (!novoAmigoNome.trim()) return;
    setReviewsList([
      ...reviewsList,
      {
        nomeUsuario: novoAmigoNome.trim(),
        nota: novaNota,
        comentario: novoComentario.trim(),
      },
    ]);
    setNovoAmigoNome('');
    setNovaNota(8.0);
    setNovoComentario('');
  };

  const handleRemoveReviewFromRetroList = (index: number) => {
    setReviewsList(reviewsList.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlbum) {
      setError('Por favor, busque e selecione um álbum no Spotify.');
      return;
    }

    if (mode === 'semana' && atingiuLimite) {
      setError('O membro selecionado já atingiu o limite de 2 indicações para esta semana.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (mode === 'semana') {
        await albumsApi.createAlbum({
          spotifyId: selectedAlbum.spotifyId,
          titulo: selectedAlbum.titulo,
          artista: selectedAlbum.artista,
          anoLancamento: selectedAlbum.anoLancamento,
          capaUrl: selectedAlbum.capaUrl,
          spotifyUrl: selectedAlbum.spotifyUrl,
          status: 'EstaSemana',
          indicadoPorUserId: indicadoPorUserId || undefined,
          edicaoId: edicaoAtiva?.id || undefined,
        });
      } else {
        await albumsApi.createRetroativo({
          spotifyId: selectedAlbum.spotifyId,
          titulo: selectedAlbum.titulo,
          artista: selectedAlbum.artista,
          anoLancamento: selectedAlbum.anoLancamento,
          capaUrl: selectedAlbum.capaUrl,
          spotifyUrl: selectedAlbum.spotifyUrl,
          indicadoPorNome: indicadoPorNome.trim() || undefined,
          indicadoPorUserId: indicadoPorUserId || undefined,
          temaEdicao: temaEdicao.trim() || undefined,
          dataReuniao: dataReuniao || undefined,
          avaliacoes: reviewsList,
        });
      }

      onSuccess();
      onClose();
      // Reset
      setSelectedAlbum(null);
      setSearchResults([]);
      setSearchInput('');
      setReviewsList([]);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao cadastrar álbum.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in">
      <div className="bg-[#0b0c13] border border-white/[0.1] rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-[0_25px_70px_rgba(0,0,0,0.9)] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
              <Music className="w-4 h-4 text-rose-400" />
            </div>
            <h2 className="text-base font-display font-bold uppercase tracking-wider text-white">
              Indicar Disco no Clube
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.06] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-white/[0.08] bg-black/40 p-2 gap-2">
          <button
            type="button"
            onClick={() => setMode('semana')}
            className={`flex-1 py-2 text-xs font-mono font-bold uppercase tracking-wider rounded-xl transition cursor-pointer ${
              mode === 'semana'
                ? 'bg-rose-950/80 text-white border border-rose-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            Álbum da Semana Atual
          </button>
          <button
            type="button"
            onClick={() => setMode('retroativo')}
            className={`flex-1 py-2 text-xs font-mono font-bold uppercase tracking-wider rounded-xl transition cursor-pointer ${
              mode === 'retroativo'
                ? 'bg-amber-950/60 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            Cadastro Retroativo (Planilha)
          </button>
        </div>

        {/* Body Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 font-sans">
          {error && (
            <div className="p-3.5 bg-rose-950/60 border border-rose-500/40 rounded-xl text-rose-300 text-xs font-mono flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Banner da Semana Temática (no modo Semana) */}
          {mode === 'semana' && (
            <div className="p-4 bg-gradient-to-r from-rose-950/40 via-zinc-900/60 to-transparent border border-rose-500/30 rounded-2xl flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-1.5 text-rose-400 text-[11px] font-mono uppercase font-bold tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  Semana Temática Ativa
                </div>
                <h3 className="text-white font-display font-bold text-sm mt-0.5">
                  {edicaoAtiva ? `Edição #${edicaoAtiva.numero}: ${edicaoAtiva.tema}` : 'Nenhum tema ativo cadastrado'}
                </h3>
                {edicaoAtiva?.descricao && (
                  <p className="text-[11px] text-zinc-400 mt-0.5">{edicaoAtiva.descricao}</p>
                )}
              </div>

              {!edicaoAtiva && onOpenCreateEdicao && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenCreateEdicao();
                  }}
                  className="px-3 py-1.5 glass-button-primary text-white rounded-xl text-xs font-mono font-bold whitespace-nowrap transition cursor-pointer"
                >
                  Definir Tema
                </button>
              )}
            </div>
          )}

          {/* Quem está indicando */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
              <UserIcon className="w-3.5 h-3.5 text-rose-400" />
              Quem está indicando este álbum? *
            </label>

            {membros.length > 0 ? (
              <select
                value={indicadoPorUserId}
                onChange={(e) => setIndicadoPorUserId(e.target.value)}
                className="w-full bg-zinc-950/70 border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-rose-500 transition cursor-pointer font-mono"
              >
                {membros.map((m) => {
                  const status = membrosStatus.find((s) => s.userId === m.id);
                  const count = status ? status.totalIndicados : 0;
                  return (
                    <option key={m.id} value={m.id}>
                      {m.nome} ({count}/2 álbuns indicados esta semana)
                    </option>
                  );
                })}
              </select>
            ) : (
              <p className="text-xs text-zinc-500 font-mono">
                Nenhum membro cadastrado. Faça login para associar a indicação ao seu perfil.
              </p>
            )}

            {/* Aviso de cota de indicação */}
            {mode === 'semana' && selectedMemberStatus && (
              <div
                className={`text-[11px] font-mono font-medium px-3.5 py-2 rounded-xl border flex items-center justify-between ${
                  atingiuLimite
                    ? 'bg-rose-950/60 text-rose-300 border-rose-500/40'
                    : 'bg-white/[0.02] text-zinc-400 border-white/[0.06]'
                }`}
              >
                <span>
                  Indicações desta semana: <strong>{selectedMemberStatus.totalIndicados} de 2 permitidas</strong>
                </span>
                {atingiuLimite ? (
                  <span className="text-[10px] font-bold uppercase bg-rose-900 text-rose-200 px-2 py-0.5 rounded-full border border-rose-500/40">
                    Limite Atingido
                  </span>
                ) : (
                  <span className="text-[10px] font-bold uppercase bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/40">
                    Disponível
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Spotify Search Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300">
                Buscar no Spotify (Link ou Nome do Álbum e Artista) *
              </label>
              <span className="text-[10px] text-zinc-500 font-mono">
                Ex: "Metallica", "Lateralus", "Black Sabbath"
              </span>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Ex: Digite 'Metallica' ou 'Lateralus' ou cole o link do álbum..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleSearchSpotify())}
                  className="w-full bg-zinc-950/70 border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-rose-500 transition"
                />
              </div>
              <button
                type="button"
                onClick={handleSearchSpotify}
                disabled={isSearching}
                className="glass-button-primary px-5 py-2.5 text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50 shadow-md"
              >
                <Search className="w-4 h-4" />
                {isSearching ? 'Buscando...' : 'Buscar'}
              </button>
            </div>
            {searchError && <p className="text-[11px] text-rose-400 font-mono">{searchError}</p>}
          </div>

          {/* Múltiplos Resultados Encontrados no Spotify */}
          {searchResults.length > 0 && (
            <div className="space-y-2.5 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                  Opções Encontradas ({searchResults.length}) — Selecione o disco:
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">
                  Clique para marcar
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
                {searchResults.map((item) => {
                  const isSelected = selectedAlbum?.spotifyId === item.spotifyId;
                  return (
                    <div
                      key={item.spotifyId}
                      onClick={() => setSelectedAlbum(item)}
                      className={`flex items-center gap-3 p-2.5 rounded-2xl border transition cursor-pointer text-left ${
                        isSelected
                          ? 'bg-rose-950/60 border-rose-500/60 ring-1 ring-rose-500/50 shadow-lg'
                          : 'glass-panel border-white/[0.06] hover:border-white/15'
                      }`}
                    >
                      <img
                        src={item.capaUrl || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17'}
                        alt={item.titulo}
                        className="w-13 h-13 rounded-xl object-cover shrink-0 border border-white/10 shadow"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-display font-bold text-xs text-white truncate leading-tight">{item.titulo}</p>
                        <p className="text-[11px] text-zinc-400 truncate mt-0.5">{item.artista}</p>
                        <span className="text-[10px] text-zinc-500 font-mono block">
                          Ano: {item.anoLancamento}
                        </span>
                      </div>
                      {isSelected ? (
                        <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="text-[10px] font-mono text-zinc-400 hover:text-white uppercase px-2 py-0.5 rounded-lg bg-white/[0.04]"
                        >
                          Escolher
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Confirmação do Álbum Selecionado */}
          {selectedAlbum && (
            <div className="p-4 bg-gradient-to-r from-rose-950/40 via-zinc-900/80 to-transparent border border-rose-500/40 rounded-2xl flex items-center justify-between gap-4 shadow-xl animate-in fade-in">
              <div className="flex items-center gap-3.5 min-w-0">
                <img
                  src={selectedAlbum.capaUrl}
                  alt={selectedAlbum.titulo}
                  className="w-16 h-16 rounded-xl object-cover shadow-lg border border-white/10 shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Disco Selecionado
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      Ano: {selectedAlbum.anoLancamento}
                    </span>
                  </div>
                  <p className="font-display font-bold text-sm text-white truncate mt-1">
                    {selectedAlbum.titulo}
                  </p>
                  <p className="text-xs text-zinc-400 truncate">{selectedAlbum.artista}</p>
                </div>
              </div>
            </div>
          )}

          {/* Retroativo Specific Fields */}
          {mode === 'retroativo' && (
            <div className="space-y-4 pt-4 border-t border-white/[0.08]">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
                Dados Históricos da Reunião
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[11px] font-mono text-zinc-400 font-medium block mb-1">
                    Nome de quem indicou na época
                  </label>
                  <input
                    type="text"
                    placeholder="Nome na planilha (ex: Lucas)"
                    value={indicadoPorNome}
                    onChange={(e) => setIndicadoPorNome(e.target.value)}
                    className="w-full bg-zinc-950/70 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono text-zinc-400 font-medium block mb-1">
                    Tema da Semana Temática (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Semana do Metal Progressivo"
                    value={temaEdicao}
                    onChange={(e) => setTemaEdicao(e.target.value)}
                    className="w-full bg-zinc-950/70 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder-zinc-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-zinc-400 font-medium block mb-1">
                  Data da Reunião (Opcional)
                </label>
                <input
                  type="date"
                  value={dataReuniao}
                  onChange={(e) => setDataReuniao(e.target.value)}
                  className="bg-zinc-950/70 border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-zinc-100 font-mono"
                />
              </div>

              {/* Add Reviews in Batch */}
              <div className="space-y-3 pt-3 border-t border-white/[0.08]">
                <label className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300">
                  Notas dadas pelos Amigos no Encontro ({reviewsList.length} registradas)
                </label>

                {reviewsList.length > 0 && (
                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                    {reviewsList.map((rev, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 glass-panel rounded-xl text-xs border border-white/[0.06]"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{rev.nomeUsuario}:</span>
                          <span className="font-mono font-bold text-amber-400">{rev.nota.toFixed(1)}</span>
                          {rev.comentario && (
                            <span className="text-zinc-400 italic truncate max-w-xs font-sans">
                              "{rev.comentario}"
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveReviewFromRetroList(index)}
                          className="text-zinc-500 hover:text-rose-400 p-1 cursor-pointer transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Sub-form to add a review */}
                <div className="p-4 bg-black/40 border border-white/[0.08] rounded-2xl space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <input
                      type="text"
                      placeholder="Nome do Amigo (ex: Thiago)"
                      value={novoAmigoNome}
                      onChange={(e) => setNovoAmigoNome(e.target.value)}
                      className="bg-zinc-950/70 border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-zinc-100"
                    />
                    <input
                      type="text"
                      placeholder="Comentário sobre o disco (opcional)"
                      value={novoComentario}
                      onChange={(e) => setNovoComentario(e.target.value)}
                      className="bg-zinc-950/70 border border-white/[0.08] rounded-xl px-3.5 py-2 text-xs text-zinc-100"
                    />
                  </div>

                  <ScoreInput value={novaNota} onChange={setNovaNota} />

                  <button
                    type="button"
                    onClick={handleAddReviewToRetroList}
                    disabled={!novoAmigoNome.trim()}
                    className="w-full py-2.5 glass-button-secondary text-xs font-mono font-bold text-zinc-200 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar Avaliação à Lista
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-4 border-t border-white/[0.08] flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-mono text-zinc-400 hover:text-white transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !selectedAlbum || (mode === 'semana' && atingiuLimite)}
              className="glass-button-primary px-7 py-2.5 disabled:opacity-40 text-white text-xs font-mono font-bold uppercase tracking-wider rounded-xl transition shadow-lg cursor-pointer"
            >
              {loading
                ? 'Salvando...'
                : mode === 'semana'
                ? 'Indicar para a Semana'
                : 'Salvar Cadastro Retroativo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
