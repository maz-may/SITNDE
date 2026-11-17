# PRODUCT REQUIREMENT DOCUMENT (PRD)
# SITNDE
**Smart Intent-to-Draft & Tata Naskah Dinas Engine — Sistem Persuratan Cerdas Rumah Sakit Pemerintah**

| Atribut Dokumen | Keterangan |
| :--- | :--- |
| **Produk / Sistem** | SITNDE (Smart Intent-to-Draft & TND Engine) |
| **Versi Dokumen** | 1.0 (Baseline Specification) |
| **Instansi Target** | Rumah Sakit Umum Daerah (RSUD) / RS Pemerintah |
| **Tanggal Dokumen** | 17 November 2026 |
| **Lingkup Sistem** | Natural Language Intent Extraction, Pemilihan Template TND Otomatis, Penyusunan Draf Narasi EYD V, Validasi Gelar/NIP & SOTK, Audit Trail, dan Ekspor Dokumen Resmi |
| **Acuan Kerangka** | 16 Tahap Perancangan Aplikasi AI & Standar Tata Naskah Dinas (TND) Pemerintahan |

---

## Ringkasan Eksekutif

**SITNDE (Smart Intent-to-Draft & TND Engine)** adalah aplikasi web cerdas berbasis kecerdasan buatan lokal (*on-premise AI*) yang dirancang untuk mengotomatisasi penyusunan naskah dinas di lingkungan Rumah Sakit Pemerintah. Sistem ini menjembatani kesenjangan antara kebutuhan komunikasi operasional yang cepat dengan ketatnya regulasi Tata Naskah Dinas (TND) daerah, hierarki Struktur Organisasi dan Tata Kerja (SOTK), serta kaidah bahasa Indonesia baku (EYD V).

Arsitektur sistem memadukan tiga lapisan utama: lapisan interaksi bahasa alami (*Intent-to-Draft*), mesin tata letak deterministik (*Deterministic TND Template Engine*) yang menjamin kepatuhan ukuran margin, kop surat, dan penomoran tanpa risiko halusinasi tata letak, serta modul validasi integritas administratif (pengecekan gelar, NIP, dan rute paraf berjenjang).

> **Prinsip Utama Produk:**  
> AI bertugas memahami konteks, menyusun draf narasi birokrasi formal, dan memvalidasi kebakuan bahasa, sedangkan aturan tata letak fisik surat serta struktur hierarki jabatan dikendalikan sepenuhnya oleh aturan baku regulasi (*rule-based engine*) agar 100% patuh terhadap peraturan kepala daerah dan UU Pelindungan Data Pribadi (UU PDP).

---

## Daftar Isi

- [1. Tujuan Aplikasi](#1-tujuan-aplikasi)
- [2. Untuk Siapa Aplikasi Ini](#2-untuk-siapa-aplikasi-ini)
- [3. Apa yang Dihasilkan](#3-apa-yang-dihasilkan)
- [4. Fitur Utama](#4-fitur-utama)
- [5. Data dan Sumber Data](#5-data-dan-sumber-data)
- [6. Model dan Teknologi AI](#6-model-dan-teknologi-ai)
- [7. Desain dan Pengalaman Pengguna](#7-desain-dan-pengalaman-pengguna)
- [8. Alur Operasional dan Logika Prioritisasi](#8-alur-operasional-dan-logika-prioritisasi)
- [9. Infrastruktur dan Development](#9-infrastruktur-dan-development)
- [10. Pengembangan Aplikasi](#10-pengembangan-aplikasi)
- [11. Pengujian](#11-pengujian)
- [12. Keamanan dan Privasi](#12-keamanan-dan-privasi)
- [13. Persiapan Deployment](#13-persiapan-deployment)
- [14. Domain dan Branding](#14-domain-dan-branding)
- [15. Publish dan Launch](#15-publish-dan-launch)
- [16. Monitoring dan Iterasi](#16-monitoring-dan-iterasi)
- [Lampiran A. Functional Requirements](#lampiran-a-functional-requirements)
- [Lampiran B. Non-Functional Requirements](#lampiran-b-non-functional-requirements)
- [Lampiran C. Data Model Awal](#lampiran-c-data-model-awal)
- [Lampiran D. Template Laporan Evaluasi & Management Brief](#lampiran-d-template-laporan-evaluasi--management-brief)
- [Lampiran E. System Prompt & Instruksi Pengembangan Aplikasi](#lampiran-e-system-prompt--instruksi-pengembangan-aplikasi)

---

## 1. Tujuan Aplikasi

### 1.1 Masalah yang Ingin Diselesaikan
- **Kerumitan Variasi Template TND:** Pegawai sering bingung memilih format surat yang tepat (Nota Dinas, Surat Undangan, Surat Tugas, Surat Permohonan Pengadaan, atau Surat Keluar Eksternal) sesuai aturan Tata Naskah Dinas daerah.
- **Kesalahan Jalur Paraf & Disposisi SOTK:** Penentuan urutan pejabat pemaraf berjenjang (Staf, Kepala Instalasi/Unit, Kepala Bidang/Bagian, Wakil Direktur, hingga Direktur) sering keliru, terutama antara unit fungsional (Komite Medik/Instalasi) dan unit struktural.
- **Risiko Kesalahan Ketik & Bahasa Tidak Baku:** Tingginya potensi salah ketik (*typo*), kesalahan penulisan gelar akademis/profesi, NIP pejabat, serta penggunaan diksi yang kurang sesuai kaidah EYD V dan bahasa birokrasi formal.
- **Inefisiensi Waktu Administrasi:** Tenaga medis dan staf administrasi menghabiskan terlalu banyak waktu untuk memformat dokumen secara manual daripada fokus pada pelayanan kesehatan dan koordinasi teknis.

### 1.2 Nilai yang Diberikan

| Aspek | Nilai Utama | Penjelasan Dampak di Lingkungan RS |
| :--- | :--- | :--- |
| **Kecepatan Kerja** | Intent-to-Draft Instan | Mengubah instruksi kalimat sehari-hari menjadi draf naskah dinas siap periksa dalam hitungan detik (reduksi waktu penyusunan hingga 70%). |
| **Kepatuhan TND** | Deterministic Layout | Menjamin kop surat, margin, jenis huruf, dan struktur dokumen 100% sesuai Peraturan Kepala Daerah tanpa pergeseran format. |
| **Akurasi Birokrasi** | Validasi SOTK & NIP | Memastikan urutan paraf berjenjang, jabatan tujuan, gelar, dan NIP tervalidasi otomatis dengan master kepegawaian RS. |
| **Kualitas Bahasa** | Koreksi EYD V Otomatis | Menghilangkan kesalahan ketik (*typo*) dan menyelaraskan gaya bahasa menjadi lugas, baku, dan sopan sesuai standar pemerintahan. |
| **Kedaulatan Data** | 100% Pemrosesan Lokal | Seluruh draf surat pengadaan, anggaran, dan informasi sensitif diproses di server internal RS tanpa dikirim ke layanan cloud eksternal. |

---

## 2. Untuk Siapa Aplikasi Ini

SITNDE dirancang untuk seluruh ekosistem pembuat, pemeriksa, dan penandatangan naskah dinas di Rumah Sakit Pemerintah dengan kebutuhan dan kebiasaan kerja yang spesifik:

| Persona Pengguna | Kebutuhan & Kebiasaan Kerja | Masalah Spesifik yang Dihadapi |
| :--- | :--- | :--- |
| **Staf Pelaksana / Administrasi Unit** | Membuat draf surat harian dengan cepat di sela beban operasional pelayanan. | Kesulitan menghafal aturan TND, sering melakukan *copy-paste* surat lama yang formatnya sudah usang. |
| **Kepala Instalasi / Kepala Ruangan (Fungsional)** | Mengajukan nota dinas pengadaan alat medis, obat, atau jadwal jaga. | Sering keliru menentukan rute paraf berjenjang ke Bidang Pelayanan atau Penunjang terkait. |
| **Kepala Bagian / Kepala Bidang (Struktural)** | Memeriksa substansi, tata bahasa, dan kelengkapan administrasi sebelum naik ke Wadir. | Terbebani mengoreksi *typo* berulang, salah gelar, dan struktur kalimat yang bertele-tele. |
| **Sekretariat / Tata Usaha (TU)** | Memverifikasi penomoran surat, kode klasifikasi arsip, dan kepatuhan fisik TND. | Banyak surat dikembalikan ke unit pengusul karena salah kop, salah kode klasifikasi, atau salah margin. |
| **Wakil Direktur & Direktur** | Meninjau ringkasan substansi dan memberikan disposisi atau tanda tangan akhir. | Membutuhkan draf surat yang ringkas, jelas maksudnya, bebas cacat redaksional, dan tepat sasaran. |
| **Admin Sistem / Tim IT RS** | Mengelola master SOTK, template TND, akun pengguna, dan performa model AI. | Membutuhkan sistem yang modular, mudah diperbarui saat terjadi mutasi jabatan, dan aman. |

### 2.1 Matriks Hak Akses Pengguna

| Role Pengguna | Hak Akses Ringkas |
| :--- | :--- |
| **Konseptor (Staf / Ka. Instalasi)** | Membuat draf surat via AI prompt, menyunting draf pada editor, melihat rekomendasi jalur paraf, menyimpan riwayat draf, dan mengajukan verifikasi. |
| **Verifikator (Ka. Subbag / Ka. Bidang / TU)** | Memeriksa draf masuk, menggunakan fitur pemeriksaan tata bahasa & gelar otomatis, memberikan catatan revisi, dan menyetujui paraf berjenjang. |
| **Pimpinan (Wadir / Direktur)** | Melihat antrean surat siap tanda tangan, meninjau pratinjau dokumen final, memberikan disposisi, dan melihat ringkasan statistik persuratan. |
| **Admin Tata Naskah & IT** | Mengelola master template TND, matriks aturan SOTK, sinkronisasi data pegawai (NIP/gelar), konfigurasi prompt sistem AI, dan audit log. |

---

## 3. Apa yang Dihasilkan

### 3.1 Output Utama Sistem
- **Draf Naskah Dinas Terstruktur:** Teks surat resmi (Nota Dinas, Surat Undangan, Surat Tugas, Surat Permohonan, Surat Keluar) yang telah tersusun rapi sesuai kaidah EYD V dan gaya bahasa birokrasi pemerintahan.
- **Metadata & Klasifikasi Surat Otomatis:** Penentuan otomatis jenis naskah, sifat surat (Biasa/Penting/Segera), kode klasifikasi arsip, perihal yang ringkas, serta pihak tujuan dan pengirim.
- **Peta Jalur Paraf Berjenjang (SOTK Routing):** Daftar urutan pejabat pemaraf dari tingkat unit pengusul hingga penandatangan akhir beserta status validasi jabatan.
- **Laporan Validasi Bahasa & Entitas:** Penandaan otomatis (*highlight*) atas kata tidak baku, kesalahan ejaan, serta verifikasi kecocokan nama, gelar, dan NIP pejabat dengan database kepegawaian.
- **Dokumen Siap Cetak / Ekspor:** Berkas dokumen terformat presisi (DOCX dan PDF) yang sudah dilengkapi kop surat resmi RSUD, margin baku TND, dan blok tanda tangan siap integrasi Tanda Tangan Elektronik (TTE).

### 3.2 Contoh Simulasi Output (Input Intent ke Draf Resmi)

```text
[INPUT PENGGUNA - BAHASA SEHARI-HARI]
"Tolong buatkan nota dinas permohonan pengadaan 2 unit komputer PC untuk poli anak karena komputer lama sering hang dan menghambat input e-RM."

[EKSTRAKSI METADATA & ROUTING OTOMATIS OLEH AI]
- Jenis Naskah     : Nota Dinas Internal
- Kode Klasifikasi : 027 / Pengadaan Perlengkapan Kantor
- Pengusul         : Kepala Instalasi Rawat Jalan (Poli Anak)
- Tujuan           : Direktur RSUD melalui Wakil Direktur Umum dan Keuangan
- Jalur Paraf      : Ka. Instalasi Rawat Jalan -> Ka. Bidang Pelayanan Medik -> Ka. Bagian Umum -> Wadir Umum & Keuangan

[OUTPUT DRAF NARASI YANG DIHASILKAN]
Yth. Direktur RSUD [Nama Instansi]
melalui Wakil Direktur Umum dan Keuangan
di Tempat

Dengan hormat,
Sehubungan dengan optimalisasi pelayanan rekam medis elektronik (e-RM) pada Poliklinik Anak, bersama ini kami sampaikan bahwa perangkat komputer yang saat ini digunakan mengalami penurunan performa teknis sehingga menghambat kecepatan pelayanan pasien.

Guna menjaga kelancaran operasional pelayanan rawat jalan, kami mengajukan permohonan pengadaan sebanyak 2 (dua) unit perangkat komputer (PC) baru untuk ditempatkan pada Poliklinik Anak.

Demikian permohonan ini kami sampaikan. Atas perhatian dan perkenan Bapak/Ibu, kami ucapkan terima kasih.
```

---

## 4. Fitur Utama

| Nama Fitur | Prioritas | Deskripsi Fungsional |
| :--- | :--- | :--- |
| **Intent-to-Draft Generator** | Versi 1 (MVP) | Kotak input bahasa alami untuk mendeteksi maksud surat, memilih template TND yang sesuai, dan menghasilkan draf awal secara otomatis. |
| **Deterministic TND Layout Engine** | Versi 1 (MVP) | Mesin perender dokumen baku yang mengunci ukuran kertas, margin, jenis huruf, kop surat RS, dan struktur blok tanda tangan sesuai Perbup/Perwali/Pergub. |
| **Smart Rich-Text Editor** | Versi 1 (MVP) | Editor penyuntingan draf interaktif dengan pratinjau langsung (*live preview*) tampilan cetak surat dinas. |
| **EYD V & Birokrasi Grammar Guard** | Versi 1 (MVP) | Pemeriksa ejaan bahasa Indonesia baku otomatis yang menyoroti kata tidak baku, singkatan tidak resmi, dan kalimat ambigu beserta saran perbaikannya. |
| **Validator Gelar, NIP & Jabatan** | Versi 1 (MVP) | Pencocokan otomatis penulisan nama pejabat, gelar akademis, dan NIP terhadap database master kepegawaian (SIMRS/HRIS). |
| **SOTK Paraf Routing Recommender** | Versi 1 (MVP) | Penentuan otomatis urutan pejabat pemaraf berjenjang berdasarkan matriks aturan SOTK rumah sakit dan unit pengusul. |
| **Ekspor PDF & DOCX Standar** | Versi 1 (MVP) | Mengunduh dokumen final siap cetak atau siap unggah ke aplikasi tanda tangan elektronik (e-Office/Srikandi). |
| **Pencarian Preseden Arsip (RAG)** | Fase Lanjutan | Menampilkan contoh surat serupa dari arsip historis rumah sakit sebagai referensi penyusunan konsiderans atau dasar hukum surat. |
| **Penyaring Data Sensitif (UU PDP Guard)** | Fase Lanjutan | Mendeteksi otomatis pencantuman data pribadi pasien (NIK, nama lengkap pasien, diagnosis) pada surat umum dan memberi peringatan masking data. |

### 4.1 Alur Penggunaan dari Awal sampai Akhir
1. **Autentikasi Pengguna:** Pegawai masuk menggunakan akun internal rumah sakit (SSO/NIP), sistem otomatis mengenali unit kerja dan jabatan pembuat surat.
2. **Input Maksud Surat:** Pegawai memilih kategori umum (opsional) atau langsung mengetikkan maksud surat dalam bahasa sehari-hari pada kolom *Smart Prompt*.
3. **Pemrosesan AI & Ekstraksi:** Mesin AI mengklasifikasikan jenis naskah dinas, mengekstrak parameter kunci (tujuan, waktu, objek, alasan), dan menyusun draf narasi.
4. **Penyuntingan & Validasi Otomatis:** Draf tampil di layar editor berdampingan dengan panel hasil pemeriksaan EYD V, validasi gelar/NIP, dan susunan jalur paraf SOTK.
5. **Finalisasi & Ekspor/Kirim:** Setelah pengguna menyetujui hasil perbaikan, sistem mengunci tata letak TND dan menghasilkan berkas PDF/DOCX siap ajukan paraf/TTE.

---

## 5. Data dan Sumber Data

Kualitas keluaran SITNDE bergantung pada akurasi data referensi internal rumah sakit agar model AI tidak menghasilkan informasi fiktif (halusinasi).

| Kelompok Data | Sumber Data | Elemen Data & Kegunaan dalam Sistem |
| :--- | :--- | :--- |
| **Master Peraturan TND Daerah** | Perbup / Perwali / Pergub tentang Tata Naskah Dinas | Format kop surat, ukuran margin, jenis & ukuran font, format penomoran, dan struktur baku tiap jenis naskah. |
| **Master Pegawai & Pejabat** | Database Kepegawaian / SIMRS (HRIS) | Nama lengkap, gelar depan/belakang, NIP, pangkat/golongan, jabatan aktif, dan status Plt./Plh. untuk validasi identitas. |
| **Matriks SOTK Rumah Sakit** | Peraturan Direktur tentang SOTK & Tata Kerja | Relasi hierarki atasan-bawahan (Instalasi, Komite, Subbagian, Bidang, Bagian, Wadir, Direktur) dalam bentuk aturan JSON/Graf. |
| **Kode Klasifikasi Arsip** | Peraturan Arsip Nasional / Daerah | Daftar kode klasifikasi surat (misal: 000 Umum, 440 Kesehatan, 027 Pengadaan) untuk penomoran otomatis. |
| **Korpus Contoh Surat Dinas** | Arsip Surat Keluar Sekretariat RS (Anonim) | Ratusan contoh surat resmi berbagai jenis yang telah dibersihkan untuk pelatihan/adaptasi gaya bahasa birokrasi (*fine-tuning*). |
| **Kamus Baku & Istilah Medis** | KBBI / EYD V & Glosarium Rumah Sakit | Daftar kosakata baku bahasa Indonesia dan singkatan medis/manajemen RS yang sah (seperti IGD, ICU, PACS, BLUD, e-RM). |

### 5.1 Prapemrosesan & Pembersihan Data (Data Sanitization)
- **Anonimisasi Data Sensitif (PII Removal):** Sebelum arsip surat historis digunakan sebagai referensi atau bahan penyesuaian model AI, seluruh identitas pasien (nama, nomor rekam medis, alamat) serta rincian angka kontrak rahasia wajib dihapus/disamarkan secara otomatis.
- **Standardisasi Master Template:** Seluruh file template Word (`.docx`) eksisting dari Bagian Tata Usaha diaudit ulang dan dikonversi menjadi template terstruktur dengan variabel penanda (*placeholder tags*) yang seragam.

---

## 6. Model dan Teknologi AI

Untuk menjamin kerahasiaan dokumen instansi pemerintah dan mematuhi kebijakan keamanan informasi SPBE, arsitektur AI SITNDE dirancang menggunakan pendekatan **Hybrid Local AI + Deterministic Engine**.

| Komponen Teknologi | Pilihan Teknologi / Model | Peran & Alasan Pemilihan |
| :--- | :--- | :--- |
| **Core Language Model (LLM)** | Open-Source LLM Lokal (Llama-3-8B / Gemma-2-9B / Qwen-2.5-7B Instruct) | Berjalan 100% di server lokal rumah sakit. Ukuran 7B–9B parameter sangat efisien dijalankan pada GPU kelas menengah dengan akurasi tinggi dalam bahasa Indonesia. |
| **Inference Server** | Ollama / vLLM dengan Structured Output (JSON Schema) | Menyediakan API lokal berlatensi rendah dan memaksa model AI mengeluarkan hasil ekstraksi entitas dalam format JSON yang terstruktur. |
| **Grammar & Entity Validator** | IndoBERT NER + Rule-Based Dictionary Matcher | Mendeteksi entitas nama orang, jabatan, tanggal, dan mencocokkan ejaan kata terhadap kamus EYD V serta glosarium medis secara deterministik. |
| **Template Layout Engine** | Python (docxtpl / Jinja2) + LibreOffice Headless / WeasyPrint | Mengisi draf teks hasil AI ke dalam master template TND resmi dan mengonversinya menjadi PDF/DOCX dengan presisi tata letak 100%. |
| **Backend API** | Python (FastAPI) atau PHP (Laravel) | Menangani orkestrasi antara antarmuka pengguna, validasi database kepegawaian, aturan matriks SOTK, dan pemanggilan layanan AI lokal. |
| **Frontend Web App** | React / Next.js atau Vue.js dengan Rich-Text Editor (TipTap) | Memberikan pengalaman pengetikan prompt yang responsif dan tampilan editor surat berdampingan dengan panel validasi. |

---

## 7. Desain dan Pengalaman Pengguna

### 7.1 Prinsip Desain Antarmuka
- **Sederhana & Familiar (Zero Learning Curve):** Pegawai tidak perlu mempelajari perintah teknis rumit; tampilan utama menyerupai gabungan kotak pesan singkat dan lembar kerja pengolah kata yang sudah akrab digunakan sehari-hari.
- **Transparansi Keputusan AI:** Sistem selalu menampilkan alasan pemilihan template dan rincian pejabat yang masuk dalam jalur paraf sehingga pengguna dapat memverifikasi logikanya.
- **Split-Screen Workspace:** Layar kerja dibagi secara proporsional antara panel kendali/validasi di sisi kiri dan pratinjau fisik surat dinas di sisi kanan agar perubahan langsung terlihat nyata.
- **Formal & Berwibawa:** Menggunakan palet warna korporat pemerintahan/kesehatan (biru tua, biru cerah, putih bersih, dan abu-abu netral) yang nyaman dibaca dalam waktu lama.

### 7.2 Struktur Halaman & Komponen Utama

| Halaman / Komponen | Fungsi & Elemen Antarmuka |
| :--- | :--- |
| **1. Beranda & Quick Prompt** | Kotak input utama ("Ketik maksud surat Anda di sini..."), tombol pilihan cepat jenis surat populer (Nota Dinas, Undangan, Surat Tugas), serta daftar draf terakhir. |
| **2. Workspace Editor Surat** | Terdiri dari 3 bagian: (a) Form parameter metadata di kiri, (b) Kanvas pratinjau surat ber-kop resmi di tengah, dan (c) Panel Asisten Pemeriksa (EYD V, NIP, Jalur Paraf) di kanan. |
| **3. Riwayat & Arsip Draf** | Daftar seluruh surat yang pernah dibuat oleh pengguna/unit beserta fitur duplikasi draf untuk kebutuhan berulang. |
| **4. Panel Admin TND & SOTK** | Halaman khusus Tata Usaha & IT untuk memperbarui master template dokumen, mengedit matriks hierarki jabatan SOTK, dan memantau log sistem. |

---

## 8. Alur Operasional dan Logika Prioritisasi

### 8.1 Alur Pemrosesan Intent-to-Draft (Backend Pipeline)
1. **Penerimaan Input & Konteks Pengguna:** Sistem menangkap teks instruksi pengguna beserta profil pengirim (NIP, Jabatan, Unit Kerja dari sesi login).
2. **Klasifikasi Intent & Ekstraksi Slot (LLM):** Model AI menganalisis teks dan mengekstrak jenis surat, perihal, penerima tujuan, poin isi, tanggal/tempat (jika undangan/tugas), serta tingkat urgensi.
3. **Resolusi Aturan SOTK (Rule Engine):** Berdasarkan unit kerja pengirim dan tujuan surat, mesin aturan menelusuri graf SOTK untuk menyusun urutan pejabat pemaraf dari bawah ke atas.
4. **Pembangunan Narasi Formal (LLM Generation):** Model AI menyusun paragraf pembuka, isi pokok, dan penutup dengan menyuntikkan parameter yang telah tervalidasi.
5. **Pengecekan Integritas & EYD V (Validator):** Teks hasil generasi dipindai untuk mendeteksi kata tidak baku, kesalahan penulisan gelar/NIP, dan kelengkapan elemen wajib surat.
6. **Rendering Pratinjau TND:** Hasil akhir dipetakan ke dalam template HTML/DOCX sesuai aturan TND daerah untuk ditampilkan kepada pengguna.

### 8.2 Logika Prioritisasi & Penanganan Ketidakpastian

| Kondisi / Skenario | Logika Penanganan Sistem |
| :--- | :--- |
| **Input Terlalu Singkat / Ambigu** | Jika pengguna hanya mengetik "Buat surat rapat", AI tidak menebak tanggal/tempat secara fiktif, melainkan menyisipkan penanda jelas `[Isi Hari/Tanggal]` dan menampilkan peringatan pengisian. |
| **Konflik Jalur Fungsional vs Struktural** | Jika pengusul berasal dari Instalasi/Komite, sistem memprioritaskan verifikasi Kepala Bidang/Bagian pembina teknis sebelum diteruskan ke Wakil Direktur terkait sesuai matriks SOTK. |
| **Pejabat Definitif Berhalangan / Plt.** | Sistem membaca status aktif di database kepegawaian; jika pejabat definitif berstatus cuti/kosong, otomatis menyematkan awalan `Plt.` atau `Plh.` sesuai data SK. |
| **Istilah Medis vs Kata Tidak Baku** | Kamus pengecualian (*whitelist*) istilah medis dan singkatan baku RS diprioritaskan agar istilah klinis tidak dianggap sebagai kesalahan ketik oleh pemeriksa EYD V. |

---

## 9. Infrastruktur dan Development

Seluruh infrastruktur SITNDE dirancang untuk berjalan di dalam jaringan intranet / pusat data lokal rumah sakit (*On-Premise Data Center*) guna menjamin kecepatan akses dan keamanan data.

| Komponen Infrastruktur | Spesifikasi & Kebutuhan Teknis |
| :--- | :--- |
| **Server Aplikasi & Web** | Linux Server (Ubuntu 22.04/24.04 LTS), 8 vCPU, RAM 16 GB, SSD 250 GB (terintegrasi dengan jaringan intranet RSUD). |
| **Server Inferensi AI (GPU Node)** | Dedicated Local GPU Server (minimal 1x NVIDIA RTX 4090 24GB VRAM atau NVIDIA L4 / A4000) untuk menjalankan LLM lokal dengan waktu respons < 3 detik per draf. |
| **Database Relasional** | PostgreSQL 16 untuk menyimpan data pengguna, riwayat draf surat, master matriks SOTK, kode klasifikasi arsip, dan log audit. |
| **Penyimpanan Berkas (Storage)** | Local Object Storage (MinIO) atau direktori penyimpanan terenkripsi untuk master template TND (`.docx`) dan hasil ekspor dokumen. |
| **Integrasi API Internal** | REST API internal untuk sinkronisasi satu arah (*read-only*) dengan database kepegawaian (SIMRS/HRIS) dan sistem e-Office/TTE bila tersedia. |

### 9.1 Entitas Database Awal
- `users` & `roles` — Menyimpan identitas pegawai, NIP, unit kerja, jabatan aktif, dan hak akses sistem.
- `sotk_units` & `sotk_routing_rules` — Menyimpan struktur organisasi dan aturan urutan paraf berjenjang antar-unit.
- `tnd_templates` — Menyimpan master file template surat dinas, parameter variabel, dan metadata aturan tata letak.
- `archive_classifications` — Menyimpan daftar kode klasifikasi arsip pemerintahan untuk penomoran surat.
- `letter_drafts` — Menyimpan input prompt asli, payload JSON hasil ekstraksi AI, teks draf versi terkini, dan status validasi.
- `validation_logs` & `audit_logs` — Mencatat riwayat pemeriksaan EYD V, koreksi NIP/gelar, serta jejak aktivitas pembuatan dan ekspor dokumen.

---

## 10. Pengembangan Aplikasi

Pengembangan dilakukan secara iteratif dengan pendekatan *agile* agar tim rumah sakit dapat segera merasakan manfaat pada versi awal sebelum masuk ke integrasi tingkat lanjut.

### 10.1 Pembagian Fase Pengembangan
- **Fase 1 — Minimum Viable Product (MVP):** Fokus pada 5 jenis surat paling sering digunakan (Nota Dinas, Surat Undangan, Surat Tugas, Surat Permohonan Pengadaan, Surat Edaran Internal), ekstraksi intent AI lokal, template engine TND baku, dan validasi EYD V dasar.
- **Fase 2 — Integrasi Kepegawaian & SOTK Dinamis:** Sinkronisasi otomatis database pegawai (NIP, gelar, status Plt./Plh.), otomatisasi rekomendasi jalur paraf berjenjang berbasis matriks SOTK, dan ekspor langsung ke format siap TTE.
- **Fase 3 — Kecerdasan Arsip & Guardrail UU PDP:** Penambahan fitur pencarian preseden surat lama berbasis RAG (*Retrieval-Augmented Generation*) dan pemindai otomatis kebocoran data medis pasien.

### 10.2 Linimasa Pengembangan MVP (8 Minggu)

| Periode | Tahapan Kerja | Output & Deliverable Utama |
| :--- | :--- | :--- |
| **Minggu 1 – 2** | Analisis TND, Pemetaan SOTK & Setup Server AI | Dokumen aturan matriks SOTK, 5 master template TND terstandardisasi, dan instalasi server LLM lokal (Ollama/vLLM). |
| **Minggu 3 – 4** | Pengembangan Backend, Prompt Engine & Template Renderer | API ekstraksi JSON intent, mesin penyusun narasi birokrasi, dan konverter dokumen presisi TND (DOCX/PDF). |
| **Minggu 5 – 6** | Pengembangan Antarmuka Editor & Modul Validator | Halaman Quick Prompt, Workspace Split-Screen Editor, pemeriksa ejaan EYD V, dan validasi NIP/gelar. |
| **Minggu 7 – 8** | Pengujian Terpadu (UAT), Perbaikan & Pilot Project | Laporan hasil uji akurasi bersama Bagian Tata Usaha, perbaikan bug, panduan pengguna, dan uji coba di 2 unit percontohan. |

---

## 11. Pengujian

Sebelum digunakan secara luas di lingkungan rumah sakit, sistem wajib melalui serangkaian pengujian ketat untuk menjamin keandalan teknis dan kepatuhan regulasi.

| Jenis Pengujian | Fokus & Skenario Pengujian |
| :--- | :--- |
| **1. Pengujian Fungsional** | Memastikan alur dari pengetikan prompt, pembuatan draf, penyuntingan teks di editor, hingga pengunduhan file PDF/DOCX berjalan tanpa galat. |
| **2. Pengujian Akurasi AI & TND** | Menguji minimal 50 skenario kasus surat rumah sakit untuk memverifikasi ketepatan pemilihan template, kesesuaian bahasa EYD V, dan nol halusinasi pada kop/margin. |
| **3. Pengujian Logika SOTK** | Memvalidasi ketepatan urutan jalur paraf untuk berbagai kombinasi unit pengusul (Instalasi Medis, Penunjang, Komite, dan Bagian Sekretariat). |
| **4. Pengujian Kegunaan (UAT)** | Melibatkan staf administrasi dan kepala ruangan non-teknis untuk mengukur kemudahan penggunaan dan kecepatan pembuatan surat dibanding cara manual. |
| **5. Pengujian Performa & Beban** | Mengukur waktu respons inferensi AI saat diakses bersamaan oleh puluhan unit kerja pada jam sibuk operasional pagi hari. |
| **6. Pengujian Keamanan** | Memverifikasi isolasi akses antar-unit, pencatatan audit log, dan memastikan tidak ada lalu lintas data keluar ke jaringan internet publik. |

### 11.1 Kriteria Penerimaan MVP (Acceptance Criteria)
- Akurasi pemilihan jenis template surat mencapai minimal 95% pada skenario uji standar rumah sakit.
- Format hasil ekspor PDF dan DOCX 100% sesuai spesifikasi ukuran kertas, margin, dan kop surat Peraturan TND Daerah.
- Waktu pembuatan draf dari klik tombol hingga tampil di editor tidak melebihi 5 detik pada kondisi jaringan normal.
- Sistem berhasil mendeteksi dan menandai 100% kesalahan penulisan gelar/NIP yang tidak cocok dengan data master pegawai.

---

## 12. Keamanan dan Privasi

Surat dinas rumah sakit pemerintah sering memuat informasi strategis pengadaan barang/jasa, mutasi pegawai, hingga koordinasi pelayanan pasien yang dilindungi oleh regulasi negara.

| Aspek Keamanan | Kebijakan & Mekanisme Perlindungan |
| :--- | :--- |
| **Kedaulatan Data (Air-Gapped AI)** | Model AI dijalankan sepenuhnya pada server lokal (*on-premise*). Tidak ada satupun teks prompt atau isi surat yang dikirim ke API AI komersial pihak ketiga. |
| **Kepatuhan UU PDP** | Menerapkan filter deteksi entitas untuk mencegah pencantuman data pribadi sensitif pasien (nama, NIK, diagnosis) pada surat administrasi umum tanpa otorisasi. |
| **Isolasi Data Antar-Unit** | Draf surat yang sedang disusun hanya dapat diakses oleh pembuat draf dan pejabat verifikator pada jalur hierarki unit terkait. |
| **Jejak Audit (Audit Trail)** | Setiap aktivitas pembuatan draf, perubahan teks oleh pengguna, dan pengunduhan dokumen tercatat lengkap dengan stempel waktu dan identitas akun. |
| **Kebijakan Retensi & Pelatihan** | Input harian pegawai tidak otomatis digunakan untuk melatih ulang model tanpa melalui proses kurasi dan anonimisasi oleh tim admin yang berwenang. |

---

## 13. Persiapan Deployment

### 13.1 Pembagian Lingkungan Sistem (Environment)
- **Development:** Lingkungan kerja tim pengembang untuk perakitan fitur, pengujian prompt sistem, dan penyesuaian template.
- **Staging / UAT:** Replika lingkungan produksi yang terhubung dengan salinan data master pegawai dan matriks SOTK untuk uji coba Bagian Tata Usaha.
- **Production:** Server operasional utama di pusat data RSUD yang siap diakses seluruh unit kerja melalui jaringan intranet rumah sakit.

### 13.2 Daftar Periksa Kesiapan Produksi (Deployment Checklist)
- Server GPU lokal dan layanan inferensi model AI berjalan stabil dengan konfigurasi mulai ulang otomatis (*auto-restart service*).
- Master template TND telah ditandatangani/disahkan kesesuaian formatnya oleh Kepala Bagian Tata Usaha / Sekretariat.
- Matriks aturan jalur paraf SOTK terbaru telah dimuat dan diverifikasi sesuai struktur organisasi aktif.
- Sertifikat keamanan SSL/TLS internal terpasang untuk enkripsi komunikasi antara peramban pengguna dan server aplikasi.
- Jadwal pencadangan (*backup*) otomatis harian untuk database PostgreSQL dan penyimpanan template aktif berjalan.

---

## 14. Domain dan Branding

### 14.1 Identitas Produk
- **Nama Utama:** SITNDE (*Smart Intent-to-Draft & TND Engine*)
- **Nama Alternatif Lokal:** Asisten Tata Naskah Dinas Cerdas RSUD
- **Alamat Domain Internal:** `https://sitnde.rsud-[namadaerah].go.id` atau sub-modul pada portal e-Office RSUD.
- **Tagline Produk:** *"Sampaikan Maksudnya, Rapi Naskahnya, Tepat Jalurnya."*

### 14.2 Arah Visual & Pedoman Antarmuka

| Elemen Visual | Spesifikasi Desain |
| :--- | :--- |
| **Karakter Visual** | Bersih, formal, terpercaya, dan fokus pada keterbacaan teks dokumen (*document-centric*). |
| **Palet Warna Utama** | Biru Tua Pemerintahan (`#0F294A`) sebagai warna struktur utama, dipadukan dengan Biru Cerah (`#0284C7`) untuk tombol aksi cerdas AI. |
| **Warna Indikator Status** | Hijau (`#16A34A`) untuk validasi NIP/EYD lolos, Kuning/Oranye (`#D97706`) untuk saran perbaikan bahasa, dan Merah (`#DC2626`) untuk data wajib yang belum lengkap. |
| **Tipografi Antarmuka** | Sans-serif modern (Inter / Segoe UI) untuk menu dan kontrol aplikasi; sedangkan area kanvas surat mengikuti font resmi regulasi TND (seperti Arial atau Bookman Old Style). |

---

## 15. Publish dan Launch

| Tahap | Nama Tahapan | Aktivitas & Sasaran Pelaksanaan |
| :--- | :--- | :--- |
| **Tahap 1** | Verifikasi Internal & TU | Uji coba terbatas oleh tim IT dan staf Bagian Tata Usaha untuk memastikan tidak ada cacat format pada seluruh jenis surat. |
| **Tahap 2** | Pilot Project (2 Unit Kerja) | Penerapan nyata selama 2 minggu pada 1 unit pelayanan (misal: Instalasi Rawat Jalan) dan 1 unit penunjang/administrasi (Bagian Umum/Pengadaan). |
| **Tahap 3** | Evaluasi & Penyempurnaan | Pengumpulan umpan balik pengguna pilot terkait kemudahan prompt, akurasi kalimat AI, dan kelancaran alur paraf berjenjang. |
| **Tahap 4** | Peluncuran Resmi (Rollout) | Sosialisasi melalui surat edaran Direktur, penyediaan video panduan singkat (durasi 3 menit), dan pembukaan akses bagi seluruh instalasi dan bidang RSUD. |

### 15.1 Checklist Sebelum Peluncuran Resmi
- Seluruh masukan kritis dari fase *Pilot Project* telah diselesaikan dan diuji ulang.
- Buku saku panduan ringkas (1 halaman infografis cara pakai) tersedia di halaman login aplikasi.
- Saluran bantuan teknis (*helpdesk* internal IT & admin Tata Usaha) siap merespons kendala pengguna pada minggu pertama peluncuran.

---

## 16. Monitoring dan Iterasi

Setelah sistem beroperasi penuh, tim pengelola memantau kinerja aplikasi dan kualitas keluaran AI secara berkala untuk peningkatan berkelanjutan.

| Kategori Monitoring | Metrik Utama (KPI) | Indikator Keberhasilan & Tindak Lanjut |
| :--- | :--- | :--- |
| **Tingkat Adopsi Pengguna** | Jumlah draf surat dibuat per minggu & rasio unit aktif | Minimal 75% nota dinas dan surat rutin unit dibuat menggunakan SITNDE dalam 3 bulan pertama. |
| **Efisiensi Waktu** | Rata-rata waktu dari input prompt hingga ekspor dokumen | Waktu penyusunan draf surat berkurang dari rata-rata 25–30 menit menjadi di bawah 5 menit. |
| **Kualitas & Akurasi AI** | Persentase teks draf AI yang dipertahankan tanpa ubahan besar | Jika pengguna sering menyunting bagian pembuka/penutup jenis surat tertentu, tim melakukan pembaruan instruksi prompt template tersebut. |
| **Penurunan Revisi Tata Usaha** | Jumlah surat dikembalikan karena salah format TND / salah paraf | Penurunan angka pengembalian surat dari Sekretariat/TU akibat kesalahan format dan jalur paraf hingga di bawah 5%. |
| **Performa Teknis** | Waktu respons inferensi LLM & tingkat ketersediaan server | Waktu generasi draf < 4 detik dan uptime server > 99,5% pada jam kerja pelayanan. |

### 16.1 Peta Jalan Iterasi Lanjutan (Roadmap)
- **Iterasi 1 (Bulan 3–4):** Penambahan dukungan jenis naskah dinas khusus rumah sakit (Surat Keterangan Medis Administratif, Telaahan Staf, Perjanjian Kerja Sama/PKS).
- **Iterasi 2 (Bulan 5–6):** Integrasi dua arah penuh dengan aplikasi e-Office/TTE daerah agar draf yang selesai di SITNDE langsung masuk ke antrean paraf elektronik tanpa perlu mengunduh file manual.
- **Iterasi 3 (Bulan 7+):** Implementasi asisten tanya-jawab regulasi internal dan pencarian preseden surat historis berbasis RAG untuk mempercepat penyusunan telaahan staf.

---

## Lampiran A. Functional Requirements

| ID | Kebutuhan Fungsional (Functional Requirement) | Prioritas |
| :--- | :--- | :--- |
| **FR-01** | Sistem menyediakan autentikasi pengguna berbasis akun pegawai/NIP dan mengenali unit kerja serta jabatan secara otomatis. | Must Have |
| **FR-02** | Sistem menyediakan antarmuka input teks bebas (*Natural Language Prompt*) untuk menangkap maksud pembuatan surat. | Must Have |
| **FR-03** | AI secara otomatis mengklasifikasikan jenis naskah dinas dan memilih master template TND yang sesuai. | Must Have |
| **FR-04** | AI mengekstrak entitas kunci (tujuan, perihal, waktu, tempat, dasar surat) dan menyusun paragraf formal sesuai kaidah EYD V. | Must Have |
| **FR-05** | Sistem memetakan dan menampilkan urutan pejabat pemaraf berjenjang berdasarkan aturan matriks SOTK rumah sakit. | Must Have |
| **FR-06** | Sistem menyediakan editor teks interaktif dengan pratinjau langsung dokumen ber-kop surat resmi. | Must Have |
| **FR-07** | Sistem melakukan pemeriksaan ejaan baku EYD V dan menandai kata tidak baku beserta rekomendasi perbaikannya. | Must Have |
| **FR-08** | Sistem memvalidasi penulisan nama pejabat, gelar akademis, dan NIP terhadap data master kepegawaian. | Should Have |
| **FR-09** | Sistem dapat mengekspor dokumen final ke format PDF dan DOCX dengan tata letak terkunci sesuai aturan TND daerah. | Must Have |
| **FR-10** | Admin dapat mengelola master template TND, matriks aturan SOTK, dan melihat log audit aktivitas pengguna. | Should Have |

---

## Lampiran B. Non-Functional Requirements

| ID | Kategori | Spesifikasi Kebutuhan Non-Fungsional |
| :--- | :--- | :--- |
| **NFR-01** | Privasi & Kedaulatan Data | Seluruh pemrosesan AI wajib berjalan pada server lokal (*on-premise*) tanpa mengirim data ke layanan cloud pihak ketiga. |
| **NFR-02** | Performa Inferensi | Waktu generasi draf surat dari pengiriman prompt hingga tampil di editor maksimal 5 detik pada beban kerja normal. |
| **NFR-03** | Kepatuhan Format | Hasil ekspor dokumen wajib mempertahankan margin, jenis font, dan struktur kop surat secara deterministik tanpa pergeseran. |
| **NFR-04** | Kemudahan Pakai | Antarmuka dapat dioperasikan oleh staf administrasi dan tenaga kesehatan dengan pelatihan singkat kurang dari 15 menit. |
| **NFR-05** | Keamanan Akses | Penerapan kontrol akses berbasis peran (RBAC) dan isolasi draf surat antar-unit kerja yang tidak berkepentingan. |
| **NFR-06** | Auditabilitas | Setiap pembuatan, penyuntingan, dan pengunduhan dokumen tercatat dalam log audit yang tidak dapat diubah pengguna biasa. |

---

## Lampiran C. Data Model Awal

| Nama Tabel | Kolom / Field Utama |
| :--- | :--- |
| `users` | `id, nip, full_name, front_title, back_title, position_name, unit_id, role_id, is_plt, status` |
| `sotk_units` | `id, unit_code, unit_name, unit_type (struktural/fungsional), parent_unit_id, head_user_id` |
| `sotk_routing_rules` | `id, origin_unit_id, letter_category, approval_sequence_json, final_signer_role` |
| `tnd_templates` | `id, template_code, letter_type, classification_code, docx_file_path, required_fields_json, is_active` |
| `letter_drafts` | `id, user_id, unit_id, raw_prompt, extracted_json, template_id, generated_body, final_html, status, created_at` |
| `validation_issues` | `id, draft_id, issue_type (eyd/nip/sotk), original_text, suggested_text, is_resolved` |
| `audit_logs` | `id, user_id, action_type, draft_id, ip_address, details_json, timestamp` |

---

## Lampiran D. Template Laporan Evaluasi & Management Brief

| Bagian Laporan Bulanan | Ringkasan Informasi untuk Pimpinan RSUD |
| :--- | :--- |
| **1. Ringkasan Adopsi** | Total naskah dinas yang dibuat melalui SITNDE, persentase penggunaan per instalasi/bidang, dan tren pertumbuhan bulanan. |
| **2. Efisiensi Operasional** | Estimasi penghematan jam kerja administrasi dan rata-rata waktu penyelesaian draf surat per jenis naskah. |
| **3. Kualitas & Kepatuhan TND** | Jumlah kesalahan EYD V dan kesalahan gelar/NIP yang berhasil dicegah sebelum surat naik ke meja pimpinan. |
| **4. Evaluasi Jalur Paraf SOTK** | Tingkat akurasi rute paraf otomatis dan daftar unit yang memerlukan pembaruan aturan hierarki akibat mutasi jabatan. |
| **5. Rekomendasi Tindak Lanjut** | Usulan penambahan template surat baru, pembaruan kamus istilah medis/manajemen, dan langkah integrasi e-Office berikutnya. |

---

## Lampiran E. System Prompt & Instruksi Pengembangan Aplikasi

```text
[SYSTEM PROMPT UNTUK LLM LOKAL SITNDE]
Anda adalah Asisten Tata Naskah Dinas Cerdas (SITNDE) pada Rumah Sakit Umum Daerah (RSUD). Tugas Anda adalah mengubah instruksi bahasa sehari-hari dari pegawai menjadi struktur data JSON dan draf narasi surat dinas resmi yang patuh pada kaidah EYD V serta bahasa birokrasi pemerintahan yang lugas, sopan, dan baku.

Aturan Ketat:
1. Identifikasi jenis naskah dinas yang paling tepat (Nota Dinas, Surat Undangan, Surat Tugas, Surat Permohonan, atau Surat Keluar).
2. Ekstrak parameter tujuan, perihal, alasan/latar belakang, serta rincian kebutuhan secara akurat dari input pengguna.
3. JANGAN PERNAH mengarang nomor surat, tanggal kegiatan, nama pejabat, NIP, atau nominal anggaran jika tidak disebutkan dalam input pengguna; gunakan penanda [Lengkapi Data] untuk informasi yang belum tersedia.
4. Gunakan kalimat efektif, hindari kata tidak baku, dan pertahankan istilah medis atau singkatan resmi rumah sakit yang relevan.

[PROMPT PEMBANGUNAN ANTARMUKA APLIKASI (UI BUILDER)]
Bangun aplikasi web internal bernama SITNDE (Smart Intent-to-Draft & TND Engine) untuk Rumah Sakit Pemerintah dengan desain formal, bersih, menggunakan warna utama biru tua (#0F294A) dan aksen biru cerah (#0284C7).
Sediakan bilah navigasi kiri berisi menu: Buat Surat Baru (Quick Prompt), Draf & Riwayat, Panduan TND, dan Pengaturan SOTK.
Pada halaman utama, tampilkan kotak input bahasa alami yang besar untuk mengetikkan maksud surat beserta tombol pilihan cepat jenis surat. Saat draf dihasilkan, tampilkan tampilan kerja tiga kolom: kolom kiri untuk metadata & urutan paraf berjenjang SOTK, kolom tengah berupa pratinjau kertas surat ber-kop resmi RSUD yang dapat disunting langsung, dan kolom kanan berisi panel pemeriksa otomatis EYD V serta validasi NIP/gelar pejabat beserta tombol ekspor ke PDF dan DOCX.
```

---

> **Catatan Penutup Implementasi:**  
> Dokumen PRD ini merupakan spesifikasi dasar pembangunan **SITNDE (Smart Intent-to-Draft & TND Engine)**. Sebelum memulai tahap pengkodean (*development*), tim pengembang bersama Bagian Tata Usaha dan Bagian Umum perlu memfinalisasi tiga prasyarat utama: (1) pembakuan matriks rute paraf SOTK dalam format tabel aturan, (2) pengumpulan master template TND daerah terbaru, serta (3) penyediaan akses baca (*read-only*) ke database master kepegawaian RSUD.