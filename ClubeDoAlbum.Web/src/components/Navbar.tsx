import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Disc,
  LogIn,
  LogOut,
  Plus,
  Trophy,
  User as UserIcon,
  Archive,
  Users,
  Flame,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';

interface NavbarProps {
  onOpenAddModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAddModal }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === '/edicoes') {
      return location.pathname === '/edicoes' || location.pathname === '/arquivo';
    }
    return location.pathname === path;
  };

  const navLinks = [
    { path: '/', label: 'Esta Semana', icon: Flame },
    { path: '/edicoes', label: 'Edições & Arquivo', icon: Archive },
    { path: '/ranking', label: 'O Grande Ranking', icon: Trophy },
    { path: '/curadores', label: 'Curadores', icon: Users },
    { path: '/catalogo', label: 'Catálogo', icon: Disc },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#06070a]/80 backdrop-blur-xl border-b border-white/[0.07] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-rose-950 via-zinc-900 to-black border border-white/10 flex items-center justify-center shadow-lg group-hover:border-rose-500/50 transition-colors overflow-hidden">
            <div className="absolute inset-0 bg-radial-[circle_at_center,rgba(225,29,72,0.2),transparent_70%]" />
            <Disc className="w-5 h-5 text-rose-500 animate-spin-slow relative z-10" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-black text-sm tracking-widest uppercase text-white group-hover:text-rose-400 transition-colors">
                Clube do Álbum
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            </div>
            <span className="block text-[9px] uppercase tracking-widest text-zinc-400 font-mono">
              Audição • Notas • Metal & Rock
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 bg-white/[0.03] border border-white/[0.06] p-1 rounded-xl backdrop-blur-md">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium tracking-wide uppercase transition-all duration-200 flex items-center gap-1.5 ${
                  active
                    ? 'text-white bg-white/[0.08] border border-white/[0.12] shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 ${
                    active ? 'text-rose-400' : 'text-zinc-500'
                  }`}
                />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Action Buttons & Auth */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenAddModal}
            className="glass-button-primary flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-white text-xs font-mono font-bold uppercase tracking-wider cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Indicar Disco</span>
          </button>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-white/20 transition cursor-pointer"
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.nome}
                    className="w-7 h-7 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-rose-950/80 border border-rose-800/60 text-rose-200 font-mono font-bold text-xs flex items-center justify-center">
                    {user.nome[0].toUpperCase()}
                  </div>
                )}
              </button>

              {userMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 glass-panel rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 border border-white/[0.1]"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <div className="px-4 py-2.5 border-b border-white/[0.06]">
                    <p className="text-xs font-bold text-white truncate">{user.nome}</p>
                    <p className="text-[11px] text-zinc-400 font-mono truncate">{user.email}</p>
                  </div>

                  <Link
                    to="/minhas-avaliacoes"
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-zinc-300 hover:bg-white/[0.06] hover:text-white transition"
                  >
                    <Disc className="w-3.5 h-3.5 text-rose-400" />
                    Minhas Avaliações
                  </Link>

                  <Link
                    to="/perfil"
                    className="flex items-center gap-2.5 px-4 py-2 text-xs text-zinc-300 hover:bg-white/[0.06] hover:text-white transition"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-zinc-400" />
                    Meu Perfil
                  </Link>

                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-400 hover:bg-rose-950/30 transition text-left cursor-pointer border-t border-white/[0.06] mt-1 font-mono"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sair da Conta
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="glass-button-secondary flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-zinc-200 hover:text-white text-xs font-mono font-bold uppercase tracking-wider"
            >
              <LogIn className="w-3.5 h-3.5" />
              Entrar
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-zinc-400 hover:text-white"
            aria-label="Abrir Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/[0.06] bg-[#06070a]/95 backdrop-blur-2xl px-4 py-4 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider ${
                  active
                    ? 'text-white bg-white/[0.08] border border-white/[0.12]'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-rose-400' : 'text-zinc-500'}`} />
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
};
