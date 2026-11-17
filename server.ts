import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import {
  AlignmentType,
  BorderStyle,
  convertMillimetersToTwip,
  Document,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  UnderlineType,
  WidthType,
} from 'docx';
import {
  ARCHIVE_CLASSIFICATIONS,
  buildSotkParafFlow,
  HOSPITAL_INFO,
  INITIAL_DRAFTS,
  INITIAL_SOTK_RULES,
  MASTER_OFFICIALS,
  RAG_PRECEDENT_CORPUS,
  ROLE_USERS,
  TND_TEMPLATES,
} from './src/data/mockHospitalData.ts';
import type {
  ArchiveClassification,
  AuditLogEntry,
  DraftStatus,
  LetterDraft,
  LetterType,
  OfficialProfile,
  ParafStep,
  RoleUserProfile,
  SotkRoutingRule,
  TndTemplateSpec,
  UrgencyLevel,
} from './src/types/sitnde.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.resolve(DATA_DIR, 'sitnde-db.json');

interface SitndeDatabase {
  drafts: LetterDraft[];
  sotkRules: SotkRoutingRule[];
  templates: TndTemplateSpec[];
  officials: OfficialProfile[];
  classifications: ArchiveClassification[];
}

function loadDatabase(): SitndeDatabase {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    const initial: SitndeDatabase = {
      drafts: INITIAL_DRAFTS,
      sotkRules: INITIAL_SOTK_RULES,
      templates: TND_TEMPLATES,
      officials: MASTER_OFFICIALS,
      classifications: ARCHIVE_CLASSIFICATIONS,
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw) as SitndeDatabase;
  } catch {
    const fallback: SitndeDatabase = {
      drafts: INITIAL_DRAFTS,
      sotkRules: INITIAL_SOTK_RULES,
      templates: TND_TEMPLATES,
      officials: MASTER_OFFICIALS,
      classifications: ARCHIVE_CLASSIFICATIONS,
    };
    return fallback;
  }
}

function saveDatabase(db: SitndeDatabase) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
}

function formatNowTimestamp(): string {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  return `17 Nov 2026 · ${hh}:${mm} WIB`;
}

let db = loadDatabase();

const app = express();
app.use(express.json({ limit: '2mb' }));

// 1. Bootstrap full persistent database
app.get('/api/bootstrap', (_req, res) => {
  res.json(db);
});

// 2. NIP & Password Login / Pegawai Lookup (FR-01)
const DEFAULT_USER_PASSWORD = process.env.SITNDE_DEFAULT_PASSWORD || '123456';

app.post('/api/auth/login-nip', (req, res) => {
  const nipInput = String(req.body?.nip || '').replace(/\s+/g, '');
  const passwordInput = String(req.body?.password || '');

  if (!nipInput) {
    res.status(400).json({ error: 'Masukkan NIP pegawai terlebih dahulu.' });
    return;
  }
  if (!passwordInput) {
    res.status(400).json({ error: 'Masukkan kata sandi terlebih dahulu.' });
    return;
  }

  const matchedUser = ROLE_USERS.find(
    (u) => u.nip.replace(/\s+/g, '') === nipInput
  );
  if (!matchedUser) {
    res.status(404).json({
      error: `NIP ${req.body?.nip} tidak ditemukan pada database kepegawaian SIMRS RSUD Nusantara Jaya.`,
    });
    return;
  }
  if (passwordInput !== DEFAULT_USER_PASSWORD) {
    res.status(401).json({
      error: 'Kata sandi yang Anda masukkan salah. Silakan coba kembali.',
    });
    return;
  }
  res.json({ user: matchedUser });
});

// 3. Real Server-Side Gemini AI Intent-to-Draft (FR-02, FR-03, FR-04, Lampiran E)
app.post('/api/ai/intent-to-draft', async (req, res) => {
  const promptText = String(req.body?.prompt || '').trim();
  const unitHint = String(req.body?.unitName || '').trim();
  const letterTypeHint = String(req.body?.letterType || '').trim();
  const creatorUser = req.body?.creatorUser as RoleUserProfile | undefined;

  if (!promptText) {
    res.status(400).json({ error: 'Prompt instruksi surat tidak boleh kosong.' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    res.status(400).json({
      code: 'API_KEY_MISSING',
      error:
        'GEMINI_API_KEY belum dikonfigurasi pada Settings > Secrets. Silakan atur kunci API atau gunakan Generator Deterministik Lokal untuk melanjutkan uji coba.',
    });
    return;
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const systemInstruction = `Anda adalah Asisten Tata Naskah Dinas Cerdas (SITNDE) pada Rumah Sakit Umum Daerah (RSUD) Nusantara Jaya.
Tugas Anda adalah mengubah instruksi bahasa sehari-hari dari pegawai menjadi struktur data JSON dan draf narasi surat dinas resmi yang patuh pada kaidah EYD V serta bahasa birokrasi pemerintahan yang lugas, sopan, dan baku.

Aturan Ketat:
1. Identifikasi jenis naskah dinas yang paling tepat: "Nota Dinas", "Surat Undangan", "Surat Tugas", "Surat Permohonan", atau "Surat Edaran".
2. Tentukan kode klasifikasi arsip yang sesuai: "000" (Umum), "005" (Undangan), "027" (Pengadaan), "090" (Perjalanan Dinas/Tugas), "440" (Kesehatan/Kebijakan), "445" (Pelayanan RS), atau "800" (Kepegawaian).
3. Ekstrak parameter tujuan, perihal, alasan/latar belakang, serta rincian kebutuhan secara akurat dari input pengguna.
4. JANGAN PERNAH mengarang nomor surat, tanggal kegiatan, waktu, tempat, nama pejabat, NIP, atau nominal anggaran jika tidak disebutkan dalam input pengguna; gunakan penanda "[Isi Hari/Tanggal]", "[Isi Pukul]", "[Isi Tempat]", atau "[Isi Data Pegawai]" untuk informasi yang belum tersedia.
5. Gunakan kalimat efektif sesuai EYD V, hindari kata tidak baku (seperti nomer, rubah, apotik, terimakasih), dan pertahankan istilah medis/manajemen RS resmi (seperti IGD, ICU, e-RM, SIMRS, BTCLS, PPI, PACS, BLUD).
6. Susun bodyParagraphs minimal 3 paragraf resmi: pembuka, pokok maksud/usulan, dan penutup formal pemerintahan.`;

    const fullUserPrompt = `Instruksi Pegawai: "${promptText}"
Konteks Unit Pengusul: ${unitHint || creatorUser?.unitName || 'Instalasi Rawat Inap'}
${letterTypeHint ? `Preferensi Jenis Surat: ${letterTypeHint}` : ''}`;

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: fullUserPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            jenisSurat: {
              type: Type.STRING,
              description:
                'Salah satu dari: Nota Dinas, Surat Undangan, Surat Tugas, Surat Permohonan, Surat Edaran',
            },
            kodeKlasifikasi: {
              type: Type.STRING,
              description: 'Kode angka klasifikasi arsip 3 digit, misal 027, 005, 090, 440, 445',
            },
            klasifikasiKeterangan: {
              type: Type.STRING,
              description: 'Deskripsi singkat kode klasifikasi',
            },
            unitPengusul: {
              type: Type.STRING,
              description: 'Nama instalasi atau bagian pengusul di RSUD',
            },
            tujuanSurat: {
              type: Type.STRING,
              description: 'Jabatan pihak penerima surat',
            },
            perihal: {
              type: Type.STRING,
              description: 'Ringkasan perihal surat yang lugas dan formal',
            },
            urgensi: {
              type: Type.STRING,
              description: 'Salah satu dari: Biasa, Penting, Segera',
            },
            entitasItem: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Daftar item barang, jumlah, atau pihak yang disebutkan',
            },
            hariTanggal: {
              type: Type.STRING,
              description: 'Khusus undangan/tugas jika disebutkan, atau [Isi Hari/Tanggal]',
            },
            waktu: {
              type: Type.STRING,
              description: 'Khusus undangan jika disebutkan, atau [Isi Pukul]',
            },
            tempat: {
              type: Type.STRING,
              description: 'Khusus undangan jika disebutkan, atau [Isi Tempat]',
            },
            bodyParagraphs: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3 paragraf resmi isi surat dinas berbahasa Indonesia baku EYD V',
            },
          },
          required: [
            'jenisSurat',
            'kodeKlasifikasi',
            'unitPengusul',
            'tujuanSurat',
            'perihal',
            'urgensi',
            'bodyParagraphs',
          ],
        },
      },
    });

    const parsed = JSON.parse((response.text || '{}').trim());
    const validTypes: LetterType[] = [
      'Nota Dinas',
      'Surat Undangan',
      'Surat Tugas',
      'Surat Permohonan',
      'Surat Edaran',
    ];
    const letterType: LetterType = validTypes.includes(parsed.jenisSurat)
      ? parsed.jenisSurat
      : 'Nota Dinas';

    const validUrgency: UrgencyLevel[] = ['Biasa', 'Penting', 'Segera'];
    const urgency: UrgencyLevel = validUrgency.includes(parsed.urgensi)
      ? parsed.urgensi
      : 'Penting';

    const proposingUnit = parsed.unitPengusul || unitHint || 'Instalasi Rawat Inap';
    const classificationCode = String(parsed.kodeKlasifikasi || '027').slice(0, 3);
    const ts = formatNowTimestamp();
    const draftId = `drf-${Date.now()}`;

    const direktur = db.officials[9] || MASTER_OFFICIALS[9];
    const kaInst = proposingUnit.includes('Jalan')
      ? db.officials[2] || MASTER_OFFICIALS[2]
      : proposingUnit.includes('Farmasi')
      ? db.officials[3] || MASTER_OFFICIALS[3]
      : proposingUnit.includes('IPSRS')
      ? db.officials[4] || MASTER_OFFICIALS[4]
      : db.officials[1] || MASTER_OFFICIALS[1];

    const signer =
      letterType === 'Nota Dinas' ? kaInst : direktur;

    const templateCodeMap: Record<LetterType, string> = {
      'Nota Dinas': 'TND-ND-01 (Nota Dinas Internal)',
      'Surat Undangan': 'TND-UND-02 (Surat Undangan)',
      'Surat Tugas': 'TND-ST-03 (Surat Tugas)',
      'Surat Permohonan': 'TND-SP-04 (Surat Permohonan)',
      'Surat Edaran': 'TND-SE-05 (Surat Edaran)',
    };

    const eventDetails =
      letterType === 'Surat Undangan'
        ? {
            hariTanggal: parsed.hariTanggal || '[Isi Hari/Tanggal Pelaksanaan]',
            waktu: parsed.waktu || '[Isi Pukul Pelaksanaan]',
            tempat: parsed.tempat || '[Isi Ruang/Tempat Rapat]',
            acara: parsed.perihal,
          }
        : undefined;

    const newDraft: LetterDraft = {
      id: draftId,
      creatorId: creatorUser?.id || 'usr-staf',
      letterNumber: '[Menunggu Nomor Resmi TU]',
      officialNumberAssigned: false,
      tteSigned: false,
      letterType,
      classificationCode,
      proposingUnit,
      recipient: parsed.tujuanSurat,
      sender: `Kepala ${proposingUnit}`,
      subject: parsed.perihal,
      urgency,
      dateStr: '17 November 2026',
      attachment:
        letterType === 'Nota Dinas' || letterType === 'Surat Permohonan'
          ? '1 (satu) berkas'
          : '-',
      bodyParagraphs:
        Array.isArray(parsed.bodyParagraphs) && parsed.bodyParagraphs.length > 0
          ? parsed.bodyParagraphs
          : [
              `Dengan hormat, sehubungan dengan ${parsed.perihal}, bersama ini kami sampaikan permohonan tindak lanjut pada ${proposingUnit}.`,
              `Demikian disampaikan. Atas perhatian Bapak/Ibu, kami ucapkan terima kasih.`,
            ],
      eventDetails,
      signerName: signer.fullNameWithTitles,
      signerTitle: signer.position,
      signerNip: signer.nip,
      rawPrompt: promptText,
      extractedJson: {
        jenisSurat: letterType,
        kodeKlasifikasi: `${classificationCode} / ${
          parsed.klasifikasiKeterangan || 'Naskah Dinas RSUD'
        }`,
        unitPengusul: proposingUnit,
        tujuanSurat: parsed.tujuanSurat,
        perihal: parsed.perihal,
        urgensi: urgency,
        templateTnd: templateCodeMap[letterType],
        entitasItem: parsed.entitasItem,
        hariTanggal: eventDetails?.hariTanggal,
        waktu: eventDetails?.waktu,
        tempat: eventDetails?.tempat,
        generationEngine: 'gemini-4-hydrogen',
      },
      status: 'Draft',
      complianceScore: JSON.stringify(parsed.bodyParagraphs || []).includes('[Isi')
        ? 88
        : 100,
      parafFlow: buildSotkParafFlow(
        proposingUnit,
        letterType,
        'Draft',
        db.officials
      ),
      auditTrail: [
        {
          id: `aud-${Date.now()}`,
          draftId,
          draftNumber: '[Draf Awal]',
          draftSubject: parsed.perihal,
          actorName: creatorUser?.name || 'Rizky Pratama, A.Md.Kep.',
          actorNip: creatorUser?.nip || '19940312 202012 1 004',
          actorRole: creatorUser?.shortRoleLabel || 'Staf Pengusul',
          action: 'Membuat Draf via Gemini AI (gemini-4-hydrogen)',
          fromStatus: '-',
          toStatus: 'Draft',
          note: 'Ekstraksi intent & penyusunan narasi EYD V berhasil dijalankan melalui server.',
          timestamp: ts,
        },
      ],
      createdAt: ts,
      updatedAt: ts,
    };

    db.drafts = [newDraft, ...db.drafts];
    saveDatabase(db);
    res.json({ draft: newDraft });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Gagal menghubungi layanan Gemini AI.';
    const statusCode = message.includes('403')
      ? 403
      : message.includes('429')
      ? 429
      : 500;
    res.status(statusCode).json({
      code: 'GEMINI_UPSTREAM_ERROR',
      error: message,
    });
  }
});

// 4. Create / Save Draft
app.post('/api/drafts', (req, res) => {
  const draft = req.body as LetterDraft;
  if (!draft || !draft.id) {
    res.status(400).json({ error: 'Payload draf tidak valid.' });
    return;
  }
  const idx = db.drafts.findIndex((d) => d.id === draft.id);
  if (idx >= 0) {
    db.drafts[idx] = draft;
  } else {
    db.drafts = [draft, ...db.drafts];
  }
  saveDatabase(db);
  res.json({ draft });
});

app.put('/api/drafts/:id', (req, res) => {
  const { id } = req.params;
  const updated = req.body as LetterDraft;
  const idx = db.drafts.findIndex((d) => d.id === id);
  if (idx === -1) {
    res.status(404).json({ error: 'Draf tidak ditemukan.' });
    return;
  }
  db.drafts[idx] = { ...db.drafts[idx], ...updated };
  saveDatabase(db);
  res.json({ draft: db.drafts[idx] });
});

// 5. Server-Enforced RBAC + 6-Stage DynFlow-SOTK Workflow Transition
app.post('/api/drafts/:id/transition', (req, res) => {
  const { id } = req.params;
  const { actionType, actor, note } = req.body as {
    actionType: 'submit' | 'approve' | 'revise' | 'reject' | 'assign_number';
    actor: RoleUserProfile;
    note?: string;
  };

  const idx = db.drafts.findIndex((d) => d.id === id);
  if (idx === -1) {
    res.status(404).json({ error: 'Draf tidak ditemukan.' });
    return;
  }

  const draft = db.drafts[idx];

  // Server-side RBAC anti-bypass check
  const allowedByStage =
    (actionType === 'submit' &&
      actor.roleId === 'staf' &&
      (draft.status === 'Draft' ||
        draft.status === 'Revisi' ||
        draft.status === 'Ditolak')) ||
    ((actionType === 'approve' ||
      actionType === 'revise' ||
      actionType === 'reject') &&
      ((actor.roleId === 'ka_instalasi' &&
        draft.status === 'Menunggu Paraf Instalasi') ||
        (actor.roleId === 'kabid' && draft.status === 'Menunggu Paraf Kabid') ||
        (actor.roleId === 'wadir' &&
          draft.status === 'Menunggu Verifikasi Wadir') ||
        (actor.roleId === 'direktur' &&
          draft.status === 'Menunggu TTE Direktur'))) ||
    (actionType === 'assign_number' &&
      actor.roleId === 'arsiparis' &&
      draft.status === 'Selesai / Terbit' &&
      !draft.officialNumberAssigned);

  if (!allowedByStage) {
    res.status(403).json({
      error: `Akses RBAC ditolak: Role "${actor.shortRoleLabel}" tidak berwenang melakukan aksi "${actionType}" pada status "${draft.status}".`,
    });
    return;
  }

  const ts = formatNowTimestamp();
  const prevStatus = draft.status;
  let nextStatus: DraftStatus = draft.status;
  let actionLabel = '';
  let nextTteSigned = draft.tteSigned;
  let nextOfficialAssigned = draft.officialNumberAssigned;
  let nextLetterNumber = draft.letterNumber;

  if (actionType === 'submit') {
    nextStatus = 'Menunggu Paraf Instalasi';
    actionLabel = 'Ajukan ke Instalasi';
  } else if (actionType === 'approve') {
    if (draft.status === 'Menunggu Paraf Instalasi') {
      nextStatus = 'Menunggu Paraf Kabid';
      actionLabel = 'Paraf Teknis Tahap 1 (Disetujui)';
    } else if (draft.status === 'Menunggu Paraf Kabid') {
      nextStatus = 'Menunggu Verifikasi Wadir';
      actionLabel = 'Paraf Struktural Tahap 2 (Disetujui)';
    } else if (draft.status === 'Menunggu Verifikasi Wadir') {
      nextStatus = 'Menunggu TTE Direktur';
      actionLabel = 'Verifikasi Kebijakan Wadir (Disetujui)';
    } else if (draft.status === 'Menunggu TTE Direktur') {
      nextStatus = 'Selesai / Terbit';
      nextTteSigned = true;
      actionLabel = 'Tanda Tangan Elektronik (TTE) Direktur';
    }
  } else if (actionType === 'revise') {
    nextStatus = 'Revisi';
    actionLabel = 'Kembalikan untuk Revisi';
  } else if (actionType === 'reject') {
    nextStatus = 'Ditolak';
    actionLabel = 'Tolak Pengajuan Surat';
  } else if (actionType === 'assign_number') {
    const seq = Math.floor(215 + Math.random() * 750);
    nextLetterNumber = `${draft.classificationCode}/${seq}/RSUD-NJ/XI/2026`;
    nextOfficialAssigned = true;
    nextStatus = 'Selesai / Terbit';
    actionLabel = `Generate Nomor Surat Resmi (${nextLetterNumber}) & Arsip Otomatis`;
  }

  const nextFlow: ParafStep[] = buildSotkParafFlow(
    draft.proposingUnit,
    draft.letterType,
    nextStatus,
    db.officials
  ).map((step) => {
    if (actionType === 'assign_number' && step.roleId === 'arsiparis') {
      return {
        ...step,
        status: 'completed',
        timestamp: ts,
        note: `Nomor resmi ${nextLetterNumber} telah diterbitkan & diarsipkan.`,
      };
    }
    if (
      (actionType === 'revise' || actionType === 'reject') &&
      step.roleId === actor.roleId
    ) {
      return {
        ...step,
        status: actionType === 'reject' ? 'rejected' : 'revision',
        timestamp: ts,
        note: note || actionLabel,
      };
    }
    return step;
  });

  const auditEntry: AuditLogEntry = {
    id: `aud-${Date.now()}-${Math.floor(Math.random() * 999)}`,
    draftId: draft.id,
    draftNumber: nextLetterNumber,
    draftSubject: draft.subject,
    actorName: actor.name,
    actorNip: actor.nip,
    actorRole: actor.shortRoleLabel,
    action: actionLabel,
    fromStatus: prevStatus,
    toStatus: nextStatus,
    note: note?.trim() || undefined,
    timestamp: ts,
  };

  const updatedDraft: LetterDraft = {
    ...draft,
    letterNumber: nextLetterNumber,
    officialNumberAssigned: nextOfficialAssigned,
    tteSigned: nextTteSigned,
    status: nextStatus,
    parafFlow: nextFlow,
    auditTrail: [auditEntry, ...draft.auditTrail],
    updatedAt: ts,
  };

  db.drafts[idx] = updatedDraft;
  saveDatabase(db);
  res.json({ draft: updatedDraft });
});

// 6. RAG Historical Precedents Search (Phase 3)
app.post('/api/rag/precedents', (req, res) => {
  const query = String(req.body?.query || '').toLowerCase();
  const letterType = String(req.body?.letterType || '');

  const tokens = query
    .split(/\s+/)
    .map((t) => t.replace(/[^a-z0-9-]/g, ''))
    .filter((t) => t.length > 2);

  const scored = RAG_PRECEDENT_CORPUS.map((doc) => {
    let score = 0;
    if (letterType && doc.letterType === letterType) score += 4;
    for (const kw of doc.keywords) {
      if (query.includes(kw)) score += 3;
      for (const tok of tokens) {
        if (kw.includes(tok) || doc.title.toLowerCase().includes(tok)) {
          score += 2;
        }
      }
    }
    return { doc, score };
  })
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((item) => ({
      ...item.doc,
      relevancePercent: Math.min(98, Math.max(62, 60 + item.score * 4)),
    }));

  res.json({ precedents: scored });
});

// 7. Admin SOTK & Master Officials (Plt./Plh.) Persistence
app.post('/api/sotk-rules', (req, res) => {
  const rule = req.body as SotkRoutingRule;
  if (!rule || !rule.originUnit) {
    res.status(400).json({ error: 'Aturan SOTK tidak valid.' });
    return;
  }
  db.sotkRules = [rule, ...db.sotkRules];
  saveDatabase(db);
  res.json({ sotkRules: db.sotkRules });
});

app.patch('/api/sotk-rules/:id', (req, res) => {
  const { id } = req.params;
  db.sotkRules = db.sotkRules.map((r) =>
    r.id === id ? { ...r, ...req.body } : r
  );
  saveDatabase(db);
  res.json({ sotkRules: db.sotkRules });
});

app.patch('/api/officials/:id', (req, res) => {
  const { id } = req.params;
  db.officials = db.officials.map((off) =>
    off.id === id ? { ...off, ...req.body } : off
  );
  // Refresh parafFlow on Draft / pending items so Plt./Plh. propagates live
  db.drafts = db.drafts.map((d) =>
    d.status === 'Selesai / Terbit'
      ? d
      : {
          ...d,
          parafFlow: buildSotkParafFlow(
            d.proposingUnit,
            d.letterType,
            d.status,
            db.officials
          ),
        }
  );
  saveDatabase(db);
  res.json({ officials: db.officials, drafts: db.drafts });
});

// 8. Real Binary OpenXML (.docx) Generator with Deterministic TND Margins (FR-09)
app.post('/api/export/docx', async (req, res) => {
  const draft = req.body as LetterDraft;
  if (!draft || !draft.subject) {
    res.status(400).json({ error: 'Data surat tidak lengkap untuk ekspor DOCX.' });
    return;
  }

  try {
    const noBorder = {
      style: BorderStyle.NONE,
      size: 0,
      color: 'FFFFFF',
    };

    const metaRow = (label: string, val: string, boldVal = false) =>
      new TableRow({
        children: [
          new TableCell({
            width: { size: 22, type: WidthType.PERCENTAGE },
            borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
            children: [
              new Paragraph({
                children: [new TextRun({ text: label, size: 22, font: 'Arial' })],
              }),
            ],
          }),
          new TableCell({
            width: { size: 4, type: WidthType.PERCENTAGE },
            borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
            children: [
              new Paragraph({
                children: [new TextRun({ text: ':', size: 22, font: 'Arial' })],
              }),
            ],
          }),
          new TableCell({
            width: { size: 74, type: WidthType.PERCENTAGE },
            borders: { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: val,
                    size: 22,
                    bold: boldVal,
                    font: 'Arial',
                  }),
                ],
              }),
            ],
          }),
        ],
      });

    const children: (Paragraph | Table)[] = [
      // Kop Surat Resmi
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: HOSPITAL_INFO.pemda,
            bold: true,
            size: 22,
            font: 'Arial',
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: HOSPITAL_INFO.dinas,
            bold: true,
            size: 22,
            font: 'Arial',
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: HOSPITAL_INFO.name,
            bold: true,
            size: 28,
            font: 'Arial',
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: HOSPITAL_INFO.address,
            size: 18,
            font: 'Arial',
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        border: {
          bottom: { style: BorderStyle.DOUBLE, size: 12, color: '000000' },
        },
        spacing: { after: 240 },
        children: [
          new TextRun({
            text: HOSPITAL_INFO.contact,
            size: 17,
            font: 'Arial',
          }),
        ],
      }),
    ];

    if (draft.letterType === 'Nota Dinas') {
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 120, after: 180 },
          children: [
            new TextRun({
              text: 'NOTA DINAS',
              bold: true,
              size: 24,
              underline: { type: UnderlineType.SINGLE },
              font: 'Arial',
            }),
          ],
        }),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            metaRow('Kepada Yth.', draft.recipient),
            metaRow('Dari', draft.sender),
            metaRow('Tanggal', draft.dateStr),
            metaRow('Nomor', draft.letterNumber),
            metaRow('Sifat', draft.urgency),
            metaRow('Lampiran', draft.attachment),
            metaRow('Hal', draft.subject, true),
          ],
        }),
        new Paragraph({
          border: {
            bottom: { style: BorderStyle.SINGLE, size: 6, color: '000000' },
          },
          spacing: { after: 200 },
          children: [],
        })
      );
    } else {
      children.push(
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          spacing: { before: 80, after: 120 },
          children: [
            new TextRun({
              text: `${HOSPITAL_INFO.city}, ${draft.dateStr}`,
              size: 22,
              font: 'Arial',
            }),
          ],
        }),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            metaRow('Nomor', draft.letterNumber),
            metaRow('Sifat', draft.urgency),
            metaRow('Lampiran', draft.attachment),
            metaRow('Hal', draft.subject, true),
          ],
        }),
        new Paragraph({
          spacing: { before: 180, after: 160 },
          children: [
            new TextRun({ text: 'Kepada Yth.\n', size: 22, font: 'Arial' }),
            new TextRun({
              text: `${draft.recipient}\n`,
              bold: true,
              size: 22,
              font: 'Arial',
            }),
            new TextRun({ text: 'di Tempat', size: 22, font: 'Arial' }),
          ],
        })
      );
    }

    // Body Paragraphs
    for (let i = 0; i < draft.bodyParagraphs.length; i++) {
      children.push(
        new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          spacing: { after: 180, line: 276 },
          indent: { firstLine: convertMillimetersToTwip(10) },
          children: [
            new TextRun({
              text: draft.bodyParagraphs[i],
              size: 22,
              font: 'Arial',
            }),
          ],
        })
      );

      if (i === 0 && draft.eventDetails) {
        children.push(
          new Table({
            width: { size: 90, type: WidthType.PERCENTAGE },
            rows: [
              metaRow('Hari / Tanggal', draft.eventDetails.hariTanggal),
              metaRow('Pukul', draft.eventDetails.waktu),
              metaRow('Tempat', draft.eventDetails.tempat),
              metaRow('Acara', draft.eventDetails.acara, true),
            ],
          }),
          new Paragraph({ spacing: { after: 140 }, children: [] })
        );
      }
    }

    // Signature Block
    children.push(
      new Paragraph({
        indent: { left: convertMillimetersToTwip(95) },
        spacing: { before: 320 },
        children: [
          new TextRun({
            text: `${draft.signerTitle},`,
            size: 22,
            font: 'Arial',
          }),
        ],
      }),
      new Paragraph({
        indent: { left: convertMillimetersToTwip(95) },
        spacing: { before: 120, after: 120 },
        children: [
          new TextRun({
            text: draft.tteSigned
              ? '[Ditandatangani secara elektronik — BSrE / BSSN]'
              : '\n\n',
            italics: draft.tteSigned,
            size: 18,
            color: draft.tteSigned ? '15803D' : '000000',
            font: 'Arial',
          }),
        ],
      }),
      new Paragraph({
        indent: { left: convertMillimetersToTwip(95) },
        children: [
          new TextRun({
            text: draft.signerName,
            bold: true,
            underline: { type: UnderlineType.SINGLE },
            size: 22,
            font: 'Arial',
          }),
        ],
      }),
      new Paragraph({
        indent: { left: convertMillimetersToTwip(95) },
        children: [
          new TextRun({
            text: `NIP. ${draft.signerNip}`,
            size: 20,
            font: 'Arial',
          }),
        ],
      })
    );

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: convertMillimetersToTwip(25),
                bottom: convertMillimetersToTwip(25),
                left: convertMillimetersToTwip(30),
                right: convertMillimetersToTwip(20),
              },
            },
          },
          children,
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    const safeName = draft.subject
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .slice(0, 40);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="SITNDE-${draft.letterType.replace(/\s+/g, '-')}-${safeName}.docx"`
    );
    res.send(buffer);
  } catch (err: unknown) {
    res.status(500).json({
      error:
        err instanceof Error ? err.message : 'Gagal membuat dokumen DOCX.',
    });
  }
});

// Mount Vite in dev or static dist in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distDir, 'index.html'));
    });
  }

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SITNDE Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
