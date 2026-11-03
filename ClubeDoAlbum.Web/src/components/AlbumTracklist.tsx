import React from 'react';
import { TrackItem } from '../types';
import { ListMusic, Clock, Music2 } from 'lucide-react';

interface AlbumTracklistProps {
  faixas?: TrackItem[];
}

export const AlbumTracklist: React.FC<AlbumTracklistProps> = ({ faixas }) => {
  if (!faixas || faixas.length === 0) {
    return null;
  }

  // Calcula tempo total do disco
  const totalMs = faixas.reduce((acc, f) => acc + (f.duracaoMs || 0), 0);
  const totalMinutos = Math.floor(totalMs / 60000);
  const totalSegundos = Math.floor((totalMs % 60000) / 1000);
  const tempoTotalFormatado = `${totalMinutos}m ${totalSegundos}s`;

  // Agrupa faixas por disco
  const discos = faixas.reduce<Record<number, TrackItem[]>>((acc, track) => {
    const d = track.discoNumero || 1;
    if (!acc[d]) acc[d] = [];
    acc[d].push(track);
    return acc;
  }, {});

  const totalDiscos = Object.keys(discos).length;

  return (
    <div className="bg-black/30 border border-white/[0.06] rounded-2xl p-3.5 space-y-2 backdrop-blur-sm">
      {/* Header compacto */}
      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 uppercase tracking-wider pb-1.5 border-b border-white/[0.06]">
        <span className="flex items-center gap-1.5 font-bold text-zinc-300">
          <ListMusic className="w-3.5 h-3.5 text-rose-400" />
          <span>Faixas do Álbum ({faixas.length})</span>
        </span>
        <span className="flex items-center gap-1 text-zinc-500 font-mono text-[10px]">
          <Clock className="w-3 h-3 text-zinc-600" />
          <span>{tempoTotalFormatado}</span>
        </span>
      </div>

      {/* Lista de faixas com rolagem suave caso o álbum tenha muitas faixas */}
      <div className="max-h-48 overflow-y-auto space-y-0.5 pr-1 scrollbar-thin">
        {Object.entries(discos).map(([discoNum, faixasDoDisco]) => (
          <div key={discoNum} className="space-y-0.5">
            {totalDiscos > 1 && (
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-400/80 pt-1 pb-0.5 flex items-center gap-1">
                <Music2 className="w-2.5 h-2.5" /> Disco {discoNum}
              </div>
            )}

            {faixasDoDisco.map((faixa) => (
              <div
                key={`${faixa.discoNumero}-${faixa.numero}`}
                className="flex items-center justify-between py-1 px-2 rounded-lg hover:bg-white/[0.04] transition group text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-3">
                  <span className="font-mono text-[11px] text-zinc-500 w-5 text-right shrink-0">
                    {String(faixa.numero).padStart(2, '0')}
                  </span>
                  <span className="text-zinc-300 group-hover:text-white transition truncate font-sans text-xs">
                    {faixa.titulo}
                  </span>
                  {faixa.explicit && (
                    <span className="text-[8px] font-mono font-bold bg-zinc-800 text-zinc-400 px-1 py-0.2 rounded border border-white/10 shrink-0">
                      E
                    </span>
                  )}
                </div>
                <span className="font-mono text-[11px] text-zinc-500 shrink-0 tabular-nums">
                  {faixa.duracaoFormatada}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
