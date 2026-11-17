import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  FileSignature,
  GitBranch,
  Hash,
  History,
  Lock,
  Send,
  XCircle,
} from 'lucide-react';
import { useRole } from '../context/RoleContext';
import { LetterDraft, RoleId } from '../types/sitnde';
import { transitionDraftWorkflow } from '../utils/sitndeEngine';
import { renderStatusLabel } from './DashboardView';
import { OfficialLetterPaper } from './OfficialLetterPaper';
import { PermissionGuard } from './PermissionGuard';

interface DynFlowViewProps {
  drafts: LetterDraft[];
  activeDraft: LetterDraft;
  onSelectDraft: (draftId: string) => void;
  onUpdateDraft: (updated: LetterDraft) => void;
}

function getQueueFilterForRole(roleId: RoleId, draft: LetterDraft): boolean {
  switch (roleId) {
    case 'staf':
      return (
        draft.status === 'Draft' ||
        draft.status === 'Revisi' ||
        draft.status === 'Ditolak'
      );
    case 'ka_instalasi':
      return draft.status === 'Menunggu Paraf Instalasi';
    case 'kabid':
      return draft.status === 'Menunggu Paraf Kabid';
    case 'wadir':
      return draft.status === 'Menunggu Verifikasi Wadir';
    case 'direktur':
      return draft.status === 'Menunggu TTE Direktur';
    case 'arsiparis':
      return draft.status === 'Selesai / Terbit' && !draft.officialNumberAssigned;
    default:
      return false;
  }
}

export const DynFlowView: React.FC<DynFlowViewProps> = ({
  drafts,
  activeDraft,
  onSelectDraft,
  onUpdateDraft,
}) => {
  const { currentUser } = useRole();
  const [queueTab, setQueueTab] = useState<'pending' | 'all'>('pending');
  const [dispositionNote, setDispositionNote] = useState('');
  const [actionToast, setActionToast] = useState<string | null>(null);
  const [showLetterPreview, setShowLetterPreview] = useState(false);

  const pendingQueue = drafts.filter((d) =>
    getQueueFilterForRole(currentUser.roleId, d)
  );
  const displayList = queueTab === 'pending' ? pendingQueue : drafts;

  const isRoleTurnOnActive = getQueueFilterForRole(
    currentUser.roleId,
    activeDraft
  );

  const handleAction = (
    actionType: 'submit' | 'approve' | 'revise' | 'reject' | 'assign_number'
  ) => {
    const updated = transitionDraftWorkflow(
      activeDraft,
      actionType,
      currentUser,
      dispositionNote
    );
    onUpdateDraft(updated);
    setDispositionNote('');
    setActionToast(
      `Status diperbarui menjadi "${updated.status}" oleh ${currentUser.shortRoleLabel}.`
    );
    setTimeout(() => setActionToast(null), 4000);
  };

  const flow = activeDraft.parafFlow;

  return (
    <div className="space-y-6">
      {/* Top Role Queue & View Switcher */}
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <div className="flex items-center gap-2">
              <GitBranch className="h-5 w-5 text-[#0F294A]" />
              <h2 className="font-display text-base font-bold text-[#0F294A]">
                {currentUser.roleId === 'ka_instalasi' ||
                currentUser.roleId === 'kabid'
                  ? `Antrean Paraf (${currentUser.shortRoleLabel})`
                  : currentUser.roleId === 'direktur'
                  ? 'Antrean TTE (Signing Queue Direktur)'
                  : currentUser.roleId === 'arsiparis'
                  ? 'Registrasi & Penomoran Surat Resmi (Tata Usaha)'
                  : currentUser.roleId === 'wadir'
                  ? 'Antrean Verifikasi Strategis (Wakil Direktur)'
                  : 'Alur Pengajuan & Paraf Berjenjang (DynFlow-SOTK)'}
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-600">
              {currentUser.roleId === 'staf'
                ? 'Pantau posisi surat Anda di meja pejabat pemaraf. Surat berstatus Draft/Ditolak dapat diajukan kembali.'
                : 'Pilih surat dari antrean di bawah ini untuk melakukan pemeriksaan dan mengeksekusi kewenangan persetujuan sesuai SOTK.'}
            </p>
          </div>

          <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 shrink-0">
            <button
              type="button"
              onClick={() => setQueueTab('pending')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                queueTab === 'pending'
                  ? 'bg-white text-[#0F294A] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {currentUser.roleId === 'staf'
                ? `Siap Diajukan (${pendingQueue.length})`
                : `Antrean Anda (${pendingQueue.length})`}
            </button>
            <button
              type="button"
              onClick={() => setQueueTab('all')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                queueTab === 'all'
                  ? 'bg-white text-[#0F294A] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua Surat ({drafts.length})
            </button>
          </div>
        </div>

        {/* Selectable Queue List */}
        <div className="mt-4 divide-y divide-slate-200 rounded-lg border border-slate-200">
          {displayList.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              Tidak ada surat yang menunggu tindakan pada antrean{' '}
              <span className="font-semibold text-slate-700">
                {currentUser.shortRoleLabel}
              </span>{' '}
              saat ini. Beralihlah ke tab &ldquo;Semua Surat&rdquo; atau ganti role di bilah atas untuk menguji tahap lainnya.
            </div>
          ) : (
            displayList.map((d) => {
              const isSelected = d.id === activeDraft.id;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => onSelectDraft(d.id)}
                  className={`flex w-full flex-col justify-between gap-2 px-4 py-3 text-left transition-colors sm:flex-row sm:items-center ${
                    isSelected ? 'bg-sky-50/80' : 'bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="font-mono font-semibold text-[#0F294A] tabular-nums">
                        {d.letterNumber}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{d.letterType}</span>
                      <span aria-hidden="true">·</span>
                      <span>{d.proposingUnit}</span>
                    </div>
                    <div className="mt-0.5 truncate text-sm font-semibold text-slate-900">
                      {d.subject}
                    </div>
                  </div>
                  <div className="shrink-0">{renderStatusLabel(d.status)}</div>
                </button>
              );
            })
          )}
        </div>
      </section>

      {actionToast && (
        <div className="flex items-center gap-2.5 rounded-xl border border-emerald-300 bg-emerald-50 px-5 py-3 text-xs font-semibold text-emerald-900">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-700" />
          <span>{actionToast}</span>
        </div>
      )}

      {/* 6-Stage Progress Stepper */}
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs text-slate-500">
              {activeDraft.letterNumber} · {activeDraft.letterType} ·{' '}
              {activeDraft.proposingUnit}
            </div>
            <h3 className="font-display text-base font-bold text-[#0F294A]">
              {activeDraft.subject}
            </h3>
          </div>
          <div className="flex items-center gap-3">
            {renderStatusLabel(activeDraft.status)}
            <button
              type="button"
              onClick={() => setShowLetterPreview(!showLetterPreview)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              {showLetterPreview ? 'Sembunyikan Surat' : 'Lihat Naskah Resmi'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-6">
          {flow.map((step, index) => {
            const isDone = step.status === 'completed';
            const isCurrent = step.status === 'current';
            const isRevision = step.status === 'revision';
            const isRejected = step.status === 'rejected';

            return (
              <div
                key={step.order}
                className={`relative flex flex-col justify-between rounded-xl border p-3.5 transition-colors ${
                  isDone
                    ? 'border-emerald-300 bg-emerald-50/60'
                    : isCurrent
                    ? 'border-amber-400 bg-amber-50/70'
                    : isRevision || isRejected
                    ? 'border-red-300 bg-red-50/70'
                    : 'border-slate-200 bg-slate-50/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-mono text-[11px] font-bold text-slate-500 tabular-nums">
                      0{step.order}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                        isDone
                          ? 'text-emerald-700'
                          : isCurrent
                          ? 'text-amber-800'
                          : isRevision || isRejected
                          ? 'text-red-700'
                          : 'text-slate-500'
                      }`}
                    >
                      {isDone && <CheckCircle2 className="h-3.5 w-3.5" />}
                      {isCurrent && <Clock className="h-3.5 w-3.5" />}
                      {(isRevision || isRejected) && (
                        <XCircle className="h-3.5 w-3.5" />
                      )}
                      <span>
                        {isDone
                          ? 'Selesai'
                          : isCurrent
                          ? 'Aktif'
                          : isRevision
                          ? 'Revisi'
                          : isRejected
                          ? 'Ditolak'
                          : 'Pending'}
                      </span>
                    </span>
                  </div>

                  <div className="mt-2.5 font-display text-xs font-bold text-[#0F294A]">
                    {step.roleLabel}
                  </div>
                  <div className="mt-0.5 text-[11px] text-slate-600 line-clamp-1">
                    {step.unitName}
                  </div>
                </div>

                <div className="mt-3 border-t border-slate-200/80 pt-2.5">
                  <div className="text-[11px] font-semibold text-slate-900 line-clamp-1">
                    {step.officialName}
                  </div>
                  <div className="mt-0.5 font-mono text-[10px] text-slate-500 tabular-nums">
                    NIP {step.officialNip}
                  </div>
                  {step.timestamp && (
                    <div className="mt-1 text-[10px] text-slate-500">
                      {step.timestamp}
                    </div>
                  )}
                </div>

                {index < flow.length - 1 && (
                  <div
                    className="hidden xl:flex absolute -right-2.5 top-1/2 z-10 h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400"
                    aria-hidden="true"
                  >
                    <ArrowRight className="h-3 w-3" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Optional Collapsible Official Letter Paper */}
        {showLetterPreview && (
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-100/80 p-4 sm:p-6">
            <OfficialLetterPaper draft={activeDraft} />
          </div>
        )}
      </section>

      {/* RBAC Action Console for Active Draft */}
      <section className="rounded-xl border border-slate-200 bg-white p-6">
        {!isRoleTurnOnActive ? (
          <div className="flex items-start gap-3">
            <Lock className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
            <div>
              <h4 className="font-display text-sm font-bold text-[#0F294A]">
                Tidak Ada Aksi Kewenangan untuk {currentUser.shortRoleLabel} pada Surat Ini
              </h4>
              <p className="mt-0.5 text-xs text-slate-600">
                Status surat saat ini adalah{' '}
                <span className="font-semibold text-slate-900">
                  {activeDraft.status}
                </span>
                {activeDraft.status === 'Selesai / Terbit' &&
                activeDraft.officialNumberAssigned
                  ? ' dan sudah mendapatkan nomor surat resmi serta diarsipkan.'
                  : '. Sesuai prinsip RBAC anti-bypass birokrasi, hanya pejabat pada jenjang aktif yang dapat mengeksekusi persetujuan/penomoran.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h4 className="font-display text-sm font-bold text-[#0F294A]">
                Panel Eksekusi Kewenangan: {currentUser.roleLabel}
              </h4>
              <p className="mt-0.5 text-xs text-slate-600">
                Tindakan Anda akan tercatat secara permanen pada Audit Trail dengan identitas{' '}
                <span className="font-semibold">{currentUser.name}</span> (NIP{' '}
                <span className="font-mono">{currentUser.nip}</span>).
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Catatan Disposisi / Keterangan (Opsional untuk Setujui, Wajib jika Revisi/Tolak)
              </label>
              <textarea
                rows={2}
                value={dispositionNote}
                onChange={(e) => setDispositionNote(e.target.value)}
                placeholder="Tuliskan catatan pemeriksaan atau arahan disposisi..."
                className="mt-1.5 w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-sky-600 focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Staf Submit Button */}
              <PermissionGuard allowedRoles={['staf']}>
                <button
                  type="button"
                  onClick={() => handleAction('submit')}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#0F294A] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#163a66]"
                >
                  <Send className="h-4 w-4" />
                  <span>Ajukan ke Instalasi</span>
                </button>
              </PermissionGuard>

              {/* Verifiers (Ka. Instalasi, Kabid, Wadir) */}
              <PermissionGuard
                allowedRoles={['ka_instalasi', 'kabid', 'wadir']}
              >
                <button
                  type="button"
                  onClick={() => handleAction('approve')}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-800"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>
                    {currentUser.roleId === 'ka_instalasi'
                      ? 'Setujui & Paraf Teknis'
                      : currentUser.roleId === 'kabid'
                      ? 'Setujui & Paraf Struktural'
                      : 'Verifikasi Kebijakan'}
                  </span>
                </button>
              </PermissionGuard>

              {/* Direktur Final TTE */}
              <PermissionGuard permission="document:sign_tte">
                <button
                  type="button"
                  onClick={() => handleAction('approve')}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-800"
                >
                  <FileSignature className="h-4 w-4" />
                  <span>Tanda Tangan Elektronik (TTE)</span>
                </button>
              </PermissionGuard>

              {/* Revise / Reject buttons for Verifiers & Direktur */}
              <PermissionGuard
                allowedRoles={['ka_instalasi', 'kabid', 'wadir', 'direktur']}
              >
                <button
                  type="button"
                  onClick={() => handleAction('revise')}
                  className="inline-flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2.5 text-xs font-semibold text-amber-900 hover:bg-amber-100"
                >
                  <AlertTriangle className="h-4 w-4" />
                  <span>Revisi</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAction('reject')}
                  className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-semibold text-red-800 hover:bg-red-100"
                >
                  <XCircle className="h-4 w-4" />
                  <span>Tolak</span>
                </button>
              </PermissionGuard>

              {/* Arsiparis Official Numbering & Auto-Archive */}
              <PermissionGuard permission="document:assign_number">
                <button
                  type="button"
                  onClick={() => handleAction('assign_number')}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#0F294A] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#163a66]"
                >
                  <Hash className="h-4 w-4" />
                  <span>Generate Nomor Surat Resmi & Arsip Otomatis</span>
                </button>
              </PermissionGuard>
            </div>
          </div>
        )}
      </section>

      {/* Immutable Audit Trail Timeline for Active Letter */}
      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center gap-2 border-b border-slate-200 px-6 py-4">
          <History className="h-4 w-4 text-[#0F294A]" />
          <h4 className="font-display text-sm font-bold text-[#0F294A]">
            Riwayat Audit Trail Naskah Dinas ({activeDraft.auditTrail.length})
          </h4>
        </div>

        <div className="divide-y divide-slate-200">
          {activeDraft.auditTrail.map((log) => (
            <div
              key={log.id}
              className="flex flex-col justify-between gap-2 px-6 py-3.5 sm:flex-row sm:items-start"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-semibold text-[#0F294A]">
                    {log.action}
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="text-slate-600">
                    {log.fromStatus} →{' '}
                    <span className="font-semibold text-slate-900">
                      {log.toStatus}
                    </span>
                  </span>
                </div>
                <div className="text-xs text-slate-600">
                  Pejabat: <span className="font-medium">{log.actorName}</span>{' '}
                  ({log.actorRole}) ·{' '}
                  <span className="font-mono tabular-nums">
                    NIP {log.actorNip}
                  </span>
                </div>
                {log.note && (
                  <div className="text-xs italic text-slate-700">
                    &ldquo;{log.note}&rdquo;
                  </div>
                )}
              </div>
              <div className="shrink-0 font-mono text-[11px] text-slate-500 tabular-nums">
                {log.timestamp}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
