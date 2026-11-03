import React from 'react';

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

export function getFlagEmoji(code: string): string {
  try {
    const clean = code.trim().toUpperCase();
    if (clean.length !== 2) return '';
    const codePoints = clean
      .split('')
      .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  } catch {
    return '';
  }
}

export const CountryFlag: React.FC<CountryFlagProps> = ({
  countryCode,
  className = '',
  size = 'md',
}) => {
  if (!countryCode) return null;

  const code = countryCode.trim().toUpperCase();
  const flag = getFlagEmoji(code);
  if (!flag) return null;

  const nomePais = COUNTRY_NAMES_PT[code] || code;

  const sizeStyles = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
  };

  return (
    <span
      className={`inline-flex items-center cursor-help select-none transition-transform hover:scale-115 ${sizeStyles[size]} ${className}`}
      title={`País de Origem: ${nomePais} (${code})`}
      aria-label={`País de Origem: ${nomePais}`}
    >
      {flag}
    </span>
  );
};
