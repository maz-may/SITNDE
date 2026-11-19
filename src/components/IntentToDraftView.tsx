import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  BookOpenCheck,
  Check,
  CheckCircle2,
  Code2,
  Download,
  FileCheck2,
  GitBranch,
  Loader2,
  Lock,
  Plus,
  Printer,
  Search,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Wand2,
} from 'lucide-react';
import { useRole } from '../context/RoleContext';
import { buildSotkParafFlow, SOTK_UNIT_OPTIONS } from '../data/mockHospitalData';
import {
  LetterDraft,
  LetterType,
  OfficialProfile,
  PrecedentDoc,
  UrgencyLevel,
  ValidationIssue,
} from '../types/sitnde';
import {
  apiGenerateIntentDraft,
  apiSearchPrecedents,
  applyAllBiromaticFixes,
  applySingleBiromaticFix,
  downloadDraftAsDoc,
  generateDraftFromPrompt,
  scanWithBiromaticGuard,
} from '../utils/sitndeEngine';
import { OfficialLetterPaper } from './OfficialLetterPaper';
import { PermissionGuard } from './PermissionGuard';

interface IntentToDraftViewProps {
  activeDraft: LetterDraft;
  officials: OfficialProfile[];
  onSaveDraft: (draft: LetterDraft) => Promise<void> | void;
  onUpdateActiveDraft: (draft: LetterDraft) => void;
  onOpenInGuard: () => void;
  onSubmitToInstallation: (draft: LetterDraft) => Promise<void> | void;
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
  'Menganalisis maksud & mengekstrak entitas via Gemini AI...',
  'Mengklasifikasikan jenis naskah dinas & kode arsip TND...',
  'Menyusun narasi formal EYD V & resolusi rute SOTK...',
];

export const IntentToDraftView: React.FC<IntentToDraftViewProps> = ({
  activeDraft,
  officials,
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
  const [inspectorTab, setInspectorTab] = useState<'guard' | 'rag'>('guard');
  const [fontMode, setFontMode] = useState<'sans' | 'serif'>('sans');
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // RAG Precedent Search state
  const [ragQuery, setRagQuery] = useState<string>(activeDraft.subject || '');
  const [precedents, setPrecedents] = useState<
    (PrecedentDoc & { relevancePercent: number })[]
  >([]);
  const [isSearchingRag, setIsSearchingRag] = useState(false);

  const guardScan = scanWithBiromaticGuard(activeDraft, officials);

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

  const runPrecedentSearch = async (queryText: string, type?: LetterType) => {
    setIsSearchingRag(true);
    try {
      const results = await apiSearchPrecedents(queryText, type);
      setPrecedents(results);
    } catch {
      // Keep existing precedents if lookup fails
    } finally {
      setIsSearchingRag(false);
    }
  };

  useEffect(() => {
    setRagQuery(activeDraft.subject);
    runPrecedentSearch(
      `${activeDraft.subject} ${activeDraft.proposingUnit}`,
      activeDraft.letterType
    );
  }, [activeDraft.id, activeDraft.letterType]);

  const handleGenerate = async () => {
    if (!promptInput.trim() || isGenerating) return;
    setIsGenerating(true);
    setAiError(null);
    setSavedNotice(null);
    setStepIdx(0);

    const t1 = setTimeout(() => setStepIdx(1), 500);
    const t2 = setTimeout(() => setStepIdx(2), 1100);

    try {
      const { draft } = await apiGenerateIntentDraft({
        prompt: promptInput.trim(),
        unitName: currentUser.unitName,
        creatorUser: currentUser,
      });
      await onSaveDraft(draft);
      setSavedNotice(
        `Draf TND (${draft.extractedJson.generationEngine || 'gemini-4-hydrogen'}) berhasil dibuat & tersimpan.`
      );
      setTimeout(() => setSavedNotice(null), 5000);
    } catch (err: unknown) {
      setAiError(
        err instanceof Error
          ? err.message
          : 'Gagal menghubungi Gemini AI. Pastikan GEMINI_API_KEY aktif.'
      );
    } finally {
      clearTimeout(t1);
      clearTimeout(t2);
      setIsGenerating(false);
    }
  };

  const handleLocalFallbackGenerate = async () => {
    if (!promptInput.trim()) return;
    setAiError(null);
    const generated = generateDraftFromPrompt(
      promptInput,
      undefined,
      undefined,
      currentUser,
      officials
    );
    await onSaveDraft(generated);
    setSavedNotice(
      'Draf TND dibuat melalui mesin deterministik lokal dan tersimpan.'
    );
    setTimeout(() => setSavedNotice(null), 4000);
  };

  const handleSaveManualEdits = async () => {
    await onSaveDraft({
      ...activeDraft,
      complianceScore: guardScan.complianceScore,
      updatedAt: 'Baru disimpan',
    });
    setSavedNotice('Perubahan draf tersimpan ke server.');
    setTimeout(() => setSavedNotice(null), 3000);
  };

  const handleDownloadDocx = async () => {
    setIsExportingDocx(true);
    try {
      await downloadDraftAsDoc(activeDraft);
    } catch (err: unknown) {
      setAiError(
        err instanceof Error ? err.message : 'Gagal mengekspor dokumen DOCX.'
      );
    } finally {
      setIsExportingDocx(false);
    }
  };

  const handleApplySingleFix = (issue: ValidationIssue) => {
    const updated = applySingleBiromaticFix(activeDraft, issue);
    onUpdateActiveDraft(updated);
  };

  const handleAutoFixAll = () => {
    if (guardScan.issues.length === 0) return;
    const updated = applyAllBiromaticFixes(activeDraft, guardScan.issues);
    onUpdateActiveDraft(updated);
    setSavedNotice(
      `${guardScan.issues.length} temuan EYD V/NIP/UU PDP berhasil diperbaiki otomatis.`
    );
    setTimeout(() => setSavedNotice(null), 3500);
  };

  const handleInsertPrecedent = (doc: PrecedentDoc) => {
    if (!canEditDraftContent) return;
    const insertion = doc.legalBasis
      ? `${doc.legalBasis} ${doc.excerptParagraph}`
      : doc.excerptParagraph;
    const nextParagraphs = [...activeDraft.bodyParagraphs];
    const insertAt = Math.max(1, nextParagraphs.length - 1);
    nextParagraphs.splice(insertAt, 0, insertion);
    onUpdateActiveDraft({
      ...activeDraft,
      bodyParagraphs: nextParagraphs,
      updatedAt: 'Disisipkan dari Preseden Arsip',
    });
    setSavedNotice(`Dasar hukum & paragraf dari ${doc.letterNumber} disisipkan.`);
    setTimeout(() => setSavedNotice(null), 3500);
  };

  const handleUnitChange = (nextUnit: string) => {
    onUpdateActiveDraft({
      ...activeDraft,
      proposingUnit: nextUnit,
      parafFlow: buildSotkParafFlow(
        nextUnit,
        activeDraft.letterType,
        activeDraft.status,
        officials
      ),
      extractedJson: {
        ...activeDraft.extractedJson,
        unitPengusul: nextUnit,
      },
    });
  };

  const handleLetterTypeChange = (nextType: LetterType) => {
    onUpdateActiveDraft({
      ...activeDraft,
      letterType: nextType,
      parafFlow: buildSotkParafFlow(
        activeDraft.proposingUnit,
        nextType,
        activeDraft.status,
        officials
      ),
      extractedJson: {
        ...activeDraft.extractedJson,
        jenisSurat: nextType,
      },
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setAiError(null);
    try {
      await onSubmitToInstallation(activeDraft);
    } catch (err: unknown) {
      setAiError(
        err instanceof Error
          ? err.message
          : 'Gagal mengajukan draf ke alur paraf instalasi.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PermissionGuard
      permission="draft:create_ai"
      mode="fallback"
      fallbackMessage="Peran aktif Anda tidak memiliki izin membuat atau menyunting naskah dinas. Silakan buka menu Antrean Persetujuan atau Arsip Surat."
    >
      <div className="space-y-5">
        {/* Natural Language Prompt Input Panel */}
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-sky-700" />
                <h2 className="font-display text-base font-bold text-[#0F294A]">
                  Smart Intent-to-Draft Generator (Gemini AI)
                </h2>
              </div>
              <p className="mt-0.5 text-xs text-slate-600">
                Ketikkan maksud surat dalam bahasa sehari-hari. AI akan mengekstrak JSON TND, menyusun narasi EYD V, dan menentukan jalur paraf SOTK otomatis.
              </p>
            </div>
            <div className="text-xs font-medium text-slate-500 whitespace-nowrap">
              Pengusul: {currentUser.name} ({currentUser.shortRoleLabel})
            </div>
          </div>

          <div className="mt-3.5 flex flex-wrap items-center gap-2">
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
              rows={2}
              placeholder="Contoh: Buatkan nota dinas permohonan pengadaan 3 unit termometer digital untuk ruang rawat inap..."
              className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-600/20"
            />
            <div className="flex shrink-0 flex-col justify-between gap-2 lg:w-52">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating || !promptInput.trim()}
                className="inline-flex h-full min-h-[44px] items-center justify-center gap-2 rounded-lg bg-[#0F294A] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#163a66] disabled:cursor-not-allowed disabled:opacity-60 transition-colors whitespace-nowrap"
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
            <div className="mt-3 rounded-lg border border-sky-200 bg-sky-50/80 px-4 py-3">
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

          {aiError && !isGenerating && (
            <div className="mt-3 flex flex-col justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-900 sm:flex-row sm:items-center">
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
                <div>
                  <span className="font-semibold">Layanan Gemini AI: </span>
                  <span>{aiError}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLocalFallbackGenerate}
                className="shrink-0 rounded-md border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-800 hover:bg-red-100 whitespace-nowrap"
              >
                Gunakan Generator Deterministik Lokal
              </button>
            </div>
          )}

          {savedNotice && !isGenerating && (
            <div className="mt-3 flex items-center gap-2 text-xs font-medium text-emerald-700">
              <Check className="h-4 w-4" />
              <span>{savedNotice}</span>
            </div>
          )}
        </section>

        {/* Lampiran E: 3-Column Workspace (Left Metadata/SOTK | Center Canvas | Right Inspector) */}
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-12 items-start">
          {/* Column 1 (Left): Metadata Form/JSON + Live SOTK Paraf Routing */}
          <section className="xl:col-span-3 space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                <div className="text-xs font-bold text-[#0F294A]">
                  Parameter TND
                </div>
                <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-0.5">
                  <button
                    type="button"
                    onClick={() => setMetaTab('form')}
                    className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
                      metaTab === 'form'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <SlidersHorizontal className="h-3 w-3" />
                    <span>Form</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMetaTab('json')}
                    className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
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
                <div className="space-y-3.5 p-4 text-xs">
                  {isDraftLocked && (
                    <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-900">
                      <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-700" />
                      <div>
                        <div className="font-semibold">
                          Draf Terkunci ({activeDraft.status})
                        </div>
                        <div className="mt-0.5 text-[11px] text-amber-800">
                          Dikunci selama dalam proses paraf berjenjang.
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
                        handleLetterTypeChange(e.target.value as LetterType)
                      }
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs font-medium text-slate-900 disabled:bg-slate-100 focus:border-sky-600 focus:outline-none"
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

                  <div className="grid grid-cols-2 gap-2.5">
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
                        className="mt-1 w-full rounded-lg border border-slate-300 px-2.5 py-1.5 font-mono text-xs tabular-nums text-slate-900 disabled:bg-slate-100 focus:border-sky-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700">
                        Urgensi
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
                        className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 disabled:bg-slate-100 focus:border-sky-600 focus:outline-none"
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
                      onChange={(e) => handleUnitChange(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-900 disabled:bg-slate-100 focus:border-sky-600 focus:outline-none"
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
                      className="mt-1 w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900 disabled:bg-slate-100 focus:border-sky-600 focus:outline-none"
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
                      className="mt-1 w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900 disabled:bg-slate-100 focus:border-sky-600 focus:outline-none"
                    />
                  </div>

                  <div className="border-t border-slate-200 pt-3 space-y-2">
                    {canSubmitToInstallation ? (
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={handleSubmit}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
                      >
                        {isSubmitting ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <GitBranch className="h-3.5 w-3.5" />
                        )}
                        <span>Ajukan ke Instalasi</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={onOpenInFlow}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-sky-600 px-3 py-2 text-xs font-semibold text-white hover:bg-sky-700"
                      >
                        <GitBranch className="h-3.5 w-3.5" />
                        <span>Posisi Paraf ({activeDraft.status})</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-4">
                  <div className="mb-2 text-[11px] font-medium text-slate-500">
                    Structured JSON Payload:
                  </div>
                  <pre className="max-h-96 overflow-auto rounded-lg bg-slate-900 p-3 font-mono text-[11px] leading-relaxed text-sky-200">
                    {JSON.stringify(activeDraft.extractedJson, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Live SOTK Paraf Routing Recommender */}
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-xs font-bold text-[#0F294A]">
                  Rekomendasi Rute Paraf SOTK
                </h3>
                <button
                  type="button"
                  onClick={onOpenInFlow}
                  className="text-[11px] font-semibold text-sky-700 hover:underline"
                >
                  Detail
                </button>
              </div>
              <div className="mt-3 space-y-2.5">
                {activeDraft.parafFlow.map((step) => (
                  <div
                    key={step.order}
                    className="flex items-start gap-2.5 text-[11px]"
                  >
                    <span
                      className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full font-mono text-[10px] font-bold ${
                        step.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : step.status === 'current'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {step.order}
                    </span>
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-800 truncate">
                        {step.roleLabel}
                        {step.isPltOrPlh && (
                          <span className="ml-1 text-amber-700">
                            ({step.isPltOrPlh})
                          </span>
                        )}
                      </div>
                      <div className="text-slate-500 truncate">
                        {step.officialName}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Column 2 (Center): Official TND Letter Canvas */}
          <section className="xl:col-span-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span className="font-semibold text-[#0F294A]">
                  Pratinjau Kertas TND
                </span>
                <span className="text-slate-300">·</span>
                <div className="inline-flex items-center rounded-md bg-slate-100 p-0.5">
                  <button
                    type="button"
                    onClick={() => setFontMode('sans')}
                    className={`rounded px-2 py-0.5 text-[11px] font-medium ${
                      fontMode === 'sans'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600'
                    }`}
                  >
                    Arial
                  </button>
                  <button
                    type="button"
                    onClick={() => setFontMode('serif')}
                    className={`rounded px-2 py-0.5 text-[11px] font-medium ${
                      fontMode === 'serif'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600'
                    }`}
                  >
                    Serif
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {canEditDraftContent && (
                  <button
                    type="button"
                    onClick={handleSaveManualEdits}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <FileCheck2 className="h-3.5 w-3.5 text-emerald-700" />
                    <span>Simpan</span>
                  </button>
                )}
                <button
                  type="button"
                  disabled={isExportingDocx}
                  onClick={handleDownloadDocx}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                >
                  {isExportingDocx ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Download className="h-3.5 w-3.5" />
                  )}
                  <span>DOCX</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1 rounded-lg bg-[#0F294A] px-2.5 py-1.5 text-xs font-medium text-white hover:bg-[#163a66]"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Cetak</span>
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-100/80 p-3 sm:p-5">
              <OfficialLetterPaper
                draft={activeDraft}
                editable={canEditDraftContent}
                onUpdateDraft={onUpdateActiveDraft}
                highlightIssues={guardScan.issues}
                fontMode={fontMode}
              />
            </div>
          </section>

          {/* Column 3 (Right): Tabbed Inspector (Biromatic Guard & UU PDP | RAG Precedents) */}
          <section className="xl:col-span-4 rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 w-full">
                <button
                  type="button"
                  onClick={() => setInspectorTab('guard')}
                  className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                    inspectorTab === 'guard'
                      ? 'bg-white text-[#0F294A] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-sky-700" />
                  <span>Biromatic ({guardScan.issues.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setInspectorTab('rag')}
                  className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                    inspectorTab === 'rag'
                      ? 'bg-white text-[#0F294A] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <BookOpenCheck className="h-3.5 w-3.5 text-emerald-700" />
                  <span>Preseden RAG ({precedents.length})</span>
                </button>
              </div>
            </div>

            {inspectorTab === 'guard' ? (
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3.5 py-2.5">
                  <div>
                    <div className="text-[11px] font-medium text-slate-500">
                      Kepatuhan EYD V, NIP & UU PDP
                    </div>
                    <div
                      className={`font-display text-xl font-bold tabular-nums ${
                        guardScan.complianceScore >= 90
                          ? 'text-emerald-700'
                          : guardScan.complianceScore >= 75
                          ? 'text-amber-700'
                          : 'text-red-700'
                      }`}
                    >
                      {guardScan.complianceScore}%
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={guardScan.issues.length === 0 || !canEditDraftContent}
                      onClick={handleAutoFixAll}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#0F294A] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#163a66] disabled:opacity-40"
                    >
                      <Wand2 className="h-3.5 w-3.5" />
                      <span>AI Fix Semua</span>
                    </button>
                  </div>
                </div>

                {guardScan.whitelistedTermsFound.length > 0 && (
                  <div className="rounded-lg border border-sky-200 bg-sky-50/70 px-3 py-2 text-[11px] text-sky-900">
                    <span className="font-semibold">Glosarium Medis Diakui: </span>
                    <span className="font-mono">
                      {guardScan.whitelistedTermsFound.join(' · ')}
                    </span>
                  </div>
                )}

                {guardScan.issues.length === 0 ? (
                  <div className="py-6 text-center">
                    <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600" />
                    <div className="mt-2 text-xs font-bold text-slate-900">
                      Naskah Memenuhi Standar TND & UU PDP
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Tidak ditemukan kata tidak baku EYD V, ketidaksesuaian NIP, maupun kebocoran data pasien.
                    </p>
                  </div>
                ) : (
                  <div className="max-h-[420px] divide-y divide-slate-200 overflow-y-auto rounded-lg border border-slate-200">
                    {guardScan.issues.map((issue) => (
                      <div key={issue.id} className="p-3 space-y-2 text-xs">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-1.5">
                            {issue.severity === 'error' ? (
                              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-600" />
                            ) : (
                              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
                            )}
                            <div>
                              <div className="font-semibold text-slate-900">
                                {issue.category === 'pdp'
                                  ? 'Perlindungan Data Pribadi (UU PDP)'
                                  : issue.category === 'eyd'
                                  ? 'Kata Tidak Baku (EYD V)'
                                  : issue.category === 'nip'
                                  ? 'Validasi NIP Master'
                                  : issue.category === 'gelar'
                                  ? 'Gelar Pejabat SIMRS'
                                  : 'Data Wajib Belum Diisi'}
                              </div>
                              <p className="mt-0.5 text-[11px] text-slate-600">
                                {issue.explanation}
                              </p>
                            </div>
                          </div>
                          {canEditDraftContent && (
                            <button
                              type="button"
                              onClick={() => handleApplySingleFix(issue)}
                              className="shrink-0 rounded border border-sky-200 bg-sky-50 px-2 py-1 text-[11px] font-semibold text-sky-800 hover:bg-sky-100"
                            >
                              Perbaiki
                            </button>
                          )}
                        </div>
                        <div className="rounded bg-slate-50 px-2.5 py-1.5 font-mono text-[11px]">
                          <span className="text-red-700 line-through">
                            {issue.originalText}
                          </span>{' '}
                          →{' '}
                          <span className="font-semibold text-emerald-700">
                            {issue.suggestedText}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  onClick={onOpenInGuard}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Buka Layar Penuh Biromatic Guard
                </button>
              </div>
            ) : (
              <div className="p-4 space-y-3.5">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    runPrecedentSearch(ragQuery, activeDraft.letterType);
                  }}
                  className="flex gap-2"
                >
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={ragQuery}
                      onChange={(e) => setRagQuery(e.target.value)}
                      placeholder="Cari preseden surat RSUD..."
                      className="w-full rounded-lg border border-slate-300 py-1.5 pl-8 pr-2.5 text-xs text-slate-900 focus:border-sky-600 focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSearchingRag}
                    className="rounded-lg bg-[#0F294A] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#163a66]"
                  >
                    {isSearchingRag ? '...' : 'Cari'}
                  </button>
                </form>

                <div className="max-h-[460px] space-y-3 overflow-y-auto">
                  {precedents.map((doc) => (
                    <div
                      key={doc.id}
                      className="rounded-lg border border-slate-200 bg-slate-50/50 p-3 space-y-2 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="font-mono text-[11px] font-semibold text-[#0F294A] tabular-nums">
                            {doc.letterNumber} · {doc.letterType}
                          </div>
                          <div className="mt-0.5 font-semibold text-slate-900">
                            {doc.title}
                          </div>
                        </div>
                        <span className="shrink-0 font-mono text-[11px] font-semibold text-emerald-700 tabular-nums">
                          {doc.relevancePercent}% cocok
                        </span>
                      </div>
                      {doc.legalBasis && (
                        <div className="text-[11px] font-medium text-sky-900">
                          Dasar: {doc.legalBasis}
                        </div>
                      )}
                      <p className="text-[11px] leading-relaxed text-slate-600">
                        &ldquo;{doc.excerptParagraph}&rdquo;
                      </p>
                      {canEditDraftContent && (
                        <button
                          type="button"
                          onClick={() => handleInsertPrecedent(doc)}
                          className="inline-flex items-center gap-1 rounded-md border border-sky-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-sky-800 hover:bg-sky-50"
                        >
                          <Plus className="h-3 w-3" />
                          <span>Sisipkan Dasar Hukum & Paragraf</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </PermissionGuard>
  );
};
