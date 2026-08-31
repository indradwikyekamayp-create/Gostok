import React, { useState, useEffect, useContext } from 'react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { ToastContext } from '../../context/ToastContext';
import { Settings, Save, Store, AlertTriangle, Printer } from 'lucide-react';
import styles from './SettingsPage.module.css';

const DEFAULT_SETTINGS = {
  namaToko: 'PT. WELINDO SUKSES BERSAMA',
  alamatToko: '',
  teleponToko: '',
  emailToko: '',
  stokMenipisThreshold: 10,
  maxHutangPelanggan: 10000000,
  ukuranKertas: 'A4',
  ukuranFontNota: 'normal',
  ukuranFontAplikasi: 'normal',
  bankNama: '',
  bankRekening: '',
  bankAtasNama: ''
};

export default function SettingsPage() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { showToast } = useContext(ToastContext);

  useEffect(() => {
    const docRef = doc(db, 'settings', 'store_config');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.namaToko === 'AyoStock!') data.namaToko = 'PT. WELINDO SUKSES BERSAMA';
        setSettings({ ...DEFAULT_SETTINGS, ...data });
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const docRef = doc(db, 'settings', 'store_config');
      await setDoc(docRef, {
        ...settings,
        stokMenipisThreshold: Number(settings.stokMenipisThreshold),
        maxHutangPelanggan: Number(settings.maxHutangPelanggan),
      });
      showToast('Pengaturan berhasil disimpan!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Gagal menyimpan pengaturan.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className={styles.loadingState}>Memuat pengaturan...</div>;

  return (
    <div className={`${styles.container} flutter-page`}>
      <header className={styles.header}>
        <h1 className={styles.title}>Pengaturan Aplikasi</h1>
        <p className={styles.subtitle}>Sesuaikan parameter dan profil toko untuk keseluruhan aplikasi.</p>
      </header>

      <div className={styles.content}>
        
        {/* PROFIL TOKO */}
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}><Store size={20} /> Profil Toko</h2>
          </div>
          <div className={styles.grid2}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Nama Toko</label>
              <input 
                type="text" 
                name="namaToko"
                value={settings.namaToko} 
                onChange={handleChange}
                className={styles.formInput}
                placeholder="Contoh: PT. Sumber Rejeki"
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Nomor Telepon</label>
              <input 
                type="text" 
                name="teleponToko"
                value={settings.teleponToko} 
                onChange={handleChange}
                className={styles.formInput}
                placeholder="08123456..."
              />
            </div>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Alamat Toko</label>
            <textarea 
              name="alamatToko"
              value={settings.alamatToko} 
              onChange={handleChange}
              className={styles.formInput}
              rows={2}
              placeholder="Jl. Raya Kemerdekaan No 45..."
            />
            <span className={styles.formHint}>Profil toko ini akan ditampilkan saat mencetak nota struk kasir.</span>
          </div>
        </section>

        {/* REKENING BANK */}
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>🏦 Rekening Bank (Untuk Nota A4)</h2>
          </div>
          <div className={styles.grid2}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Bank (Contoh: BCA, Mandiri)</label>
              <input 
                type="text" 
                name="bankNama"
                value={settings.bankNama} 
                onChange={handleChange}
                className={styles.formInput}
                placeholder="BCA"
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Nomor Rekening</label>
              <input 
                type="text" 
                name="bankRekening"
                value={settings.bankRekening} 
                onChange={handleChange}
                className={styles.formInput}
                placeholder="1234567890"
              />
            </div>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Atas Nama (A/N)</label>
            <input 
              type="text" 
              name="bankAtasNama"
              value={settings.bankAtasNama} 
              onChange={handleChange}
              className={styles.formInput}
              placeholder="PT. Welindo Sukses Bersama"
            />
          </div>
        </section>
        {/* PENGATURAN INVENTORI & KEUANGAN */}
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}><AlertTriangle size={20} /> Parameter Operasional</h2>
          </div>
          
          <div className={styles.grid2}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Batas Stok Menipis</label>
              <input 
                type="number" 
                name="stokMenipisThreshold"
                value={settings.stokMenipisThreshold} 
                onChange={handleChange}
                className={styles.formInput}
                min={1}
              />
              <span className={styles.formHint}>Indikator peringatan "Stok Menipis" di Dashboard akan menyala jika stok barang sama dengan atau di bawah angka ini.</span>
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Limit Peringatan Hutang (Rp)</label>
              <input 
                type="number" 
                name="maxHutangPelanggan"
                value={settings.maxHutangPelanggan} 
                onChange={handleChange}
                className={styles.formInput}
                min={0}
              />
              <span className={styles.formHint}>Akan berguna di masa depan untuk memunculkan notifikasi jika pelanggan melampaui limit hutang ini.</span>
            </div>
          </div>
        </section>

        {/* TAMPILAN APLIKASI */}
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>📱 Tampilan Aplikasi</h2>
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Ukuran Font Seluruh Aplikasi</label>
            <select 
              name="ukuranFontAplikasi"
              value={settings.ukuranFontAplikasi || 'normal'} 
              onChange={handleChange}
              className={styles.formInput}
            >
              <option value="small">Kecil (Small)</option>
              <option value="normal">Sedang (Normal)</option>
              <option value="large">Besar (Large)</option>
            </select>
            <span className={styles.formHint}>Akan membesarkan atau mengecilkan semua teks dan menu di dalam aplikasi (bukan nota).</span>
          </div>
        </section>

        {/* PRINTER SETTING */}
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}><Printer size={20} /> Pengaturan Cetak Nota</h2>
          </div>
          
          <div className={styles.grid2}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Ukuran Kertas Nota</label>
              <select 
                name="ukuranKertas"
                value={settings.ukuranKertas} 
                onChange={handleChange}
                className={styles.formInput}
              >
                <option value="A4">A4 (Printer Biasa)</option>
                <option value="80mm">Thermal 80mm</option>
                <option value="58mm">Thermal 58mm</option>
              </select>
              <span className={styles.formHint}>Menyesuaikan layout dan lebar struk nota ketika dicetak.</span>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Ukuran Font Struk</label>
              <select 
                name="ukuranFontNota"
                value={settings.ukuranFontNota || 'normal'} 
                onChange={handleChange}
                className={styles.formInput}
              >
                <option value="small">Kecil (Small)</option>
                <option value="normal">Sedang (Normal)</option>
                <option value="large">Besar (Large)</option>
              </select>
              <span className={styles.formHint}>Ubah ukuran tulisan cetak jika nota terlihat terlalu kecil/besar.</span>
            </div>
          </div>
        </section>

      </div>

      <div className={styles.actionArea}>
        <button 
          className={`${styles.saveBtn} ${styles.desktopOnlyBtn} flutter-ripple`}
          onClick={handleSave}
          disabled={isSaving}
        >
          <Save size={18} />
          {isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}
        </button>
      </div>

      {/* Floating Bottom Bar (Mobile/Flutter Style) */}
      <div className={styles.floatingBottomBar}>
        <button 
          className={`${styles.floatingBtnPrimary} flutter-ripple`}
          onClick={handleSave}
          disabled={isSaving}
        >
          <Save size={20} />
          {isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}
        </button>
      </div>

    </div>
  );
}
