import React from 'react';
import { Link } from 'react-router-dom';
import { Album } from '../types';
import { TierBadge } from './TierBadge';
import { UserAvatar } from './UserAvatar';
import { Disc3, MessageSquare, Star, User } from 'lucide-react';

interface AlbumCardProps {
  album: Album;
}

export const AlbumCard: React.FC<AlbumCardProps> = ({ album }) => {
  return (
    <Link
      to={`/album/${album.id}`}
      className="group flex flex-col glass-panel glass-panel-hover rounded-2xl overflow-hidden transition-all duration-300"
    >
      {/* Cover Image Container */}
      <div className="relative aspect-square w-full bg-[#0a0b10] overflow-hidden">
        {album.capaUrl ? (
          <img
            src={album.capaUrl}
            alt={`${album.titulo} - ${album.artista}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-zinc-700 bg-zinc-950">
            <Disc3 className="w-14 h-14 animate-spin-slow stroke-[1.2] text-zinc-600" />
          </div>
        )}

        {/* Ambient Top Shadow Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 opacity-80 group-hover:opacity-60 transition-opacity" />

        {/* Status Tag Overlay */}
        {album.status === 'EstaSemana' && (
          <div className="absolute top-2.5 left-2.5 bg-rose-600/90 backdrop-blur-md text-white text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-lg border border-rose-400/30 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            Esta Semana
          </div>
        )}

        {/* Score Pill Overlay */}
        {album.totalAvaliacoes > 0 ? (
          <div className="absolute bottom-2.5 right-2.5 bg-black/80 backdrop-blur-md border border-white/10 rounded-xl px-2.5 py-1 flex items-center gap-1.5 shadow-xl">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="font-mono font-black text-sm text-white tabular-nums">
              {album.notaMedia.toFixed(1)}
            </span>
          </div>
        ) : (
          <div className="absolute bottom-2.5 right-2.5 bg-black/80 backdrop-blur-md border border-white/10 rounded-xl px-2 py-0.5 text-[10px] font-mono text-zinc-400">
            Em avaliação
          </div>
        )}
      </div>

      {/* Info Container */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1">
          <h3 className="font-display font-bold text-white text-sm leading-snug group-hover:text-rose-400 transition-colors line-clamp-1">
            {album.titulo}
          </h3>
          <p className="text-zinc-400 text-xs font-medium line-clamp-1">
            {album.artista} {album.anoLancamento > 0 && `• ${album.anoLancamento}`}
          </p>
        </div>

        {/* Tier & Reviews Metadata */}
        <div className="pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-xs text-zinc-500">
          {album.totalAvaliacoes > 0 ? (
            <TierBadge classificacao={album.classificacao} size="xs" />
          ) : (
            <span className="text-[10px] text-zinc-500 font-mono">Pendente</span>
          )}

          <div className="flex items-center gap-1 text-[11px] font-mono text-zinc-400">
            <MessageSquare className="w-3 h-3 text-zinc-500" />
            <span>{album.totalAvaliacoes}</span>
          </div>
        </div>

        {/* Curator Attribution */}
        {album.indicadoPor && (
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 pt-0.5 truncate">
            <UserAvatar
              name={album.indicadoPor.nome}
              avatarUrl={album.indicadoPor.avatarUrl}
              size="xs"
              className="!w-4 !h-4 !rounded-full"
            />
            <span className="truncate">
              Curadoria: <strong className="text-zinc-200 font-medium">{album.indicadoPor.nome}</strong>
            </span>
          </div>
        )}
      </div>
    </Link>
  );
};
