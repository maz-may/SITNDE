export type NavSection =
  | 'dashboard'
  | 'create'
  | 'templates'
  | 'guard'
  | 'flow'
  | 'archive'
  | 'reports'
  | 'admin';

export type RoleId =
  | 'staf'
  | 'ka_instalasi'
  | 'kabid'
  | 'wadir'
  | 'direktur'
  | 'arsiparis'
  | 'admin_it';

export type PermissionCode =
  | 'draft:create_ai'
  | 'draft:edit_content'
  | 'draft:view_all'
  | 'guard:run'
  | 'workflow:submit'
  | 'workflow:paraf_1'
  | 'workflow:paraf_2'
  | 'workflow:verify_wadir'
  | 'document:sign_tte'
  | 'document:assign_number'
  | 'view:templates'
  | 'view:approval_queue'
  | 'view:archive'
  | 'view:reports'
  | 'system:manage_sotk_tnd';

export interface RoleUserProfile {
  id: string;
  roleId: RoleId;
  roleLabel: string;
  shortRoleLabel: string;
  description: string;
  name: string;
  nip: string;
  position: string;
  unitName: string;
  isPlt?: boolean;
}

export type LetterType =
  | 'Nota Dinas'
  | 'Surat Undangan'
  | 'Surat Tugas'
  | 'Surat Permohonan'
  | 'Surat Edaran';

export type UrgencyLevel = 'Biasa' | 'Penting' | 'Segera';

export type DraftStatus =
  | 'Draft'
  | 'Menunggu Paraf Instalasi'
  | 'Menunggu Paraf Kabid'
  | 'Menunggu Verifikasi Wadir'
  | 'Menunggu TTE Direktur'
  | 'Selesai / Terbit'
  | 'Revisi'
  | 'Ditolak';

export type ParafStepStatus =
  | 'completed'
  | 'current'
  | 'pending'
  | 'revision'
  | 'rejected';

export type OfficialDutyStatus = 'Definitif' | 'Cuti (Plt.)' | 'Dinas Luar (Plh.)';

export interface OfficialProfile {
  id: string;
  name: string;
  fullNameWithTitles: string;
  nip: string;
  rank: string;
  position: string;
  unitName: string;
  sotkLevel: 1 | 2 | 3 | 4 | 5;
  dutyStatus?: OfficialDutyStatus;
  delegateName?: string;
  delegateNip?: string;
}

export interface ArchiveClassification {
  code: string;
  category: string;
  description: string;
}

export interface PrecedentDoc {
  id: string;
  letterNumber: string;
  letterType: LetterType;
  classificationCode: string;
  unitName: string;
  title: string;
  keywords: string[];
  excerptParagraph: string;
  legalBasis?: string;
  year: string;
}

export interface ParafStep {
  order: number;
  roleId: RoleId;
  roleLabel: string;
  unitName: string;
  officialName: string;
  officialNip: string;
  isPltOrPlh?: string;
  status: ParafStepStatus;
  timestamp?: string;
  note?: string;
}

export interface AuditLogEntry {
  id: string;
  draftId: string;
  draftNumber: string;
  draftSubject: string;
  actorName: string;
  actorNip: string;
  actorRole: string;
  action: string;
  fromStatus: string;
  toStatus: string;
  note?: string;
  timestamp: string;
}

export interface SotkRoutingRule {
  id: string;
  originUnit: string;
  unitType: 'Fungsional' | 'Struktural';
  paraf1Role: string;
  paraf2Role: string;
  wadirRole: string;
  finalSigner: string;
  isActive: boolean;
}

export interface ExtractedIntentPayload {
  jenisSurat: LetterType;
  kodeKlasifikasi: string;
  unitPengusul: string;
  tujuanSurat: string;
  perihal: string;
  urgensi: UrgencyLevel;
  templateTnd: string;
  entitasItem?: string[];
  hariTanggal?: string;
  waktu?: string;
  tempat?: string;
  generationEngine?: 'gemini-4-hydrogen' | 'local-rule-engine';
}

export interface ValidationIssue {
  id: string;
  category: 'eyd' | 'nip' | 'gelar' | 'placeholder' | 'pdp';
  severity: 'error' | 'warning';
  originalText: string;
  suggestedText: string;
  explanation: string;
  field: 'body' | 'subject' | 'recipient' | 'signerName' | 'signerNip';
  fixed: boolean;
}

export interface LetterDraft {
  id: string;
  creatorId: string;
  letterNumber: string;
  officialNumberAssigned: boolean;
  tteSigned: boolean;
  letterType: LetterType;
  classificationCode: string;
  proposingUnit: string;
  recipient: string;
  sender: string;
  subject: string;
  urgency: UrgencyLevel;
  dateStr: string;
  attachment: string;
  bodyParagraphs: string[];
  eventDetails?: {
    hariTanggal: string;
    waktu: string;
    tempat: string;
    acara: string;
  };
  signerName: string;
  signerTitle: string;
  signerNip: string;
  rawPrompt: string;
  extractedJson: ExtractedIntentPayload;
  status: DraftStatus;
  complianceScore: number;
  parafFlow: ParafStep[];
  auditTrail: AuditLogEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface TndTemplateSpec {
  id: string;
  letterType: LetterType;
  templateCode: string;
  classificationCode: string;
  paperSize: string;
  margins: string;
  fontSpec: string;
  description: string;
  requiredElements: string[];
  samplePrompt: string;
}
