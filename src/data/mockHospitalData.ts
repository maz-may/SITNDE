import {
  ArchiveClassification,
  DraftStatus,
  LetterDraft,
  LetterType,
  OfficialProfile,
  ParafStep,
  PermissionCode,
  PrecedentDoc,
  RoleId,
  RoleUserProfile,
  SotkRoutingRule,
  TndTemplateSpec,
} from '../types/sitnde.ts';

export const HOSPITAL_INFO = {
  pemda: 'PEMERINTAH PROVINSI NUSANTARA',
  dinas: 'DINAS KESEHATAN',
  name: 'RUMAH SAKIT UMUM DAERAH NUSANTARA JAYA',
  address: 'Jl. Kesehatan Raya No. 45, Kota Nusantara 12950',
  contact:
    'Telp. (021) 555-0192 · Laman: rsudnusantara.go.id · Pos-el: tatausaha@rsudnusantara.go.id',
  city: 'Nusantara',
};

export const MEDICAL_GLOSSARY_WHITELIST = [
  'IGD',
  'ICU',
  'NICU',
  'PICU',
  'PACS',
  'BLUD',
  'e-RM',
  'SIMRS',
  'BTCLS',
  'ACLS',
  'PPI',
  'DPJP',
  'BPJS',
  'BPFK',
  'EKG',
  'USG',
  'CT-Scan',
  'IPSRS',
  'CSSD',
  'SBAR',
  'RBA',
  'SOTK',
  'TND',
  'TTE',
  'BSrE',
  'BSSN',
];

export const ARCHIVE_CLASSIFICATIONS: ArchiveClassification[] = [
  { code: '000', category: 'Umum', description: 'Tata Usaha, Persuratan Umum, & Kerumahtanggaan' },
  { code: '005', category: 'Undangan', description: 'Undangan Rapat Dinas, Koordinasi, & Pertemuan Resmi' },
  { code: '027', category: 'Pengadaan', description: 'Pengadaan Barang/Jasa, Alat Kesehatan, & Pemeliharaan Sarana' },
  { code: '090', category: 'Perjalanan Dinas', description: 'Surat Tugas, Perjalanan Dinas Dalam/Luar Daerah, & Diklat' },
  { code: '440', category: 'Kesehatan', description: 'Kebijakan Pelayanan Kesehatan, Akreditasi, & Regulasi RS' },
  { code: '445', category: 'Pelayanan RS', description: 'Operasional Instalasi Medis, Keperawatan, Penunjang, & Rekam Medis' },
  { code: '800', category: 'Kepegawaian', description: 'Mutasi, Penugasan SDM, Cuti, Plt./Plh., & Pengembangan Kompetensi' },
];

export const RAG_PRECEDENT_CORPUS: PrecedentDoc[] = [
  {
    id: 'rag-01',
    letterNumber: '027/041/RSUD-NJ/VIII/2026',
    letterType: 'Nota Dinas',
    classificationCode: '027',
    unitName: 'Instalasi Rawat Jalan',
    title: 'Pengadaan Perangkat Komputer & Printer Layanan e-RM Poliklinik',
    keywords: ['pengadaan', 'komputer', 'pc', 'e-rm', 'alat', 'termometer', 'unit', 'rawat'],
    legalBasis: 'Sesuai Rencana Bisnis dan Anggaran (RBA) BLUD RSUD Nusantara Jaya Tahun Anggaran 2026 serta standar mutu pelayanan rekam medis elektronik.',
    excerptParagraph:
      'Guna menjaga kesinambungan pelayanan klinis dan memenuhi standar akreditasi keselamatan pasien, seluruh perangkat yang diusulkan telah melalui telaah spesifikasi teknis bersama Instalasi IPSRS dan dipastikan kompatibel dengan sistem SIMRS terintegrasi.',
    year: '2026',
  },
  {
    id: 'rag-02',
    letterNumber: '445/102/RSUD-NJ/IX/2026',
    letterType: 'Surat Permohonan',
    classificationCode: '440',
    unitName: 'Instalasi IPSRS',
    title: 'Kalibrasi Alat Elektromedik & Uji Laik Fungsi BPFK',
    keywords: ['kalibrasi', 'ventilator', 'ekg', 'alat', 'medis', 'bpfk', 'monitor', 'suhu', 'termometer'],
    legalBasis: 'Berdasarkan Peraturan Menteri Kesehatan RI Nomor 54 Tahun 2015 tentang Pengujian dan Kalibrasi Alat Kesehatan.',
    excerptParagraph:
      'Pengujian dan kalibrasi alat kesehatan sebagaimana dimaksud dilaksanakan untuk menjamin ketelitian, ketepatan pengukuran klinis, dan keamanan penggunaan perangkat elektromedik bagi pasien maupun tenaga kesehatan.',
    year: '2026',
  },
  {
    id: 'rag-03',
    letterNumber: '005/088/RSUD-NJ/X/2026',
    letterType: 'Surat Undangan',
    classificationCode: '005',
    unitName: 'Komite Mutu & Keselamatan Pasien',
    title: 'Rapat Koordinasi Pokja Akreditasi & Pencegahan Pengendalian Infeksi (PPI)',
    keywords: ['undangan', 'rapat', 'koordinasi', 'akreditasi', 'ppi', 'mutu', 'aula'],
    legalBasis: 'Menindaklanjuti program kerja Komite Peningkatan Mutu dan Keselamatan Pasien (PMKP) RSUD Nusantara Jaya.',
    excerptParagraph:
      'Setiap Ketua Kelompok Kerja (Pokja) dan Kepala Instalasi dimohon menyiapkan dokumen regulasi internal, bukti implementasi harian, serta matriks tindak lanjut hasil telusur lapangan sebelum rapat dimulai.',
    year: '2026',
  },
  {
    id: 'rag-04',
    letterNumber: '090/119/RSUD-NJ/X/2026',
    letterType: 'Surat Tugas',
    classificationCode: '090',
    unitName: 'Instalasi Gawat Darurat (IGD)',
    title: 'Penugasan Pelatihan Kegawatdaruratan BTCLS / ACLS Tenaga Perawat',
    keywords: ['tugas', 'pelatihan', 'diklat', 'btcls', 'acls', 'perawat', 'igd', 'workshop'],
    legalBasis: 'Berdasarkan kalender pengembangan kompetensi SDM kesehatan Dinas Kesehatan Provinsi Nusantara Tahun 2026.',
    excerptParagraph:
      'Selama mengikuti kegiatan pelatihan dimaksud, penjadwalan jaga shift pada unit kerja terkait telah diatur secara proporsional oleh Kepala Instalasi agar mutu pelayanan kegawatdaruratan tetap berjalan optimal 24 jam.',
    year: '2026',
  },
  {
    id: 'rag-05',
    letterNumber: '440/054/RSUD-NJ/VII/2026',
    letterType: 'Surat Edaran',
    classificationCode: '440',
    unitName: 'Direktorat Pelayanan',
    title: 'Kepatuhan Input Rekam Medis Elektronik (e-RM) & Privasi Data Pasien (UU PDP)',
    keywords: ['edaran', 'e-rm', 'rekam medis', 'kepatuhan', 'privasi', 'pdp', 'nik'],
    legalBasis: 'Mengacu pada Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi dan Permenkes Nomor 24 Tahun 2022 tentang Rekam Medis.',
    excerptParagraph:
      'Seluruh unit pelayanan dan administrasi wajib menjaga kerahasiaan identitas pribadi pasien (nama lengkap, NIK, nomor rekam medis, dan diagnosis) serta dilarang mencantumkan data sensitif tersebut pada naskah dinas umum tanpa otorisasi resmi.',
    year: '2026',
  },
];

export const ROLE_USERS: RoleUserProfile[] = [
  {
    id: 'usr-staf',
    roleId: 'staf',
    roleLabel: 'Staf Pengusul / Pembuat Draf',
    shortRoleLabel: 'Staf Pengusul',
    description: 'Membuat draf via Intent-to-Draft, cek Biromatic Guard, & ajukan surat',
    name: 'Rizky Pratama, A.Md.Kep.',
    nip: '19940312 202012 1 004',
    position: 'Staf Administrasi Instalasi Rawat Inap',
    unitName: 'Instalasi Rawat Inap',
  },
  {
    id: 'usr-ka-inst',
    roleId: 'ka_instalasi',
    roleLabel: 'Kepala Instalasi / Unit',
    shortRoleLabel: 'Ka. Instalasi',
    description: 'Review substansi teknis unit & Paraf Teknis Tahap 1',
    name: 'Ns. Ratna Sari Dewi, S.Kep., M.Kep.',
    nip: '19850719 201001 2 011',
    position: 'Kepala Instalasi Rawat Inap',
    unitName: 'Instalasi Rawat Inap',
  },
  {
    id: 'usr-kabid',
    roleId: 'kabid',
    roleLabel: 'Kepala Bagian / Bidang',
    shortRoleLabel: 'Ka. Bidang',
    description: 'Review struktural, pagu program & Paraf Struktural Tahap 2',
    name: 'dr. Hendra Wijaya, Sp.PD., M.Kes.',
    nip: '19780421 200604 1 009',
    position: 'Kepala Bidang Pelayanan Medik & Keperawatan',
    unitName: 'Bidang Pelayanan Medik',
  },
  {
    id: 'usr-wadir',
    roleId: 'wadir',
    roleLabel: 'Wakil Direktur',
    shortRoleLabel: 'Wakil Direktur',
    description: 'Verifikasi kebijakan strategis, laporan evaluasi & disposisi pimpinan',
    name: 'drg. Kartika Sari, MARS.',
    nip: '19740109 200212 2 004',
    position: 'Wakil Direktur Pelayanan & Penunjang',
    unitName: 'Direktorat Pelayanan',
  },
  {
    id: 'usr-direktur',
    roleId: 'direktur',
    roleLabel: 'Direktur RSUD (Signing Authority)',
    shortRoleLabel: 'Direktur',
    description: 'Pengesahan akhir, Management Brief & Tanda Tangan Elektronik (TTE)',
    name: 'Dr. dr. Aris Munandar, Sp.B., MARS.',
    nip: '19691203 199803 1 002',
    position: 'Direktur RSUD Nusantara Jaya',
    unitName: 'Direktorat RSUD Nusantara Jaya',
  },
  {
    id: 'usr-arsiparis',
    roleId: 'arsiparis',
    roleLabel: 'Bagian Tata Usaha / Arsiparis',
    shortRoleLabel: 'Tata Usaha',
    description: 'Penomoran surat resmi, validasi TND & registrasi arsip keluar setelah TTE',
    name: 'Siti Aminah, S.Sos.',
    nip: '19810614 200801 2 015',
    position: 'Arsiparis Ahli Muda / Subbag Tata Usaha',
    unitName: 'Bagian Tata Usaha & Sekretariat',
  },
  {
    id: 'usr-admin',
    roleId: 'admin_it',
    roleLabel: 'Admin Sistem / IT',
    shortRoleLabel: 'Admin IT',
    description: 'Konfigurasi matriks SOTK, master pegawai Plt./Plh., & audit trail',
    name: 'Bagus Prasetyo, S.Kom.',
    nip: '19910908 201903 1 006',
    position: 'Pranata Komputer Ahli Muda (SIMRS)',
    unitName: 'Instalasi SIMRS & IT',
  },
];

export const ROLE_PERMISSIONS: Record<RoleId, PermissionCode[]> = {
  staf: ['draft:create_ai', 'draft:edit_content', 'guard:run', 'workflow:submit'],
  ka_instalasi: [
    'draft:create_ai',
    'draft:edit_content',
    'guard:run',
    'workflow:paraf_1',
    'view:templates',
    'view:approval_queue',
    'view:archive',
    'view:reports',
  ],
  kabid: [
    'draft:create_ai',
    'draft:edit_content',
    'draft:view_all',
    'guard:run',
    'workflow:paraf_2',
    'view:templates',
    'view:approval_queue',
    'view:archive',
    'view:reports',
  ],
  wadir: [
    'draft:view_all',
    'workflow:verify_wadir',
    'view:templates',
    'view:approval_queue',
    'view:archive',
    'view:reports',
  ],
  direktur: [
    'draft:view_all',
    'document:sign_tte',
    'view:approval_queue',
    'view:archive',
    'view:reports',
  ],
  arsiparis: [
    'draft:create_ai',
    'draft:edit_content',
    'draft:view_all',
    'guard:run',
    'document:assign_number',
    'view:templates',
    'view:approval_queue',
    'view:archive',
    'view:reports',
  ],
  admin_it: ['view:templates', 'view:reports', 'system:manage_sotk_tnd'],
};

export const MASTER_OFFICIALS: OfficialProfile[] = [
  {
    id: 'off-1',
    name: 'Rizky Pratama',
    fullNameWithTitles: 'Rizky Pratama, A.Md.Kep.',
    nip: '19940312 202012 1 004',
    rank: 'Pengatur Tk. I / II.d',
    position: 'Staf Administrasi Ruang Rawat Inap',
    unitName: 'Instalasi Rawat Inap',
    sotkLevel: 1,
    dutyStatus: 'Definitif',
  },
  {
    id: 'off-2',
    name: 'Ratna Sari Dewi',
    fullNameWithTitles: 'Ns. Ratna Sari Dewi, S.Kep., M.Kep.',
    nip: '19850719 201001 2 011',
    rank: 'Penata Tk. I / III.d',
    position: 'Kepala Instalasi Rawat Inap',
    unitName: 'Instalasi Rawat Inap',
    sotkLevel: 2,
    dutyStatus: 'Definitif',
    delegateName: 'Ns. Dwi Anggraini, S.Kep.',
    delegateNip: '19890411 201402 2 005',
  },
  {
    id: 'off-2b',
    name: 'dr. Aditya Mahendra',
    fullNameWithTitles: 'dr. Aditya Mahendra, Sp.A.',
    nip: '19831104 201101 1 007',
    rank: 'Pembina / IV.a',
    position: 'Kepala Instalasi Rawat Jalan',
    unitName: 'Instalasi Rawat Jalan',
    sotkLevel: 2,
    dutyStatus: 'Definitif',
    delegateName: 'dr. Nabila Kusuma',
    delegateNip: '19881022 201503 2 006',
  },
  {
    id: 'off-2c',
    name: 'Apt. Lestari Wulandari',
    fullNameWithTitles: 'apt. Lestari Wulandari, S.Farm., M.Farm.',
    nip: '19860228 201212 2 003',
    rank: 'Penata Tk. I / III.d',
    position: 'Kepala Instalasi Farmasi',
    unitName: 'Instalasi Farmasi',
    sotkLevel: 2,
    dutyStatus: 'Definitif',
  },
  {
    id: 'off-2d',
    name: 'Fajar Nugroho',
    fullNameWithTitles: 'Fajar Nugroho, S.T., M.T.',
    nip: '19870915 201403 1 002',
    rank: 'Penata / III.c',
    position: 'Kepala Instalasi Pemeliharaan Sarana RS (IPSRS)',
    unitName: 'Instalasi IPSRS',
    sotkLevel: 2,
    dutyStatus: 'Definitif',
  },
  {
    id: 'off-3',
    name: 'dr. Hendra Wijaya',
    fullNameWithTitles: 'dr. Hendra Wijaya, Sp.PD., M.Kes.',
    nip: '19780421 200604 1 009',
    rank: 'Pembina Tk. I / IV.b',
    position: 'Kepala Bidang Pelayanan Medik & Keperawatan',
    unitName: 'Bidang Pelayanan Medik',
    sotkLevel: 3,
    dutyStatus: 'Definitif',
    delegateName: 'dr. Rahmat Hidayat, MARS.',
    delegateNip: '19800512 200903 1 004',
  },
  {
    id: 'off-3b',
    name: 'Bambang Sutrisno',
    fullNameWithTitles: 'H. Bambang Sutrisno, S.E., M.M.',
    nip: '19760811 200312 1 005',
    rank: 'Pembina Tk. I / IV.b',
    position: 'Kepala Bagian Umum & Pengadaan',
    unitName: 'Bagian Umum & Pengadaan',
    sotkLevel: 3,
    dutyStatus: 'Definitif',
  },
  {
    id: 'off-4',
    name: 'drg. Kartika Sari',
    fullNameWithTitles: 'drg. Kartika Sari, MARS.',
    nip: '19740109 200212 2 004',
    rank: 'Pembina Utama Muda / IV.c',
    position: 'Wakil Direktur Pelayanan & Penunjang',
    unitName: 'Direktorat Pelayanan',
    sotkLevel: 4,
    dutyStatus: 'Definitif',
  },
  {
    id: 'off-4b',
    name: 'Suryo Pranoto',
    fullNameWithTitles: 'Drs. Suryo Pranoto, M.Si.',
    nip: '19720517 199903 1 008',
    rank: 'Pembina Utama Muda / IV.c',
    position: 'Wakil Direktur Umum & Keuangan',
    unitName: 'Direktorat Umum & Keuangan',
    sotkLevel: 4,
    dutyStatus: 'Definitif',
  },
  {
    id: 'off-5',
    name: 'Dr. dr. Aris Munandar',
    fullNameWithTitles: 'Dr. dr. Aris Munandar, Sp.B., MARS.',
    nip: '19691203 199803 1 002',
    rank: 'Pembina Utama Madya / IV.d',
    position: 'Direktur RSUD Nusantara Jaya',
    unitName: 'Direktorat RSUD Nusantara Jaya',
    sotkLevel: 5,
    dutyStatus: 'Definitif',
    delegateName: 'drg. Kartika Sari, MARS.',
    delegateNip: '19740109 200212 2 004',
  },
];

export const SOTK_UNIT_OPTIONS = [
  'Instalasi Rawat Inap',
  'Instalasi Rawat Jalan',
  'Instalasi Gawat Darurat (IGD)',
  'Instalasi Farmasi',
  'Instalasi IPSRS',
  'Bagian Umum & Pengadaan',
];

export const INITIAL_SOTK_RULES: SotkRoutingRule[] = [
  {
    id: 'sotk-1',
    originUnit: 'Instalasi Rawat Inap',
    unitType: 'Fungsional',
    paraf1Role: 'Ka. Instalasi Rawat Inap',
    paraf2Role: 'Kabid Pelayanan Medik',
    wadirRole: 'Wadir Pelayanan & Penunjang',
    finalSigner: 'Direktur RSUD',
    isActive: true,
  },
  {
    id: 'sotk-2',
    originUnit: 'Instalasi Rawat Jalan',
    unitType: 'Fungsional',
    paraf1Role: 'Ka. Instalasi Rawat Jalan',
    paraf2Role: 'Kabid Pelayanan Medik',
    wadirRole: 'Wadir Pelayanan & Penunjang',
    finalSigner: 'Direktur RSUD',
    isActive: true,
  },
  {
    id: 'sotk-3',
    originUnit: 'Instalasi Gawat Darurat (IGD)',
    unitType: 'Fungsional',
    paraf1Role: 'Ka. Instalasi Gawat Darurat',
    paraf2Role: 'Kabid Pelayanan Medik',
    wadirRole: 'Wadir Pelayanan & Penunjang',
    finalSigner: 'Direktur RSUD',
    isActive: true,
  },
  {
    id: 'sotk-4',
    originUnit: 'Instalasi Farmasi',
    unitType: 'Fungsional',
    paraf1Role: 'Ka. Instalasi Farmasi',
    paraf2Role: 'Kabid Pelayanan Medik',
    wadirRole: 'Wadir Pelayanan & Penunjang',
    finalSigner: 'Direktur RSUD',
    isActive: true,
  },
  {
    id: 'sotk-5',
    originUnit: 'Instalasi IPSRS',
    unitType: 'Fungsional',
    paraf1Role: 'Ka. Instalasi IPSRS',
    paraf2Role: 'Kabag Umum & Pengadaan',
    wadirRole: 'Wadir Umum & Keuangan',
    finalSigner: 'Direktur RSUD',
    isActive: true,
  },
];

function resolveOfficialWithPlt(off: OfficialProfile): {
  displayName: string;
  displayNip: string;
  pltPrefix?: string;
} {
  if (off.dutyStatus === 'Cuti (Plt.)' && off.delegateName) {
    return {
      displayName: `Plt. ${off.delegateName}`,
      displayNip: off.delegateNip || off.nip,
      pltPrefix: 'Plt.',
    };
  }
  if (off.dutyStatus === 'Dinas Luar (Plh.)' && off.delegateName) {
    return {
      displayName: `Plh. ${off.delegateName}`,
      displayNip: off.delegateNip || off.nip,
      pltPrefix: 'Plh.',
    };
  }
  return {
    displayName: off.fullNameWithTitles,
    displayNip: off.nip,
  };
}

export function buildSotkParafFlow(
  proposingUnit: string,
  letterType: LetterType,
  targetStatus: DraftStatus = 'Draft',
  officialsList: OfficialProfile[] = MASTER_OFFICIALS
): ParafStep[] {
  const isSupportUnit =
    proposingUnit.includes('IPSRS') || proposingUnit.includes('Umum');

  const kaInstalasiRaw = proposingUnit.includes('Jalan')
    ? officialsList[2] || MASTER_OFFICIALS[2]
    : proposingUnit.includes('Farmasi')
    ? officialsList[3] || MASTER_OFFICIALS[3]
    : proposingUnit.includes('IPSRS')
    ? officialsList[4] || MASTER_OFFICIALS[4]
    : officialsList[1] || MASTER_OFFICIALS[1];

  const kaBidangRaw = isSupportUnit
    ? officialsList[6] || MASTER_OFFICIALS[6]
    : officialsList[5] || MASTER_OFFICIALS[5];
  const wadirRaw =
    isSupportUnit && letterType === 'Nota Dinas'
      ? officialsList[8] || MASTER_OFFICIALS[8]
      : officialsList[7] || MASTER_OFFICIALS[7];
  const direkturRaw = officialsList[9] || MASTER_OFFICIALS[9];

  const kaInst = resolveOfficialWithPlt(kaInstalasiRaw);
  const kaBid = resolveOfficialWithPlt(kaBidangRaw);
  const wadir = resolveOfficialWithPlt(wadirRaw);
  const dir = resolveOfficialWithPlt(direkturRaw);

  const stageIndexByStatus: Record<DraftStatus, number> = {
    Draft: 0,
    Revisi: 0,
    Ditolak: 0,
    'Menunggu Paraf Instalasi': 1,
    'Menunggu Paraf Kabid': 2,
    'Menunggu Verifikasi Wadir': 3,
    'Menunggu TTE Direktur': 4,
    'Selesai / Terbit': 5,
  };

  const activeIndex = stageIndexByStatus[targetStatus] ?? 0;

  const statusFor = (stepIdx: number): ParafStep['status'] => {
    if (targetStatus === 'Ditolak' && stepIdx === 1) return 'rejected';
    if (targetStatus === 'Revisi' && stepIdx === 1) return 'revision';
    if (activeIndex >= 5) return 'completed';
    if (stepIdx < activeIndex) return 'completed';
    if (stepIdx === activeIndex) return 'current';
    return 'pending';
  };

  return [
    {
      order: 1,
      roleId: 'staf',
      roleLabel: 'Staf Pengusul',
      unitName: proposingUnit,
      officialName: 'Rizky Pratama, A.Md.Kep.',
      officialNip: '19940312 202012 1 004',
      status: activeIndex === 0 ? 'current' : 'completed',
      timestamp: activeIndex > 0 ? '17 Nov 2026 · 08:30 WIB' : undefined,
      note:
        activeIndex > 0
          ? 'Draf disusun dan diajukan melalui Intent-to-Draft.'
          : 'Draf siap diajukan ke Kepala Instalasi.',
    },
    {
      order: 2,
      roleId: 'ka_instalasi',
      roleLabel: kaInst.pltPrefix
        ? `${kaInst.pltPrefix} Kepala Instalasi`
        : 'Kepala Instalasi / Unit',
      unitName: proposingUnit,
      officialName: kaInst.displayName,
      officialNip: kaInst.displayNip,
      isPltOrPlh: kaInst.pltPrefix,
      status: statusFor(1),
      timestamp: activeIndex > 1 ? '17 Nov 2026 · 09:05 WIB' : undefined,
      note:
        activeIndex > 1
          ? 'Paraf Teknis 1 disetujui. Kebutuhan operasional valid.'
          : activeIndex === 1
          ? 'Menunggu Paraf Teknis Tahap 1.'
          : undefined,
    },
    {
      order: 3,
      roleId: 'kabid',
      roleLabel: kaBid.pltPrefix
        ? `${kaBid.pltPrefix} Kepala Bidang`
        : 'Kepala Bagian / Bidang',
      unitName: kaBidangRaw.unitName,
      officialName: kaBid.displayName,
      officialNip: kaBid.displayNip,
      isPltOrPlh: kaBid.pltPrefix,
      status: statusFor(2),
      timestamp: activeIndex > 2 ? '17 Nov 2026 · 10:15 WIB' : undefined,
      note:
        activeIndex > 2
          ? 'Paraf Struktural 2 disetujui sesuai program bidang.'
          : activeIndex === 2
          ? 'Menunggu Paraf Struktural Tahap 2.'
          : undefined,
    },
    {
      order: 4,
      roleId: 'wadir',
      roleLabel: wadir.pltPrefix
        ? `${wadir.pltPrefix} Wakil Direktur`
        : 'Wakil Direktur',
      unitName: wadirRaw.unitName,
      officialName: wadir.displayName,
      officialNip: wadir.displayNip,
      isPltOrPlh: wadir.pltPrefix,
      status: statusFor(3),
      timestamp: activeIndex > 3 ? '17 Nov 2026 · 11:20 WIB' : undefined,
      note:
        activeIndex > 3
          ? 'Verifikasi kebijakan strategis selesai. Teruskan ke Direktur.'
          : activeIndex === 3
          ? 'Menunggu Verifikasi Kebijakan Wadir.'
          : undefined,
    },
    {
      order: 5,
      roleId: 'direktur',
      roleLabel: dir.pltPrefix
        ? `${dir.pltPrefix} Direktur (TTE)`
        : 'Direktur (TTE Final)',
      unitName: 'Direktorat RSUD Nusantara Jaya',
      officialName: dir.displayName,
      officialNip: dir.displayNip,
      isPltOrPlh: dir.pltPrefix,
      status: statusFor(4),
      timestamp: activeIndex >= 5 ? '17 Nov 2026 · 13:10 WIB' : undefined,
      note:
        activeIndex >= 5
          ? 'Ditandatangani secara elektronik (TTE BSrE/BSSN).'
          : activeIndex === 4
          ? 'Menunggu Tanda Tangan Elektronik (TTE) Direktur.'
          : undefined,
    },
    {
      order: 6,
      roleId: 'arsiparis',
      roleLabel: 'Tata Usaha / Arsiparis',
      unitName: 'Bagian Tata Usaha & Sekretariat',
      officialName: 'Siti Aminah, S.Sos.',
      officialNip: '19810614 200801 2 015',
      status: activeIndex >= 5 ? 'current' : 'pending',
      note:
        activeIndex >= 5
          ? 'Siap registrasi nomor surat resmi & pengarsipan.'
          : undefined,
    },
  ];
}

export const TND_TEMPLATES: TndTemplateSpec[] = [
  {
    id: 'tpl-nd',
    letterType: 'Nota Dinas',
    templateCode: 'TND-ND-01',
    classificationCode: '027 / 445',
    paperSize: 'F4 (215 × 330 mm)',
    margins: 'Atas 2,5 cm · Kiri 3,0 cm · Kanan 2,0 cm · Bawah 2,5 cm',
    fontSpec: 'Arial / Public Sans 11 pt · Spasi 1,15',
    description:
      'Naskah dinas internal antarpejabat di lingkungan RSUD untuk penyampaian usulan pengadaan, laporan operasional, atau koordinasi teknis unit.',
    requiredElements: [
      'Kop Surat RSUD Pemerintah',
      'Judul "NOTA DINAS" rata tengah huruf kapital',
      'Blok Kepala: Kepada, Dari, Tanggal, Nomor, Sifat, Lampiran, Hal',
      'Paragraf Pembuka, Pokok Usulan, dan Penutup EYD V',
      'Blok Tanda Tangan & NIP Pejabat Pengusul',
    ],
    samplePrompt:
      'Buatkan nota dinas permohonan pengadaan 3 unit termometer digital untuk ruang rawat inap',
  },
  {
    id: 'tpl-und',
    letterType: 'Surat Undangan',
    templateCode: 'TND-UND-02',
    classificationCode: '005',
    paperSize: 'A4 (210 × 297 mm)',
    margins: 'Atas 2,5 cm · Kiri 3,0 cm · Kanan 2,0 cm · Bawah 2,5 cm',
    fontSpec: 'Arial / Public Sans 11 pt · Spasi 1,15',
    description:
      'Naskah dinas pemberitahuan resmi kepada pejabat internal atau lintas instansi untuk menghadiri rapat koordinasi, evaluasi mutu, atau sosialisasi.',
    requiredElements: [
      'Kop Surat Resmi RSUD',
      'Nomor, Sifat, Lampiran, Hal di kiri atas & Tanggal di kanan',
      'Alamat Tujuan (Yth.) dengan format baku',
      'Rincian Hari/Tanggal, Pukul, Tempat, dan Acara',
      'Blok Tanda Tangan Pejabat Berwenang + Tembusan',
    ],
    samplePrompt:
      'Buatkan surat undangan rapat koordinasi persiapan akreditasi Pokja PPI hari Kamis pukul 09.00 WIB di Aula Lantai 3',
  },
  {
    id: 'tpl-st',
    letterType: 'Surat Tugas',
    templateCode: 'TND-ST-03',
    classificationCode: '090 / 800',
    paperSize: 'F4 (215 × 330 mm)',
    margins: 'Atas 2,5 cm · Kiri 3,0 cm · Kanan 2,0 cm · Bawah 2,5 cm',
    fontSpec: 'Bookman Old Style / Serif 11 pt · Spasi 1,15',
    description:
      'Naskah dinas penugasan resmi dari pimpinan RSUD kepada pegawai/tim medis untuk melaksanakan diklat, pendampingan, atau tugas kedinasan.',
    requiredElements: [
      'Kop Surat Resmi RSUD',
      'Judul "SURAT TUGAS" dan Nomor Surat',
      'Konsiderans Dasar & Kepada (Daftar Pegawai + NIP)',
      'Uraian "Untuk" berisi tujuan, waktu, dan lokasi penugasan',
      'Kewajiban pelaporan hasil tugas & TTD Direktur/Wadir',
    ],
    samplePrompt:
      'Buatkan surat tugas untuk 2 perawat IGD mengikuti pelatihan kegawatdaruratan BTCLS selama 3 hari di Bandung',
  },
  {
    id: 'tpl-sp',
    letterType: 'Surat Permohonan',
    templateCode: 'TND-SP-04',
    classificationCode: '440 / 027',
    paperSize: 'A4 (210 × 297 mm)',
    margins: 'Atas 2,5 cm · Kiri 3,0 cm · Kanan 2,0 cm · Bawah 2,5 cm',
    fontSpec: 'Arial / Public Sans 11 pt · Spasi 1,15',
    description:
      'Surat resmi pengajuan kalibrasi alat kesehatan, pemeliharaan sarana, atau permohonan dukungan teknis kepada pihak eksternal/Dinas Kesehatan.',
    requiredElements: [
      'Kop Surat Resmi RSUD',
      'Nomor, Sifat, Lampiran, dan Perihal Permohonan',
      'Tujuan Instansi/Mitra Eksternal',
      'Latar Belakang Teknis & Daftar Kebutuhan',
      'Blok Tanda Tangan Direktur RSUD',
    ],
    samplePrompt:
      'Buatkan surat permohonan kalibrasi 5 unit ventilator ICU dan alat EKG kepada Balai Pengamanan Fasilitas Kesehatan',
  },
  {
    id: 'tpl-se',
    letterType: 'Surat Edaran',
    templateCode: 'TND-SE-05',
    classificationCode: '440 / 000',
    paperSize: 'F4 (215 × 330 mm)',
    margins: 'Atas 2,5 cm · Kiri 3,0 cm · Kanan 2,0 cm · Bawah 2,5 cm',
    fontSpec: 'Bookman Old Style / Serif 11 pt · Spasi 1,15',
    description:
      'Naskah dinas pemberitahuan kebijakan internal rumah sakit yang berlaku bagi seluruh instalasi, bidang, dan staf pelayanan.',
    requiredElements: [
      'Kop Surat Resmi RSUD',
      'Judul "SURAT EDARAN", Nomor, dan Tentang',
      'Latar Belakang Kebijakan & Dasar Hukum',
      'Poin Ketentuan Pelaksanaan Operasional',
      'Penetapan Tanggal & Tanda Tangan Direktur',
    ],
    samplePrompt:
      'Buatkan surat edaran internal mengenai kewajiban kepatuhan input rekam medis elektronik e-RM maksimal 1x24 jam di seluruh poliklinik',
  },
];

export const INITIAL_DRAFTS: LetterDraft[] = [
  {
    id: 'drf-2026-001',
    creatorId: 'usr-staf',
    letterNumber: '[Menunggu Nomor Resmi TU]',
    officialNumberAssigned: false,
    tteSigned: false,
    letterType: 'Nota Dinas',
    classificationCode: '027',
    proposingUnit: 'Instalasi Rawat Inap',
    recipient: 'Direktur RSUD Nusantara Jaya melalui Wakil Direktur Umum dan Keuangan',
    sender: 'Kepala Instalasi Rawat Inap',
    subject: 'Permohonan Pengadaan 3 Unit Termometer Digital Ruang Rawat Inap',
    urgency: 'Penting',
    dateStr: '17 November 2026',
    attachment: '1 (satu) berkas spesifikasi teknis',
    bodyParagraphs: [
      'Dengan hormat, dalam rangka menjaga mutu pemantauan tanda-tanda vital pasien secara akurat pada Ruang Rawat Inap Kelas I dan Kelas II, bersama ini kami laporkan bahwa beberapa unit termometer klinis eksisting mengalami deviasi pembacaan suhu.',
      'Sehubungan dengan hal tersebut, kami mengajukan permohonan pengadaan sebanyak 3 (tiga) unit termometer digital medis terkalibrasi guna mendukung kelancaran asuhan keperawatan di Instalasi Rawat Inap.',
      'Demikian nota dinas ini kami sampaikan. Atas perhatian dan perkenan Bapak/Ibu, kami ucapkan terima kasih.',
    ],
    signerName: 'Dr. dr. Aris Munandar, Sp.B., MARS.',
    signerTitle: 'Direktur RSUD Nusantara Jaya',
    signerNip: '19691203 199803 1 002',
    rawPrompt:
      'Buatkan nota dinas permohonan pengadaan 3 unit termometer digital untuk ruang rawat inap',
    extractedJson: {
      jenisSurat: 'Nota Dinas',
      kodeKlasifikasi: '027 / Pengadaan Perlengkapan & Alat Kesehatan',
      unitPengusul: 'Instalasi Rawat Inap',
      tujuanSurat: 'Direktur melalui Wadir Umum & Keuangan',
      perihal: 'Permohonan Pengadaan 3 Unit Termometer Digital Ruang Rawat Inap',
      urgensi: 'Penting',
      templateTnd: 'TND-ND-01 (Nota Dinas Internal)',
      entitasItem: ['3 unit termometer digital'],
    },
    status: 'Draft',
    complianceScore: 100,
    parafFlow: buildSotkParafFlow('Instalasi Rawat Inap', 'Nota Dinas', 'Draft'),
    auditTrail: [
      {
        id: 'aud-101',
        draftId: 'drf-2026-001',
        draftNumber: '[Draf Awal]',
        draftSubject: 'Permohonan Pengadaan 3 Unit Termometer Digital Ruang Rawat Inap',
        actorName: 'Rizky Pratama, A.Md.Kep.',
        actorNip: '19940312 202012 1 004',
        actorRole: 'Staf Pengusul',
        action: 'Membuat Draf via Intent-to-Draft',
        fromStatus: '-',
        toStatus: 'Draft',
        note: 'Draf awal selesai disusun dan siap diajukan ke Kepala Instalasi.',
        timestamp: '17 Nov 2026 · 08:30 WIB',
      },
    ],
    createdAt: '17 Nov 2026 · 08:30',
    updatedAt: '17 Nov 2026 · 08:32',
  },
  {
    id: 'drf-2026-002',
    creatorId: 'usr-staf',
    letterNumber: '[Menunggu Nomor Resmi TU]',
    officialNumberAssigned: false,
    tteSigned: false,
    letterType: 'Nota Dinas',
    classificationCode: '027',
    proposingUnit: 'Instalasi Rawat Inap',
    recipient: 'Direktur RSUD Nusantara Jaya melalui Wakil Direktur Pelayanan',
    sender: 'Kepala Instalasi Rawat Inap',
    subject: 'Usulan Pemeliharaan & Kalibrasi 4 Unit Monitor Pasien Ruang ICU/Ranap',
    urgency: 'Segera',
    dateStr: '17 November 2026',
    attachment: '1 (satu) berkas daftar aset',
    bodyParagraphs: [
      'Dengan hormat, menindaklanjuti jadwal pemeliharaan alat elektromedik triwulan IV, bersama ini kami ajukan permohonan kalibrasi ulang terhadap 4 (empat) unit bedside patient monitor pada Instalasi Rawat Inap.',
      'Langkah kalibrasi ini diperlukan untuk memastikan akurasi pembacaan saturasi oksigen dan tekanan darah pasien sesuai standar keselamatan rumah sakit.',
      'Demikian permohonan ini kami sampaikan. Atas perhatian dan persetujuan Bapak/Ibu, kami ucapkan terima kasih.',
    ],
    signerName: 'Dr. dr. Aris Munandar, Sp.B., MARS.',
    signerTitle: 'Direktur RSUD Nusantara Jaya',
    signerNip: '19691203 199803 1 002',
    rawPrompt:
      'Buatkan nota dinas usulan kalibrasi 4 unit monitor pasien ruang rawat inap',
    extractedJson: {
      jenisSurat: 'Nota Dinas',
      kodeKlasifikasi: '027 / Pemeliharaan Alat Medik',
      unitPengusul: 'Instalasi Rawat Inap',
      tujuanSurat: 'Direktur melalui Wadir Pelayanan',
      perihal: 'Usulan Pemeliharaan & Kalibrasi 4 Unit Monitor Pasien Ruang ICU/Ranap',
      urgensi: 'Segera',
      templateTnd: 'TND-ND-01 (Nota Dinas Internal)',
      entitasItem: ['4 unit monitor pasien'],
    },
    status: 'Menunggu Paraf Instalasi',
    complianceScore: 100,
    parafFlow: buildSotkParafFlow(
      'Instalasi Rawat Inap',
      'Nota Dinas',
      'Menunggu Paraf Instalasi'
    ),
    auditTrail: [
      {
        id: 'aud-201',
        draftId: 'drf-2026-002',
        draftNumber: '[Menunggu Nomor Resmi TU]',
        draftSubject: 'Usulan Pemeliharaan & Kalibrasi 4 Unit Monitor Pasien Ruang ICU/Ranap',
        actorName: 'Rizky Pratama, A.Md.Kep.',
        actorNip: '19940312 202012 1 004',
        actorRole: 'Staf Pengusul',
        action: 'Ajukan ke Instalasi',
        fromStatus: 'Draft',
        toStatus: 'Menunggu Paraf Instalasi',
        note: 'Mohon tinjauan teknis dari Ibu Kepala Instalasi.',
        timestamp: '17 Nov 2026 · 08:45 WIB',
      },
    ],
    createdAt: '17 Nov 2026 · 08:40',
    updatedAt: '17 Nov 2026 · 08:45',
  },
  {
    id: 'drf-2026-003',
    creatorId: 'usr-staf',
    letterNumber: '[Menunggu Nomor Resmi TU]',
    officialNumberAssigned: false,
    tteSigned: false,
    letterType: 'Surat Undangan',
    classificationCode: '005',
    proposingUnit: 'Instalasi Rawat Jalan',
    recipient: 'Seluruh Kepala Instalasi dan Ketua Pokja Akreditasi RSUD Nusantara Jaya',
    sender: 'Wakil Direktur Pelayanan & Penunjang',
    subject: 'Undangan Rapat Koordinasi Persiapan Survei Akreditasi Pokja PPI',
    urgency: 'Segera',
    dateStr: '17 November 2026',
    attachment: '-',
    bodyParagraphs: [
      'Dengan hormat, menindaklanjuti jadwal evaluasi mutu pelayanan serta kesiapan dokumen standar akreditasi rumah sakit triwulan IV tahun 2026, kami mengundang Bapak/Ibu untuk hadir pada rapat koordinasi yang akan diselenggarakan pada:',
      'Mengingat pentingnya agenda penyelarasan bukti telusur tiap pokja, dimohon kehadiran Bapak/Ibu tepat pada waktunya dengan membawa laporan capaian unit masing-masing.',
      'Demikian surat undangan ini kami sampaikan. Atas perhatian dan kerja sama Bapak/Ibu, kami ucapkan terima kasih.',
    ],
    eventDetails: {
      hariTanggal: 'Kamis, 19 November 2026',
      waktu: '09.00 WIB s.d. selesai',
      tempat: 'Aula Pertemuan Lantai 3, Gedung Administrasi RSUD Nusantara Jaya',
      acara: 'Rapat Koordinasi Kesiapan Akreditasi & Pencegahan Infeksi (PPI)',
    },
    signerName: 'Dr. dr. Aris Munandar, Sp.B., MARS.',
    signerTitle: 'Direktur RSUD Nusantara Jaya',
    signerNip: '19691203 199803 1 002',
    rawPrompt:
      'Buatkan surat undangan rapat koordinasi persiapan akreditasi hari Kamis jam 9 pagi di Aula Lantai 3',
    extractedJson: {
      jenisSurat: 'Surat Undangan',
      kodeKlasifikasi: '005 / Undangan Rapat Dinas',
      unitPengusul: 'Instalasi Rawat Jalan',
      tujuanSurat: 'Kepala Instalasi & Ketua Pokja Akreditasi',
      perihal: 'Undangan Rapat Koordinasi Persiapan Survei Akreditasi Pokja PPI',
      urgensi: 'Segera',
      templateTnd: 'TND-UND-02 (Surat Undangan)',
      hariTanggal: 'Kamis, 19 November 2026',
      waktu: '09.00 WIB',
      tempat: 'Aula Pertemuan Lantai 3',
    },
    status: 'Menunggu Paraf Kabid',
    complianceScore: 100,
    parafFlow: buildSotkParafFlow(
      'Instalasi Rawat Jalan',
      'Surat Undangan',
      'Menunggu Paraf Kabid'
    ),
    auditTrail: [
      {
        id: 'aud-301',
        draftId: 'drf-2026-003',
        draftNumber: '[Menunggu Nomor Resmi TU]',
        draftSubject: 'Undangan Rapat Koordinasi Persiapan Survei Akreditasi Pokja PPI',
        actorName: 'Rizky Pratama, A.Md.Kep.',
        actorNip: '19940312 202012 1 004',
        actorRole: 'Staf Pengusul',
        action: 'Ajukan ke Instalasi',
        fromStatus: 'Draft',
        toStatus: 'Menunggu Paraf Instalasi',
        timestamp: '17 Nov 2026 · 08:10 WIB',
      },
      {
        id: 'aud-302',
        draftId: 'drf-2026-003',
        draftNumber: '[Menunggu Nomor Resmi TU]',
        draftSubject: 'Undangan Rapat Koordinasi Persiapan Survei Akreditasi Pokja PPI',
        actorName: 'dr. Aditya Mahendra, Sp.A.',
        actorNip: '19831104 201101 1 007',
        actorRole: 'Kepala Instalasi',
        action: 'Paraf Teknis Disetujui',
        fromStatus: 'Menunggu Paraf Instalasi',
        toStatus: 'Menunggu Paraf Kabid',
        note: 'Materi undangan Pokja PPI sudah sesuai jadwal akreditasi.',
        timestamp: '17 Nov 2026 · 09:05 WIB',
      },
    ],
    createdAt: '17 Nov 2026 · 08:05',
    updatedAt: '17 Nov 2026 · 09:05',
  },
  {
    id: 'drf-2026-004',
    creatorId: 'usr-staf',
    letterNumber: '[Menunggu Nomor Resmi TU]',
    officialNumberAssigned: false,
    tteSigned: false,
    letterType: 'Surat Permohonan',
    classificationCode: '440',
    proposingUnit: 'Instalasi Gawat Darurat (IGD)',
    recipient: 'Kepala Balai Pengamanan Fasilitas Kesehatan (BPFK) Regional',
    sender: 'Direktur RSUD Nusantara Jaya',
    subject: 'Permohonan Kalibrasi 5 Unit Ventilator Ruang Resusitasi IGD',
    urgency: 'Segera',
    dateStr: '17 November 2026',
    attachment: '1 (satu) berkas daftar nomor seri ventilator',
    bodyParagraphs: [
      'Dengan hormat, dalam rangka memastikan kesiapsiagaan pelayanan kegawatdaruratan medik serta memenuhi persyaratan uji laik fungsi alat kesehatan, bersama ini kami mengajukan permohonan pengujian dan kalibrasi terhadap 5 (lima) unit ventilator mekanik pada Instalasi Gawat Darurat.',
      'Adapun jadwal pelaksanaan kalibrasi dapat dikoordinasikan langsung dengan Kepala Instalasi Gawat Darurat dan IPSRS RSUD Nusantara Jaya agar tidak mengganggu layanan pasien.',
      'Demikian permohonan ini kami sampaikan. Atas perhatian dan kerja sama Bapak/Ibu, kami ucapkan terima kasih.',
    ],
    signerName: 'Dr. dr. Aris Munandar, Sp.B., MARS.',
    signerTitle: 'Direktur RSUD Nusantara Jaya',
    signerNip: '19691203 199803 1 002',
    rawPrompt:
      'Buatkan surat permohonan kalibrasi 5 unit ventilator IGD kepada Balai Pengamanan Fasilitas Kesehatan',
    extractedJson: {
      jenisSurat: 'Surat Permohonan',
      kodeKlasifikasi: '440 / Kesehatan & Fasilitas Medik',
      unitPengusul: 'Instalasi Gawat Darurat (IGD)',
      tujuanSurat: 'Kepala BPFK Regional',
      perihal: 'Permohonan Kalibrasi 5 Unit Ventilator Ruang Resusitasi IGD',
      urgensi: 'Segera',
      templateTnd: 'TND-SP-04 (Surat Permohonan)',
      entitasItem: ['5 unit ventilator'],
    },
    status: 'Menunggu Verifikasi Wadir',
    complianceScore: 100,
    parafFlow: buildSotkParafFlow(
      'Instalasi Gawat Darurat (IGD)',
      'Surat Permohonan',
      'Menunggu Verifikasi Wadir'
    ),
    auditTrail: [
      {
        id: 'aud-401',
        draftId: 'drf-2026-004',
        draftNumber: '[Menunggu Nomor Resmi TU]',
        draftSubject: 'Permohonan Kalibrasi 5 Unit Ventilator Ruang Resusitasi IGD',
        actorName: 'Ns. Ratna Sari Dewi, S.Kep., M.Kep.',
        actorNip: '19850719 201001 2 011',
        actorRole: 'Kepala Instalasi',
        action: 'Paraf Teknis Disetujui',
        fromStatus: 'Menunggu Paraf Instalasi',
        toStatus: 'Menunggu Paraf Kabid',
        timestamp: '17 Nov 2026 · 09:10 WIB',
      },
      {
        id: 'aud-402',
        draftId: 'drf-2026-004',
        draftNumber: '[Menunggu Nomor Resmi TU]',
        draftSubject: 'Permohonan Kalibrasi 5 Unit Ventilator Ruang Resusitasi IGD',
        actorName: 'dr. Hendra Wijaya, Sp.PD., M.Kes.',
        actorNip: '19780421 200604 1 009',
        actorRole: 'Kepala Bidang',
        action: 'Paraf Struktural Disetujui',
        fromStatus: 'Menunggu Paraf Kabid',
        toStatus: 'Menunggu Verifikasi Wadir',
        note: 'Anggaran kalibrasi tersedia pada pos pemeliharaan alat medik.',
        timestamp: '17 Nov 2026 · 10:15 WIB',
      },
    ],
    createdAt: '17 Nov 2026 · 08:15',
    updatedAt: '17 Nov 2026 · 10:15',
  },
  {
    id: 'drf-2026-005',
    creatorId: 'usr-staf',
    letterNumber: '[Menunggu Nomor Resmi TU]',
    officialNumberAssigned: false,
    tteSigned: false,
    letterType: 'Surat Tugas',
    classificationCode: '090',
    proposingUnit: 'Instalasi Gawat Darurat (IGD)',
    recipient: 'Tim Perawat Kegawatdaruratan IGD RSUD Nusantara Jaya',
    sender: 'Direktur RSUD Nusantara Jaya',
    subject: 'Penugasan Pelatihan Basic Trauma Cardiac Life Support (BTCLS)',
    urgency: 'Biasa',
    dateStr: '17 November 2026',
    attachment: '1 (satu) berkas jadwal pelatihan',
    bodyParagraphs: [
      'Dalam rangka peningkatan kompetensi klinis tenaga keperawatan pada Instalasi Gawat Darurat, Direktur RSUD Nusantara Jaya menugaskan kepada 2 (dua) orang perawat pelaksana IGD untuk mengikuti Pelatihan Kegawatdaruratan BTCLS Terakreditasi.',
      'Penugasan dilaksanakan selama 3 (tiga) hari kerja terhitung mulai tanggal 24 s.d. 26 November 2026 bertempat di Pusat Pelatihan Kesehatan Daerah.',
      'Setelah menyelesaikan penugasan, pegawai yang bersangkutan wajib menyampaikan laporan hasil kegiatan serta salinan sertifikat kepada Bagian Sumber Daya Manusia selambat-lambatnya 5 (lima) hari kerja setelah kembali.',
    ],
    signerName: 'Dr. dr. Aris Munandar, Sp.B., MARS.',
    signerTitle: 'Direktur RSUD Nusantara Jaya',
    signerNip: '19691203 199803 1 002',
    rawPrompt:
      'Buatkan surat tugas untuk 2 perawat IGD mengikuti pelatihan BTCLS selama 3 hari',
    extractedJson: {
      jenisSurat: 'Surat Tugas',
      kodeKlasifikasi: '090 / Perjalanan Dinas & Diklat',
      unitPengusul: 'Instalasi Gawat Darurat (IGD)',
      tujuanSurat: '2 Perawat Pelaksana IGD',
      perihal: 'Penugasan Pelatihan Basic Trauma Cardiac Life Support (BTCLS)',
      urgensi: 'Biasa',
      templateTnd: 'TND-ST-03 (Surat Tugas)',
    },
    status: 'Menunggu TTE Direktur',
    complianceScore: 100,
    parafFlow: buildSotkParafFlow(
      'Instalasi Gawat Darurat (IGD)',
      'Surat Tugas',
      'Menunggu TTE Direktur'
    ),
    auditTrail: [
      {
        id: 'aud-501',
        draftId: 'drf-2026-005',
        draftNumber: '[Menunggu Nomor Resmi TU]',
        draftSubject: 'Penugasan Pelatihan Basic Trauma Cardiac Life Support (BTCLS)',
        actorName: 'dr. Hendra Wijaya, Sp.PD., M.Kes.',
        actorNip: '19780421 200604 1 009',
        actorRole: 'Kepala Bidang',
        action: 'Paraf Struktural Disetujui',
        fromStatus: 'Menunggu Paraf Kabid',
        toStatus: 'Menunggu Verifikasi Wadir',
        timestamp: '17 Nov 2026 · 10:00 WIB',
      },
      {
        id: 'aud-502',
        draftId: 'drf-2026-005',
        draftNumber: '[Menunggu Nomor Resmi TU]',
        draftSubject: 'Penugasan Pelatihan Basic Trauma Cardiac Life Support (BTCLS)',
        actorName: 'drg. Kartika Sari, MARS.',
        actorNip: '19740109 200212 2 004',
        actorRole: 'Wakil Direktur',
        action: 'Verifikasi Kebijakan Disetujui',
        fromStatus: 'Menunggu Verifikasi Wadir',
        toStatus: 'Menunggu TTE Direktur',
        note: 'Jadwal rotasi jaga IGD selama pelatihan telah diamankan. Siap TTE Direktur.',
        timestamp: '17 Nov 2026 · 11:20 WIB',
      },
    ],
    createdAt: '17 Nov 2026 · 07:50',
    updatedAt: '17 Nov 2026 · 11:20',
  },
  {
    id: 'drf-2026-006',
    creatorId: 'usr-staf',
    letterNumber: '[Menunggu Nomor Resmi TU]',
    officialNumberAssigned: false,
    tteSigned: true,
    letterType: 'Surat Edaran',
    classificationCode: '440',
    proposingUnit: 'Instalasi Rawat Jalan',
    recipient: 'Seluruh Kepala Instalasi, Kepala Bidang, dan Pegawai RSUD Nusantara Jaya',
    sender: 'Direktur RSUD Nusantara Jaya',
    subject: 'Kewajiban Kepatuhan Pengisian Rekam Medis Elektronik (e-RM) Maksimal 1x24 Jam',
    urgency: 'Penting',
    dateStr: '17 November 2026',
    attachment: '-',
    bodyParagraphs: [
      'Dalam rangka menertibkan tata kelola administrasi pelayanan klinis dan memenuhi indikator mutu nasional rumah sakit, seluruh Dokter Penanggung Jawab Pelayanan (DPJP) dan tenaga kesehatan diwajibkan melengkapi pengisian Rekam Medis Elektronik (e-RM) selambat-lambatnya 1x24 jam setelah pelayanan pasien.',
      'Setiap Kepala Instalasi dan Kepala Bidang agar melakukan pemantauan kepatuhan mingguan melalui dasbor SIMRS dan melaporkan kendala teknis kepada Instalasi Rekam Medis.',
      'Demikian surat edaran ini disampaikan untuk dilaksanakan dengan penuh tanggung jawab.',
    ],
    signerName: 'Dr. dr. Aris Munandar, Sp.B., MARS.',
    signerTitle: 'Direktur RSUD Nusantara Jaya',
    signerNip: '19691203 199803 1 002',
    rawPrompt:
      'Buatkan surat edaran internal mengenai kewajiban kepatuhan input rekam medis elektronik e-RM maksimal 1x24 jam',
    extractedJson: {
      jenisSurat: 'Surat Edaran',
      kodeKlasifikasi: '440 / Ketentuan Internal RSUD',
      unitPengusul: 'Instalasi Rawat Jalan',
      tujuanSurat: 'Seluruh Instalasi & Bidang RSUD',
      perihal: 'Kewajiban Kepatuhan Pengisian Rekam Medis Elektronik (e-RM) Maksimal 1x24 Jam',
      urgensi: 'Penting',
      templateTnd: 'TND-SE-05 (Surat Edaran)',
    },
    status: 'Selesai / Terbit',
    complianceScore: 100,
    parafFlow: buildSotkParafFlow(
      'Instalasi Rawat Jalan',
      'Surat Edaran',
      'Selesai / Terbit'
    ),
    auditTrail: [
      {
        id: 'aud-601',
        draftId: 'drf-2026-006',
        draftNumber: '[Menunggu Nomor Resmi TU]',
        draftSubject: 'Kewajiban Kepatuhan Pengisian Rekam Medis Elektronik (e-RM) Maksimal 1x24 Jam',
        actorName: 'Dr. dr. Aris Munandar, Sp.B., MARS.',
        actorNip: '19691203 199803 1 002',
        actorRole: 'Direktur',
        action: 'Tanda Tangan Elektronik (TTE)',
        fromStatus: 'Menunggu TTE Direktur',
        toStatus: 'Selesai / Terbit',
        note: 'Disahkan dengan sertifikat elektronik BSrE/BSSN. Diteruskan ke Tata Usaha untuk penomoran resmi.',
        timestamp: '17 Nov 2026 · 13:10 WIB',
      },
    ],
    createdAt: '16 Nov 2026 · 14:20',
    updatedAt: '17 Nov 2026 · 13:10',
  },
  {
    id: 'drf-2026-007',
    creatorId: 'usr-staf',
    letterNumber: '027/099/RSUD-NJ/XI/2026',
    officialNumberAssigned: true,
    tteSigned: false,
    letterType: 'Nota Dinas',
    classificationCode: '027',
    proposingUnit: 'Instalasi Farmasi',
    recipient: 'Kepala Bagian Umum & Pengadaan RSUD Nusantara Jaya',
    sender: 'Kepala Instalasi Farmasi',
    subject: 'Permohonan Perbaikan Sistem Pendingin Gudang Obat',
    urgency: 'Segera',
    dateStr: '16 November 2026',
    attachment: '1 (satu) lembar berita acara kerusakan',
    bodyParagraphs: [
      'Dengan hormat, kami informasikan bahwa nomer seri unit pendingin utama pada Gudang Penyimpanan Obat Khusus mengalami gangguan kompresor sehingga suhu ruangan naik di atas ambang batas standar.',
      'Agar kwalitas sediaan farmasi tetap terjaga sesuai standar akreditasi apotik rumah sakit, kami mohon dapat dilakukan pemeriksaan dan perbaikan sistim pendingin tersebut sesegera mungkin.',
      'Demikian nota dinas ini disampaikan, atas perhatian dan tindak lanjutnya kami ucapkan terimakasih.',
    ],
    signerName: 'apt. Lestari Wulandari, S.Farm, M.Farm',
    signerTitle: 'Kepala Instalasi Farmasi',
    signerNip: '1986022820121220',
    rawPrompt:
      'Buatkan nota dinas permintaan perbaikan AC gudang obat instalasi farmasi karena suhu naik',
    extractedJson: {
      jenisSurat: 'Nota Dinas',
      kodeKlasifikasi: '027 / Pemeliharaan Sarana',
      unitPengusul: 'Instalasi Farmasi',
      tujuanSurat: 'Kepala Bagian Umum & Pengadaan',
      perihal: 'Permohonan Perbaikan Sistem Pendingin Gudang Obat',
      urgensi: 'Segera',
      templateTnd: 'TND-ND-01 (Nota Dinas Internal)',
      entitasItem: ['Unit pendingin gudang obat'],
    },
    status: 'Ditolak',
    complianceScore: 68,
    parafFlow: buildSotkParafFlow('Instalasi Farmasi', 'Nota Dinas', 'Ditolak'),
    auditTrail: [
      {
        id: 'aud-701',
        draftId: 'drf-2026-007',
        draftNumber: '027/099/RSUD-NJ/XI/2026',
        draftSubject: 'Permohonan Perbaikan Sistem Pendingin Gudang Obat',
        actorName: 'apt. Lestari Wulandari, S.Farm., M.Farm.',
        actorNip: '19860228 201212 2 003',
        actorRole: 'Kepala Instalasi',
        action: 'Tolak / Kembalikan ke Pengusul',
        fromStatus: 'Menunggu Paraf Instalasi',
        toStatus: 'Ditolak',
        note: 'Terdapat beberapa kata tidak baku (nomer, kwalitas, apotik, terimakasih) & NIP belum 18 digit. Silakan perbaiki di Biromatic Guard lalu ajukan kembali.',
        timestamp: '16 Nov 2026 · 16:05 WIB',
      },
    ],
    createdAt: '16 Nov 2026 · 15:30',
    updatedAt: '16 Nov 2026 · 16:05',
  },
];
