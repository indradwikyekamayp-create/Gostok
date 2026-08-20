# GoStok POS - Dokumentasi Arsitektur Project

Proyek ini dibangun menggunakan **React (Vite)** di sisi Frontend dan **Firebase (Firestore & Auth)** di sisi Backend. 
Struktur folder dan database telah didesain dengan konsep **Modular Component** agar mudah di-maintain dan dikembangkan di kemudian hari oleh developer mana pun.

---

## ?? Struktur Folder (\src/\)

Kode aplikasi sepenuhnya berada di dalam folder \src/\. Pembagian foldernya sangat spesifik berdasarkan fungsinya:

- **\ssets/\** : Menyimpan file statis seperti gambar, logo (contoh: \AyoStock!.png\), dan icon.
- **\components/\** : Berisi komponen UI yang bisa dipakai berulang-ulang di berbagai halaman.
  - \common/\ : Komponen generik seperti \Card\, \Table\, \Button\.
  - \layout/\ : Kerangka utama aplikasi seperti \Sidebar\, \Header\, dan \MainLayout\.
- **\constants/\** : Variabel statis yang nilainya tetap (contoh: \oles.js\ untuk mendefinisikan Owner, Admin, Kasir).
- **\context/\** : State management global menggunakan React Context (contoh: \AuthContext.jsx\ untuk manajemen login & sesi, \ToastContext.jsx\ untuk notifikasi).
- **\hooks/\** : Custom React Hooks untuk mempermudah logika komponen (contoh: \useAuth.js\).
- **\pages/\** : Halaman utama aplikasi, **dipisah per-modul/fitur** agar tidak bercampur:
  - \uth/\ : Halaman Login.
  - \dashboard/\ : Halaman awal/statistik (OwnerDashboard & komponen turunannya).
  - \master-produk/\ : Halaman kelola katalog barang.
  - \pelanggan/\ : Halaman kelola data pelanggan & piutang.
  - \	ransaksi-jual/\ : Halaman Point of Sales / Kasir.
  - \arang-masuk/\ : Halaman input stok (Scan/Manual).
  - \iwayat/\ : Halaman riwayat transaksi.
  - \laporan/\ : Halaman laporan omzet, laba rugi, stok, piutang.
  - \karyawan/\ : Halaman manajemen akun staf/karyawan.
- **\styles/\** : File CSS global dan variabel warna (CSS Modules digunakan di dalam masing-masing komponen).
- **\irebase.js\** : Konfigurasi koneksi ke server Firebase.

---

## ??? Struktur Database (Firestore NoSQL)

Database menggunakan pendekatan **Denormalisasi NoSQL** khas Firebase. Artinya, data dirancang agar proses membacanya (*query*) sangat cepat tanpa perlu melakukan *JOIN* yang rumit antar tabel.

Koleksi (*Collections*) yang digunakan:

### 1. \users\ (Karyawan / Pengguna)
Menyimpan profil akun yang bisa login ke aplikasi.
- \uid\ (Document ID): Sesuai dengan ID Firebase Auth.
- \email\: Email login.
- \
ama\: Nama lengkap karyawan.
- \ole\: Jabatan (\owner\, \dmin\, \kasir\).
- \ktif\: Boolean (\	rue\ / \alse\) untuk memblokir akses login jika karyawan dinonaktifkan.

### 2. \products\ (Master Produk)
Menyimpan katalog barang.
- \arcode\ (String): Kode unik barang.
- \
ama_barang\ (String)
- \kategori\ (String): Makanan & Minuman, Kesehatan, dll.
- \harga_modal\ & \harga_jual\ (Number)
- \stok\ (Number): Stok dasar.
- \satuan\ (String): pcs, kg, dll.
- Field Multi-satuan: \has_multi_satuan\, \satuan_besar\, \konversi\.

### 3. \customers\ (Pelanggan)
Menyimpan data pelanggan dan rekap piutang (BON).
- \
ama_perusahaan\ / \
ama_pic\ (String)
- \	otal_hutang_berjalan\ (Number): Nilai ini akan otomatis bertambah saat pelanggan melakukan transaksi BON, dan berkurang saat pelunasan.

### 4. \	ransactions\ (Riwayat Penjualan)
Menyimpan setiap nota transaksi yang terjadi di kasir.
- \	anggal\ (String/Timestamp)
- \kasir\ (String): Nama karyawan yang menginput.
- \metodePembayaran\ (String): Cash / Transfer / BON.
- \statusPembayaran\ (String): Lunas / Belum Lunas.
- \grandTotal\, \	otalModal\, \keuntungan\ (Number): Disimpan langsung di dokumen transaksi agar Laporan Keuntungan dapat dihitung dengan cepat tanpa membaca ulang detail barang.
- \items\ (Array of Objects): Daftar barang yang dibeli (menyalin \harga\ dan \modal\ pada saat transaksi terjadi, sehingga perubahan harga di masa depan tidak merusak laporan lama).

### 5. \stock_ins\ (Riwayat Barang Masuk)
Menyimpan log penambahan stok.
- \	anggal\ (String)
- \	otal_items\ (Number): Berapa jenis barang.
- \items\ (Array of Objects): Detail barang yang ditambahkan stoknya.

---

## ??? Panduan Maintenance

- **Ubah UI/Tampilan**: Buka folder \src/pages/[nama-fitur]\. Setiap halaman memuat file \.jsx\ dan \.module.css\ yang saling terikat secara eksklusif (tidak akan merusak tampilan halaman lain).
- **Ubah Aturan Hak Akses**: Cek \src/constants/roles.js\ dan logika di \src/context/AuthContext.jsx\. Komponen UI disembunyikan menggunakan pengecekan \isOwner\ atau \isAdmin\.
- **Tambah Koleksi Database Baru**: Langsung buat *query* di komponen bersangkutan menggunakan \collection(db, 'nama_koleksi_baru')\. Tidak perlu mengubah *schema* di backend karena Firestore bersifat *schema-less*.
