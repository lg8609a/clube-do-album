import React, { useEffect, useState } from 'react';
import { albumsApi, authApi } from '../services/api';
import { Album, User, TierClassificacao } from '../types';
import { AlbumCard } from '../components/AlbumCard';
import { Search, Filter, Disc3, Archive } from 'lucide-react';

export const CatalogPage: React.FC = () => {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'score_desc' | 'score_asc' | 'recent' | 'year'>('recent');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [albunsData, usersData] = await Promise.all([
          albumsApi.getAlbums({ status: 'JaOuvido' }),
          authApi.getAllUsers(),
        ]);
        setAlbums(albunsData);
        setUsers(usersData);
      } catch (err) {
        console.error('Erro ao carregar catálogo:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredAlbums = albums
    .filter((a) => {
      const matchSearch =
        a.titulo.toLowerCase().includes(search.toLowerCase()) ||
        a.artista.toLowerCase().includes(search.toLowerCase());

      const matchUser =
        selectedUser === 'all' || (a.indicadoPor && a.indicadoPor.id === selectedUser);

      const matchTier = selectedTier === 'all' || a.classificacao === selectedTier;

      return matchSearch && matchUser && matchTier;
    })
    .sort((a, b) => {
      if (sortBy === 'score_desc') return b.notaMedia - a.notaMedia;
      if (sortBy === 'score_asc') return a.notaMedia - b.notaMedia;
      if (sortBy === 'year') return b.anoLancamento - a.anoLancamento;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const tiers: TierClassificacao[] = [
    'Masterpiece',
    'É o Aço',
    'Bom',
    'Meia Boca',
    'Ruim',
    'Absolute Porcaria',
  ];

  if (loading) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center space-y-4">
        <Disc3 className="w-12 h-12 animate-spin-slow text-rose-500" />
        <p className="text-xs uppercase tracking-widest font-mono text-zinc-500">
          Carregando acervo do clube...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2 text-rose-400 font-mono text-xs uppercase tracking-widest font-bold mb-1">
            <Archive className="w-4 h-4" />
            <span>Histórico de Reuniões & Acervo</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-display font-black text-white uppercase tracking-tight">
            Catálogo Geral de Álbuns
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Explore todos os discos já debatidos e votados pelo Clube do Álbum ({albums.length} discos catalogados).
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-white/[0.08]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-zinc-500" />
            <input
              type="text"
              placeholder="Buscar álbum ou artista..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-zinc-950/70 border border-white/[0.08] rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-rose-500 transition"
            />
          </div>

          {/* User / Curator Filter */}
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="bg-zinc-950/70 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-rose-500 transition cursor-pointer"
          >
            <option value="all">Todos os Curadores</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                Curadoria: {u.nome}
              </option>
            ))}
          </select>

          {/* Tier Filter */}
          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value)}
            className="bg-zinc-950/70 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-rose-500 transition cursor-pointer"
          >
            <option value="all">Todas as Classificações</option>
            {tiers.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-zinc-950/70 border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-rose-500 transition cursor-pointer font-mono"
          >
            <option value="recent">Mais Recentes no Clube</option>
            <option value="score_desc">Maior Nota Média</option>
            <option value="score_asc">Menor Nota Média</option>
            <option value="year">Ano de Lançamento</option>
          </select>
        </div>
      </div>

      {/* Albums Grid */}
      {filteredAlbums.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredAlbums.map((album) => (
            <AlbumCard key={album.id} album={album} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center space-y-3 glass-panel rounded-2xl border border-white/[0.06]">
          <Filter className="w-8 h-8 mx-auto text-zinc-600" />
          <p className="text-zinc-200 font-display font-bold text-base">Nenhum álbum encontrado para estes filtros.</p>
          <p className="text-xs text-zinc-500 font-mono">Tente limpar os termos de busca ou filtros selecionados.</p>
        </div>
      )}
    </div>
  );
};
