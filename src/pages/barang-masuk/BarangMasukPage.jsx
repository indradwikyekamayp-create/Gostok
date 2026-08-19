import React, { useState } from 'react';
import { History, Keyboard } from 'lucide-react';
import styles from './BarangMasukPage.module.css';
import ScanInput from './ScanInput';
import StockInList from './StockInList';

const BarangMasukPage = () => {
  const [items, setItems] = useState([]);

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
    // In full implementation, open modal here
    alert(`Produk baru terdeteksi! Barcode: ${barcode}. Buka form tambah produk.`);
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
          <button className={styles.btnPrimary}>
            <Keyboard size={18} />
            Input Manual
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
