import React, { useState } from 'react';
import { edicoesApi } from '../services/api';
import { Edicao } from '../types';
import { X, Calendar, Sparkles, AlertCircle } from 'lucide-react';

interface CreateEdicaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (edicao: Edicao) => void;
}

export const CreateEdicaoModal: React.FC<CreateEdicaoModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [tema, setTema] = useState('');
  const [numero, setNumero] = useState<string>('');
  const [descricao, setDescricao] = useState('');
  const [dataReuniao, setDataReuniao] = useState('');
  const [ativarImediatamente, setAtivarImediatamente] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!tema.trim()) {
      setError('Por favor, informe o tema da semana temática.');
      return;
    }

    setSubmitting(true);
    try {
      const nova = await edicoesApi.createEdicao({
        tema: tema.trim(),
        numero: numero ? parseInt(numero) : undefined,
        descricao: descricao.trim() || undefined,
        dataReuniao: dataReuniao || undefined,
        ativarImediatamente,
      });

      onSuccess(nova);
      onClose();
      // Reset
      setTema('');
      setNumero('');
      setDescricao('');
      setDataReuniao('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao cadastrar a semana temática.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in">
      <div className="relative w-full max-w-lg bg-[#0b0c13] border border-white/[0.1] rounded-3xl p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.9)] space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-white/[0.06] transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-rose-400 font-mono text-xs uppercase tracking-widest font-bold">
            <Sparkles className="w-4 h-4" />
            <span>Nova Edição / Tema da Semana</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-black text-white uppercase tracking-tight">
            Definir Semana Temática
          </h2>
          <p className="text-xs text-zinc-400 leading-relaxed font-sans">
            Crie a rodada de audição onde cada membro poderá indicar até 2 álbuns do tema escolhido.
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-950/60 border border-rose-500/40 rounded-xl text-rose-300 text-xs font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 font-sans">
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-300">
              Tema da Semana *
            </label>
            <input
              type="text"
              placeholder="Ex: Semana do Metal Progressivo, Clássicos do Death Metal..."
              value={tema}
              onChange={(e) => setTema(e.target.value)}
              required
              className="w-full bg-zinc-950/70 border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-rose-500 transition font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-400">
                Número da Edição (Opcional)
              </label>
              <input
                type="number"
                placeholder="Auto-incrementa se vazio"
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                min={1}
                className="w-full bg-zinc-950/70 border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-rose-500 transition font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-rose-400" /> Data do Encontro
              </label>
              <input
                type="date"
                value={dataReuniao}
                onChange={(e) => setDataReuniao(e.target.value)}
                className="w-full bg-zinc-950/70 border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-rose-500 transition font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-400">
              Regras ou Observações (Opcional)
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Álbuns lançados entre 1990 e 2005. Permitido até 2 álbuns por pessoa."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full bg-zinc-950/70 border border-white/[0.08] rounded-xl p-3 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-rose-500 resize-none transition"
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer pt-1 text-xs text-zinc-300">
            <input
              type="checkbox"
              checked={ativarImediatamente}
              onChange={(e) => setAtivarImediatamente(e.target.checked)}
              className="accent-rose-600 w-4 h-4 rounded cursor-pointer"
            />
            <span className="font-mono">Definir como a <strong>Semana Ativa</strong> imediatamente</span>
          </label>

          <div className="flex justify-end gap-3 pt-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-mono text-zinc-400 hover:text-white font-medium transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="glass-button-primary px-6 py-2.5 disabled:opacity-50 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition shadow cursor-pointer"
            >
              {submitting ? 'Criando Semana...' : 'Criar Semana Temática'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
