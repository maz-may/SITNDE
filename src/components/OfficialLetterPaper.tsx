import React from 'react';
import { HOSPITAL_INFO } from '../data/mockHospitalData';
import { LetterDraft, ValidationIssue } from '../types/sitnde';

interface OfficialLetterPaperProps {
  draft: LetterDraft;
  editable?: boolean;
  onUpdateDraft?: (updated: LetterDraft) => void;
  highlightIssues?: ValidationIssue[];
  fontMode?: 'sans' | 'serif';
}

function renderHighlightedText(text: string, issues: ValidationIssue[] = []) {
  const activeIssues = issues.filter((i) => !i.fixed && i.field === 'body');
  if (activeIssues.length === 0) return text;

  const terms = activeIssues.map((i) => i.originalText).filter(Boolean);
  if (terms.length === 0) return text;

  const escaped = terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex = new RegExp(`(${escaped.join('|')})`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, idx) => {
    const matched = activeIssues.find(
      (iss) => iss.originalText.toLowerCase() === part.toLowerCase()
    );
    if (!matched) return <React.Fragment key={idx}>{part}</React.Fragment>;

    const isError = matched.severity === 'error';
    return (
      <mark
        key={idx}
        title={`${matched.originalText} → Saran: ${matched.suggestedText}`}
        className={`rounded px-1 py-0.5 font-medium underline decoration-wavy ${
          isError
            ? 'bg-red-100 text-red-900 decoration-red-600'
            : 'bg-amber-100 text-amber-900 decoration-amber-600'
        }`}
      >
        {part}
      </mark>
    );
  });
}

export const OfficialLetterPaper: React.FC<OfficialLetterPaperProps> = ({
  draft,
  editable = false,
  onUpdateDraft,
  highlightIssues = [],
  fontMode = 'sans',
}) => {
  const handleParagraphChange = (index: number, value: string) => {
    if (!onUpdateDraft) return;
    const nextParagraphs = [...draft.bodyParagraphs];
    nextParagraphs[index] = value;
    onUpdateDraft({
      ...draft,
      bodyParagraphs: nextParagraphs,
      updatedAt: 'Baru disunting',
    });
  };

  const isCompletedTte = draft.tteSigned || draft.status === 'Selesai / Terbit';
  const nipHasIssue = highlightIssues.some(
    (i) => !i.fixed && i.field === 'signerNip'
  );
  const nameHasIssue = highlightIssues.some(
    (i) => !i.fixed && i.field === 'signerName'
  );

  const fontStyle =
    fontMode === 'serif'
      ? '"Source Serif 4", Georgia, serif'
      : '"Public Sans", Arial, sans-serif';

  return (
    <div
      id="tnd-printable-paper"
      className="mx-auto w-full max-w-[780px] rounded-sm border border-slate-300 bg-white px-7 py-8 text-slate-900 shadow-sm sm:px-11 sm:py-10"
      style={{ fontFamily: fontStyle }}
    >
      {/* Kop Surat Resmi Instansi Pemerintah / RSUD */}
      <div className="flex items-center gap-4 border-b-[3px] border-double border-slate-900 pb-4">
        <div className="flex h-15 w-15 shrink-0 items-center justify-center text-slate-900">
          <svg viewBox="0 0 64 64" fill="none" className="h-14 w-14">
            <path
              d="M32 6L52 14V30C52 43 43.5 53.5 32 58C20.5 53.5 12 43 12 30V14L32 6Z"
              stroke="currentColor"
              strokeWidth="2.5"
              fill="#F8FAFC"
            />
            <path
              d="M32 18V42M20 30H44"
              stroke="#0F294A"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <circle
              cx="32"
              cy="30"
              r="14"
              stroke="#0F294A"
              strokeWidth="1.2"
              strokeDasharray="2 2"
            />
          </svg>
        </div>
        <div className="flex-1 text-center leading-tight">
          <div className="text-[11px] font-bold tracking-wider text-slate-800 uppercase">
            {HOSPITAL_INFO.pemda}
          </div>
          <div className="text-[11px] font-bold tracking-wider text-slate-800 uppercase">
            {HOSPITAL_INFO.dinas}
          </div>
          <div className="mt-0.5 text-sm font-bold tracking-wide text-slate-950 uppercase sm:text-base">
            {HOSPITAL_INFO.name}
          </div>
          <div className="mt-1 text-[10.5px] text-slate-700">
            {HOSPITAL_INFO.address}
          </div>
          <div className="text-[10px] text-slate-600">
            {HOSPITAL_INFO.contact}
          </div>
        </div>
      </div>

      {/* Struktur Kepala Naskah Dinas */}
      {draft.letterType === 'Nota Dinas' ? (
        <div className="mt-5">
          <div className="text-center text-sm font-bold tracking-wider text-slate-950 underline underline-offset-4">
            NOTA DINAS
          </div>

          <div className="mt-4 grid grid-cols-[95px_12px_1fr] gap-y-1.5 border-b border-slate-800 pb-3 text-[12.5px]">
            <span className="font-medium">Kepada Yth.</span>
            <span>:</span>
            {editable && onUpdateDraft ? (
              <input
                type="text"
                value={draft.recipient}
                onChange={(e) =>
                  onUpdateDraft({ ...draft, recipient: e.target.value })
                }
                className="w-full rounded border border-transparent bg-slate-50/70 px-1.5 py-0.5 text-[12.5px] focus:border-sky-400 focus:bg-white focus:outline-none"
              />
            ) : (
              <span>{draft.recipient}</span>
            )}

            <span className="font-medium">Dari</span>
            <span>:</span>
            <span>{draft.sender}</span>

            <span className="font-medium">Tanggal</span>
            <span>:</span>
            <span>{draft.dateStr}</span>

            <span className="font-medium">Nomor</span>
            <span>:</span>
            <span className="font-mono text-xs tabular-nums">
              {draft.letterNumber}
            </span>

            <span className="font-medium">Sifat</span>
            <span>:</span>
            <span>{draft.urgency}</span>

            <span className="font-medium">Lampiran</span>
            <span>:</span>
            <span>{draft.attachment}</span>

            <span className="font-medium">Hal</span>
            <span>:</span>
            {editable && onUpdateDraft ? (
              <input
                type="text"
                value={draft.subject}
                onChange={(e) =>
                  onUpdateDraft({ ...draft, subject: e.target.value })
                }
                className="w-full rounded border border-transparent bg-slate-50/70 px-1.5 py-0.5 text-[12.5px] font-semibold focus:border-sky-400 focus:bg-white focus:outline-none"
              />
            ) : (
              <span className="font-semibold">{draft.subject}</span>
            )}
          </div>
        </div>
      ) : draft.letterType === 'Surat Tugas' ||
        draft.letterType === 'Surat Edaran' ? (
        <div className="mt-5">
          <div className="text-center">
            <div className="text-sm font-bold tracking-wider text-slate-950 underline underline-offset-4 uppercase">
              {draft.letterType}
            </div>
            <div className="mt-1 font-mono text-xs text-slate-800 tabular-nums">
              NOMOR: {draft.letterNumber}
            </div>
            {draft.letterType === 'Surat Edaran' && (
              <div className="mt-2 text-[12.5px] font-semibold uppercase">
                TENTANG: {draft.subject}
              </div>
            )}
          </div>
          <div className="mt-4 border-b border-slate-300 pb-2 text-[12.5px]">
            <span className="font-semibold">Hal: </span>
            <span>{draft.subject}</span>
          </div>
        </div>
      ) : (
        <div className="mt-5">
          <div className="flex flex-col justify-between gap-3 sm:flex-row">
            <div className="grid grid-cols-[75px_12px_1fr] gap-y-1 text-[12.5px]">
              <span>Nomor</span>
              <span>:</span>
              <span className="font-mono text-xs tabular-nums">
                {draft.letterNumber}
              </span>
              <span>Sifat</span>
              <span>:</span>
              <span>{draft.urgency}</span>
              <span>Lampiran</span>
              <span>:</span>
              <span>{draft.attachment}</span>
              <span>Hal</span>
              <span>:</span>
              <span className="font-semibold">{draft.subject}</span>
            </div>
            <div className="text-right text-[12.5px]">
              {HOSPITAL_INFO.city}, {draft.dateStr}
            </div>
          </div>

          <div className="mt-5 text-[12.5px] leading-relaxed">
            <div>Kepada Yth.</div>
            <div className="font-medium">{draft.recipient}</div>
            <div>di Tempat</div>
          </div>
        </div>
      )}

      {/* Isi Naskah Dinas */}
      <div className="mt-5 space-y-3 text-[13px] leading-relaxed text-slate-900">
        {draft.bodyParagraphs.map((paragraph, index) => (
          <React.Fragment key={index}>
            {editable && onUpdateDraft ? (
              <textarea
                value={paragraph}
                onChange={(e) => handleParagraphChange(index, e.target.value)}
                rows={Math.max(2, Math.ceil(paragraph.length / 72))}
                className="w-full resize-none rounded border border-slate-200 bg-slate-50/50 p-2 text-[13px] leading-relaxed text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-none"
              />
            ) : (
              <p className="text-justify indent-8">
                {renderHighlightedText(paragraph, highlightIssues)}
              </p>
            )}

            {index === 0 && draft.eventDetails && (
              <div className="my-3 ml-6 grid grid-cols-[110px_12px_1fr] gap-y-1 rounded border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-[12.5px]">
                <span className="font-medium">Hari / Tanggal</span>
                <span>:</span>
                {editable && onUpdateDraft ? (
                  <input
                    type="text"
                    value={draft.eventDetails.hariTanggal}
                    onChange={(e) =>
                      onUpdateDraft({
                        ...draft,
                        eventDetails: {
                          ...draft.eventDetails!,
                          hariTanggal: e.target.value,
                        },
                      })
                    }
                    className="rounded border border-slate-200 bg-white px-2 py-0.5 text-[12.5px] focus:border-sky-500 focus:outline-none"
                  />
                ) : (
                  <span>{draft.eventDetails.hariTanggal}</span>
                )}

                <span className="font-medium">Pukul</span>
                <span>:</span>
                {editable && onUpdateDraft ? (
                  <input
                    type="text"
                    value={draft.eventDetails.waktu}
                    onChange={(e) =>
                      onUpdateDraft({
                        ...draft,
                        eventDetails: {
                          ...draft.eventDetails!,
                          waktu: e.target.value,
                        },
                      })
                    }
                    className="rounded border border-slate-200 bg-white px-2 py-0.5 text-[12.5px] focus:border-sky-500 focus:outline-none"
                  />
                ) : (
                  <span>{draft.eventDetails.waktu}</span>
                )}

                <span className="font-medium">Tempat</span>
                <span>:</span>
                {editable && onUpdateDraft ? (
                  <input
                    type="text"
                    value={draft.eventDetails.tempat}
                    onChange={(e) =>
                      onUpdateDraft({
                        ...draft,
                        eventDetails: {
                          ...draft.eventDetails!,
                          tempat: e.target.value,
                        },
                      })
                    }
                    className="rounded border border-slate-200 bg-white px-2 py-0.5 text-[12.5px] focus:border-sky-500 focus:outline-none"
                  />
                ) : (
                  <span>{draft.eventDetails.tempat}</span>
                )}

                <span className="font-medium">Acara</span>
                <span>:</span>
                <span className="font-medium">{draft.eventDetails.acara}</span>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Blok Tanda Tangan Resmi */}
      <div className="mt-9 flex justify-end">
        <div className="w-68 text-[12.5px]">
          {draft.letterType === 'Nota Dinas' ||
          draft.letterType === 'Surat Tugas' ? (
            <div className="mb-1 text-xs text-slate-600">
              {HOSPITAL_INFO.city}, {draft.dateStr}
            </div>
          ) : null}
          <div className="font-medium">{draft.signerTitle},</div>

          {isCompletedTte ? (
            <div className="my-3 flex items-center gap-2.5 rounded border border-emerald-300 bg-emerald-50/70 px-3 py-2 text-xs text-emerald-900">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-emerald-400 bg-white font-mono text-[9px] font-bold text-emerald-800">
                TTE
              </div>
              <div className="leading-tight">
                <div className="font-semibold">Ditandatangani Elektronik</div>
                <div className="text-[10.5px] text-emerald-800">
                  BSrE / BSSN · Tersertifikasi
                </div>
              </div>
            </div>
          ) : (
            <div className="h-14" />
          )}

          <div
            className={`font-bold underline underline-offset-2 ${
              nameHasIssue ? 'rounded bg-amber-100 px-1 text-amber-900' : ''
            }`}
          >
            {draft.signerName}
          </div>
          <div
            className={`mt-0.5 font-mono text-xs tabular-nums ${
              nipHasIssue
                ? 'rounded bg-red-100 px-1 font-semibold text-red-900'
                : 'text-slate-700'
            }`}
          >
            NIP. {draft.signerNip}
          </div>
        </div>
      </div>
    </div>
  );
};
