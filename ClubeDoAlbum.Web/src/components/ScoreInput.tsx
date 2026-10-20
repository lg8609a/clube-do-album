import React from 'react';
import { TierBadge } from './TierBadge';
import { TierClassificacao } from '../types';
import { Minus, Plus } from 'lucide-react';

interface ScoreInputProps {
  value: number;
  onChange: (value: number) => void;
}

export const ScoreInput: React.FC<ScoreInputProps> = ({ value, onChange }) => {
  const getTier = (nota: number): TierClassificacao => {
    if (nota < 2.0) return 'Absolute Porcaria';
    if (nota < 4.0) return 'Ruim';
    if (nota < 6.0) return 'Meia Boca';
    if (nota < 7.0) return 'Bom';
    if (nota < 8.0) return 'É o Aço';
    return 'Masterpiece';
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onChange(Math.round(val * 10) / 10);
  };

  const setFixed = (val: number) => {
    const clamped = Math.min(10, Math.max(0, val));
    onChange(Math.round(clamped * 10) / 10);
  };

  return (
    <div className="glass-panel rounded-2xl p-6 space-y-5 border border-white/[0.08]">
      <div className="flex items-center justify-between">
        <label className="text-xs font-mono font-bold tracking-widest text-zinc-400 uppercase flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          Sua Avaliação Oficial
        </label>
        <TierBadge classificacao={getTier(value)} size="md" />
      </div>

      {/* Main Score Display with Tactile Steppers */}
      <div className="flex items-center justify-center gap-6 py-2">
        <button
          type="button"
          onClick={() => setFixed(value - 0.5)}
          className="w-11 h-11 rounded-xl glass-button-secondary text-zinc-300 hover:text-white font-bold flex items-center justify-center cursor-pointer transition active:scale-95"
          aria-label="Diminuir 0.5"
        >
          <Minus className="w-4 h-4" />
        </button>

        <div className="flex items-baseline gap-1 select-none">
          <span className="font-display font-black text-6xl tracking-tight text-white tabular-nums drop-shadow-[0_0_24px_rgba(255,255,255,0.15)]">
            {value.toFixed(1)}
          </span>
          <span className="text-lg font-mono text-zinc-500 font-medium">/10</span>
        </div>

        <button
          type="button"
          onClick={() => setFixed(value + 0.5)}
          className="w-11 h-11 rounded-xl glass-button-secondary text-zinc-300 hover:text-white font-bold flex items-center justify-center cursor-pointer transition active:scale-95"
          aria-label="Aumentar 0.5"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Slider Track with Custom Accent */}
      <div className="space-y-2">
        <input
          type="range"
          min="0"
          max="10"
          step="0.1"
          value={value}
          onChange={handleSliderChange}
          className="w-full h-2.5 bg-zinc-900 border border-white/[0.06] rounded-full appearance-none cursor-pointer accent-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500/40"
        />

        <div className="flex justify-between text-[10px] text-zinc-500 font-mono tracking-wider px-0.5">
          <span>0.0 (Porcaria)</span>
          <span>4.0</span>
          <span>6.0</span>
          <span>8.0</span>
          <span>10.0 (Masterpiece)</span>
        </div>
      </div>
    </div>
  );
};
