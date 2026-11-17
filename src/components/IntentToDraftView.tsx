import React, { useState } from 'react';
import {
  Check,
  Code2,
  Download,
  FileCheck2,
  GitBranch,
  Loader2,
  Lock,
  Printer,
  Send,
  ShieldCheck,
  SlidersHorizontal,
} from 'lucide-react';
import { useRole } from '../context/RoleContext';
import { SOTK_UNIT_OPTIONS } from '../data/mockHospitalData';
import { LetterDraft, LetterType, UrgencyLevel } from '../types/sitnde';
import {
  downloadDraftAsDoc,
  generateDraftFromPrompt,
  scanWithBiromaticGuard,
} from '../utils/sitndeEngine';
import { OfficialLetterPaper } from './OfficialLetterPaper';
import { PermissionGuard } from './PermissionGuard';

interface IntentToDraftViewProps {
  activeDraft: LetterDraft;
  onSaveDraft: (draft: LetterDraft) => void;
  onUpdateActiveDraft: (draft: LetterDraft) => void;
  onOpenInGuard: () => void;
  onSubmitToInstallation: (draft: LetterDraft) => void;
  onOpenInFlow: () => void;
}

const PROMPT_PRESETS = [
  {
    label: 'Nota Dinas Termometer Digital',
    prompt:
      'Buatkan nota dinas permohonan pengadaan 3 unit termometer digital untuk ruang rawat inap',
  },
  {
    label: 'Surat Undangan Rapat Akreditasi',
    prompt:
      'Buatkan surat undangan rapat koordinasi persiapan survei akreditasi hari Kamis pukul 09.00 WIB di Aula Lantai 3',
  },
  {
    label: 'Surat Tugas Pelatihan BTCLS IGD',
    prompt:
      'Buatkan surat tugas untuk 2 perawat IGD mengikuti pelatihan kegawatdaruratan BTCLS selama 3 hari',
  },
  {
    label: 'Surat Permohonan Kalibrasi Alat',
    prompt:
      'Buatkan surat permohonan kalibrasi 5 unit ventilator ICU kepada Balai Pengamanan Fasilitas Kesehatan',
  },
];

const PROCESSING_STEPS = [
  'Menganalisis maksud dan entitas kalimat natural...',
  'Mengklasifikasikan jenis naskah dinas & kode arsip TND...',
  'Menyusun narasi formal EYD V & resolusi rute SOTK...',
];

export const IntentToDraftView: React.FC<IntentToDraftViewProps> = ({
  activeDraft,
  onSaveDraft,
  onUpdateActiveDraft,
  onOpenInGuard,
  onSubmitToInstallation,
  onOpenInFlow,
}) => {
  const { currentUser, hasPermission } = useRole();
  const [promptInput, setPromptInput] = useState<string>(
    activeDraft.rawPrompt || PROMPT_PRESETS[0].prompt
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [metaTab, setMetaTab] = useState<'form' | 'json'>('form');
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const guardScan = scanWithBiromaticGuard(activeDraft);

  const isDraftLocked =
    activeDraft.status !== 'Draft' &&
    activeDraft.status !== 'Revisi' &&
    activeDraft.status !== 'Ditolak' &&
    currentUser.roleId !== 'arsiparis';

  const canEditDraftContent =
    hasPermission('draft:edit_content') && !isDraftLocked;

  const canSubmitToInstallation =
    (activeDraft.status === 'Draft' ||
      activeDraft.status === 'Revisi' ||
      activeDraft.status === 'Ditolak') &&
    (currentUser.roleId === 'staf' || hasPermission('workflow:submit'));

  const handleGenerate = () => {
    if (!promptInput.trim() || isGenerating) return;
    setIsGenerating(true);
    setStepIdx(0);

    setTimeout(() => setStepIdx(1), 350);
    setTimeout(() => setStepIdx(2), 700);
    setTimeout(() => {
      const generated = generateDraftFromPrompt(
        promptInput,
        undefined,
        undefined,
        currentUser
      );
      onSaveDraft(generated);
      setIsGenerating(false);
      setSavedNotice(
        'Draf TND berstatus Draft berhasil dibuat dan siap diajukan ke Instalasi.'
      );
      setTimeout(() => setSavedNotice(null), 4000);
    }, 1050);
  };

  const handleSaveManualEdits = () => {
    onSaveDraft({
      ...activeDraft,
      complianceScore: guardScan.complianceScore,
      updatedAt: 'Baru disimpan',
    });
    setSavedNotice('Perubahan draf tersimpan.');
    setTimeout(() => setSavedNotice(null), 3000);
  };

  return (
    <PermissionGuard
      permission="draft:create_ai"
      mode="fallback"
      fallbackMessage="Peran aktif Anda tidak memiliki izin membuat atau menyunting naskah dinas. Silakan buka menu Antrean Persetujuan atau Arsip Surat."
    >
      <div className="space-y-6">
        {/* Natural Language Prompt Input Panel */}
        <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-display text-base font-bold text-[#0F294A]">
                Smart Intent-to-Draft Generator
              </h2>
              <p className="mt-0.5 text-xs text-slate-600">
                Ketikkan maksud surat dalam bahasa sehari-hari. Draf baru akan berstatus <span className="font-semibold">Draft</span> sebelum Anda ajukan ke Kepala Instalasi.
              </p>
            </div>
            <div className="text-xs font-medium text-slate-500 whitespace-nowrap">
              Pengusul: {currentUser.name} ({currentUser.shortRoleLabel})
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-500">
              Contoh cepat:
            </span>
            {PROMPT_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => setPromptInput(preset.prompt)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                  promptInput === preset.prompt
                    ? 'border-sky-600 bg-sky-50 text-sky-800'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <div className="mt-3 flex flex-col gap-3 lg:flex-row">
            <textarea
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              rows={3}
              placeholder="Contoh: Buatkan nota dinas permohonan pengadaan 3 unit termometer digital untuk ruang rawat inap..."
              className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-600/20"
            />
            <div className="flex shrink-0 flex-col justify-between gap-2 lg:w-52">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating || !promptInput.trim()}
                className="inline-flex h-full min-h-[48px] items-center justify-center gap-2 rounded-lg bg-[#0F294A] px-5 py-3 text-sm font-semibold text-white hover:bg-[#163a66] disabled:cursor-not-allowed disabled:opacity-60 transition-colors whitespace-nowrap"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Memproses AI...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Generate Draf TND</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {isGenerating && (
            <div className="mt-4 rounded-lg border border-sky-200 bg-sky-50/80 px-4 py-3">
              <div className="flex items-center justify-between text-xs font-semibold text-[#0F294A]">
                <span>{PROCESSING_STEPS[stepIdx]}</span>
                <span className="font-mono tabular-nums">
                  Tahap {stepIdx + 1}/3
                </span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-sky-200">
                <div
                  className="h-full rounded-full bg-sky-600 transition-all duration-300"
                  style={{ width: `${((stepIdx + 1) / 3) * 100}%` }}
                />
              </div>
            </div>
          )}

          {savedNotice && !isGenerating && (
            <div className="mt-3 flex items-center gap-2 text-xs font-medium text-emerald-700">
              <Check className="h-4 w-4" />
              <span>{savedNotice}</span>
            </div>
          )}
        </section>

        {/* Split Workspace */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 items-start">
          {/* Left Column: Extracted JSON & Metadata Form */}
          <section className="xl:col-span-4 rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3.5">
              <div className="text-sm font-semibold text-[#0F294A]">
                Ekstraksi & Kontrol Alur
              </div>
              <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setMetaTab('form')}
                  className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    metaTab === 'form'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <SlidersHorizontal className="h-3 w-3" />
                  <span>Form TND</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMetaTab('json')}
                  className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    metaTab === 'json'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Code2 className="h-3 w-3" />
                  <span>JSON</span>
                </button>
              </div>
            </div>

            {metaTab === 'form' ? (
              <div className="space-y-4 p-5 text-xs">
                {isDraftLocked && (
                  <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                    <Lock className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
                    <div>
                      <div className="font-semibold">
                        Draf Terkunci ({activeDraft.status})
                      </div>
                      <div className="mt-0.5 text-[11px] text-amber-800">
                        Isi surat dikunci sementara selama berada dalam antrean paraf berjenjang agar integritas persetujuan terjaga.
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-slate-700">
                    Template Master TND
                  </label>
                  <select
                    disabled={!canEditDraftContent}
                    value={activeDraft.letterType}
                    onChange={(e) =>
                      onUpdateActiveDraft({
                        ...activeDraft,
                        letterType: e.target.value as LetterType,
                        extractedJson: {
                          ...activeDraft.extractedJson,
                          jenisSurat: e.target.value as LetterType,
                        },
                      })
                    }
                    className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 disabled:bg-slate-100 focus:border-sky-600 focus:outline-none"
                  >
                    <option value="Nota Dinas">Nota Dinas (TND-ND-01)</option>
                    <option value="Surat Undangan">
                      Surat Undangan (TND-UND-02)
                    </option>
                    <option value="Surat Tugas">Surat Tugas (TND-ST-03)</option>
                    <option value="Surat Permohonan">
                      Surat Permohonan (TND-SP-04)
                    </option>
                    <option value="Surat Edaran">
                      Surat Edaran (TND-SE-05)
                    </option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700">
                      Kode Klasifikasi
                    </label>
                    <input
                      disabled={!canEditDraftContent}
                      type="text"
                      value={activeDraft.classificationCode}
                      onChange={(e) =>
                        onUpdateActiveDraft({
                          ...activeDraft,
                          classificationCode: e.target.value,
                        })
                      }
                      className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs tabular-nums text-slate-900 disabled:bg-slate-100 focus:border-sky-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700">
                      Urgensi / Sifat
                    </label>
                    <select
                      disabled={!canEditDraftContent}
                      value={activeDraft.urgency}
                      onChange={(e) =>
                        onUpdateActiveDraft({
                          ...activeDraft,
                          urgency: e.target.value as UrgencyLevel,
                          extractedJson: {
                            ...activeDraft.extractedJson,
                            urgensi: e.target.value as UrgencyLevel,
                          },
                        })
                      }
                      className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 disabled:bg-slate-100 focus:border-sky-600 focus:outline-none"
                    >
                      <option value="Biasa">Biasa</option>
                      <option value="Penting">Penting</option>
                      <option value="Segera">Segera</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700">
                    Unit Pengusul (SOTK)
                  </label>
                  <select
                    disabled={!canEditDraftContent}
                    value={activeDraft.proposingUnit}
                    onChange={(e) =>
                      onUpdateActiveDraft({
                        ...activeDraft,
                        proposingUnit: e.target.value,
                        extractedJson: {
                          ...activeDraft.extractedJson,
                          unitPengusul: e.target.value,
                        },
                      })
                    }
                    className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 disabled:bg-slate-100 focus:border-sky-600 focus:outline-none"
                  >
                    {SOTK_UNIT_OPTIONS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700">
                    Tujuan Surat
                  </label>
                  <input
                    disabled={!canEditDraftContent}
                    type="text"
                    value={activeDraft.recipient}
                    onChange={(e) =>
                      onUpdateActiveDraft({
                        ...activeDraft,
                        recipient: e.target.value,
                      })
                    }
                    className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 disabled:bg-slate-100 focus:border-sky-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700">
                    Perihal Surat
                  </label>
                  <textarea
                    disabled={!canEditDraftContent}
                    rows={2}
                    value={activeDraft.subject}
                    onChange={(e) =>
                      onUpdateActiveDraft({
                        ...activeDraft,
                        subject: e.target.value,
                      })
                    }
                    className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 disabled:bg-slate-100 focus:border-sky-600 focus:outline-none"
                  />
                </div>

                <div className="border-t border-slate-200 pt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Status Validasi EYD/NIP</span>
                    <span
                      className={`font-semibold tabular-nums ${
                        guardScan.issues.length === 0
                          ? 'text-emerald-700'
                          : 'text-amber-700'
                      }`}
                    >
                      {guardScan.issues.length === 0
                        ? '100% Patuh'
                        : `${guardScan.issues.length} temuan`}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={onOpenInGuard}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
                    >
                      <ShieldCheck className="h-3.5 w-3.5 text-sky-700" />
                      <span>Periksa di Biromatic Guard</span>
                    </button>

                    {canSubmitToInstallation ? (
                      <button
                        type="button"
                        onClick={() => onSubmitToInstallation(activeDraft)}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-800"
                      >
                        <GitBranch className="h-3.5 w-3.5" />
                        <span>Ajukan ke Instalasi</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={onOpenInFlow}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-sky-600 px-3 py-2 text-xs font-semibold text-white hover:bg-sky-700"
                      >
                        <GitBranch className="h-3.5 w-3.5" />
                        <span>Lihat Posisi Paraf ({activeDraft.status})</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-5">
                <div className="mb-2 text-xs font-medium text-slate-500">
                  Ekstraksi JSON Payload (Structured Output):
                </div>
                <pre className="overflow-x-auto rounded-lg bg-slate-900 p-4 font-mono text-[11.5px] leading-relaxed text-sky-200">
                  {JSON.stringify(activeDraft.extractedJson, null, 2)}
                </pre>
              </div>
            )}
          </section>

          {/* Right Column: Official TND Letter Preview */}
          <section className="xl:col-span-8 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
              <div className="text-xs text-slate-600">
                <span className="font-semibold text-[#0F294A]">
                  Pratinjau Kertas TND
                </span>
                <span className="mx-1.5 text-slate-300">·</span>
                <span>
                  {canEditDraftContent
                    ? 'Klik paragraf pada surat untuk menyunting'
                    : 'Mode baca (Read-Only)'}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {canEditDraftContent && (
                  <button
                    type="button"
                    onClick={handleSaveManualEdits}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <FileCheck2 className="h-3.5 w-3.5 text-emerald-700" />
                    <span>Simpan Draf</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => downloadDraftAsDoc(activeDraft)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Unduh DOCX</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#0F294A] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#163a66]"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Cetak / PDF</span>
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-100/80 p-4 sm:p-6">
              <OfficialLetterPaper
                draft={activeDraft}
                editable={canEditDraftContent}
                onUpdateDraft={onUpdateActiveDraft}
              />
            </div>
          </section>
        </div>
      </div>
    </PermissionGuard>
  );
};
