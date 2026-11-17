import { useMemo, useState } from 'react';
import { AdminSotkAuditView } from './components/AdminSotkAuditView';
import { ArchiveView } from './components/ArchiveView';
import { BiromaticGuardView } from './components/BiromaticGuardView';
import { DashboardView } from './components/DashboardView';
import { DynFlowView } from './components/DynFlowView';
import { IntentToDraftView } from './components/IntentToDraftView';
import { Sidebar } from './components/Sidebar';
import { TemplatesView } from './components/TemplatesView';
import { TopBar } from './components/TopBar';
import { RoleProvider, useRole } from './context/RoleContext';
import { INITIAL_DRAFTS, ROLE_PERMISSIONS } from './data/mockHospitalData';
import {
  LetterDraft,
  NavSection,
  RoleId,
  TndTemplateSpec,
} from './types/sitnde';
import {
  generateDraftFromPrompt,
  scanWithBiromaticGuard,
  transitionDraftWorkflow,
} from './utils/sitndeEngine';

function SitndeWorkspace() {
  const { currentUser } = useRole();
  const [activeSection, setActiveSection] = useState<NavSection>('dashboard');
  const [drafts, setDrafts] = useState<LetterDraft[]>(INITIAL_DRAFTS);
  const [activeDraftId, setActiveDraftId] = useState<string>(
    INITIAL_DRAFTS[0].id
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeDraft = useMemo(
    () => drafts.find((d) => d.id === activeDraftId) || drafts[0],
    [drafts, activeDraftId]
  );

  const activeGuardIssueCount = useMemo(
    () => scanWithBiromaticGuard(activeDraft).issues.length,
    [activeDraft]
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

  const handleSaveDraft = (newOrUpdated: LetterDraft) => {
    setDrafts((prev) => {
      const exists = prev.some((d) => d.id === newOrUpdated.id);
      if (exists) {
        return prev.map((d) => (d.id === newOrUpdated.id ? newOrUpdated : d));
      }
      return [newOrUpdated, ...prev];
    });
    setActiveDraftId(newOrUpdated.id);
  };

  const handleUpdateDraft = (updated: LetterDraft) => {
    setDrafts((prev) =>
      prev.map((d) => (d.id === updated.id ? updated : d))
    );
  };

  const handleUseTemplate = (template: TndTemplateSpec) => {
    const generated = generateDraftFromPrompt(
      template.samplePrompt,
      undefined,
      template.letterType,
      currentUser
    );
    handleSaveDraft(generated);
    setActiveSection('create');
  };

  const handleDuplicateDraft = (draftId: string) => {
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
    setDrafts((prev) => [copy, ...prev]);
    setActiveDraftId(copy.id);
    setActiveSection('create');
  };

  const handleSubmitToInstallation = (draft: LetterDraft) => {
    const submitted = transitionDraftWorkflow(
      draft,
      'submit',
      currentUser,
      'Diajukan dari editor Intent-to-Draft.'
    );
    handleSaveDraft(submitted);
    setActiveSection('flow');
  };

  const handleRoleChanged = (nextRole: RoleId) => {
    const perms = ROLE_PERMISSIONS[nextRole] || [];
    // Ensure user never lands on a restricted page after switching roles
    if (nextRole === 'admin_it') {
      setActiveSection('admin');
      return;
    }
    if (
      activeSection === 'admin' ||
      (activeSection === 'create' && !perms.includes('draft:create_ai')) ||
      (activeSection === 'guard' && !perms.includes('guard:run')) ||
      (activeSection === 'templates' && !perms.includes('view:templates')) ||
      (activeSection === 'archive' && !perms.includes('view:archive'))
    ) {
      setActiveSection('dashboard');
    }
    // Auto-select the first pending draft for the newly selected role so tester sees it immediately
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

        <main className="mx-auto w-full max-w-[1320px] flex-1 px-4 py-6 sm:px-6 lg:px-8">
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
              onSelectDraft={setActiveDraftId}
              onUpdateDraft={handleUpdateDraft}
            />
          )}

          {activeSection === 'flow' && (
            <DynFlowView
              drafts={drafts}
              activeDraft={activeDraft}
              onSelectDraft={setActiveDraftId}
              onUpdateDraft={handleUpdateDraft}
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

          {activeSection === 'admin' && <AdminSotkAuditView drafts={drafts} />}
        </main>
      </div>
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
