import React from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  FileCheck2,
  FilePlus2,
  GitBranch,
  Lock,
  Settings2,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { useRole } from '../context/RoleContext';
import { DraftStatus, LetterDraft, NavSection } from '../types/sitnde';
import { PermissionGuard } from './PermissionGuard';

interface DashboardViewProps {
  drafts: LetterDraft[];
  onOpenDraftInEditor: (draftId: string) => void;
  onOpenDraftInGuard: (draftId: string) => void;
  onOpenDraftInFlow: (draftId: string) => void;
  onNavigate: (section: NavSection) => void;
}

export function renderStatusLabel(status: DraftStatus) {
  switch (status) {
    case 'Selesai / Terbit':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
          <span>Selesai / Terbit</span>
        </span>
      );
    case 'Menunggu Paraf Instalasi':
    case 'Menunggu Paraf Kabid':
    case 'Menunggu Verifikasi Wadir':
    case 'Menunggu TTE Direktur':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700">
          <Clock className="h-3.5 w-3.5 shrink-0" />
          <span>{status}</span>
        </span>
      );
    case 'Revisi':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          <span>Perlu Revisi</span>
        </span>
      );
    case 'Ditolak':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700">
          <XCircle className="h-3.5 w-3.5 shrink-0" />
          <span>Ditolak</span>
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600">
          <FileCheck2 className="h-3.5 w-3.5 shrink-0" />
          <span>Draft</span>
        </span>
      );
  }
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  drafts,
  onOpenDraftInEditor,
  onOpenDraftInGuard,
  onOpenDraftInFlow,
  onNavigate,
}) => {
  const { currentUser, hasPermission } = useRole();

  // Scope visible drafts strictly per RBAC
  const visibleDrafts =
    currentUser.roleId === 'staf'
      ? drafts.filter((d) => d.creatorId === currentUser.id)
      : drafts;

  const stafEditableDrafts = visibleDrafts.filter(
    (d) => d.status === 'Draft' || d.status === 'Ditolak' || d.status === 'Revisi'
  );

  const pendingForRole = drafts.filter((d) => {
    if (currentUser.roleId === 'ka_instalasi')
      return d.status === 'Menunggu Paraf Instalasi';
    if (currentUser.roleId === 'kabid')
      return d.status === 'Menunggu Paraf Kabid';
    if (currentUser.roleId === 'wadir')
      return d.status === 'Menunggu Verifikasi Wadir';
    if (currentUser.roleId === 'direktur')
      return d.status === 'Menunggu TTE Direktur';
    if (currentUser.roleId === 'arsiparis')
      return d.status === 'Selesai / Terbit' && !d.officialNumberAssigned;
    if (currentUser.roleId === 'staf')
      return (
        d.creatorId === currentUser.id &&
        (d.status === 'Draft' || d.status === 'Ditolak' || d.status === 'Revisi')
      );
    return false;
  });

  const inProgressCount = visibleDrafts.filter((d) =>
    d.status.startsWith('Menunggu')
  ).length;
  const completedCount = visibleDrafts.filter(
    (d) => d.status === 'Selesai / Terbit'
  ).length;
  const avgCompliance =
    visibleDrafts.length > 0
      ? Math.round(
          visibleDrafts.reduce((sum, d) => sum + d.complianceScore, 0) /
            visibleDrafts.length
        )
      : 100;

  return (
    <div className="space-y-6">
      {/* Role-Specific Context Strip */}
      <section className="flex flex-col justify-between gap-5 rounded-xl border border-slate-200 bg-white p-6 lg:flex-row lg:items-center">
        <div className="max-w-2xl">
          <div className="text-xs font-semibold tracking-wide text-sky-700 uppercase">
            Sesi Aktif: {currentUser.roleLabel} · {currentUser.unitName}
          </div>
          <h2 className="mt-1 font-display text-xl font-bold text-[#0F294A] sm:text-2xl text-balance">
            {currentUser.roleId === 'staf'
              ? 'Buat naskah dinas dari kalimat natural & ajukan ke atasan'
              : currentUser.roleId === 'admin_it'
              ? 'Kelola matriks rute SOTK, hak akses peran, & jejak audit'
              : currentUser.roleId === 'direktur'
              ? 'Tinjau naskah terverifikasi & bubuhkan Tanda Tangan Elektronik'
              : currentUser.roleId === 'arsiparis'
              ? 'Validasi format TND, terbitkan nomor surat resmi, & arsipkan'
              : 'Tinjau antrean paraf berjenjang & pastikan kepatuhan TND'}
          </h2>
          <p className="mt-1.5 text-sm text-slate-600">
            {currentUser.description}. Hak akses antarmuka dan tombol aksi disesuaikan otomatis oleh RBAC.
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-3">
          <PermissionGuard permission="draft:create_ai">
            <button
              type="button"
              onClick={() => onNavigate('create')}
              className="inline-flex items-center gap-2 rounded-lg bg-[#0F294A] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#163a66] transition-colors whitespace-nowrap"
            >
              <FilePlus2 className="h-4 w-4" />
              <span>Mulai Intent-to-Draft</span>
            </button>
          </PermissionGuard>

          <PermissionGuard permission="guard:run">
            <button
              type="button"
              onClick={() => onNavigate('guard')}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap"
            >
              <ShieldCheck className="h-4 w-4 text-sky-700" />
              <span>Biromatic Guard</span>
            </button>
          </PermissionGuard>

          {currentUser.roleId !== 'staf' && currentUser.roleId !== 'admin_it' && (
            <button
              type="button"
              onClick={() => onNavigate('flow')}
              className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-700 transition-colors whitespace-nowrap"
            >
              <GitBranch className="h-4 w-4" />
              <span>
                Buka Antrean ({pendingForRole.length})
              </span>
            </button>
          )}

          <PermissionGuard permission="system:manage_sotk_tnd">
            <button
              type="button"
              onClick={() => onNavigate('admin')}
              className="inline-flex items-center gap-2 rounded-lg bg-[#0F294A] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#163a66] transition-colors whitespace-nowrap"
            >
              <Settings2 className="h-4 w-4" />
              <span>Buka Panel SOTK & Audit</span>
            </button>
          </PermissionGuard>
        </div>
      </section>

      {/* 4 KPI Summary Strip */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="text-xs font-medium text-slate-500">
            {currentUser.roleId === 'staf'
              ? 'Draf Draft / Ditolak Milik Saya'
              : 'Menunggu Tindakan Role Anda'}
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-display text-3xl font-bold text-[#0F294A] tabular-nums">
              {currentUser.roleId === 'staf'
                ? stafEditableDrafts.length
                : pendingForRole.length}
            </span>
            <span className="text-xs font-medium text-amber-700">
              {currentUser.shortRoleLabel}
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="text-xs font-medium text-slate-500">
            Surat Dalam Alur Paraf
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-display text-3xl font-bold text-sky-700 tabular-nums">
              {inProgressCount}
            </span>
            <span className="text-xs font-medium text-sky-700">
              DynFlow-SOTK
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="text-xs font-medium text-slate-500">
            Surat Selesai / Terbit (TTE)
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-display text-3xl font-bold text-emerald-700 tabular-nums">
              {completedCount}
            </span>
            <span className="text-xs font-medium text-emerald-700">
              Sah Elektronik
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="text-xs font-medium text-slate-500">
            Kepatuhan TND & EYD V
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="font-display text-3xl font-bold text-[#0F294A] tabular-nums">
              {avgCompliance}%
            </span>
            <span
              className={`text-xs font-semibold ${
                avgCompliance >= 90 ? 'text-emerald-700' : 'text-amber-700'
              }`}
            >
              {avgCompliance >= 90 ? 'Sesuai standar' : 'Perlu cek'}
            </span>
          </div>
        </div>
      </section>

      {/* Admin IT Notice vs Drafts Table */}
      {currentUser.roleId === 'admin_it' ? (
        <section className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <Lock className="mx-auto h-9 w-9 text-slate-400" />
          <h3 className="mt-3 font-display text-base font-bold text-[#0F294A]">
            Isi Naskah Dinas Terenkripsi untuk Admin Sistem / IT
          </h3>
          <p className="mx-auto mt-1 max-w-lg text-xs leading-relaxed text-slate-600">
            Sesuai kebijakan *Principle of Least Privilege* & UU PDP pada matriks RBAC SITNDE, Admin IT tidak memiliki akses baca/sunting isi surat dinas, namun berwenang penuh atas konfigurasi matriks SOTK, manajemen peran, dan audit log sistem.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('admin')}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#0F294A] px-4 py-2 text-xs font-semibold text-white hover:bg-[#163a66]"
          >
            <Settings2 className="h-3.5 w-3.5" />
            <span>Kelola SOTK, User & Audit Trail</span>
          </button>
        </section>
      ) : (
        <section className="rounded-xl border border-slate-200 bg-white">
          <div className="flex flex-col justify-between gap-3 border-b border-slate-200 px-6 py-4 sm:flex-row sm:items-center">
            <div>
              <h3 className="font-display text-base font-semibold text-[#0F294A]">
                {currentUser.roleId === 'staf'
                  ? 'Daftar Draf Saya (Draft, Ditolak & Terkirim)'
                  : 'Daftar Naskah Dinas & Posisi Hierarki SOTK'}
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                {currentUser.roleId === 'staf'
                  ? 'Staf Pengusul hanya dapat menyunting draf berstatus Draft, Revisi, atau Ditolak sebelum diajukan ke Kepala Instalasi.'
                  : 'Menampilkan seluruh naskah dalam kewenangan pemantauan peran Anda.'}
              </p>
            </div>
            <PermissionGuard permission="view:archive">
              <button
                type="button"
                onClick={() => onNavigate('archive')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 hover:text-sky-800 whitespace-nowrap"
              >
                <span>Lihat Semua Arsip</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </PermissionGuard>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-semibold text-slate-600">
                  <th className="px-6 py-3">Nomor & Jenis</th>
                  <th className="px-4 py-3">Perihal & Unit Pengusul</th>
                  <th className="px-4 py-3">Posisi Meja Pejabat</th>
                  <th className="px-4 py-3 text-right">Skor TND</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {visibleDrafts.map((draft) => {
                  const currentStep =
                    draft.parafFlow.find(
                      (s) =>
                        s.status === 'current' ||
                        s.status === 'revision' ||
                        s.status === 'rejected'
                    ) || draft.parafFlow[draft.parafFlow.length - 1];
                  const canEditInEditor =
                    hasPermission('draft:edit_content') &&
                    (draft.status === 'Draft' ||
                      draft.status === 'Revisi' ||
                      draft.status === 'Ditolak' ||
                      currentUser.roleId === 'arsiparis');

                  return (
                    <tr
                      key={draft.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="px-6 py-3.5 align-top">
                        <div className="font-mono text-xs font-medium text-[#0F294A] tabular-nums">
                          {draft.letterNumber}
                        </div>
                        <div className="mt-0.5 text-xs text-slate-500">
                          {draft.letterType} · Kode {draft.classificationCode}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 align-top max-w-xs">
                        <div className="font-medium text-slate-900 line-clamp-1">
                          {draft.subject}
                        </div>
                        <div className="mt-0.5 text-xs text-slate-500">
                          {draft.proposingUnit} · {draft.updatedAt}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 align-top">
                        <div className="text-xs font-medium text-slate-800">
                          {currentStep?.roleLabel || '-'}
                        </div>
                        <div className="mt-0.5 text-xs text-slate-500">
                          {currentStep?.officialName || '-'}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 align-top text-right">
                        <span
                          className={`font-mono text-xs font-semibold tabular-nums ${
                            draft.complianceScore >= 90
                              ? 'text-emerald-700'
                              : 'text-amber-700'
                          }`}
                        >
                          {draft.complianceScore}%
                        </span>
                      </td>
                      <td className="px-4 py-3.5 align-top whitespace-nowrap">
                        {renderStatusLabel(draft.status)}
                      </td>
                      <td className="px-6 py-3.5 align-top text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          {canEditInEditor && (
                            <button
                              type="button"
                              onClick={() => onOpenDraftInEditor(draft.id)}
                              className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                            >
                              Sunting
                            </button>
                          )}
                          <PermissionGuard permission="guard:run">
                            <button
                              type="button"
                              onClick={() => onOpenDraftInGuard(draft.id)}
                              className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                            >
                              Guard
                            </button>
                          </PermissionGuard>
                          <button
                            type="button"
                            onClick={() => onOpenDraftInFlow(draft.id)}
                            className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-sky-700 hover:bg-sky-50"
                          >
                            <GitBranch className="h-3 w-3" />
                            <span>Detail Alur</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};
