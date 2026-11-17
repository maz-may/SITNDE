import React from 'react';
import {
  Archive,
  BarChart3,
  FilePlus2,
  FileText,
  GitBranch,
  LayoutDashboard,
  LogOut,
  Settings2,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useRole } from '../context/RoleContext';
import { NavSection, RoleId } from '../types/sitnde';

interface SidebarProps {
  activeSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  draftCount: number;
  guardIssueCount: number;
  pendingQueueCount: number;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

function getFlowLabelForRole(roleId: RoleId): string {
  switch (roleId) {
    case 'ka_instalasi':
    case 'kabid':
      return 'Antrean Paraf';
    case 'wadir':
      return 'Antrean Verifikasi';
    case 'direktur':
      return 'Antrean TTE';
    case 'arsiparis':
      return 'Registrasi & Penomoran';
    default:
      return 'Alur Paraf & Disposisi';
  }
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  onSelectSection,
  draftCount,
  guardIssueCount,
  pendingQueueCount,
  mobileOpen,
  onCloseMobile,
}) => {
  const { currentUser, canAccessNav, logout } = useRole();

  const navItems: {
    id: NavSection;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    {
      id: 'dashboard',
      label: currentUser.roleId === 'staf' ? 'Draf Saya (Dashboard)' : 'Dashboard',
      icon: LayoutDashboard,
    },
    { id: 'create', label: 'Buat Surat Baru', icon: FilePlus2 },
    { id: 'templates', label: 'Draf & Template TND', icon: FileText },
    { id: 'guard', label: 'Validasi Biromatic Guard', icon: ShieldCheck },
    {
      id: 'flow',
      label: getFlowLabelForRole(currentUser.roleId),
      icon: GitBranch,
    },
    { id: 'archive', label: 'Arsip Surat', icon: Archive },
    { id: 'reports', label: 'Laporan & Brief', icon: BarChart3 },
    { id: 'admin', label: 'Manajemen SOTK & Audit', icon: Settings2 },
  ];

  const visibleItems = navItems.filter((item) => canAccessNav(item.id));

  const sidebarBody = (
    <div className="flex h-full flex-col bg-[#0F294A] text-slate-100">
      {/* Brand Lockup */}
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-sky-400/30 bg-sky-500/20 text-sky-300">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-5 w-5"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3l7 3v5c0 4.5-3 8.4-7 10-4-1.6-7-5.5-7-10V6l7-3z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v6M9 11h6"
              />
            </svg>
          </div>
          <div className="min-w-0">
            <div className="font-display text-base font-bold tracking-tight text-white">
              SITNDE
            </div>
            <div className="truncate text-xs text-slate-300">
              RSUD Nusantara Jaya
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={onCloseMobile}
          className="rounded-md p-1.5 text-slate-300 hover:bg-white/10 hover:text-white lg:hidden"
          aria-label="Tutup menu navigasi"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation Links Filtered by Active RBAC Role */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Menu Utama SITNDE">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onSelectSection(item.id);
                onCloseMobile();
              }}
              className={`flex w-full items-center justify-between rounded-lg px-3.5 py-2.5 text-left text-sm font-medium transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-sky-600 text-white'
                  : 'text-slate-200 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="flex min-w-0 items-center gap-3">
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </span>

              {item.id === 'templates' && (
                <span className="ml-2 text-xs tabular-nums text-slate-300">
                  {draftCount}
                </span>
              )}
              {item.id === 'guard' && guardIssueCount > 0 && (
                <span className="ml-2 text-xs font-semibold tabular-nums text-amber-300">
                  {guardIssueCount}
                </span>
              )}
              {item.id === 'flow' && pendingQueueCount > 0 && (
                <span className="ml-2 font-mono text-xs font-semibold tabular-nums text-sky-200">
                  {pendingQueueCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Active RBAC Employee Identity + Logout Action */}
      <div className="border-t border-white/10 px-5 py-4">
        <div className="text-[11px] font-semibold tracking-wide text-sky-300 uppercase">
          {currentUser.shortRoleLabel}
        </div>
        <div className="mt-1 truncate text-sm font-semibold text-white">
          {currentUser.name}
        </div>
        <div className="mt-0.5 truncate text-xs text-slate-300">
          {currentUser.unitName}
        </div>
        <div className="mt-0.5 font-mono text-[11px] text-slate-400 tabular-nums">
          NIP {currentUser.nip}
        </div>
        <button
          type="button"
          onClick={() => {
            onCloseMobile();
            logout();
          }}
          className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-red-400/30 bg-red-500/15 px-3 py-1.5 text-xs font-medium text-red-100 hover:bg-red-500/25 transition-colors"
        >
          <LogOut className="h-3.5 w-3.5 text-red-300" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 lg:block">
        <div className="sticky top-0 h-screen">{sidebarBody}</div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/50"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative z-10 h-full w-72 max-w-[85vw]">
            {sidebarBody}
          </div>
        </div>
      )}
    </>
  );
};
