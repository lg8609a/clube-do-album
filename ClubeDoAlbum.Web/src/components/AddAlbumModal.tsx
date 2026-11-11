import React, { useEffect, useState } from 'react';
import { albumsApi, spotifyApi, edicoesApi, authApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { SpotifySearchResult, Edicao, MembroIndicacoesStatus, User } from '../types';
import { X, Search, Plus, Check, Music, User as UserIcon, Sparkles, AlertCircle } from 'lucide-react';

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
          }
        } catch (err) {
          console.error('Erro ao carregar contexto do modal:', err);
        }
      };

      loadContext();
      setError(null);
      setSearchError(null);
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  // Verifica cota do membro selecionado
  const statusMembroAtual = membrosStatus.find((m) => m.userId === indicadoPorUserId);
  const atingiuLimite = statusMembroAtual ? statusMembroAtual.totalIndicados >= (statusMembroAtual.limiteMaximo || 1) : false;

  const handleSearchSpotify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchInput.trim()) return;

    setIsSearching(true);
    setSearchError(null);
    setSelectedAlbum(null);

    try {
      const results = await spotifyApi.searchAlbums(searchInput.trim());
      setSearchResults(results);
      if (results.length === 0) {
        setSearchError('Nenhum álbum encontrado no Spotify com esses termos.');
      } else if (results.length === 1) {
        setSelectedAlbum(results[0]);
      }
    } catch (err: any) {
      setSearchError(err.response?.data?.message || 'Erro ao buscar no Spotify.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedAlbum) {
      setError('Por favor, busque e selecione um álbum do Spotify.');
      return;
    }

    if (atingiuLimite) {
      setError('Este membro já atingiu o limite de 1 indicação para a semana ativa.');
      return;
    }

    setLoading(true);

    try {
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

      onSuccess();
      onClose();
      // Reset
      setSelectedAlbum(null);
      setSearchResults([]);
      setSearchInput('');
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
              Indicar Disco para a Semana
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.06] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
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

          {/* Banner da Semana Temática */}
          <div className="p-4 bg-gradient-to-r from-rose-950/40 via-zinc-900/60 to-transparent border border-rose-500/30 rounded-2xl flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-rose-400 font-bold block">
                Semana Temática Ativa
              </span>
              <p className="font-display font-black text-sm text-white mt-0.5">
                {edicaoAtiva ? `Edição #${edicaoAtiva.numero}: ${edicaoAtiva.tema}` : 'Semana Sem Edição Oficial'}
              </p>
            </div>
            {!edicaoAtiva && user?.isAdmin && onOpenCreateEdicao && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCreateEdicao();
                }}
                className="text-xs font-mono text-rose-400 hover:text-rose-300 underline shrink-0 cursor-pointer"
              >
                + Criar Semana Temática
              </button>
            )}
          </div>

          {/* Quem está indicando? */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
              <UserIcon className="w-3.5 h-3.5 text-rose-400" />
              <span>Quem está indicando este álbum?</span>
            </label>

            {user?.isAdmin && membros.length > 0 ? (
              <div className="space-y-1.5">
                <select
                  value={indicadoPorUserId}
                  onChange={(e) => setIndicadoPorUserId(e.target.value)}
                  className="w-full bg-zinc-950/70 border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-zinc-100 font-mono focus:outline-none focus:border-rose-500/50 cursor-pointer"
                >
                  {membros.map((m) => {
                    const st = membrosStatus.find((s) => s.userId === m.id);
                    const count = st ? st.totalIndicados : 0;
                    return (
                      <option key={m.id} value={m.id} className="bg-zinc-900 text-white">
                        {m.nome} ({count}/1 disco indicado)
                      </option>
                    );
                  })}
                </select>
                {atingiuLimite && (
                  <p className="text-[11px] font-mono text-rose-400">
                    Aviso: Este membro já indicou 1 disco nesta semana temática.
                  </p>
                )}
              </div>
            ) : (
              <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl text-xs font-mono text-zinc-300 flex items-center justify-between">
                <span>Indicado por: <strong>{user?.nome || 'Você'}</strong></span>
                <span className="text-[11px] text-zinc-500">
                  Cota pessoal: {statusMembroAtual ? `${statusMembroAtual.totalIndicados}/1` : '0/1'}
                </span>
              </div>
            )}
          </div>

          {/* Spotify Search Input */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-rose-400" />
              <span>Buscar Álbum no Spotify ou Colar Link</span>
            </label>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ex: Iron Maiden Piece of Mind OU cole o link do Spotify"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearchSpotify();
                  }
                }}
                className="flex-1 bg-zinc-950/70 border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-rose-500/50 font-sans"
              />
              <button
                type="button"
                onClick={() => handleSearchSpotify()}
                disabled={isSearching || !searchInput.trim()}
                className="glass-button-primary px-5 py-2.5 rounded-xl text-xs font-mono font-bold text-white uppercase tracking-wider transition disabled:opacity-40 cursor-pointer shrink-0"
              >
                {isSearching ? 'Buscando...' : 'Buscar'}
              </button>
            </div>
          </div>

          {searchError && (
            <p className="text-xs font-mono text-rose-400 bg-rose-950/30 p-2.5 rounded-xl border border-rose-500/20">
              {searchError}
            </p>
          )}

          {/* Search Results List */}
          {searchResults.length > 1 && !selectedAlbum && (
            <div className="space-y-2">
              <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block">
                Selecione a versão correta do álbum ({searchResults.length} opções):
              </span>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {searchResults.map((item) => (
                  <div
                    key={item.spotifyId}
                    onClick={() => setSelectedAlbum(item)}
                    className="flex items-center gap-3 p-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] hover:border-rose-500/40 cursor-pointer transition"
                  >
                    <img
                      src={item.capaUrl || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17'}
                      alt={item.titulo}
                      className="w-12 h-12 rounded-lg object-cover border border-white/10"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-white text-xs truncate">{item.titulo}</p>
                      <p className="text-xs text-zinc-400 truncate">
                        {item.artista} • {item.anoLancamento}
                      </p>
                    </div>
                    <span className="text-[11px] font-mono text-rose-400 shrink-0 pr-2">
                      Selecionar &rarr;
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Selected Album Preview */}
          {selectedAlbum && (
            <div className="p-4 bg-rose-950/20 border border-rose-500/40 rounded-2xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <img
                  src={selectedAlbum.capaUrl || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17'}
                  alt={selectedAlbum.titulo}
                  className="w-16 h-16 rounded-xl object-cover border border-white/10 shadow-md shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-wider">
                    <Check className="w-3.5 h-3.5" /> Álbum Selecionado ({selectedAlbum.anoLancamento})
                  </div>
                  <p className="font-display font-bold text-sm text-white truncate mt-1">
                    {selectedAlbum.titulo}
                  </p>
                  <p className="text-xs text-zinc-400 truncate">{selectedAlbum.artista}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedAlbum(null)}
                className="text-xs font-mono text-zinc-400 hover:text-white underline shrink-0 cursor-pointer"
              >
                Trocar
              </button>
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
              disabled={loading || !selectedAlbum || atingiuLimite}
              className="glass-button-primary px-7 py-2.5 disabled:opacity-40 text-white text-xs font-mono font-bold uppercase tracking-wider rounded-xl transition shadow-lg cursor-pointer"
            >
              {loading ? 'Salvando...' : 'Indicar para a Semana'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
