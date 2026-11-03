import React, { useState } from 'react';
import { TrackItem } from '../types';
import { ListMusic, Clock, ExternalLink, ChevronDown, ChevronUp, Music2 } from 'lucide-react';

interface AlbumTracklistProps {
  faixas?: TrackItem[];
}

export const AlbumTracklist: React.FC<AlbumTracklistProps> = ({ faixas }) => {
  const [isOpen, setIsOpen] = useState(true);

  if (!faixas || faixas.length === 0) {
    return null;
  }

  // Calcula tempo total do álbum
  const totalMs = faixas.reduce((acc, f) => acc + (f.duracaoMs || 0), 0);
  const totalMinutos = Math.floor(totalMs / 60000);
  const totalSegundos = Math.floor((totalMs % 60000) / 1000);
  const tempoTotalFormatado = `${totalMinutos}m ${totalSegundos}s`;

  // Agrupa faixas por disco (caso seja álbum duplo/triplo)
  const discos = faixas.reduce<Record<number, TrackItem[]>>((acc, track) => {
    const d = track.discoNumero || 1;
    if (!acc[d]) acc[d] = [];
    acc[d].push(track);
    return acc;
  }, {});

  const totalDiscos = Object.keys(discos).length;

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/[0.08] shadow-xl space-y-5">
      {/* Header do Tracklist */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 text-left group cursor-pointer focus:outline-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-950/60 to-zinc-900 border border-white/10 flex items-center justify-center text-rose-400 group-hover:border-rose-500/40 transition">
            <ListMusic className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-display font-bold uppercase tracking-wider text-white group-hover:text-rose-300 transition">
                Faixas do Álbum ({faixas.length})
              </h2>
              {isOpen ? (
                <ChevronUp className="w-4 h-4 text-zinc-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-zinc-500" />
              )}
            </div>
            <p className="text-xs text-zinc-400 mt-0.5 font-mono">
              Tracklist oficial com duração de cada faixa
            </p>
          </div>
        </button>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs font-mono text-zinc-400">
          <Clock className="w-3.5 h-3.5 text-zinc-500" />
          <span>Duração total: <strong className="text-zinc-200">{tempoTotalFormatado}</strong></span>
        </div>
      </div>

      {/* Conteúdo Expansível */}
      {isOpen && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {Object.entries(discos).map(([discoNum, faixasDoDisco]) => (
            <div key={discoNum} className="space-y-2">
              {totalDiscos > 1 && (
                <div className="text-[11px] font-mono font-bold uppercase tracking-widest text-rose-400 pt-2 pb-1 flex items-center gap-1.5">
                  <Music2 className="w-3 h-3" /> Disco {discoNum}
                </div>
              )}

              <div className="divide-y divide-white/[0.04] border border-white/[0.06] rounded-2xl overflow-hidden bg-black/20">
                {faixasDoDisco.map((faixa) => (
                  <div
                    key={`${faixa.discoNumero}-${faixa.numero}`}
                    className="flex items-center justify-between px-4 py-3 hover:bg-white/[0.03] transition-colors group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0 pr-4">
                      <span className="font-mono text-xs font-bold text-zinc-500 group-hover:text-rose-400 transition-colors w-6 text-right shrink-0">
                        {String(faixa.numero).padStart(2, '0')}
                      </span>

                      <div className="min-w-0">
                        <span className="text-xs sm:text-sm font-medium text-zinc-200 group-hover:text-white transition-colors truncate block">
                          {faixa.titulo}
                        </span>
                      </div>

                      {faixa.explicit && (
                        <span className="text-[9px] font-mono font-bold bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded border border-white/10 shrink-0">
                          E
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-mono text-xs text-zinc-400 tabular-nums">
                        {faixa.duracaoFormatada}
                      </span>

                      {faixa.spotifyUrl && (
                        <a
                          href={faixa.spotifyUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-zinc-400 hover:text-emerald-400"
                          title="Tocar faixa no Spotify"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
