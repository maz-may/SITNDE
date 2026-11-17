import React from 'react';
import { FilePlus2, Menu, Printer, UserCheck } from 'lucide-react';
import { useRole } from '../context/RoleContext';
import { NavSection, RoleId } from '../types/sitnde';
import { PermissionGuard } from './PermissionGuard';

interface TopBarProps {
  activeSection: NavSection;
  activeDraftNumber?: string;
  onOpenMobileMenu: () => void;
  onNewDraftClick: () => void;
  onPrintClick: () => void;
  onRoleChanged?: (roleId: RoleId) => void;
}

const SECTION_TITLES: Record<NavSection, string> = {
  dashboard: 'Dashboard Persuratan',
  create: 'Buat Surat Baru (Intent-to-Draft)',
  templates: 'Draf & Template TND',
  guard: 'Validasi Biromatic Guard',
  flow: 'Alur Paraf & Disposisi (DynFlow-SOTK)',
  archive: 'Arsip Naskah Dinas',
  reports: 'Laporan Evaluasi & Management Brief',
  admin: 'Manajemen SOTK, Role & Audit Trail',
};

export const TopBar: React.FC<TopBarProps> = ({
  activeSection,
  activeDraftNumber,
  onOpenMobileMenu,
  onNewDraftClick,
  onPrintClick,
  onRoleChanged,
}) => {
  const { currentUser, allRoleUsers, switchRole } = useRole();

  const handleSelectRole = (nextRole: RoleId) => {
    switchRole(nextRole);
    onRoleChanged?.(nextRole);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
          aria-label="Buka menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex min-w-0 items-center gap-2 text-sm">
          <span className="hidden font-medium text-slate-500 sm:inline whitespace-nowrap">
            e-Office RSUD
          </span>
          <span className="hidden text-slate-300 sm:inline" aria-hidden="true">
            /
          </span>
          <h1 className="truncate font-display text-base font-semibold text-[#0F294A]">
            {SECTION_TITLES[activeSection]}
          </h1>
          {activeDraftNumber &&
            activeSection !== 'dashboard' &&
            activeSection !== 'archive' &&
            activeSection !== 'reports' &&
            activeSection !== 'admin' && (
              <>
                <span
                  className="hidden text-slate-300 md:inline"
                  aria-hidden="true"
                >
                  ·
                </span>
                <span className="hidden font-mono text-xs text-slate-500 tabular-nums md:inline whitespace-nowrap">
                  {activeDraftNumber}
                </span>
              </>
            )}
        </div>
      </div>

      {/* Role Switcher + Primary Action */}
      <div className="flex shrink-0 items-center gap-3">
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5">
          <UserCheck className="h-3.5 w-3.5 shrink-0 text-[#0F294A]" />
          <label htmlFor="rbac-role-switcher" className="sr-only">
            Simulasi Role Aktif
          </label>
          <select
            id="rbac-role-switcher"
            value={currentUser.roleId}
            onChange={(e) => handleSelectRole(e.target.value as RoleId)}
            className="bg-transparent text-xs font-semibold text-[#0F294A] focus:outline-none cursor-pointer max-w-[165px] sm:max-w-none"
          >
            {allRoleUsers.map((u) => (
              <option key={u.roleId} value={u.roleId}>
                Role: {u.shortRoleLabel} — {u.name.split(',')[0]}
              </option>
            ))}
          </select>
        </div>

        {(activeSection === 'create' ||
          activeSection === 'guard' ||
          activeSection === 'flow') && (
          <button
            type="button"
            onClick={onPrintClick}
            className="hidden md:inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Cetak / PDF</span>
          </button>
        )}

        <PermissionGuard permission="draft:create_ai">
          <button
            type="button"
            onClick={onNewDraftClick}
            className="hidden sm:inline-flex items-center gap-2 rounded-lg bg-[#0F294A] px-4 py-2 text-xs font-medium text-white hover:bg-[#163a66] transition-colors whitespace-nowrap shrink-0"
          >
            <FilePlus2 className="h-3.5 w-3.5" />
            <span>Buat Surat Baru</span>
          </button>
        </PermissionGuard>
      </div>
    </header>
  );
};
