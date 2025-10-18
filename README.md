# 🏫 Sistem Informasi Akademik - MIS Nurush Sholihin

![React](https://img.shields.io/badge/React-Vite-blue?logo=react)
![Next.js](https://img.shields.io/badge/Backend-Next.js-black?logo=next.js)
![Material-UI](https://img.shields.io/badge/UI-Material--UI-blue?logo=mui)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue?logo=postgresql)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

Sistem Informasi Akademik (SIA) yang dirancang khusus untuk Madrasah Ibtidaiyah Swasta (MIS) Nurush Sholihin. Aplikasi ini bertujuan untuk mendigitalisasi dan menyederhanakan proses administrasi serta kegiatan akademik sekolah, membuatnya lebih efisien dan terpusat.

---

## 📸 Tangkapan Layar

*Ganti gambar di bawah ini dengan tangkapan layar dasbor aplikasi Anda.*

*Dasbor utama SIA MIS Nurush Sholihin*

---

## ✨ Fitur Utama

Berdasarkan fungsionalitas yang telah dirancang, berikut adalah fitur-fitur utama yang tersedia dalam sistem ini:

* 🗂️ **Manajemen Data**
    * Input dan edit data detail untuk **Guru, Staf, dan Siswa**.
    * Penetapan Wali Kelas.
    * Pengelolaan biodata lengkap siswa.

* 📈 **Manajemen Nilai dan E-Rapor**
    * Otomatisasi perhitungan nilai akhir berdasarkan bobot komponen yang diatur.
    * Input nilai harian, tugas, dan ujian oleh Guru.
    * Menghasilkan dokumen **Rapor dalam format PDF** yang siap cetak.

* 🗓️ **Manajemen Absensi**
    * Input absensi harian (hadir, sakit, izin, alfa) oleh Guru.
    * Sistem rekapitulasi absensi otomatis (harian, mingguan, bulanan).
    * Integrasi data absensi untuk ditarik ke dalam E-Rapor.

* 📚 **Manajemen Kurikulum**
    * Pengelolaan data **Kelas** (Rombongan Belajar).
    * Manajemen **Mata Pelajaran** dan penetapan guru pengampu.
    * Pembuatan dan pengelolaan **Jadwal Pelajaran** per kelas.

* 📢 **Manajemen Informasi dan Dokumentasi**
    * Fitur untuk membuat dan mempublikasikan **pengumuman** penting.
    * Pengumuman akan tampil di dasbor utama SIA untuk semua pengguna.

* 👤 **Manajemen User**
    * Pengelolaan akun dan hak akses (role-based access) untuk setiap pengguna sistem (Admin, Guru, Siswa).

---

## 💻 Teknologi yang Digunakan

Arsitektur sistem ini dibangun menggunakan teknologi modern untuk memastikan performa, skalabilitas, dan kemudahan pengembangan.

* **Frontend:**
    * [**React.js**](https://react.dev/) (Library UI)
    * [**Vite**](https://vitejs.dev/) (Build Tool)
    * [**Material-UI (MUI)**](https://mui.com/) (Framework Komponen UI)
    * [**Redux Toolkit**](https://redux-toolkit.js.org/) (State Management)
    * [**Axios**](https://axios-http.com/) (HTTP Client)

* **Backend:**
    * [**Next.js**](https://nextjs.org/) (Digunakan untuk membangun API Routes)
    * [**Prisma**](https://www.prisma.io/) (ORM untuk interaksi dengan database)
    * [**NextAuth.js**](https://next-auth.js.org/) (Untuk otentikasi)

* **Database:**
    * [**PostgreSQL**](https://www.postgresql.org/) (Sistem Database Relasional)

---

## 🚀 Instalasi & Menjalankan Proyek

Ikuti langkah-langkah di bawah ini untuk menjalankan proyek ini di lingkungan lokal Anda.

### **Prasyarat**
* Node.js (v18.x atau lebih tinggi)
* pnpm (atau npm/yarn)
* PostgreSQL server yang sedang berjalan

### **1. Backend (Next.js)**

```bash
# Clone repositori
git clone [https://github.com/irfnnd/siakad-mis-nurussholihin-react.git](https://github.com/irfnnd/siakad-mis-nurussholihin-react.git)
cd sia-nurush-sholihin/backend

# Instal dependencies
pnpm install

# Buat file .env dari contoh .env.example
cp .env.example .env

# Atur variabel lingkungan di dalam file .env, terutama DATABASE_URL
# Contoh: DATABASE_URL="postgresql://user:password@localhost:5432/sia_nurush_sholihin?schema=public"

# Jalankan migrasi database menggunakan Prisma
pnpm prisma migrate dev

# Jalankan server backend
pnpm dev
````

Server backend akan berjalan di `http://localhost:3000`.

### **2. Frontend (React + Vite)**

```bash
# Buka terminal baru dan masuk ke folder frontend
cd ../frontend

# Instal dependencies
pnpm install

# Buat file .env dari contoh .env.example
cp .env.example .env

# Atur variabel lingkungan di dalam file .env
# Contoh: VITE_API_BASE_URL="http://localhost:3000/api"

# Jalankan server development frontend
pnpm dev
```

Aplikasi frontend akan dapat diakses di `http://localhost:5173`.

-----

## 📁 Struktur Folder (Disederhanakan)

```
/
├── backend/          # Proyek Next.js (API)
│   ├── app/api/      # Semua endpoint API
│   ├── prisma/       # Skema dan migrasi database
│   └── ...
├── frontend/         # Proyek React + Vite (UI)
│   ├── src/
│   │   ├── components/ # Komponen UI yang bisa dipakai ulang
│   │   ├── pages/      # Komponen untuk setiap halaman
│   │   ├── store/      # Konfigurasi Redux Toolkit
│   │   ├── App.jsx
│   │   └── main.jsx
└── README.md
```

-----

## 🤝 Kontribusi

Kontribusi sangat kami harapkan\! Silakan *fork* repositori ini, buat *branch* baru untuk fitur Anda (`git checkout -b fitur/nama-fitur-keren`), dan buat *Pull Request*.

-----

## 📜 Lisensi

Proyek ini dilisensikan di bawah **MIT License**. Lihat file `LICENSE` untuk detail lebih lanjut.

```
```