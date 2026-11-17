import React, { useState } from 'react';
import {
  CheckCircle2,
  History,
  Plus,
  Search,
  Settings2,
  Shield,
  Users,
} from 'lucide-react';
import {
  INITIAL_SOTK_RULES,
  ROLE_PERMISSIONS,
  ROLE_USERS,
} from '../data/mockHospitalData';
import { AuditLogEntry, LetterDraft, SotkRoutingRule } from '../types/sitnde';
import { PermissionGuard } from './PermissionGuard';

interface AdminSotkAuditViewProps {
  drafts: LetterDraft[];
}

export const AdminSotkAuditView: React.FC<AdminSotkAuditViewProps> = ({
  drafts,
}) => {
  const [activeTab, setActiveTab] = useState<'sotk' | 'roles' | 'audit'>(
    'sotk'
  );
  const [sotkRules, setSotkRules] =
    useState<SotkRoutingRule[]>(INITIAL_SOTK_RULES);
  const [auditSearch, setAuditSearch] = useState('');
  const [newUnitName, setNewUnitName] = useState('');
  const [newKabidRole, setNewKabidRole] = useState('Kabid Pelayanan Medik');

  const allAuditLogs: AuditLogEntry[] = drafts
    .flatMap((d) => d.auditTrail)
    .filter((log) => {
      if (!auditSearch.trim()) return true;
      const q = auditSearch.toLowerCase();
      return (
        log.actorName.toLowerCase().includes(q) ||
        log.actorNip.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.draftSubject.toLowerCase().includes(q)
      );
    });

  const handleToggleRule = (ruleId: string) => {
    setSotkRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, isActive: !r.isActive } : r))
    );
  };

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnitName.trim()) return;
    const added: SotkRoutingRule = {
      id: `sotk-${Date.now()}`,
      originUnit: newUnitName.trim(),
      unitType: 'Fungsional',
      paraf1Role: `Ka. ${newUnitName.trim()}`,
      paraf2Role: newKabidRole,
      wadirRole: newKabidRole.includes('Umum')
        ? 'Wadir Umum & Keuangan'
        : 'Wadir Pelayanan & Penunjang',
      finalSigner: 'Direktur RSUD',
      isActive: true,
    };
    setSotkRules((prev) => [added, ...prev]);
    setNewUnitName('');
  };

  return (
    <PermissionGuard
      permission="system:manage_sotk_tnd"
      mode="fallback"
      fallbackMessage="Panel Manajemen SOTK, User Roles, dan Audit Trail hanya dapat diakses oleh Admin Sistem / IT."
    >
      <div className="space-y-6">
        {/* Header & Sub-Navigation Tabs */}
        <section className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 lg:flex-row lg:items-center">
          <div>
            <div className="flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-[#0F294A]" />
              <h2 className="font-display text-base font-bold text-[#0F294A]">
                Panel Administrasi Sistem, Matriks SOTK & Audit Trail
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-600">
              Konfigurasi aturan hierarki rute paraf SOTK RSUD, pemetaan 7 level peran RBAC, serta pemantauan log aktivitas yang tidak dapat diubah (*immutable*).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('sotk')}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                activeTab === 'sotk'
                  ? 'bg-white text-[#0F294A] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Settings2 className="h-3.5 w-3.5" />
              <span>Matriks SOTK</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('roles')}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                activeTab === 'roles'
                  ? 'bg-white text-[#0F294A] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              <span>User & RBAC Roles</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('audit')}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
                activeTab === 'audit'
                  ? 'bg-white text-[#0F294A] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <History className="h-3.5 w-3.5" />
              <span>Audit Trail ({allAuditLogs.length})</span>
            </button>
          </div>
        </section>

        {/* Tab 1: Matriks SOTK */}
        {activeTab === 'sotk' && (
          <div className="space-y-4">
            <form
              onSubmit={handleAddRule}
              className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-end"
            >
              <div className="flex-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Tambah Unit Pengusul Baru ke Matriks SOTK
                </label>
                <input
                  type="text"
                  value={newUnitName}
                  onChange={(e) => setNewUnitName(e.target.value)}
                  placeholder="Contoh: Instalasi Radiologi / Komite Medik"
                  className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-sky-600 focus:outline-none"
                />
              </div>
              <div className="sm:w-64">
                <label className="block text-xs font-semibold text-slate-700">
                  Pembina Struktural (Paraf 2)
                </label>
                <select
                  value={newKabidRole}
                  onChange={(e) => setNewKabidRole(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-sky-600 focus:outline-none"
                >
                  <option value="Kabid Pelayanan Medik">
                    Kabid Pelayanan Medik
                  </option>
                  <option value="Kabid Penunjang Medik">
                    Kabid Penunjang Medik
                  </option>
                  <option value="Kabag Umum & Pengadaan">
                    Kabag Umum & Pengadaan
                  </option>
                </select>
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#0F294A] px-4 py-2 text-xs font-semibold text-white hover:bg-[#163a66] whitespace-nowrap"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Tambah Aturan</span>
              </button>
            </form>

            <section className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
              <table className="w-full min-w-[780px] border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600">
                    <th className="px-6 py-3">Unit Pengusul</th>
                    <th className="px-4 py-3">Paraf Teknis (1)</th>
                    <th className="px-4 py-3">Paraf Struktural (2)</th>
                    <th className="px-4 py-3">Verifikasi Wadir</th>
                    <th className="px-4 py-3">Penandatangan</th>
                    <th className="px-6 py-3 text-right">Status Aturan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {sotkRules.map((rule) => (
                    <tr key={rule.id} className="hover:bg-slate-50/70">
                      <td className="px-6 py-3.5 font-semibold text-[#0F294A]">
                        {rule.originUnit}
                        <div className="mt-0.5 text-[11px] font-normal text-slate-500">
                          Unit {rule.unitType}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-700">
                        {rule.paraf1Role}
                      </td>
                      <td className="px-4 py-3.5 text-slate-700">
                        {rule.paraf2Role}
                      </td>
                      <td className="px-4 py-3.5 text-slate-700">
                        {rule.wadirRole}
                      </td>
                      <td className="px-4 py-3.5 text-slate-700">
                        {rule.finalSigner}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => handleToggleRule(rule.id)}
                          className={`rounded-md border px-2.5 py-1 text-xs font-semibold transition-colors ${
                            rule.isActive
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {rule.isActive ? 'Aktif' : 'Nonaktif'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </div>
        )}

        {/* Tab 2: User & RBAC Roles Matrix */}
        {activeTab === 'roles' && (
          <section className="rounded-xl border border-slate-200 bg-white overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600">
                  <th className="px-6 py-3">Peran RBAC</th>
                  <th className="px-4 py-3">Pejabat / Akun Simulasi</th>
                  <th className="px-4 py-3">Unit Kerja</th>
                  <th className="px-6 py-3">Kewenangan Operasi (Permissions)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {ROLE_USERS.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70">
                    <td className="px-6 py-3.5 align-top">
                      <div className="flex items-center gap-1.5 font-semibold text-[#0F294A]">
                        <Shield className="h-3.5 w-3.5 text-sky-700" />
                        <span>{u.roleLabel}</span>
                      </div>
                      <div className="mt-0.5 text-[11px] text-slate-500">
                        {u.description}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 align-top">
                      <div className="font-medium text-slate-900">{u.name}</div>
                      <div className="mt-0.5 font-mono text-[11px] text-slate-500 tabular-nums">
                        NIP {u.nip}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 align-top text-slate-700">
                      {u.unitName}
                    </td>
                    <td className="px-6 py-3.5 align-top font-mono text-[11px] text-slate-700">
                      {(ROLE_PERMISSIONS[u.roleId] || []).join(' · ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* Tab 3: Immutable Audit Trail */}
        {activeTab === 'audit' && (
          <section className="rounded-xl border border-slate-200 bg-white">
            <div className="flex flex-col justify-between gap-3 border-b border-slate-200 px-6 py-4 sm:flex-row sm:items-center">
              <div>
                <h3 className="font-display text-sm font-bold text-[#0F294A]">
                  Log Jejak Audit Sistem (Immutable Audit Trail)
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  Merekam setiap aktivitas pembuatan, paraf, revisi, penolakan, TTE, dan penomoran tanpa dapat diubah atau dihapus.
                </p>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  placeholder="Filter nama, NIP, atau aksi..."
                  className="w-full rounded-lg border border-slate-300 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-900 focus:border-sky-600 focus:outline-none"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600">
                    <th className="px-6 py-3">Waktu</th>
                    <th className="px-4 py-3">Aktor & NIP</th>
                    <th className="px-4 py-3">Aksi & Transisi Status</th>
                    <th className="px-6 py-3">Naskah Terkait</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {allAuditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/70">
                      <td className="px-6 py-3 align-top font-mono text-[11px] text-slate-600 tabular-nums whitespace-nowrap">
                        {log.timestamp}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="font-semibold text-slate-900">
                          {log.actorName}
                        </div>
                        <div className="mt-0.5 font-mono text-[11px] text-slate-500 tabular-nums">
                          {log.actorRole} · NIP {log.actorNip}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="inline-flex items-center gap-1 font-semibold text-[#0F294A]">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          <span>{log.action}</span>
                        </div>
                        <div className="mt-0.5 text-[11px] text-slate-500">
                          {log.fromStatus} → {log.toStatus}
                        </div>
                      </td>
                      <td className="px-6 py-3 align-top max-w-xs">
                        <div className="font-medium text-slate-800 line-clamp-1">
                          {log.draftSubject}
                        </div>
                        <div className="mt-0.5 font-mono text-[11px] text-slate-500 tabular-nums">
                          {log.draftNumber}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </PermissionGuard>
  );
};
