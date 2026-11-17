import {
  buildSotkParafFlow,
  HOSPITAL_INFO,
  MASTER_OFFICIALS,
} from '../data/mockHospitalData';
import {
  AuditLogEntry,
  DraftStatus,
  LetterDraft,
  LetterType,
  ParafStep,
  RoleUserProfile,
  UrgencyLevel,
  ValidationIssue,
} from '../types/sitnde';

interface TypoRule {
  pattern: RegExp;
  wrong: string;
  correct: string;
  explanation: string;
}

const EYD_RULES: TypoRule[] = [
  {
    pattern: /\bnomer\b/gi,
    wrong: 'nomer',
    correct: 'nomor',
    explanation:
      'Kata tidak baku menurut KBBI & EYD V. Bentuk baku yang tepat adalah "nomor".',
  },
  {
    pattern: /\brubah\b/gi,
    wrong: 'rubah',
    correct: 'ubah',
    explanation:
      '"Rubah" berarti nama satwa; untuk makna mengganti/menjadikan lain, gunakan kata baku "ubah" / "mengubah".',
  },
  {
    pattern: /\bmerubah\b/gi,
    wrong: 'merubah',
    correct: 'mengubah',
    explanation:
      'Imbuhan meN- pada kata dasar "ubah" membentuk kata baku "mengubah", bukan "merubah".',
  },
  {
    pattern: /\bapotik\b/gi,
    wrong: 'apotik',
    correct: 'apotek',
    explanation:
      'Penulisan tidak baku. Istilah resmi fasilitas pelayanan kefarmasian menurut KBBI adalah "apotek".',
  },
  {
    pattern: /\banalisa\b/gi,
    wrong: 'analisa',
    correct: 'analisis',
    explanation:
      'Kata serapan baku bahasa Indonesia adalah "analisis" (bukan "analisa").',
  },
  {
    pattern: /\bijin\b/gi,
    wrong: 'ijin',
    correct: 'izin',
    explanation: 'Kata tidak baku. Gunakan huruf "z" menjadi "izin".',
  },
  {
    pattern: /\bpraktek\b/gi,
    wrong: 'praktek',
    correct: 'praktik',
    explanation:
      'Bentuk baku menurut EYD V untuk pelayanan klinis atau operasional adalah "praktik".',
  },
  {
    pattern: /\bsistim\b/gi,
    wrong: 'sistim',
    correct: 'sistem',
    explanation: 'Penulisan tidak baku. Gunakan bentuk baku "sistem".',
  },
  {
    pattern: /\bsekedar\b/gi,
    wrong: 'sekedar',
    correct: 'sekadar',
    explanation:
      'Kata dasar yang baku dalam KBBI adalah "kadar" sehingga bentuk bakunya "sekadar".',
  },
  {
    pattern: /\bterimakasih\b/gi,
    wrong: 'terimakasih',
    correct: 'terima kasih',
    explanation: 'Ungkapan "terima kasih" wajib ditulis terpisah dua kata.',
  },
  {
    pattern: /\baktifitas\b/gi,
    wrong: 'aktifitas',
    correct: 'aktivitas',
    explanation:
      'Bentuk baku kata benda dari aktif adalah "aktivitas" menggunakan huruf "v".',
  },
  {
    pattern: /\bkwalitas\b/gi,
    wrong: 'kwalitas',
    correct: 'kualitas',
    explanation: 'Penulisan tidak baku. Gunakan bentuk baku "kualitas".',
  },
  {
    pattern: /\bstandart\b/gi,
    wrong: 'standart',
    correct: 'standar',
    explanation:
      'Dalam bahasa Indonesia baku tidak menggunakan huruf "t" di akhir; gunakan "standar".',
  },
  {
    pattern: /\bkwitansi\b/gi,
    wrong: 'kwitansi',
    correct: 'kuitansi',
    explanation: 'Bentuk baku dokumen bukti pembayaran adalah "kuitansi".',
  },
  {
    pattern: /\bresiko\b/gi,
    wrong: 'resiko',
    correct: 'risiko',
    explanation: 'Penulisan baku menurut KBBI adalah "risiko" (bukan "resiko").',
  },
  {
    pattern: /\bdiagnosa\b/gi,
    wrong: 'diagnosa',
    correct: 'diagnosis',
    explanation: 'Istilah medis baku dalam bahasa Indonesia adalah "diagnosis".',
  },
  {
    pattern: /\befektifitas\b/gi,
    wrong: 'efektifitas',
    correct: 'efektivitas',
    explanation: 'Penulisan baku menggunakan huruf "v" yaitu "efektivitas".',
  },
  {
    pattern: /\bmengkoordinir\b/gi,
    wrong: 'mengkoordinir',
    correct: 'mengoordinasikan',
    explanation:
      'Peluluhan huruf "k" dengan imbuhan meN- membentuk kata baku "mengoordinasikan".',
  },
  {
    pattern: /\bsilahkan\b/gi,
    wrong: 'silahkan',
    correct: 'silakan',
    explanation:
      'Kata dasar "sila" mendapat akhiran -kan menjadi "silakan" (satu huruf "h" dihilangkan).',
  },
  {
    pattern: /\bdi mohon\b/gi,
    wrong: 'di mohon',
    correct: 'dimohon',
    explanation:
      'Sebagai imbuhan kata kerja pasif, "di-" wajib ditulis serangkai menjadi "dimohon".',
  },
  {
    pattern: /\bdi sampaikan\b/gi,
    wrong: 'di sampaikan',
    correct: 'disampaikan',
    explanation:
      'Sebagai imbuhan kata kerja pasif, "di-" wajib ditulis serangkai menjadi "disampaikan".',
  },
  {
    pattern: /\bdi karenakan\b/gi,
    wrong: 'di karenakan',
    correct: 'dikarenakan',
    explanation:
      'Imbuhan pasif "di-" harus ditulis serangkai atau diganti "disebabkan oleh".',
  },
  {
    pattern: /\bjadual\b/gi,
    wrong: 'jadual',
    correct: 'jadwal',
    explanation: 'Bentuk baku dalam KBBI adalah "jadwal" menggunakan huruf "w".',
  },
];

function capitalizeFirst(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function detectUnit(prompt: string): string {
  const p = prompt.toLowerCase();
  if (p.includes('rawat inap') || p.includes('bangsal') || p.includes('ranap')) {
    return 'Instalasi Rawat Inap';
  }
  if (p.includes('poli') || p.includes('rawat jalan') || p.includes('rajal')) {
    return 'Instalasi Rawat Jalan';
  }
  if (p.includes('igd') || p.includes('gawat darurat') || p.includes('ugd')) {
    return 'Instalasi Gawat Darurat (IGD)';
  }
  if (p.includes('farmasi') || p.includes('obat') || p.includes('apotek')) {
    return 'Instalasi Farmasi';
  }
  if (
    p.includes('ipsrs') ||
    p.includes('ac ') ||
    p.includes('listrik') ||
    p.includes('kalibrasi') ||
    p.includes('perbaikan')
  ) {
    return 'Instalasi IPSRS';
  }
  if (p.includes('umum') || p.includes('pengadaan') || p.includes('tata usaha')) {
    return 'Bagian Umum & Pengadaan';
  }
  return 'Instalasi Rawat Inap';
}

function detectLetterType(prompt: string): LetterType {
  const p = prompt.toLowerCase();
  if (
    p.includes('undangan') ||
    p.includes('mengundang') ||
    p.includes('rapat') ||
    p.includes('pertemuan')
  ) {
    return 'Surat Undangan';
  }
  if (
    p.includes('surat tugas') ||
    p.includes('menugaskan') ||
    p.includes('pelatihan') ||
    p.includes('diklat') ||
    p.includes('workshop')
  ) {
    return 'Surat Tugas';
  }
  if (
    p.includes('edaran') ||
    p.includes('himbauan') ||
    p.includes('imbauan') ||
    p.includes('kewajiban seluruh')
  ) {
    return 'Surat Edaran';
  }
  if (p.includes('nota dinas')) {
    return 'Nota Dinas';
  }
  if (
    p.includes('balai') ||
    p.includes('eksternal') ||
    p.includes('dinas kesehatan') ||
    (p.includes('permohonan') && !p.includes('nota'))
  ) {
    return 'Surat Permohonan';
  }
  return 'Nota Dinas';
}

function extractSubjectAndItems(
  prompt: string,
  letterType: LetterType
): {
  subject: string;
  items: string[];
} {
  const cleaned = prompt
    .replace(
      /^(tolong\s+)?(buatkan|buat|susunkan|bikin|mohon\s+buatkan)\s+(sebuah\s+)?/i,
      ''
    )
    .replace(
      /^(nota dinas|surat undangan|surat tugas|surat permohonan|surat edaran)\s*/i,
      ''
    )
    .trim();

  const itemMatches = prompt.match(
    /(\d+\s+(?:unit|buah|set|paket|orang|perawat|dokter|komputer|termometer)[^,.;]*)/gi
  );
  const items = itemMatches ? itemMatches.map((m) => m.trim()) : [];

  let subject = cleaned.replace(/\.$/, '');
  if (subject.length > 90) {
    subject = subject.slice(0, 87).trim() + '...';
  }
  if (!subject) {
    subject =
      letterType === 'Nota Dinas'
        ? 'Permohonan Dukungan Operasional Unit'
        : letterType === 'Surat Undangan'
        ? 'Undangan Rapat Koordinasi Unit'
        : letterType === 'Surat Tugas'
        ? 'Penugasan Kegiatan Kedinasan Pegawai'
        : letterType === 'Surat Edaran'
        ? 'Ketentuan Operasional Internal RSUD'
        : 'Permohonan Dukungan Teknis RSUD';
  } else {
    subject = capitalizeFirst(subject);
  }

  return { subject, items };
}

export function formatNowTimestamp(): string {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  return `17 Nov 2026 · ${hh}:${mm} WIB`;
}

export function generateDraftFromPrompt(
  promptText: string,
  overrideUnit?: string,
  overrideType?: LetterType,
  creatorUser?: RoleUserProfile
): LetterDraft {
  const trimmedPrompt = promptText.trim();
  const letterType = overrideType || detectLetterType(trimmedPrompt);
  const proposingUnit =
    overrideUnit || creatorUser?.unitName || detectUnit(trimmedPrompt);
  const pLower = trimmedPrompt.toLowerCase();

  const urgency: UrgencyLevel =
    pLower.includes('segera') ||
    pLower.includes('cito') ||
    pLower.includes('darurat') ||
    pLower.includes('mendesak')
      ? 'Segera'
      : pLower.includes('penting') ||
        pLower.includes('pengadaan') ||
        pLower.includes('rapat') ||
        pLower.includes('akreditasi')
      ? 'Penting'
      : 'Biasa';

  const { subject, items } = extractSubjectAndItems(trimmedPrompt, letterType);

  let classificationCode = '000';
  let classificationDesc = 'Umum / Tata Usaha';
  let templateCode = 'TND-ND-01';
  if (letterType === 'Nota Dinas') {
    if (
      pLower.includes('pengadaan') ||
      pLower.includes('beli') ||
      pLower.includes('unit') ||
      pLower.includes('alat') ||
      pLower.includes('komputer')
    ) {
      classificationCode = '027';
      classificationDesc = 'Pengadaan Perlengkapan & Alat Kesehatan';
    } else {
      classificationCode = '445';
      classificationDesc = 'Pelayanan Rumah Sakit';
    }
    templateCode = 'TND-ND-01 (Nota Dinas Internal)';
  } else if (letterType === 'Surat Undangan') {
    classificationCode = '005';
    classificationDesc = 'Undangan Rapat Dinas';
    templateCode = 'TND-UND-02 (Surat Undangan)';
  } else if (letterType === 'Surat Tugas') {
    classificationCode = '090';
    classificationDesc = 'Perjalanan Dinas & Penugasan';
    templateCode = 'TND-ST-03 (Surat Tugas)';
  } else if (letterType === 'Surat Permohonan') {
    classificationCode = '440';
    classificationDesc = 'Kesehatan & Fasilitas Medik';
    templateCode = 'TND-SP-04 (Surat Permohonan)';
  } else if (letterType === 'Surat Edaran') {
    classificationCode = '440';
    classificationDesc = 'Ketentuan Internal RSUD';
    templateCode = 'TND-SE-05 (Surat Edaran)';
  }

  const kaInstalasi = proposingUnit.includes('Jalan')
    ? MASTER_OFFICIALS[2]
    : proposingUnit.includes('Farmasi')
    ? MASTER_OFFICIALS[3]
    : proposingUnit.includes('IPSRS')
    ? MASTER_OFFICIALS[4]
    : MASTER_OFFICIALS[1];

  const direktur = MASTER_OFFICIALS[9];
  const wadirYan = MASTER_OFFICIALS[7];

  let recipient =
    'Direktur RSUD Nusantara Jaya melalui Wakil Direktur Umum dan Keuangan';
  let sender = `Kepala ${proposingUnit}`;
  let signer = kaInstalasi;
  let bodyParagraphs: string[] = [];
  let eventDetails: LetterDraft['eventDetails'] | undefined = undefined;

  if (letterType === 'Nota Dinas') {
    const itemPhrase =
      items.length > 0 ? items.join(', ') : 'sarana pendukung operasional unit';
    recipient =
      pLower.includes('pengadaan') ||
      pLower.includes('alat') ||
      pLower.includes('komputer') ||
      pLower.includes('termometer')
        ? 'Direktur RSUD Nusantara Jaya melalui Wakil Direktur Umum dan Keuangan'
        : 'Wakil Direktur Pelayanan dan Penunjang RSUD Nusantara Jaya';

    bodyParagraphs = [
      `Dengan hormat, sehubungan dengan upaya peningkatan mutu dan kelancaran operasional pelayanan pada ${proposingUnit}, bersama ini kami sampaikan kondisi kebutuhan teknis yang memerlukan dukungan pengadaan/penanganan segera.`,
      `Guna menunjang standar keselamatan pasien dan efektivitas kerja staf, kami mengajukan permohonan ${itemPhrase} untuk ditempatkan dan digunakan pada ${proposingUnit}.`,
      `Demikian nota dinas ini kami sampaikan. Atas perhatian dan perkenan Bapak/Ibu, kami ucapkan terima kasih.`,
    ];
  } else if (letterType === 'Surat Undangan') {
    recipient =
      'Para Kepala Instalasi, Kepala Bidang, dan Tim Terkait di Lingkungan RSUD Nusantara Jaya';
    sender = wadirYan.position;
    signer = wadirYan;
    eventDetails = {
      hariTanggal: pLower.includes('kamis')
        ? 'Kamis, 19 November 2026'
        : '[Isi Hari/Tanggal Pelaksanaan]',
      waktu:
        pLower.includes('09') || pLower.includes('9')
          ? '09.00 WIB s.d. selesai'
          : '[Isi Pukul Pelaksanaan]',
      tempat: pLower.includes('aula')
        ? 'Aula Pertemuan Lantai 3 RSUD Nusantara Jaya'
        : '[Isi Ruang/Tempat Rapat]',
      acara: subject,
    };
    bodyParagraphs = [
      `Dengan hormat, dalam rangka koordinasi dan percepatan pelaksanaan program kerja di lingkungan RSUD Nusantara Jaya, dengan ini kami mengundang Bapak/Ibu untuk menghadiri rapat dinas yang akan diselenggarakan pada:`,
      `Mengingat pentingnya agenda pembahasan dimaksud, dimohon Bapak/Ibu hadir tepat pada waktunya serta membawa bahan evaluasi unit kerja masing-masing.`,
      `Demikian surat undangan ini kami sampaikan. Atas perhatian dan kehadirannya, kami ucapkan terima kasih.`,
    ];
  } else if (letterType === 'Surat Tugas') {
    recipient =
      'Pegawai / Tenaga Kesehatan yang Ditunjuk pada ' + proposingUnit;
    sender = direktur.position;
    signer = direktur;
    const personPhrase =
      items.length > 0
        ? items.join(', ')
        : '[Isi Nama & NIP Pegawai yang Ditugaskan]';
    bodyParagraphs = [
      `Dasar: Program Peningkatan Kompetensi SDM dan Mutu Pelayanan RSUD Nusantara Jaya Tahun Anggaran 2026.`,
      `Direktur RSUD Nusantara Jaya menugaskan kepada ${personPhrase} dari ${proposingUnit} untuk melaksanakan kegiatan ${subject} sesuai jadwal yang telah ditetapkan.`,
      `Setelah selesai melaksanakan tugas, pegawai yang bersangkutan wajib menyampaikan laporan tertulis kepada atasan langsung dan Bagian Kepegawaian paling lambat 5 (lima) hari kerja setelah pelaksanaan kegiatan.`,
    ];
  } else if (letterType === 'Surat Permohonan') {
    recipient = pLower.includes('balai')
      ? 'Kepala Balai Pengamanan Fasilitas Kesehatan (BPFK) Regional'
      : 'Kepala Dinas Kesehatan Provinsi Nusantara';
    sender = direktur.position;
    signer = direktur;
    const itemPhrase =
      items.length > 0
        ? items.join(', ')
        : 'perangkat pelayanan kesehatan sesuai daftar terlampir';
    bodyParagraphs = [
      `Dengan hormat, dalam rangka menjamin keakuratan fungsi alat kesehatan serta pemenuhan standar keselamatan pasien di RSUD Nusantara Jaya, bersama ini kami mengajukan permohonan dukungan teknis terkait ${itemPhrase}.`,
      `Adapun rincian jadwal kesiapan perangkat dan lokasi unit pelayanan telah kami koordinasikan melalui ${proposingUnit} untuk kelancaran proses pemeriksaan di lapangan.`,
      `Demikian surat permohonan ini kami sampaikan. Atas perhatian dan kerja sama Bapak/Ibu, kami ucapkan terima kasih.`,
    ];
  } else {
    recipient =
      'Seluruh Kepala Instalasi, Kepala Bidang, dan Pegawai RSUD Nusantara Jaya';
    sender = direktur.position;
    signer = direktur;
    bodyParagraphs = [
      `Dalam rangka menertibkan tata kelola administrasi pelayanan dan kepatuhan standar operasional prosedur di lingkungan RSUD Nusantara Jaya, seluruh unit kerja diwajibkan melaksanakan ketentuan sebagaimana dimaksud pada perihal di atas.`,
      `Setiap Kepala Instalasi dan Kepala Bidang agar melakukan pemantauan berkala terhadap pelaksanaan ketentuan ini pada unit kerja masing-masing mulai tanggal ditetapkan.`,
      `Demikian surat edaran ini disampaikan untuk dilaksanakan dengan penuh tanggung jawab.`,
    ];
  }

  const ts = formatNowTimestamp();
  const draftId = `drf-${Date.now()}`;

  return {
    id: draftId,
    creatorId: creatorUser?.id || 'usr-staf',
    letterNumber: '[Menunggu Nomor Resmi TU]',
    officialNumberAssigned: false,
    tteSigned: false,
    letterType,
    classificationCode,
    proposingUnit,
    recipient,
    sender,
    subject,
    urgency,
    dateStr: '17 November 2026',
    attachment:
      letterType === 'Surat Permohonan' || letterType === 'Nota Dinas'
        ? '1 (satu) berkas'
        : '-',
    bodyParagraphs,
    eventDetails,
    signerName: signer.fullNameWithTitles,
    signerTitle: signer.position,
    signerNip: signer.nip,
    rawPrompt: trimmedPrompt,
    extractedJson: {
      jenisSurat: letterType,
      kodeKlasifikasi: `${classificationCode} / ${classificationDesc}`,
      unitPengusul: proposingUnit,
      tujuanSurat: recipient,
      perihal: subject,
      urgensi: urgency,
      templateTnd: templateCode,
      entitasItem: items.length > 0 ? items : undefined,
      hariTanggal: eventDetails?.hariTanggal,
      waktu: eventDetails?.waktu,
      tempat: eventDetails?.tempat,
    },
    status: 'Draft',
    complianceScore: trimmedPrompt.includes('[Isi') ? 92 : 100,
    parafFlow: buildSotkParafFlow(proposingUnit, letterType, 'Draft'),
    auditTrail: [
      {
        id: `aud-${Date.now()}`,
        draftId,
        draftNumber: '[Draf Awal]',
        draftSubject: subject,
        actorName: creatorUser?.name || 'Rizky Pratama, A.Md.Kep.',
        actorNip: creatorUser?.nip || '19940312 202012 1 004',
        actorRole: creatorUser?.shortRoleLabel || 'Staf Pengusul',
        action: 'Membuat Draf via Intent-to-Draft',
        fromStatus: '-',
        toStatus: 'Draft',
        note: 'Draf dibuat menggunakan mesin Intent-to-Draft TND.',
        timestamp: ts,
      },
    ],
    createdAt: ts,
    updatedAt: ts,
  };
}

export function transitionDraftWorkflow(
  draft: LetterDraft,
  actionType: 'submit' | 'approve' | 'revise' | 'reject' | 'assign_number',
  actor: RoleUserProfile,
  note?: string
): LetterDraft {
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
    nextStatus
  ).map((step) => {
    if (
      actionType === 'assign_number' &&
      step.roleId === 'arsiparis'
    ) {
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

  return {
    ...draft,
    letterNumber: nextLetterNumber,
    officialNumberAssigned: nextOfficialAssigned,
    tteSigned: nextTteSigned,
    status: nextStatus,
    parafFlow: nextFlow,
    auditTrail: [auditEntry, ...draft.auditTrail],
    updatedAt: ts,
  };
}

export function scanWithBiromaticGuard(draft: LetterDraft): {
  issues: ValidationIssue[];
  complianceScore: number;
} {
  const issues: ValidationIssue[] = [];
  const fullBody = draft.bodyParagraphs.join('\n\n');

  EYD_RULES.forEach((rule, idx) => {
    const bodyMatches = fullBody.match(rule.pattern);
    if (bodyMatches && bodyMatches.length > 0) {
      const uniqueWrong = Array.from(new Set(bodyMatches))[0];
      issues.push({
        id: `eyd-body-${idx}`,
        category: 'eyd',
        severity: 'warning',
        originalText: uniqueWrong,
        suggestedText: rule.correct,
        explanation: rule.explanation,
        field: 'body',
        fixed: false,
      });
    }
    const subjMatches = draft.subject.match(rule.pattern);
    if (subjMatches && subjMatches.length > 0) {
      issues.push({
        id: `eyd-subj-${idx}`,
        category: 'eyd',
        severity: 'warning',
        originalText: subjMatches[0],
        suggestedText: capitalizeFirst(rule.correct),
        explanation: `Pada Perihal: ${rule.explanation}`,
        field: 'subject',
        fixed: false,
      });
    }
  });

  const cleanDigits = draft.signerNip.replace(/\s+/g, '');
  const matchedOfficial = MASTER_OFFICIALS.find(
    (off) =>
      off.name
        .toLowerCase()
        .includes(
          draft.signerName
            .split(',')[0]
            .replace(/^(dr\.|drg\.|Ns\.|apt\.|Dr\.|H\.)\s*/i, '')
            .trim()
            .toLowerCase()
        ) || off.position.toLowerCase() === draft.signerTitle.toLowerCase()
  );

  const properNipFormat = /^\d{8}\s\d{6}\s\d\s\d{3}$/;
  if (!properNipFormat.test(draft.signerNip)) {
    const suggestedNip = matchedOfficial
      ? matchedOfficial.nip
      : cleanDigits.length === 18
      ? `${cleanDigits.slice(0, 8)} ${cleanDigits.slice(
          8,
          14
        )} ${cleanDigits.slice(14, 15)} ${cleanDigits.slice(15, 18)}`
      : '19850719 201001 2 011';

    issues.push({
      id: 'nip-format-err',
      category: 'nip',
      severity: 'error',
      originalText: draft.signerNip || '(Kosong)',
      suggestedText: suggestedNip,
      explanation:
        cleanDigits.length !== 18
          ? `NIP harus berjumlah tepat 18 digit dengan format spasi 8-6-1-3 sesuai data master kepegawaian RSUD.`
          : `Format pemisah spasi NIP belum sesuai standar TND (8-6-1-3 digit).`,
      field: 'signerNip',
      fixed: false,
    });
  } else if (matchedOfficial && draft.signerNip !== matchedOfficial.nip) {
    issues.push({
      id: 'nip-mismatch-err',
      category: 'nip',
      severity: 'error',
      originalText: draft.signerNip,
      suggestedText: matchedOfficial.nip,
      explanation: `NIP tidak cocok dengan data master kepegawaian untuk pejabat ${matchedOfficial.fullNameWithTitles}.`,
      field: 'signerNip',
      fixed: false,
    });
  }

  if (
    matchedOfficial &&
    draft.signerName.trim() !== matchedOfficial.fullNameWithTitles
  ) {
    issues.push({
      id: 'gelar-mismatch-warn',
      category: 'gelar',
      severity: 'warning',
      originalText: draft.signerName,
      suggestedText: matchedOfficial.fullNameWithTitles,
      explanation: `Penulisan gelar akademis/profesi belum sesuai tanda baca EYD V dan master SIMRS (${matchedOfficial.fullNameWithTitles}).`,
      field: 'signerName',
      fixed: false,
    });
  }

  const placeholderMatch = fullBody.match(/\[Isi[^\]]+\]/g);
  if (placeholderMatch) {
    placeholderMatch.forEach((ph, idx) => {
      issues.push({
        id: `placeholder-${idx}`,
        category: 'placeholder',
        severity: 'error',
        originalText: ph,
        suggestedText: 'Kamis, 19 November 2026',
        explanation:
          'Terdapat penanda data wajib yang masih harus dilengkapi sebelum pengajuan paraf.',
        field: 'body',
        fixed: false,
      });
    });
  }

  const nikMatch = fullBody.match(/\b\d{16}\b/g);
  if (nikMatch) {
    issues.push({
      id: 'pdp-nik-warn',
      category: 'pdp',
      severity: 'error',
      originalText: nikMatch[0],
      suggestedText: '[Disamarkan - Sesuai UU PDP]',
      explanation:
        'Terdeteksi 16 digit menyerupai NIK/Identitas Pribadi Pasien. Sesuai UU PDP, hindari mencantumkan NIK pada surat administrasi umum.',
      field: 'body',
      fixed: false,
    });
  }

  const penalty = issues.reduce(
    (acc, item) => acc + (item.severity === 'error' ? 12 : 6),
    0
  );
  const complianceScore = Math.max(40, Math.min(100, 100 - penalty));

  return { issues, complianceScore };
}

export function applySingleBiromaticFix(
  draft: LetterDraft,
  issue: ValidationIssue
): LetterDraft {
  let updatedBody = [...draft.bodyParagraphs];
  let updatedSubject = draft.subject;
  let updatedSignerName = draft.signerName;
  let updatedSignerNip = draft.signerNip;

  const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  if (issue.field === 'body') {
    const regex = new RegExp(`\\b${escapeRegex(issue.originalText)}\\b`, 'gi');
    updatedBody = updatedBody.map((p) => {
      if (issue.originalText.startsWith('[')) {
        return p.replace(issue.originalText, issue.suggestedText);
      }
      return p.replace(regex, (match) => {
        if (match[0] === match[0].toUpperCase()) {
          return capitalizeFirst(issue.suggestedText);
        }
        return issue.suggestedText;
      });
    });
  } else if (issue.field === 'subject') {
    const regex = new RegExp(`\\b${escapeRegex(issue.originalText)}\\b`, 'gi');
    updatedSubject = updatedSubject.replace(regex, issue.suggestedText);
  } else if (issue.field === 'signerName') {
    updatedSignerName = issue.suggestedText;
  } else if (issue.field === 'signerNip') {
    updatedSignerNip = issue.suggestedText;
  }

  const nextDraft: LetterDraft = {
    ...draft,
    subject: updatedSubject,
    bodyParagraphs: updatedBody,
    signerName: updatedSignerName,
    signerNip: updatedSignerNip,
    updatedAt: 'Baru diperbaiki Biromatic Guard',
  };

  const rescan = scanWithBiromaticGuard(nextDraft);
  return {
    ...nextDraft,
    complianceScore: rescan.complianceScore,
  };
}

export function applyAllBiromaticFixes(
  draft: LetterDraft,
  issues: ValidationIssue[]
): LetterDraft {
  let current = { ...draft };
  for (const issue of issues) {
    current = applySingleBiromaticFix(current, issue);
  }
  return {
    ...current,
    complianceScore: 100,
    updatedAt: 'Baru saja (AI Fix)',
  };
}

export function downloadDraftAsDoc(draft: LetterDraft) {
  const paragraphsHtml = draft.bodyParagraphs
    .map(
      (p) =>
        `<p style="text-align:justify; margin-bottom:10pt; line-height:1.45;">${p}</p>`
    )
    .join('\n');

  const eventBlock = draft.eventDetails
    ? `<table style="margin: 8pt 0 12pt 24pt; font-size:11pt; border-collapse:collapse;">
        <tr><td style="width:120pt; padding:2pt 0;">Hari / Tanggal</td><td style="width:12pt;">:</td><td>${draft.eventDetails.hariTanggal}</td></tr>
        <tr><td style="padding:2pt 0;">Pukul</td><td>:</td><td>${draft.eventDetails.waktu}</td></tr>
        <tr><td style="padding:2pt 0;">Tempat</td><td>:</td><td>${draft.eventDetails.tempat}</td></tr>
        <tr><td style="padding:2pt 0;">Acara</td><td>:</td><td>${draft.eventDetails.acara}</td></tr>
      </table>`
    : '';

  const headerMeta =
    draft.letterType === 'Nota Dinas'
      ? `<div style="text-align:center; font-weight:bold; font-size:12pt; text-decoration:underline; margin-top:12pt; margin-bottom:12pt;">NOTA DINAS</div>
         <table style="width:100%; font-size:11pt; margin-bottom:10pt; border-bottom:1px solid #000; padding-bottom:6pt;">
           <tr><td style="width:90pt;">Kepada Yth.</td><td style="width:12pt;">:</td><td>${draft.recipient}</td></tr>
           <tr><td>Dari</td><td>:</td><td>${draft.sender}</td></tr>
           <tr><td>Tanggal</td><td>:</td><td>${draft.dateStr}</td></tr>
           <tr><td>Nomor</td><td>:</td><td>${draft.letterNumber}</td></tr>
           <tr><td>Sifat</td><td>:</td><td>${draft.urgency}</td></tr>
           <tr><td>Lampiran</td><td>:</td><td>${draft.attachment}</td></tr>
           <tr><td>Hal</td><td>:</td><td><strong>${draft.subject}</strong></td></tr>
         </table>`
      : `<table style="width:100%; font-size:11pt; margin-top:12pt; margin-bottom:12pt;">
           <tr>
             <td style="width:60%; vertical-align:top;">
               <table>
                 <tr><td style="width:75pt;">Nomor</td><td>: ${draft.letterNumber}</td></tr>
                 <tr><td>Sifat</td><td>: ${draft.urgency}</td></tr>
                 <tr><td>Lampiran</td><td>: ${draft.attachment}</td></tr>
                 <tr><td>Hal</td><td>: <strong>${draft.subject}</strong></td></tr>
               </table>
             </td>
             <td style="width:40%; vertical-align:top; text-align:right;">
               ${HOSPITAL_INFO.city}, ${draft.dateStr}
             </td>
           </tr>
         </table>
         <p style="margin-bottom:10pt;">Kepada Yth.<br/>${draft.recipient}<br/>di Tempat</p>`;

  const html = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head><meta charset='utf-8'><title>${draft.subject}</title></head>
    <body style="font-family: Arial, sans-serif; font-size: 11pt; color: #000; margin: 2.5cm 2cm 2.5cm 3cm;">
      <div style="text-align:center; border-bottom: 3px double #000; padding-bottom: 8pt; margin-bottom: 10pt;">
        <div style="font-size:11pt; font-weight:bold;">${HOSPITAL_INFO.pemda}</div>
        <div style="font-size:11pt; font-weight:bold;">${HOSPITAL_INFO.dinas}</div>
        <div style="font-size:14pt; font-weight:bold;">${HOSPITAL_INFO.name}</div>
        <div style="font-size:9pt;">${HOSPITAL_INFO.address}</div>
        <div style="font-size:8.5pt;">${HOSPITAL_INFO.contact}</div>
      </div>
      ${headerMeta}
      ${paragraphsHtml}
      ${eventBlock}
      <div style="margin-top:24pt; margin-left:55%;">
        <p style="margin:0;">${draft.signerTitle},</p>
        <div style="height:48pt;"></div>
        <p style="margin:0; font-weight:bold; text-decoration:underline;">${draft.signerName}</p>
        <p style="margin:0; font-size:10pt;">NIP. ${draft.signerNip}</p>
      </div>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', html], {
    type: 'application/msword',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const safeName = draft.subject
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 40);
  link.download = `SITNDE-${draft.letterType.replace(/\s+/g, '-')}-${safeName}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
