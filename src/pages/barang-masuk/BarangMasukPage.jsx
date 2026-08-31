import React, { useState, useContext } from 'react';
import { History, Keyboard, Save } from 'lucide-react';
import { collection, doc, writeBatch } from 'firebase/firestore';
import { db } from '../../firebase';
import { ToastContext } from '../../context/ToastContext';
import styles from './BarangMasukPage.module.css';
import ScanInput from './ScanInput';
import StockInList from './StockInList';
import RiwayatBarangMasukModal from './RiwayatBarangMasukModal';

const BarangMasukPage = () => {
  const { showToast } = useContext(ToastContext);
  const [items, setItems] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showRiwayat, setShowRiwayat] = useState(false);

  const handleAddItem = (item) => {
    setItems(prev => [item, ...prev]);
  };

  const handleEditQty = (index, newQty) => {
    setItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], qty: newQty };
      return updated;
    });
  };

  const handleDelete = (index) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleNewProduct = (barcode) => {
    showToast(`Produk baru ditambahkan ke daftar. Jangan lupa klik Simpan Barang Masuk.`, 'info');
  };

  const handleSaveStockIn = async () => {
    if (items.length === 0) return;
    setIsSaving(true);
    
    try {
      const batch = writeBatch(db);
      
      const stockInEntry = {
        tanggal: new Date().toISOString(),
        total_items: items.reduce((sum, item) => sum + item.qty, 0),
        items: items
      };
      
      const stockInRef = doc(collection(db, 'stock_ins'));
      batch.set(stockInRef, stockInEntry);
      
      for (const item of items) {
        if (item.id) {
          const prodRef = doc(db, 'products', item.id);
          const newStock = (item.stok || 0) + item.qty;
          batch.update(prodRef, { stok: newStock });
        } else if (item.barcode) {
          // This is a new product added from the scan input
          const prodRef = doc(db, 'products', item.barcode);
          batch.set(prodRef, {
            barcode: item.barcode,
            nama_barang: item.nama_barang,
            satuan: item.satuan,
            stok: item.qty,
            kategori: 'Lainnya',
            asal: 'Lokal',
            harga_jual: 0,
            harga_modal: 0,
            has_multi_satuan: false
          });
        }
      }
      
      await batch.commit();
      showToast('Barang masuk berhasil disimpan!', 'success');
      setItems([]);
    } catch (err) {
      console.error(err);
      showToast('Gagal menyimpan data barang masuk: ' + err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`${styles.container} flutter-page`}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1>Barang Masuk</h1>
          <p className={styles.subtitle}>Catat produk yang masuk ke gudang</p>
        </div>
        <div className={styles.headerActions}>
          <button className={`${styles.btnSecondary} flutter-ripple`} onClick={() => setShowRiwayat(true)}>
            <History size={18} />
            Riwayat Barang Masuk
          </button>
          <button 
            className={`${styles.btnPrimary} ${styles.desktopOnlyBtn} flutter-ripple`} 
            onClick={handleSaveStockIn}
            disabled={isSaving || items.length === 0}
            style={{ opacity: (isSaving || items.length === 0) ? 0.5 : 1 }}
          >
            <Save size={18} />
            {isSaving ? 'Menyimpan...' : 'Simpan Barang Masuk'}
          </button>
        </div>
      </header>

      <div className={styles.contentArea}>
        <section className={styles.scanSection}>
          <ScanInput onScan={handleAddItem} onNewProduct={handleNewProduct} />
        </section>

        <section className={styles.listSection}>
          <StockInList 
            items={items} 
            onEditQty={handleEditQty}
            onDelete={handleDelete}
          />
        </section>
      </div>

      {showRiwayat && (
        <RiwayatBarangMasukModal onClose={() => setShowRiwayat(false)} />
      )}

      {/* Floating Bottom Bar (Mobile/Flutter Style) */}
      {items.length > 0 && (
        <div className={styles.floatingBottomBar}>
          <div className={styles.floatingSummary}>
            <span className={styles.floatingCount}>{items.length} Macam Barang</span>
            <span className={styles.floatingTotal}>{items.reduce((s, i) => s + i.qty, 0)} Total Qty</span>
          </div>
          <button 
            className={`${styles.floatingBtnPrimary} flutter-ripple`} 
            onClick={handleSaveStockIn}
            disabled={isSaving}
          >
            <Save size={20} />
            {isSaving ? 'Menyimpan...' : 'Simpan Barang Masuk'}
          </button>
        </div>
      )}
    </div>
  );
};

export default BarangMasukPage;
