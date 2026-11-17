import { useEffect, useMemo, useState } from 'react';
import { AdminSotkAuditView } from './components/AdminSotkAuditView';
import { ArchiveView } from './components/ArchiveView';
import { BiromaticGuardView } from './components/BiromaticGuardView';
import { DashboardView } from './components/DashboardView';
import { DynFlowView } from './components/DynFlowView';
import { IntentToDraftView } from './components/IntentToDraftView';
import { ManagementBriefView } from './components/ManagementBriefView';
import { NipLoginModal } from './components/NipLoginModal';
import { Sidebar } from './components/Sidebar';
import { TemplatesView } from './components/TemplatesView';
import { TopBar } from './components/TopBar';
import { RoleProvider, useRole } from './context/RoleContext';
import {
  ARCHIVE_CLASSIFICATIONS,
  INITIAL_DRAFTS,
  INITIAL_SOTK_RULES,
  MASTER_OFFICIALS,
  ROLE_PERMISSIONS,
} from './data/mockHospitalData';
import {
  ArchiveClassification,
  LetterDraft,
  NavSection,
  OfficialDutyStatus,
  OfficialProfile,
  RoleId,
  SotkRoutingRule,
  TndTemplateSpec,
} from './types/sitnde';
import {
  apiSaveDraft,
  apiTransitionWorkflow,
  apiUpdateDraft,
  generateDraftFromPrompt,
  scanWithBiromaticGuard,
} from './utils/sitndeEngine';

function SitndeWorkspace() {
  const { currentUser } = useRole();
  const [activeSection, setActiveSection] = useState<NavSection>('dashboard');
  const [drafts, setDrafts] = useState<LetterDraft[]>(INITIAL_DRAFTS);
  const [sotkRules, setSotkRules] =
    useState<SotkRoutingRule[]>(INITIAL_SOTK_RULES);
  const [officials, setOfficials] =
    useState<OfficialProfile[]>(MASTER_OFFICIALS);
  const [classifications, setClassifications] = useState<
    ArchiveClassification[]
  >(ARCHIVE_CLASSIFICATIONS);
  const [activeDraftId, setActiveDraftId] = useState<string>(
    INITIAL_DRAFTS[0].id
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  useEffect(() => {
    let active = true;
    fetch('/api/bootstrap')
      .then((res) => {
        if (!res.ok) throw new Error('Gagal memuat data server');
        return res.json();
      })
      .then((data) => {
        if (!active) return;
        if (Array.isArray(data.drafts) && data.drafts.length > 0) {
          setDrafts(data.drafts);
          setActiveDraftId((prev) =>
            data.drafts.some((d: LetterDraft) => d.id === prev)
              ? prev
              : data.drafts[0].id
          );
        }
        if (Array.isArray(data.sotkRules)) setSotkRules(data.sotkRules);
        if (Array.isArray(data.officials)) setOfficials(data.officials);
        if (Array.isArray(data.classifications))
          setClassifications(data.classifications);
      })
      .catch(() => {
        // Keep seeded defaults if bootstrap is momentarily unavailable
      });
    return () => {
      active = false;
    };
  }, []);

  const activeDraft = useMemo(
    () => drafts.find((d) => d.id === activeDraftId) || drafts[0],
    [drafts, activeDraftId]
  );

  const activeGuardIssueCount = useMemo(
    () => scanWithBiromaticGuard(activeDraft, officials).issues.length,
    [activeDraft, officials]
  );

  const pendingQueueCount = useMemo(() => {
    return drafts.filter((d) => {
      if (currentUser.roleId === 'staf')
        return (
          d.status === 'Draft' ||
          d.status === 'Revisi' ||
          d.status === 'Ditolak'
        );
      if (currentUser.roleId === 'ka_instalasi')
        return d.status === 'Menunggu Paraf Instalasi';
      if (currentUser.roleId === 'kabid')
        return d.status === 'Menunggu Paraf Kabid';
      if (currentUser.roleId === 'wadir')
        return d.status === 'Menunggu Verifikasi Wadir';
      if (currentUser.roleId === 'direktur')
        return d.status === 'Menunggu TTE Direktur';
      if (currentUser.roleId === 'arsiparis')
        return d.status === 'Selesai / Terbit' && !d.officialNumberAssigned;
      return false;
    }).length;
  }, [drafts, currentUser.roleId]);

  const handleSaveDraft = async (newOrUpdated: LetterDraft) => {
    setDrafts((prev) => {
      const exists = prev.some((d) => d.id === newOrUpdated.id);
      if (exists) {
        return prev.map((d) => (d.id === newOrUpdated.id ? newOrUpdated : d));
      }
      return [newOrUpdated, ...prev];
    });
    setActiveDraftId(newOrUpdated.id);
    try {
      await apiSaveDraft(newOrUpdated);
    } catch {
      // Optimistic state retained
    }
  };

  const handleUpdateDraft = async (updated: LetterDraft) => {
    setDrafts((prev) =>
      prev.map((d) => (d.id === updated.id ? updated : d))
    );
    try {
      await apiUpdateDraft(updated);
    } catch {
      // Optimistic state retained
    }
  };

  const handleUpdateDraftLocalOnly = (updated: LetterDraft) => {
    setDrafts((prev) =>
      prev.map((d) => (d.id === updated.id ? updated : d))
    );
  };

  const handleUseTemplate = async (template: TndTemplateSpec) => {
    const generated = generateDraftFromPrompt(
      template.samplePrompt,
      undefined,
      template.letterType,
      currentUser,
      officials
    );
    await handleSaveDraft(generated);
    setActiveSection('create');
  };

  const handleDuplicateDraft = async (draftId: string) => {
    const source = drafts.find((d) => d.id === draftId);
    if (!source) return;
    const copy: LetterDraft = {
      ...source,
      id: `drf-${Date.now()}`,
      creatorId: currentUser.id,
      letterNumber: '[Menunggu Nomor Resmi TU]',
      officialNumberAssigned: false,
      tteSigned: false,
      subject: `${source.subject} (Salinan)`,
      status: 'Draft',
      createdAt: '17 Nov 2026 · Baru diduplikasi',
      updatedAt: 'Baru saja',
    };
    await handleSaveDraft(copy);
    setActiveSection('create');
  };

  const handleSubmitToInstallation = async (draft: LetterDraft) => {
    await apiSaveDraft(draft);
    const submitted = await apiTransitionWorkflow(
      draft.id,
      'submit',
      currentUser,
      'Diajukan dari editor Intent-to-Draft.'
    );
    handleUpdateDraftLocalOnly(submitted);
    setActiveDraftId(submitted.id);
    setActiveSection('flow');
  };

  const handleCreateSotkRule = async (rule: SotkRoutingRule) => {
    const res = await fetch('/api/sotk-rules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rule),
    });
    const data = await res.json();
    if (res.ok && Array.isArray(data.sotkRules)) {
      setSotkRules(data.sotkRules);
    }
  };

  const handleToggleSotkRule = async (ruleId: string, isActive: boolean) => {
    const res = await fetch(`/api/sotk-rules/${encodeURIComponent(ruleId)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive }),
    });
    const data = await res.json();
    if (res.ok && Array.isArray(data.sotkRules)) {
      setSotkRules(data.sotkRules);
    }
  };

  const handleUpdateOfficialDutyStatus = async (
    officialId: string,
    dutyStatus: OfficialDutyStatus
  ) => {
    const res = await fetch(
      `/api/officials/${encodeURIComponent(officialId)}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dutyStatus }),
      }
    );
    const data = await res.json();
    if (res.ok) {
      if (Array.isArray(data.officials)) setOfficials(data.officials);
      if (Array.isArray(data.drafts)) setDrafts(data.drafts);
    }
  };

  const handleRoleChanged = (nextRole: RoleId) => {
    const perms = ROLE_PERMISSIONS[nextRole] || [];
    if (nextRole === 'admin_it') {
      setActiveSection('admin');
      return;
    }
    if (
      activeSection === 'admin' ||
      (activeSection === 'create' && !perms.includes('draft:create_ai')) ||
      (activeSection === 'guard' && !perms.includes('guard:run')) ||
      (activeSection === 'templates' && !perms.includes('view:templates')) ||
      (activeSection === 'archive' && !perms.includes('view:archive')) ||
      (activeSection === 'reports' && !perms.includes('view:reports'))
    ) {
      setActiveSection('dashboard');
    }
    const matching = drafts.find((d) => {
      if (nextRole === 'ka_instalasi')
        return d.status === 'Menunggu Paraf Instalasi';
      if (nextRole === 'kabid') return d.status === 'Menunggu Paraf Kabid';
      if (nextRole === 'wadir') return d.status === 'Menunggu Verifikasi Wadir';
      if (nextRole === 'direktur') return d.status === 'Menunggu TTE Direktur';
      if (nextRole === 'arsiparis')
        return d.status === 'Selesai / Terbit' && !d.officialNumberAssigned;
      if (nextRole === 'staf')
        return (
          d.status === 'Draft' ||
          d.status === 'Ditolak' ||
          d.status === 'Revisi'
        );
      return false;
    });
    if (matching) {
      setActiveDraftId(matching.id);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <Sidebar
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        draftCount={drafts.length}
        guardIssueCount={activeGuardIssueCount}
        pendingQueueCount={pendingQueueCount}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        onOpenLoginModal={() => setLoginModalOpen(true)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          activeSection={activeSection}
          activeDraftNumber={activeDraft.letterNumber}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onNewDraftClick={() => setActiveSection('create')}
          onPrintClick={() => window.print()}
          onRoleChanged={handleRoleChanged}
        />

        <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {activeSection === 'dashboard' && (
            <DashboardView
              drafts={drafts}
              onOpenDraftInEditor={(id) => {
                setActiveDraftId(id);
                setActiveSection('create');
              }}
              onOpenDraftInGuard={(id) => {
                setActiveDraftId(id);
                setActiveSection('guard');
              }}
              onOpenDraftInFlow={(id) => {
                setActiveDraftId(id);
                setActiveSection('flow');
              }}
              onNavigate={setActiveSection}
            />
          )}

          {activeSection === 'create' && (
            <IntentToDraftView
              activeDraft={activeDraft}
              officials={officials}
              onSaveDraft={handleSaveDraft}
              onUpdateActiveDraft={handleUpdateDraft}
              onOpenInGuard={() => setActiveSection('guard')}
              onSubmitToInstallation={handleSubmitToInstallation}
              onOpenInFlow={() => setActiveSection('flow')}
            />
          )}

          {activeSection === 'templates' && (
            <TemplatesView
              drafts={drafts}
              onUseTemplate={handleUseTemplate}
              onOpenDraft={(id) => {
                setActiveDraftId(id);
                setActiveSection('create');
              }}
              onDuplicateDraft={handleDuplicateDraft}
            />
          )}

          {activeSection === 'guard' && (
            <BiromaticGuardView
              drafts={drafts}
              activeDraft={activeDraft}
              officials={officials}
              onSelectDraft={setActiveDraftId}
              onUpdateDraft={handleUpdateDraft}
            />
          )}

          {activeSection === 'flow' && (
            <DynFlowView
              drafts={drafts}
              activeDraft={activeDraft}
              onSelectDraft={setActiveDraftId}
              onUpdateDraft={handleUpdateDraftLocalOnly}
            />
          )}

          {activeSection === 'archive' && (
            <ArchiveView
              drafts={drafts}
              onOpenDraft={(id) => {
                setActiveDraftId(id);
                setActiveSection('create');
              }}
              onDuplicateDraft={handleDuplicateDraft}
            />
          )}

          {activeSection === 'reports' && (
            <ManagementBriefView drafts={drafts} officials={officials} />
          )}

          {activeSection === 'admin' && (
            <AdminSotkAuditView
              drafts={drafts}
              sotkRules={sotkRules}
              officials={officials}
              classifications={classifications}
              onCreateSotkRule={handleCreateSotkRule}
              onToggleSotkRule={handleToggleSotkRule}
              onUpdateOfficialDutyStatus={handleUpdateOfficialDutyStatus}
            />
          )}
        </main>
      </div>

      <NipLoginModal
        open={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLoggedIn={handleRoleChanged}
      />
    </div>
  );
}

export default function App() {
  return (
    <RoleProvider>
      <SitndeWorkspace />
    </RoleProvider>
  );
}
