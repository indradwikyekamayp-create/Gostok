# GoStok — Aplikasi POS Distributor

Aplikasi Point of Sale (POS) berbasis web untuk **PT. WELINDO SUKSES BERSAMA**.  
Dibangun dengan React (Vite) + Firebase.

---

## Fitur Utama

| Modul | Deskripsi |
|---|---|
| **Master Produk** | Kelola data produk, barcode, foto, harga modal & jual |
| **Barang Masuk** | Scan barcode untuk input stok masuk ke gudang |
| **Transaksi Jual** | POS kasir: scan, qty, pilih metode bayar, cetak nota |
| **Pelanggan & Piutang** | Data pelanggan, tracking hutang BON, pembayaran cicilan |
| **Riwayat** | Cari & filter seluruh transaksi, cetak ulang nota |
| **Laporan** | Penjualan, stok, piutang, keuntungan (Owner only) |

## Role

- **Owner (Admin)**: Full akses termasuk harga modal, margin, dan laporan
- **Kasir**: Input barang masuk & transaksi jual, tanpa akses harga modal

---

## Tech Stack

- **Frontend**: React 18 + Vite
- **Backend/Database**: Firebase (Firestore + Auth + Storage + Cloud Functions)
- **Styling**: CSS Modules + CSS Custom Properties
- **Charts**: Recharts
- **Icons**: Lucide React
- **Print**: react-to-print + CSS Print Styles
- **Export**: SheetJS (xlsx) + jsPDF

---

## Cara Memulai

### 1. Clone & Install

```bash
git clone <repository-url>
cd GoStok
npm install
```

### 2. Konfigurasi Firebase

1. Buat project di [Firebase Console](https://console.firebase.google.com)
2. Aktifkan: Authentication (Email/Password), Firestore, Storage
3. Salin `.env.example` menjadi `.env`:

```bash
cp .env.example .env
```

4. Isi nilai-nilai Firebase config dari Firebase Console ke file `.env`

### 3. Jalankan Development Server

```bash
npm run dev
```

### 4. Deploy Cloud Functions

```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

### 5. Deploy ke Firebase Hosting

```bash
npm run build
firebase deploy --only hosting
```

---

## Struktur Folder

```
/src
├── /assets          → Logo, gambar statis
├── /components
│   ├── /common      → Komponen reusable (Button, Input, Modal, dll)
│   └── /layout      → Sidebar, Header, MainLayout
├── /config          → Firebase initialization
├── /constants       → Nama koleksi, role, status pembayaran
├── /context         → React Context (Auth, Toast)
├── /hooks           → Custom hooks (useAuth, useBarcodeScan, dll)
├── /pages           → Halaman per modul
├── /services        → Semua akses Firestore/Storage
├── /styles          → Design tokens, reset, typography, print
└── /utils           → Format currency, date, validators

/functions           → Cloud Functions (triggers)
/firestore           → Security Rules & Indexes
```

> **Prinsip Arsitektur**: Halaman (pages) TIDAK boleh mengakses Firestore langsung.  
> Semua operasi database wajib lewat folder `/services`.

---

## Setup Data Awal

Setelah Firebase terhubung, buat user pertama (Owner) secara manual di Firestore:

1. Di Firebase Console → Authentication, buat user email/password
2. Di Firestore, buat dokumen:

```
users/{uid-dari-auth}
{
  nama: "Nama Owner",
  role: "owner",
  aktif: true
}
```

3. Login ke aplikasi dengan email/password tersebut

---

## Lisensi

Private — PT. WELINDO SUKSES BERSAMA
