import React from 'react';
import {
  BarChart3,
  Clock,
  FileCheck2,
  Printer,
  ShieldAlert,
  UserCheck,
} from 'lucide-react';
import { LetterDraft, OfficialProfile } from '../types/sitnde';
import { scanWithBiromaticGuard } from '../utils/sitndeEngine';
import { PermissionGuard } from './PermissionGuard';

interface ManagementBriefViewProps {
  drafts: LetterDraft[];
  officials: OfficialProfile[];
}

export const ManagementBriefView: React.FC<ManagementBriefViewProps> = ({
  drafts,
  officials,
}) => {
  const totalDrafts = drafts.length;
  const completedCount = drafts.filter(
    (d) => d.status === 'Selesai / Terbit'
  ).length;
  const inQueueCount = drafts.filter((d) =>
    d.status.startsWith('Menunggu')
  ).length;

  // Baseline comparison: 25 minutes manual drafting vs 4 minutes with SITNDE (21 mins saved per letter)
  const minutesSaved = totalDrafts * 21;
  const hoursSaved = (minutesSaved / 60).toFixed(1);

  const guardSummaries = drafts.map((d) => ({
    draft: d,
    scan: scanWithBiromaticGuard(d, officials),
  }));

  const avgCompliance =
    totalDrafts > 0
      ? Math.round(
          guardSummaries.reduce(
            (acc, item) => acc + item.scan.complianceScore,
            0
          ) / totalDrafts
        )
      : 100;

  const totalPendingFindings = guardSummaries.reduce(
    (acc, item) => acc + item.scan.issues.length,
    0
  );
  const pdpAlerts = guardSummaries.reduce(
    (acc, item) =>
      acc + item.scan.issues.filter((iss) => iss.category === 'pdp').length,
    0
  );
  const aiGeneratedCount = drafts.filter(
    (d) => d.extractedJson.generationEngine === 'gemini-4-hydrogen'
  ).length;

  const delegatedOfficials = officials.filter(
    (off) => off.dutyStatus && off.dutyStatus !== 'Definitif'
  );

  // Aggregate by Proposing Unit
  const unitMap = new Map<
    string,
    {
      unit: string;
      total: number;
      completed: number;
      inFlow: number;
      scoreSum: number;
    }
  >();

  for (const item of guardSummaries) {
    const u = item.draft.proposingUnit;
    const prev = unitMap.get(u) || {
      unit: u,
      total: 0,
      completed: 0,
      inFlow: 0,
      scoreSum: 0,
    };
    prev.total += 1;
    if (item.draft.status === 'Selesai / Terbit') prev.completed += 1;
    if (item.draft.status.startsWith('Menunggu')) prev.inFlow += 1;
    prev.scoreSum += item.scan.complianceScore;
    unitMap.set(u, prev);
  }

  const unitRows = Array.from(unitMap.values()).sort(
    (a, b) => b.total - a.total
  );

  return (
    <PermissionGuard
      permission="view:reports"
      mode="fallback"
      fallbackMessage="Laporan Evaluasi & Management Brief hanya dapat diakses oleh Kepala Instalasi, Kepala Bidang, Wakil Direktur, Direktur, Tata Usaha, dan Admin IT."
    >
      <div className="space-y-6">
        {/* Header Bar */}
        <section className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-6 sm:flex-row sm:items-center">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-sky-700">
              Evaluasi Kinerja Tata Naskah Dinas · RSUD R.T. Notopuro
            </div>
            <h2 className="mt-1 font-display text-lg font-bold text-[#0F294A]">
              Laporan Adopsi SITNDE & Management Brief Pimpinan
            </h2>
            <p className="mt-1 text-xs text-slate-600">
              Ringkasan metrik efisiensi penyusunan surat, kepatuhan EYD V & UU PDP, serta kesiapan jalur delegasi paraf (Plt./Plh.).
            </p>
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-[#0F294A] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#163a66] whitespace-nowrap"
          >
            <Printer className="h-4 w-4" />
            <span>Cetak Management Brief</span>
          </button>
        </section>

        {/* Executive KPI Grid */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Total Naskah Terkelola</span>
              <BarChart3 className="h-4 w-4 text-[#0F294A]" />
            </div>
            <div className="mt-3 font-display text-3xl font-bold text-[#0F294A] tabular-nums">
              {totalDrafts}
            </div>
            <div className="mt-1 text-xs text-slate-600">
              {completedCount} terbit · {inQueueCount} dalam antrean paraf
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Estimasi Penghematan Waktu</span>
              <Clock className="h-4 w-4 text-sky-600" />
            </div>
            <div className="mt-3 font-display text-3xl font-bold text-sky-700 tabular-nums">
              {hoursSaved} Jam
            </div>
            <div className="mt-1 text-xs text-slate-600">
              ~21 menit dihemat/surat (25 mnt manual vs 4 mnt SITNDE)
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Rata-rata Kepatuhan TND</span>
              <FileCheck2 className="h-4 w-4 text-emerald-700" />
            </div>
            <div className="mt-3 font-display text-3xl font-bold text-emerald-700 tabular-nums">
              {avgCompliance}%
            </div>
            <div className="mt-1 text-xs text-slate-600">
              {aiGeneratedCount} naskah via Gemini AI · {totalPendingFindings} temuan aktif
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
              <span>Delegasi Plt./Plh. & UU PDP</span>
              <ShieldAlert className="h-4 w-4 text-amber-600" />
            </div>
            <div className="mt-3 font-display text-3xl font-bold text-[#0F294A] tabular-nums">
              {delegatedOfficials.length} / {pdpAlerts}
            </div>
            <div className="mt-1 text-xs text-slate-600">
              Pejabat Plt./Plh. aktif · Peringatan UU PDP terdeteksi
            </div>
          </div>
        </section>

        {/* Unit Adoption Breakdown & Plt./Plh. Status */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 items-start">
          <section className="xl:col-span-7 rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="border-b border-slate-200 px-6 py-4">
              <h3 className="font-display text-sm font-bold text-[#0F294A]">
                Adopsi & Kepatuhan Tata Naskah Dinas per Unit Kerja
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                Distribusi produksi naskah dinas dan tingkat kepatuhan EYD V pada masing-masing instalasi/bidang.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600">
                    <th className="px-6 py-3">Unit Kerja Pengusul</th>
                    <th className="px-4 py-3 text-right">Total Surat</th>
                    <th className="px-4 py-3 text-right">Terbit (TTE)</th>
                    <th className="px-4 py-3 text-right">Proses Paraf</th>
                    <th className="px-6 py-3 text-right">Skor Kepatuhan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {unitRows.map((row) => {
                    const avgUnitScore = Math.round(row.scoreSum / row.total);
                    return (
                      <tr key={row.unit} className="hover:bg-slate-50/70">
                        <td className="px-6 py-3.5 font-semibold text-[#0F294A]">
                          {row.unit}
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono tabular-nums text-slate-700">
                          {row.total}
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono tabular-nums text-emerald-700">
                          {row.completed}
                        </td>
                        <td className="px-4 py-3.5 text-right font-mono tabular-nums text-amber-700">
                          {row.inFlow}
                        </td>
                        <td
                          className={`px-6 py-3.5 text-right font-mono font-semibold tabular-nums ${
                            avgUnitScore >= 90
                              ? 'text-emerald-700'
                              : 'text-amber-700'
                          }`}
                        >
                          {avgUnitScore}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <section className="xl:col-span-5 rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center gap-2 border-b border-slate-200 px-6 py-4">
              <UserCheck className="h-4 w-4 text-[#0F294A]" />
              <h3 className="font-display text-sm font-bold text-[#0F294A]">
                Status Pejabat Definitif & Pelimpahan (Plt./Plh.)
              </h3>
            </div>
            <div className="divide-y divide-slate-200">
              {delegatedOfficials.length === 0 ? (
                <div className="p-6 text-xs text-slate-600">
                  Seluruh pejabat struktural dan instalasi berstatus{' '}
                  <span className="font-semibold text-emerald-700">
                    Definitif
                  </span>
                  . Tidak ada pelimpahan kewenangan Plt./Plh. yang aktif saat ini. Admin IT dapat mengubah status cuti/dinas luar pada menu Manajemen SOTK & Audit.
                </div>
              ) : (
                delegatedOfficials.map((off) => (
                  <div key={off.id} className="p-5 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#0F294A]">
                        {off.position}
                      </span>
                      <span className="font-semibold text-amber-700">
                        {off.dutyStatus}
                      </span>
                    </div>
                    <div className="text-slate-600">
                      Pejabat Definitif: {off.fullNameWithTitles}
                    </div>
                    <div className="text-slate-800">
                      Pelaksana Pengganti:{' '}
                      <span className="font-semibold">
                        {off.delegateName || 'Pejabat Pengganti Terjadwal'}
                      </span>{' '}
                      {off.delegateNip && (
                        <span className="font-mono text-[11px] text-slate-500 tabular-nums">
                          · NIP {off.delegateNip}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}

              <div className="bg-slate-50/70 p-5 text-xs text-slate-600 space-y-1.5">
                <div className="font-semibold text-[#0F294A]">
                  Rekomendasi Eksekutif Pimpinan
                </div>
                <p className="leading-relaxed">
                  Optimalisasi templat Nota Dinas dan Surat Undangan terstandar berhasil menekan potensi kesalahan ejaan baku EYD V serta mencegah kebocoran data pasien (NIK/No. RM) sesuai UU No. 27 Tahun 2022 sebelum memasuki antrean paraf berjenjang.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </PermissionGuard>
  );
};
