import React, { useState } from 'react';
import { History, Keyboard, Save } from 'lucide-react';
import { collection, doc, writeBatch } from 'firebase/firestore';
import { db } from '../../firebase';
import styles from './BarangMasukPage.module.css';
import ScanInput from './ScanInput';
import StockInList from './StockInList';

const BarangMasukPage = () => {
  const [items, setItems] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

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
    alert(`Produk baru terdeteksi! Barcode: ${barcode}. Buka form tambah produk.`);
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
        }
      }
      
      await batch.commit();
      alert('Barang masuk berhasil disimpan!');
      setItems([]);
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan data barang masuk: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1>Barang Masuk</h1>
          <p className={styles.subtitle}>Catat produk yang masuk ke gudang</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.btnSecondary}>
            <History size={18} />
            Riwayat Barang Masuk
          </button>
          <button 
            className={styles.btnPrimary} 
            onClick={handleSaveStockIn}
            disabled={isSaving || items.length === 0}
            style={{ opacity: (isSaving || items.length === 0) ? 0.5 : 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
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
    </div>
  );
};

export default BarangMasukPage;
