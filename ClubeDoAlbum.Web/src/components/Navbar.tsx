import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserAvatar } from './UserAvatar';
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
  Shield,
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
                title={user.nome}
              >
                <UserAvatar name={user.nome} avatarUrl={user.avatarUrl} size="sm" />
              </button>

              {userMenuOpen && (
                <>
                  {/* Backdrop para fechar ao clicar fora */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserMenuOpen(false)}
                  />

                  {/* Menu suspenso com fundo 100% opaco e sólido */}
                  <div
                    className="absolute right-0 mt-2 w-60 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.95)] py-2 z-50 animate-in fade-in slide-in-from-top-2 border border-white/[0.12] bg-[#0c0d14] text-white"
                  >
                    <div className="px-4 py-3 border-b border-white/[0.08] flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{user.nome}</p>
                        <p className="text-[11px] text-zinc-400 font-mono truncate">{user.email}</p>
                      </div>
                      {user.isAdmin && (
                        <span className="flex-shrink-0 text-[9px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Shield className="w-2.5 h-2.5" /> Admin
                        </span>
                      )}
                    </div>

                    <div className="py-1">
                      <Link
                        to="/minhas-avaliacoes"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-zinc-300 hover:bg-white/[0.06] hover:text-white transition"
                      >
                        <Disc className="w-3.5 h-3.5 text-rose-400" />
                        Minhas Avaliações
                      </Link>

                      <Link
                        to="/perfil"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-zinc-300 hover:bg-white/[0.06] hover:text-white transition"
                      >
                        <UserIcon className="w-3.5 h-3.5 text-zinc-400" />
                        Meu Perfil
                      </Link>
                    </div>

                    <div className="pt-1 border-t border-white/[0.08]">
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition text-left cursor-pointer font-mono font-bold"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sair da Conta
                      </button>
                    </div>
                  </div>
                </>
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
