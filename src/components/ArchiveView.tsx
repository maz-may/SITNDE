import React, { useState } from 'react';
import {
  CheckCircle2,
  Copy,
  Download,
  Eye,
  Printer,
  Search,
  X,
} from 'lucide-react';
import { DraftStatus, LetterDraft, LetterType } from '../types/sitnde';
import { downloadDraftAsDoc } from '../utils/sitndeEngine';
import { OfficialLetterPaper } from './OfficialLetterPaper';
import { PermissionGuard } from './PermissionGuard';

interface ArchiveViewProps {
  drafts: LetterDraft[];
  onOpenDraft: (draftId: string) => void;
  onDuplicateDraft: (draftId: string) => void;
}

export const ArchiveView: React.FC<ArchiveViewProps> = ({
  drafts,
  onOpenDraft,
  onDuplicateDraft,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'Semua' | LetterType>('Semua');
  const [statusFilter, setStatusFilter] = useState<'Semua' | DraftStatus>('Semua');
  const [previewDraft, setPreviewDraft] = useState<LetterDraft | null>(null);

  const filtered = drafts.filter((d) => {
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      !q ||
      d.subject.toLowerCase().includes(q) ||
      d.letterNumber.toLowerCase().includes(q) ||
      d.proposingUnit.toLowerCase().includes(q) ||
      d.classificationCode.toLowerCase().includes(q);
    const matchesType = typeFilter === 'Semua' || d.letterType === typeFilter;
    const matchesStatus = statusFilter === 'Semua' || d.status === statusFilter;
    return matchesQuery && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Filter & Search Bar */}
      <section className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <h2 className="font-display text-base font-bold text-[#0F294A]">
              Arsip & Riwayat Naskah Dinas RSUD
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Telusuri surat berdasarkan nomor registrasi, kode klasifikasi arsip, jenis naskah, atau unit pengusul.
            </p>
          </div>

          <div className="relative w-full lg:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nomor, perihal, atau unit..."
              className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-sky-600 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
          <div className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1">
            {(
              [
                'Semua',
                'Nota Dinas',
                'Surat Undangan',
                'Surat Tugas',
                'Surat Permohonan',
                'Surat Edaran',
              ] as const
            ).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTypeFilter(t)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                  typeFilter === t
                    ? 'bg-white text-[#0F294A] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as 'Semua' | DraftStatus)
            }
            aria-label="Filter status arsip"
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 focus:border-sky-600 focus:outline-none"
          >
            <option value="Semua">Semua Status</option>
            <option value="Draft">Draft</option>
            <option value="Menunggu Paraf Instalasi">Menunggu Paraf Instalasi</option>
            <option value="Menunggu Paraf Kabid">Menunggu Paraf Kabid</option>
            <option value="Menunggu Verifikasi Wadir">Menunggu Verifikasi Wadir</option>
            <option value="Menunggu TTE Direktur">Menunggu TTE Direktur</option>
            <option value="Selesai / Terbit">Selesai / Terbit</option>
            <option value="Revisi">Revisi</option>
            <option value="Ditolak">Ditolak</option>
          </select>
        </div>
      </section>

      {/* Archive Table */}
      <section className="rounded-xl border border-slate-200 bg-white">
        {filtered.length === 0 ? (
          <div className="p-10 text-center">
            <div className="text-sm font-semibold text-slate-800">
              Tidak ada arsip surat yang cocok
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Coba ubah kata kunci pencarian atau reset filter jenis surat.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setTypeFilter('Semua');
                setStatusFilter('Semua');
              }}
              className="mt-4 rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-semibold text-slate-600">
                  <th className="px-6 py-3">Nomor & Klasifikasi</th>
                  <th className="px-4 py-3">Perihal & Jenis Naskah</th>
                  <th className="px-4 py-3">Unit Pengusul</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filtered.map((draft) => (
                  <tr key={draft.id} className="hover:bg-slate-50/80">
                    <td className="px-6 py-3.5 align-top">
                      <div className="font-mono text-xs font-semibold text-[#0F294A] tabular-nums">
                        {draft.letterNumber}
                      </div>
                      <div className="mt-0.5 text-xs text-slate-500">
                        Kode {draft.classificationCode} · {draft.dateStr}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 align-top max-w-sm">
                      <div className="font-medium text-slate-900">
                        {draft.subject}
                      </div>
                      <div className="mt-0.5 text-xs text-slate-500">
                        {draft.letterType} · Urgensi {draft.urgency}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 align-top text-xs text-slate-700">
                      {draft.proposingUnit}
                    </td>
                    <td className="px-4 py-3.5 align-top whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-semibold ${
                          draft.status === 'Selesai / Terbit'
                            ? 'text-emerald-700'
                            : draft.status === 'Ditolak'
                            ? 'text-red-700'
                            : draft.status.startsWith('Menunggu') || draft.status === 'Revisi'
                            ? 'text-amber-700'
                            : 'text-slate-600'
                        }`}
                      >
                        {draft.status === 'Selesai / Terbit' && (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        )}
                        <span>{draft.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-3.5 align-top text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setPreviewDraft(draft)}
                          className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Pratinjau</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => downloadDraftAsDoc(draft)}
                          className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          title="Unduh DOCX"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </button>
                        <PermissionGuard permission="draft:create_ai">
                          <button
                            type="button"
                            onClick={() => onDuplicateDraft(draft.id)}
                            className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                            title="Duplikasi Draf"
                          >
                            <Copy className="h-3.5 w-3.5" />
                          </button>
                        </PermissionGuard>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Official Letter Preview Modal */}
      {previewDraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="flex max-h-[92vh] w-full max-w-4xl flex-col rounded-xl border border-slate-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3.5">
              <div className="min-w-0">
                <div className="truncate font-display text-sm font-bold text-[#0F294A]">
                  {previewDraft.subject}
                </div>
                <div className="text-xs text-slate-500">
                  {previewDraft.letterNumber} · {previewDraft.letterType}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <PermissionGuard permission="draft:create_ai">
                  <button
                    type="button"
                    onClick={() => {
                      onOpenDraft(previewDraft.id);
                      setPreviewDraft(null);
                    }}
                    className="rounded-lg bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-sky-700"
                  >
                    Buka di Editor
                  </button>
                </PermissionGuard>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Cetak</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDraft(null)}
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  aria-label="Tutup pratinjau"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto bg-slate-100 p-6">
              <OfficialLetterPaper draft={previewDraft} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
