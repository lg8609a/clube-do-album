import React, { useEffect, useState } from 'react';
import { edicoesApi } from '../services/api';
import { Edicao } from '../types';
import { X, Calendar, AlertCircle, Check, Trash2 } from 'lucide-react';

interface EditDataReuniaoModalProps {
  isOpen: boolean;
  onClose: () => void;
  edicao: Edicao | null;
  onSuccess: (edicaoAtualizada: Edicao) => void;
}

export const EditDataReuniaoModal: React.FC<EditDataReuniaoModalProps> = ({
  isOpen,
  onClose,
  edicao,
  onSuccess,
}) => {
  const [dataReuniao, setDataReuniao] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (edicao) {
      setDataReuniao(edicao.dataReuniao ? edicao.dataReuniao.split('T')[0] : '');
      setError(null);
    }
  }, [edicao, isOpen]);

  if (!isOpen || !edicao) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const edicaoAtualizada = await edicoesApi.updateDataReuniao(
        edicao.id,
        dataReuniao ? dataReuniao : null
      );
      onSuccess(edicaoAtualizada);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao atualizar a data da reunião.');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoverData = async () => {
    setError(null);
    setSaving(true);
    try {
      const edicaoAtualizada = await edicoesApi.updateDataReuniao(edicao.id, null);
      onSuccess(edicaoAtualizada);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao remover a data da reunião.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-[#0c0d14] border border-white/[0.12] rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.95)] z-10 space-y-6 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/[0.08] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-rose-400 font-mono text-xs uppercase tracking-widest font-bold">
              <Calendar className="w-4 h-4" />
              <span>Ajuste de Calendário</span>
            </div>
            <h2 className="text-xl font-display font-black text-white uppercase tracking-tight">
              Data da Reunião
            </h2>
            <p className="text-xs text-zinc-400 font-mono truncate max-w-xs">
              Edição #{edicao.numero}: {edicao.tema}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-rose-300 text-xs font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-[11px] text-zinc-400 leading-relaxed font-mono">
          ℹ️ Esta ação atualiza <strong className="text-zinc-200">apenas o dia do encontro</strong>. Os discos indicados, avaliações registradas e o tema da semana permanecem exatamente como estão.
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[11px] font-mono font-semibold uppercase text-zinc-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-rose-400" /> Nova Data da Reunião
            </label>
            <input
              type="date"
              value={dataReuniao}
              onChange={(e) => setDataReuniao(e.target.value)}
              className="w-full bg-zinc-950/80 border border-white/[0.1] rounded-xl px-4 py-3 text-xs text-zinc-100 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition font-mono [color-scheme:dark]"
            />
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            {edicao.dataReuniao ? (
              <button
                type="button"
                onClick={handleRemoverData}
                disabled={saving}
                className="px-3.5 py-2.5 rounded-xl bg-white/[0.04] hover:bg-rose-950/30 text-zinc-400 hover:text-rose-400 font-mono text-xs transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                title="Remover data definida"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Limpar Data</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-zinc-400 hover:text-white font-mono text-xs uppercase tracking-wider transition cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={saving}
                className="glass-button-primary px-5 py-2.5 rounded-xl text-white font-mono font-bold text-xs uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer shadow disabled:opacity-50"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                {saving ? 'Salvando...' : 'Salvar Data'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
