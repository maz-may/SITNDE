# Detail Role-Based Access Control (RBAC) — SITNDE

**Sistem:** SITNDE (*Smart Intent-to-Draft & Tata Naskah Dinas Engine*)  
**Instansi:** Rumah Sakit Umum Daerah (RSUD) / RS Pemerintah  
**Versi:** 1.0  

---

## 1. Tujuan & Prinsip RBAC dalam SITNDE

Penerapan *Role-Based Access Control* (RBAC) pada sistem persuratan dinas berbasis AI bertujuan untuk:

* **Mencegah *Bypass* Birokrasi:** Memastikan draf surat tidak bisa langsung melompat ke pimpinan tertinggi tanpa melalui jalur paraf berjenjang yang sah sesuai SOTK.
* **Pembatasan Akses Data Sensitif:** Menjaga kerahasiaan naskah dinas yang bersifat *Rahasia* atau *Penting* (misalnya nota dinas kepegawaian, pengadaan strategis, atau keuangan).
* **Akuntabilitas Mutlak:** Setiap tindakan (buat, edit, paraf, tolak, penomoran, hingga tanda tangan) terikat secara unik pada NIP dan akun pejabat yang berwenang melalui *Audit Trail*.

---

## 2. Matriks Peran dan Hak Akses (*RBAC Matrix*)

Berikut adalah rincian 7 level peran (*roles*) dalam ekosistem SITNDE beserta modul dan kewenangan aksinya:

| No | Peran Pengguna (*Role*) | Deskripsi / Posisi dalam SOTK | Hak Akses & Modul Utama | Kewenangan Aksi Spesifik |
| :---: | :--- | :--- | :--- | :--- |
| **1** | **Staf Pengusul / Pembuat Draf** *(Staff / Creator)* | Pelaksana administrasi, tenaga fungsional, atau staf umum di instalasi/unit. | • Modul Intent-to-Draft (SITNDE)<br>• Modul Biromatic Guard<br>• Arsip Pribadi / Unit | • Membuat draf awal via AI prompt.<br>• Menyunting teks naskah.<br>• Mengajukan draf ke atasan langsung (Kepala Unit). |
| **2** | **Kepala Instalasi / Unit Kerja** *(Unit Head)* | Penanggung jawab unit/instalasi fungsional (misal: Kepala Instalasi Rawat Jalan, Kepala Unit IT). | • Modul Review & Paraf<br>• Kalender & Monitoring Unit<br>• Arsip Unit | • Meninjau substansi teknis usulan.<br>• Memberikan *Paraf Teknis 1*.<br>• Merevisi/menolak draf jika ada kesalahan data teknis. |
| **3** | **Kepala Bagian / Bidang** *(Division Head)* | Pejabat struktural eselon (misal: Kabag TU, Kabid Pelayanan Medis, Kabid Penunjang). | • Modul Review & Paraf Berjenjang<br>• Manajemen Disposisi<br>• Laporan Bidang | • Meninjau keselarasan program/anggaran.<br>• Memberikan *Paraf Struktural 2*.<br>• Meneruskan draf ke level Wakil Direktur. |
| **4** | **Wakil Direktur** *(Vice Director)* | Pimpinan struktural tingkat II (misal: Wadir Pelayanan, Wadir Administrasi & Umum). | • Modul Verifikasi Strategis<br>• Dashboard Eksekutif Sektoral | • Memeriksa aspek kebijakan strategis rumah sakit.<br>• Memberikan verifikasi akhir (*Final Review* sebelum pimpinan tertinggi). |
| **5** | **Direktur / Pimpinan Tertinggi** *(Signing Authority)* | Kepala Instansi / Direktur RSUD. | • Modul Penandatanganan Elektronik (TTE)<br>• Dashboard Eksekutif Utama | • Memberikan pengesahan akhir.<br>• Melakukan *Sign* dokumen menggunakan Tanda Tangan Elektronik (TTE tersertifikasi BSrE/BSSN). |
| **6** | **Bagian Tata Usaha / Arsiparis** *(Secretariat / Admin Naskah)* | Staf khusus pengelola sekretariat pimpinan / tata naskah dinas. | • Modul Penomoran Resmi<br>• Registrasi Surat Keluar<br>• Master TND & Template | • Menginput nomor surat resmi otomatis setelah ditandatangani.<br>• Melakukan validasi akhir format tata naskah dinas (margin, kop, lampiran).<br>• Mendistribusikan surat keluar. |
| **7** | **Admin Sistem / IT** *(System Administrator)* | Pranata Komputer / Tim IT Rumah Sakit. | • Panel Konfigurasi Sistem<br>• Manajemen SOTK & User<br>• Log Keamanan & Server LLM | • Mengatur pemetaan matriks SOTK di database.<br>• Mengelola hak akses, *roles*, dan pemeliharaan server LLM *on-premise*.<br>• Memantau *audit log* dan keamanan data (UU PDP). |

---

## 3. Matriks Izin Operasi Teknis (*Permission Matrix*)

Tabel berikut memetakan izin spesifik tingkat database/API (`Create`, `Read`, `Update`, `Delete`, `Approve`, `Sign`) untuk setiap peran:

| Kode Izin (*Permission*) | Staf | Ka. Instalasi | Ka. Bag / Bid | Wadir | Direktur | Tata Usaha | Admin IT |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `draft:create_ai` (Buat draf via AI) | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| `draft:edit_content` (Edit isi naskah) | ✅ *(Milik sendiri)* | ✅ *(Unitnya)* | ✅ *(Bidangnya)* | ❌ *(Hanya catatan)* | ❌ | ✅ *(Format TND)* | ❌ |
| `draft:view_unit` (Lihat draf lintas unit) | ❌ | ❌ | ✅ *(Sub-unitnya)* | ✅ *(Direktoratnya)* | ✅ *(Semua)* | ✅ *(Semua)* | ❌ *(Terenkripsi)* |
| `workflow:paraf_1` (Paraf Teknis Unit) | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `workflow:paraf_2` (Paraf Struktural) | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `workflow:verify_wadir` (Verifikasi Wadir) | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| `document:sign_tte` (Tanda Tangan Akhir) | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |
| `document:assign_number` (Penomoran) | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| `system:manage_sotk_tnd` (Master Aturan) | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ *(Template)* | ✅ *(SOTK & Server)* |

---

## 4. Logika Transisi Alur Berjenjang (*Dynamic Routing Logic*)

Sistem RBAC pada SITNDE terintegrasi langsung dengan matriks SOTK. Ketika staf membuat draf, sistem membaca profil penugasan pegawai dari database kepegawaian (SIMRS/HRIS) untuk menentukan jalur persetujuan secara otomatis:

1. **Inisiasi (`DRAFT` $\rightarrow$ `PENDING_UNIT_HEAD`):**  
   Staf Unit IT (`Staf`) menekan tombol ajukan. Status draf berubah menjadi *Menunggu Paraf Instalasi*, dan hak edit penulis utama dikunci sementara.
2. **Eskalasi 1 (`PENDING_UNIT_HEAD` $\rightarrow$ `PENDING_DIV_HEAD`):**  
   Kepala Unit IT (`Kepala Instalasi`) menerima notifikasi, memeriksa substansi teknis, lalu membubuhkan paraf digital. Status berubah menjadi *Menunggu Paraf Kabid Penunjang*.
3. **Eskalasi 2 (`PENDING_DIV_HEAD` $\rightarrow$ `PENDING_WADIR`):**  
   Kabid Penunjang (`Kepala Bagian/Bidang`) memeriksa keselarasan program/anggaran dan membubuhkan paraf struktural. Status berubah menjadi *Menunggu Verifikasi Wadir*.
4. **Finalisasi Penandatanganan (`PENDING_WADIR` $\rightarrow$ `READY_TO_SIGN`):**  
   Setelah lolos verifikasi Wadir, draf masuk ke antrean Direktur (`Direktur`) untuk ditandatangani secara elektronik (TTE).
5. **Penomoran & Publikasi (`SIGNED` $\rightarrow$ `PUBLISHED`):**  
   Setelah ditandatangani Direktur, dokumen otomatis dikunci permanen (*read-only*), diteruskan ke Bagian Tata Usaha (`Arsiparis`) untuk disematkan **Nomor Surat Resmi**, dan diarsipkan secara digital.

---

## 5. Kebijakan Keamanan & Penanganan Kasus Khusus

* **Prinsip Hak Istimewa Terendah (*Principle of Least Privilege*):**  
  Staf di suatu instalasi (misalnya Instalasi Farmasi) tidak memiliki hak akses untuk melihat atau menarik draf surat yang sedang diproses di instalasi lain (misalnya Kepegawaian atau Keuangan), kecuali surat tersebut berstatus terbuka untuk umum atau berbentuk surat edaran/undangan massal.
* **Delegasi Pejabat Sementara (`Plt.` / `Plh.`):**  
  Jika pejabat definitif sedang cuti atau berhalangan tetap, hak akses persetujuan (`workflow:paraf` atau `document:sign_tte`) dialihkan sementara berdasarkan SK Penunjukan `Plt.`/`Plh.` di database kepegawaian, dan blok tanda tangan otomatis menyesuaikan nomenklatur jabatan sementara.
* **Jejak Audit Otomatis (*Immutable Audit Trail*):**  
  Setiap klik tombol *Submit*, *Approve*, *Reject*, *Revise*, atau *Sign* dicatat dalam tabel `audit_logs` dengan merekam `user_id`, `nip`, `role_active`, `timestamp`, `ip_address`, dan `action_type` yang tidak dapat diubah maupun dihapus oleh peran mana pun (termasuk Admin IT).