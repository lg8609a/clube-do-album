import React from 'react';
import { TierClassificacao } from '../types';

interface TierBadgeProps {
  classificacao: TierClassificacao;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showDot?: boolean;
}

export const TierBadge: React.FC<TierBadgeProps> = ({
  classificacao,
  size = 'md',
  showDot = true,
}) => {
  const getTierConfig = () => {
    switch (classificacao) {
      case 'Masterpiece':
        return {
          wrapper: 'bg-amber-950/40 text-amber-200 border-amber-500/40 shadow-[0_0_16px_rgba(245,158,11,0.15)]',
          dot: 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]',
          glow: 'from-amber-400/20 to-transparent',
        };
      case 'É o Aço':
        return {
          wrapper: 'bg-emerald-950/40 text-emerald-200 border-emerald-500/40 shadow-[0_0_16px_rgba(16,185,129,0.15)]',
          dot: 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]',
          glow: 'from-emerald-400/20 to-transparent',
        };
      case 'Bom':
        return {
          wrapper: 'bg-sky-950/40 text-sky-200 border-sky-500/40 shadow-[0_0_16px_rgba(14,165,233,0.12)]',
          dot: 'bg-sky-400 shadow-[0_0_8px_rgba(14,165,233,0.8)]',
          glow: 'from-sky-400/20 to-transparent',
        };
      case 'Meia Boca':
        return {
          wrapper: 'bg-zinc-900/60 text-zinc-300 border-zinc-700/60 shadow-[0_0_12px_rgba(113,113,122,0.1)]',
          dot: 'bg-zinc-400 shadow-[0_0_6px_rgba(161,161,170,0.6)]',
          glow: 'from-zinc-400/10 to-transparent',
        };
      case 'Ruim':
        return {
          wrapper: 'bg-orange-950/40 text-orange-200 border-orange-500/40 shadow-[0_0_16px_rgba(249,115,22,0.15)]',
          dot: 'bg-orange-400 shadow-[0_0_8px_rgba(249,115,22,0.8)]',
          glow: 'from-orange-400/20 to-transparent',
        };
      case 'Absolute Porcaria':
        return {
          wrapper: 'bg-rose-950/50 text-rose-200 border-rose-600/50 shadow-[0_0_16px_rgba(225,29,72,0.2)]',
          dot: 'bg-rose-500 shadow-[0_0_8px_rgba(225,29,72,0.9)] animate-pulse',
          glow: 'from-rose-500/25 to-transparent',
        };
      default:
        return {
          wrapper: 'bg-zinc-900 text-zinc-400 border-zinc-800',
          dot: 'bg-zinc-500',
          glow: 'from-transparent to-transparent',
        };
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'xs':
        return 'text-[9px] px-1.5 py-0.5 tracking-wider gap-1';
      case 'sm':
        return 'text-[10px] px-2.5 py-1 tracking-wider gap-1.5';
      case 'lg':
        return 'text-xs px-3.5 py-1.5 font-bold tracking-widest gap-2';
      default:
        return 'text-[11px] px-3 py-1 font-semibold tracking-wide gap-1.5';
    }
  };

  const config = getTierConfig();

  return (
    <span
      className={`inline-flex items-center uppercase rounded-full border font-mono select-none backdrop-blur-md relative overflow-hidden transition-all duration-300 ${config.wrapper} ${getSizeClasses()}`}
    >
      {/* Specular highlight sheen */}
      <span
        aria-hidden="true"
        className={`absolute inset-0 bg-gradient-to-r ${config.glow} opacity-30 pointer-events-none`}
      />

      {showDot && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${config.dot}`}
          aria-hidden="true"
        />
      )}
      <span className="relative z-10 leading-none">{classificacao}</span>
    </span>
  );
};
