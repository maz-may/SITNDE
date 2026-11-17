import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  FlaskConical,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Wand2,
} from 'lucide-react';
import { LetterDraft, OfficialProfile, ValidationIssue } from '../types/sitnde';
import {
  applyAllBiromaticFixes,
  applySingleBiromaticFix,
  scanWithBiromaticGuard,
} from '../utils/sitndeEngine';
import { OfficialLetterPaper } from './OfficialLetterPaper';
import { PermissionGuard } from './PermissionGuard';

interface BiromaticGuardViewProps {
  drafts: LetterDraft[];
  activeDraft: LetterDraft;
  officials: OfficialProfile[];
  onSelectDraft: (draftId: string) => void;
  onUpdateDraft: (updated: LetterDraft) => Promise<void> | void;
}

export const BiromaticGuardView: React.FC<BiromaticGuardViewProps> = ({
  drafts,
  activeDraft,
  officials,
  onSelectDraft,
  onUpdateDraft,
}) => {
  const [editMode, setEditMode] = useState<'highlight' | 'raw'>('highlight');
  const [fixBanner, setFixBanner] = useState<string | null>(null);

  const { issues, complianceScore, whitelistedTermsFound } =
    scanWithBiromaticGuard(activeDraft, officials);

  const handleApplySingle = async (issue: ValidationIssue) => {
    const updated = applySingleBiromaticFix(activeDraft, issue);
    await onUpdateDraft(updated);
  };

  const handleAutoFixAll = async () => {
    if (issues.length === 0) return;
    const fixedCount = issues.length;
    const updated = applyAllBiromaticFixes(activeDraft, issues);
    await onUpdateDraft(updated);
    setFixBanner(
      `${fixedCount} temuan ejaan baku EYD V, NIP/gelar, dan proteksi UU PDP berhasil diperbaiki otomatis.`
    );
    setTimeout(() => setFixBanner(null), 4000);
  };

  const handleInjectSampleIssues = async () => {
    const sampleFaulty: LetterDraft = {
      ...activeDraft,
      bodyParagraphs: [
        'Dengan hormat, kami sampaikan bahwa nomer inventaris peralatan medis pada ruang rawat inap perlu dilakukan penyesuaian dan kami bermaksud untuk rubah jadwal kalibrasi berkala alat IGD.',
        'Agar kwalitas pelayanan apotik serta sistim pencatatan tetap terjaga sesuai standart akreditasi rumah sakit, dimohon tindak lanjut segera. Atas perhatiannya kami ucapkan terimakasih.',
      ],
      signerName: 'Ns. Ratna Sari Dewi, S.Kep, M.Kep',
      signerNip: '1985071920100120',
      updatedAt: 'Simulasi uji typo & NIP',
    };
    const rescanned = scanWithBiromaticGuard(sampleFaulty, officials);
    await onUpdateDraft({
      ...sampleFaulty,
      complianceScore: rescanned.complianceScore,
    });
    setEditMode('highlight');
  };

  const handleInjectPdpSample = async () => {
    const samplePdp: LetterDraft = {
      ...activeDraft,
      bodyParagraphs: [
        'Dengan hormat, sehubungan dengan rujukan pelayanan pada instalasi IGD dan SIMRS terpadu, kami laporkan kendala klaim atas pasien a.n. Budi Santoso dengan NIK 3273011205880004 dan No. RM: 00481922.',
        'Mohon arahan tindak lanjut verifikasi administrasi tanpa kendala. Atas perhatian Bapak/Ibu, kami ucapkan terima kasih.',
      ],
      updatedAt: 'Simulasi uji UU PDP Guard',
    };
    const rescanned = scanWithBiromaticGuard(samplePdp, officials);
    await onUpdateDraft({
      ...samplePdp,
      complianceScore: rescanned.complianceScore,
    });
    setEditMode('highlight');
  };

  return (
    <PermissionGuard
      permission="guard:run"
      mode="fallback"
      fallbackMessage="Modul Biromatic Guard hanya dapat dijalankan oleh Konseptor, Kepala Unit/Bidang, dan Bagian Tata Usaha."
    >
      <div className="space-y-6">
        {/* Guard Control Header */}
        <section className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 lg:flex-row lg:items-center">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[#0F294A]" />
              <h2 className="font-display text-base font-bold text-[#0F294A]">
                Biromatic Guard — Validator EYD V, NIP Pejabat & UU PDP
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-600">
              Pemindaian real-time kata tidak baku (<span className="font-mono">nomer</span>, <span className="font-mono">rubah</span>, <span className="font-mono">apotik</span>), validasi NIP 18 digit SIMRS, glosarium medis RS, serta deteksi data pribadi pasien (NIK / No. RM).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <select
              value={activeDraft.id}
              onChange={(e) => onSelectDraft(e.target.value)}
              aria-label="Pilih draf untuk diperiksa"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-sky-600 focus:outline-none max-w-[220px]"
            >
              {drafts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.letterNumber} — {d.subject.slice(0, 30)}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleInjectSampleIssues}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 whitespace-nowrap"
            >
              <FlaskConical className="h-3.5 w-3.5 text-amber-600" />
              <span>Uji Typo & NIP</span>
            </button>

            <button
              type="button"
              onClick={handleInjectPdpSample}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 whitespace-nowrap"
            >
              <ShieldAlert className="h-3.5 w-3.5 text-red-600" />
              <span>Uji UU PDP</span>
            </button>

            <button
              type="button"
              onClick={handleAutoFixAll}
              disabled={issues.length === 0}
              className="inline-flex items-center gap-2 rounded-lg bg-[#0F294A] px-4 py-2 text-xs font-semibold text-white hover:bg-[#163a66] disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap"
            >
              <Wand2 className="h-3.5 w-3.5" />
              <span>Perbaiki Otomatis (AI Fix)</span>
            </button>
          </div>
        </section>

        {fixBanner && (
          <div className="flex items-center gap-2.5 rounded-xl border border-emerald-300 bg-emerald-50 px-5 py-3.5 text-xs font-semibold text-emerald-900">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-700" />
            <span>{fixBanner}</span>
          </div>
        )}

        {/* Split Screen: Left Highlighted Paper / Editable Text | Right Issue List */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 items-start">
          <section className="xl:col-span-7 space-y-3">
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
              <div className="text-xs font-semibold text-[#0F294A]">
                Pratinjau Pemindaian Naskah Dinas
              </div>
              <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setEditMode('highlight')}
                  className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                    editMode === 'highlight'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Mode Sorot Kesalahan
                </button>
                <button
                  type="button"
                  onClick={() => setEditMode('raw')}
                  className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                    editMode === 'raw'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sunting Teks & NIP
                </button>
              </div>
            </div>

            {editMode === 'highlight' ? (
              <div className="rounded-xl border border-slate-200 bg-slate-100/80 p-4 sm:p-6">
                <OfficialLetterPaper
                  draft={activeDraft}
                  highlightIssues={issues}
                />
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Isi Paragraf Surat (Ketik kata seperti &quot;nomer&quot;, &quot;rubah&quot;, atau NIK 16 digit untuk menguji deteksi)
                  </label>
                  <div className="mt-2 space-y-3">
                    {activeDraft.bodyParagraphs.map((p, idx) => (
                      <textarea
                        key={idx}
                        rows={3}
                        value={p}
                        onChange={(e) => {
                          const next = [...activeDraft.bodyParagraphs];
                          next[idx] = e.target.value;
                          const updated = { ...activeDraft, bodyParagraphs: next };
                          const scan = scanWithBiromaticGuard(updated, officials);
                          onUpdateDraft({
                            ...updated,
                            complianceScore: scan.complianceScore,
                          });
                        }}
                        className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-sky-600 focus:outline-none"
                      />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 border-t border-slate-200 pt-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">
                      Nama & Gelar Pejabat Penandatangan
                    </label>
                    <input
                      type="text"
                      value={activeDraft.signerName}
                      onChange={(e) => {
                        const updated = {
                          ...activeDraft,
                          signerName: e.target.value,
                        };
                        const scan = scanWithBiromaticGuard(updated, officials);
                        onUpdateDraft({
                          ...updated,
                          complianceScore: scan.complianceScore,
                        });
                      }}
                      className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-sky-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">
                      NIP Pejabat (18 Digit Baku)
                    </label>
                    <input
                      type="text"
                      value={activeDraft.signerNip}
                      onChange={(e) => {
                        const updated = {
                          ...activeDraft,
                          signerNip: e.target.value,
                        };
                        const scan = scanWithBiromaticGuard(updated, officials);
                        onUpdateDraft({
                          ...updated,
                          complianceScore: scan.complianceScore,
                        });
                      }}
                      className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs tabular-nums text-slate-900 focus:border-sky-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Right Panel: Findings & Compliance Score */}
          <section className="xl:col-span-5 space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-slate-500">
                    Skor Kepatuhan Biromatic Guard
                  </div>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span
                      className={`font-display text-3xl font-bold tabular-nums ${
                        complianceScore >= 90
                          ? 'text-emerald-700'
                          : complianceScore >= 75
                          ? 'text-amber-700'
                          : 'text-red-700'
                      }`}
                    >
                      {complianceScore}%
                    </span>
                    <span className="text-xs font-medium text-slate-600">
                      {issues.length === 0
                        ? 'Bebas kesalahan ejaan, NIP & UU PDP'
                        : `${issues.length} temuan terdeteksi`}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setEditMode(editMode === 'highlight' ? 'raw' : 'highlight')
                  }
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>
                    {editMode === 'highlight' ? 'Sunting Manual' : 'Lihat Sorotan'}
                  </span>
                </button>
              </div>

              {whitelistedTermsFound.length > 0 && (
                <div className="rounded-lg border border-sky-200 bg-sky-50/70 px-3.5 py-2 text-xs text-sky-900">
                  <span className="font-semibold">
                    Glosarium Medis RSUD Diakui (Whitelist):{' '}
                  </span>
                  <span className="font-mono text-[11px]">
                    {whitelistedTermsFound.join(' · ')}
                  </span>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 bg-white">
              <div className="border-b border-slate-200 px-5 py-3.5">
                <h3 className="font-display text-sm font-bold text-[#0F294A]">
                  Daftar Temuan Validasi ({issues.length})
                </h3>
              </div>

              {issues.length === 0 ? (
                <div className="p-8 text-center">
                  <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
                  <div className="mt-3 font-display text-sm font-bold text-slate-900">
                    Naskah Dinas Lolos Pemeriksaan Biromatic Guard
                  </div>
                  <p className="mt-1 text-xs text-slate-600">
                    Seluruh kosakata telah sesuai kaidah EYD V, bebas kebocoran data pasien (UU PDP), dan NIP cocok dengan master kepegawaian RSUD.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-200">
                  {issues.map((issue) => {
                    const isError = issue.severity === 'error';
                    return (
                      <div key={issue.id} className="p-4 space-y-2.5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2">
                            {isError ? (
                              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                            ) : (
                              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                            )}
                            <div>
                              <div className="text-xs font-semibold text-slate-900">
                                {issue.category === 'eyd'
                                  ? 'Kata Tidak Baku (EYD V)'
                                  : issue.category === 'nip'
                                  ? 'Validasi NIP Pejabat'
                                  : issue.category === 'gelar'
                                  ? 'Format Gelar Master Kepegawaian'
                                  : issue.category === 'pdp'
                                  ? 'Perlindungan Data Pribadi (UU PDP)'
                                  : 'Data Wajib Belum Terisi'}
                              </div>
                              <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
                                {issue.explanation}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleApplySingle(issue)}
                            className="shrink-0 rounded-md border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-800 hover:bg-sky-100"
                          >
                            Terapkan
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-xs">
                          <span className="font-mono text-red-700 line-through">
                            {issue.originalText}
                          </span>
                          <span className="text-slate-400">→</span>
                          <span className="font-mono font-semibold text-emerald-700">
                            {issue.suggestedText}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </PermissionGuard>
  );
};
