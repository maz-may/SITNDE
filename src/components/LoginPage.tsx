import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  FileCheck2,
  GitBranch,
  KeyRound,
  Loader2,
  Lock,
  ShieldCheck,
  User,
} from 'lucide-react';
import { useRole } from '../context/RoleContext';
import { HOSPITAL_INFO } from '../data/mockHospitalData';
import { RoleId } from '../types/sitnde';

interface LoginPageProps {
  onLoggedIn: (roleId: RoleId) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoggedIn }) => {
  const { allRoleUsers, loginWithCredentials } = useRole();
  const [nip, setNip] = useState(allRoleUsers[0]?.nip || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const user = await loginWithCredentials(nip.trim(), password);
      onLoggedIn(user.roleId);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Gagal masuk. Periksa kembali NIP dan kata sandi Anda.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickFill = (selectedNip: string) => {
    setNip(selectedNip);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 lg:grid lg:grid-cols-12">
      {/* Left Institutional Brand Column */}
      <aside className="flex flex-col justify-between bg-[#0F294A] px-8 py-10 text-slate-100 lg:col-span-5 lg:px-12 lg:py-12">
        <div>
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-sky-400/30 bg-sky-500/20 text-sky-300">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-6 w-6"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3l7 3v5c0 4.5-3 8.4-7 10-4-1.6-7-5.5-7-10V6l7-3z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v6M9 11h6"
                />
              </svg>
            </div>
            <div>
              <div className="font-display text-xl font-bold tracking-tight text-white">
                SITNDE
              </div>
              <div className="text-xs text-sky-200">
                Smart Intent-to-Draft &amp; Tata Naskah Dinas Engine
              </div>
            </div>
          </div>

          <div className="mt-12 max-w-md space-y-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-sky-300">
              {HOSPITAL_INFO.pemda} · {HOSPITAL_INFO.dinas}
            </div>
            <h1 className="font-display text-2xl font-bold leading-snug text-white sm:text-3xl text-balance">
              Sistem Persuratan Resmi Terstandar {HOSPITAL_INFO.name}
            </h1>
            <p className="text-sm leading-relaxed text-slate-300">
              Portal terpadu penyusunan naskah dinas berbasis instruksi bahasa natural, validasi otomatis EYD V dan UU PDP, serta alur paraf elektronik berjenjang sesuai struktur organisasi rumah sakit.
            </p>
          </div>

          <div className="mt-10 space-y-5 border-t border-white/10 pt-8">
            <div className="flex items-start gap-3.5">
              <FileCheck2 className="mt-0.5 h-5 w-5 shrink-0 text-sky-300" />
              <div>
                <div className="text-sm font-semibold text-white">
                  Intent-to-Draft &amp; Ekspor OpenXML Resmi
                </div>
                <p className="mt-0.5 text-xs leading-relaxed text-slate-300">
                  Konversi maksud surat menjadi Nota Dinas, Surat Undangan, atau Surat Tugas berformat baku Perbup TND.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
              <div>
                <div className="text-sm font-semibold text-white">
                  Biromatic Guard &amp; Proteksi UU PDP
                </div>
                <p className="mt-0.5 text-xs leading-relaxed text-slate-300">
                  Pemeriksaan kata tidak baku, kecocokan NIP SIMRS, dan pencegahan kebocoran NIK atau nomor rekam medis pasien.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <GitBranch className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
              <div>
                <div className="text-sm font-semibold text-white">
                  Alur Paraf Berjenjang (DynFlow-SOTK)
                </div>
                <p className="mt-0.5 text-xs leading-relaxed text-slate-300">
                  Kontrol kewenangan 7 peran pegawai dari pengusul hingga TTE Direktur dan registrasi Tata Usaha.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-5 text-xs text-slate-400">
          {HOSPITAL_INFO.address}
        </div>
      </aside>

      {/* Right Authentication Form Column */}
      <main className="flex items-center justify-center px-4 py-10 sm:px-8 lg:col-span-7 lg:px-14">
        <div className="w-full max-w-xl space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
            <div className="border-b border-slate-200 pb-5">
              <div className="flex items-center gap-2 text-xs font-semibold text-sky-700">
                <KeyRound className="h-4 w-4" />
                <span>Autentikasi Pegawai SIMRS</span>
              </div>
              <h2 className="mt-1.5 font-display text-xl font-bold text-[#0F294A]">
                Masuk ke Ruang Kerja SITNDE
              </h2>
              <p className="mt-1 text-xs text-slate-600">
                Masukkan NIP 18 digit yang terdaftar pada SIMRS RSUD Nusantara Jaya beserta kata sandi Anda.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="login-nip"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Nomor Induk Pegawai (NIP)
                </label>
                <div className="relative mt-1.5">
                  <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="login-nip"
                    type="text"
                    required
                    value={nip}
                    onChange={(e) => setNip(e.target.value)}
                    placeholder="Contoh: 19940312 202012 1 004"
                    autoComplete="username"
                    className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 font-mono text-sm tabular-nums text-slate-900 placeholder:font-sans placeholder:text-slate-400 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-600/20"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="login-password"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Kata Sandi
                </label>
                <div className="relative mt-1.5">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi"
                    autoComplete="current-password"
                    className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-11 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-600/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={
                      showPassword
                        ? 'Sembunyikan kata sandi'
                        : 'Tampilkan kata sandi'
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-700"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {errorMessage && (
                <div
                  role="alert"
                  className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-800"
                >
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !nip.trim() || !password}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#0F294A] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#163a66] disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Memverifikasi Kredensial...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4" />
                    <span>Masuk ke Sistem</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick-Select SIMRS Employee NIP Directory */}
          <section className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="border-b border-slate-200 bg-slate-50/80 px-5 py-3">
              <h3 className="font-display text-xs font-bold text-[#0F294A]">
                Daftar NIP Pegawai SIMRS (Klik Baris untuk Mengisi Cepat)
              </h3>
            </div>
            <div className="divide-y divide-slate-200 max-h-64 overflow-y-auto">
              {allRoleUsers.map((u) => {
                const isSelected =
                  nip.replace(/\s+/g, '') === u.nip.replace(/\s+/g, '');
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleQuickFill(u.nip)}
                    className={`flex w-full items-center justify-between gap-3 px-5 py-2.5 text-left text-xs transition-colors ${
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
          </section>
        </div>
      </main>
    </div>
  );
};
