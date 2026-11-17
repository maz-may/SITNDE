import React, { useState } from 'react';
import { KeyRound, Loader2, ShieldCheck, X } from 'lucide-react';
import { useRole } from '../context/RoleContext';
import { RoleId } from '../types/sitnde';

interface NipLoginModalProps {
  open: boolean;
  onClose: () => void;
  onLoggedIn: (roleId: RoleId) => void;
}

export const NipLoginModal: React.FC<NipLoginModalProps> = ({
  open,
  onClose,
  onLoggedIn,
}) => {
  const { allRoleUsers, currentUser, loginByNip } = useRole();
  const [nipInput, setNipInput] = useState(currentUser.nip);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nipInput.trim() || isSubmitting) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const matched = await loginByNip(nipInput.trim());
      onLoggedIn(matched.roleId);
      onClose();
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'NIP tidak ditemukan pada database kepegawaian SIMRS.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="nip-login-title"
    >
      <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white shadow-lg">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <KeyRound className="h-5 w-5 text-[#0F294A]" />
            <div>
              <h2
                id="nip-login-title"
                className="font-display text-base font-bold text-[#0F294A]"
              >
                Autentikasi Pegawai SIMRS (NIP)
              </h2>
              <p className="text-xs text-slate-500">
                Masuk menggunakan NIP 18 digit untuk aktivasi hak akses RBAC
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Tutup dialog login NIP"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div>
            <label
              htmlFor="nip-input-field"
              className="block text-xs font-semibold text-slate-700"
            >
              Nomor Induk Pegawai (NIP)
            </label>
            <input
              id="nip-input-field"
              type="text"
              value={nipInput}
              onChange={(e) => setNipInput(e.target.value)}
              placeholder="Contoh: 19940312 202012 1 004"
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2.5 font-mono text-sm tabular-nums text-slate-900 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-600/20"
            />
          </div>

          {errorMsg && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-800">
              {errorMsg}
            </div>
          )}

          <div>
            <div className="mb-2 text-xs font-semibold text-slate-600">
              Daftar NIP Pejabat & Pegawai SIMRS (Klik untuk mengisi cepat):
            </div>
            <div className="max-h-56 divide-y divide-slate-200 overflow-y-auto rounded-lg border border-slate-200">
              {allRoleUsers.map((u) => {
                const isSelected =
                  nipInput.replace(/\s+/g, '') === u.nip.replace(/\s+/g, '');
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      setNipInput(u.nip);
                      setErrorMsg(null);
                    }}
                    className={`flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left text-xs transition-colors ${
                      isSelected ? 'bg-sky-50' : 'bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-[#0F294A]">
                        {u.name}
                      </div>
                      <div className="truncate text-[11px] text-slate-500">
                        {u.shortRoleLabel} · {u.unitName}
                      </div>
                    </div>
                    <div className="shrink-0 font-mono text-[11px] font-medium text-slate-700 tabular-nums">
                      {u.nip}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !nipInput.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-[#0F294A] px-4 py-2 text-xs font-semibold text-white hover:bg-[#163a66] disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Memverifikasi NIP...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Masuk dengan NIP</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
