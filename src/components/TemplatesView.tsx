import React from 'react';
import { ArrowRight, CheckCircle2, Copy, FileText } from 'lucide-react';
import { TND_TEMPLATES } from '../data/mockHospitalData';
import { LetterDraft, TndTemplateSpec } from '../types/sitnde';
import { PermissionGuard } from './PermissionGuard';

interface TemplatesViewProps {
  drafts: LetterDraft[];
  onUseTemplate: (template: TndTemplateSpec) => void;
  onOpenDraft: (draftId: string) => void;
  onDuplicateDraft: (draftId: string) => void;
}

export const TemplatesView: React.FC<TemplatesViewProps> = ({
  drafts,
  onUseTemplate,
  onOpenDraft,
  onDuplicateDraft,
}) => {
  return (
    <div className="space-y-8">
      {/* Deterministic TND Master Templates */}
      <section className="space-y-4">
        <div>
          <h2 className="font-display text-lg font-bold text-[#0F294A]">
            Master Template Tata Naskah Dinas (TND) Resmi
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Seluruh tata letak fisik (margin, kop surat RSUD, struktur kepala surat, dan blok tanda tangan) dikunci secara deterministik sesuai peraturan kepala daerah.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {TND_TEMPLATES.map((tpl) => (
            <article
              key={tpl.id}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5"
            >
              <div>
                <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                  <span className="font-mono font-semibold text-sky-700">
                    {tpl.templateCode}
                  </span>
                  <span>Kode Arsip {tpl.classificationCode}</span>
                </div>

                <h3 className="mt-2 font-display text-base font-bold text-[#0F294A]">
                  {tpl.letterType}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                  {tpl.description}
                </p>

                <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3 text-xs text-slate-600">
                  <div>
                    <span className="font-semibold text-slate-800">Kertas: </span>
                    {tpl.paperSize}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800">Margin: </span>
                    {tpl.margins}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800">Tipografi: </span>
                    {tpl.fontSpec}
                  </div>
                </div>

                <ul className="mt-3 space-y-1 border-t border-slate-100 pt-3">
                  {tpl.requiredElements.slice(0, 3).map((el) => (
                    <li
                      key={el}
                      className="flex items-start gap-1.5 text-xs text-slate-600"
                    >
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                      <span>{el}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <PermissionGuard permission="draft:create_ai">
                <div className="mt-5 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => onUseTemplate(tpl)}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#0F294A] px-4 py-2 text-xs font-semibold text-white hover:bg-[#163a66] transition-colors"
                  >
                    <span>Gunakan Template Ini</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </PermissionGuard>
            </article>
          ))}
        </div>
      </section>

      {/* Saved Drafts List */}
      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-6 py-4">
          <h3 className="font-display text-base font-bold text-[#0F294A]">
            Draf Naskah Dinas Tersimpan
          </h3>
          <p className="mt-0.5 text-xs text-slate-500">
            Buka kembali untuk menyunting atau duplikasi format draf untuk pengajuan berulang.
          </p>
        </div>

        <div className="divide-y divide-slate-200">
          {drafts.map((draft) => (
            <div
              key={draft.id}
              className="flex flex-col justify-between gap-4 px-6 py-4 sm:flex-row sm:items-center"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="font-mono font-semibold text-[#0F294A] tabular-nums">
                    {draft.letterNumber}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{draft.letterType}</span>
                  <span aria-hidden="true">·</span>
                  <span>{draft.proposingUnit}</span>
                </div>
                <div className="mt-1 truncate text-sm font-semibold text-slate-900">
                  {draft.subject}
                </div>
              </div>

              <PermissionGuard permission="draft:create_ai">
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onDuplicateDraft(draft.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    <span>Duplikasi</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenDraft(draft.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-sky-700"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>Buka di Editor</span>
                  </button>
                </div>
              </PermissionGuard>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
