import React, { useState } from 'react';

interface CountryFlagProps {
  countryCode?: string | null;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

const COUNTRY_NAMES_PT: Record<string, string> = {
  GB: 'Reino Unido',
  UK: 'Reino Unido',
  US: 'Estados Unidos',
  BR: 'Brasil',
  SE: 'Suécia',
  DE: 'Alemanha',
  AU: 'Austrália',
  CA: 'Canadá',
  NO: 'Noruega',
  FI: 'Finlândia',
  FR: 'França',
  IT: 'Itália',
  JP: 'Japão',
  NL: 'Holanda',
  DK: 'Dinamarca',
  PL: 'Polônia',
  CH: 'Suíça',
  AT: 'Áustria',
  ES: 'Espanha',
  PT: 'Portugal',
  IE: 'Irlanda',
  GR: 'Grécia',
  AR: 'Argentina',
  CL: 'Chile',
  UY: 'Uruguai',
  MX: 'México',
  UA: 'Ucrânia',
  RU: 'Rússia',
  NZ: 'Nova Zelândia',
  BE: 'Bélgica',
  IS: 'Islândia',
};

const SIZE_CONFIG = {
  xs: { w: 16, h: 12, className: 'w-4 h-3' },
  sm: { w: 20, h: 15, className: 'w-5 h-3.5' },
  md: { w: 24, h: 18, className: 'w-6 h-4.5' },
  lg: { w: 32, h: 24, className: 'w-8 h-6' },
};

export const CountryFlag: React.FC<CountryFlagProps> = ({
  countryCode,
  className = '',
  size = 'md',
}) => {
  const [imageError, setImageError] = useState(false);

  if (!countryCode) return null;

  const code = countryCode.trim().toUpperCase();
  if (code.length !== 2) return null;

  const nomePais = COUNTRY_NAMES_PT[code] || code;
  const cfg = SIZE_CONFIG[size] || SIZE_CONFIG.md;
  const lowerCode = code.toLowerCase();

  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 cursor-help select-none transition-transform hover:scale-110 align-middle ${className}`}
      title={`País de Origem: ${nomePais} (${code})`}
      aria-label={`Bandeira de ${nomePais}`}
    >
      {!imageError ? (
        <img
          src={`https://flagcdn.com/24x18/${lowerCode}.png`}
          srcSet={`https://flagcdn.com/48x36/${lowerCode}.png 2x`}
          alt={`Bandeira de ${nomePais}`}
          width={cfg.w}
          height={cfg.h}
          loading="lazy"
          onError={() => setImageError(true)}
          className={`${cfg.className} object-cover rounded-[3px] shadow-[0_1px_3px_rgba(0,0,0,0.5)] border border-white/20`}
        />
      ) : (
        <span className="text-[10px] font-mono text-zinc-400 bg-white/10 px-1 rounded">
          {code}
        </span>
      )}
    </span>
  );
};
