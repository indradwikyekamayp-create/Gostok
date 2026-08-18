import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, PackagePlus, Package, Users } from 'lucide-react';
import Card from '../../components/common/Card';
import styles from './QuickActions.module.css';

const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <Card padding="lg">
      <h2 className={styles.title}>Aksi Cepat</h2>
      <div className={styles.grid}>
        <button className={styles.actionBtn} onClick={() => navigate('/transaksi-jual')}>
          <ShoppingCart size={18} className={styles.icon} />
          <span>Transaksi Jual</span>
        </button>
        <button className={styles.actionBtn} onClick={() => navigate('/barang-masuk')}>
          <PackagePlus size={18} className={styles.icon} />
          <span>Barang Masuk</span>
        </button>
        <button className={styles.actionBtn} onClick={() => navigate('/master-produk')}>
          <Package size={18} className={styles.icon} />
          <span>Tambah Produk</span>
        </button>
        <button className={styles.actionBtn} onClick={() => navigate('/pelanggan')}>
          <Users size={18} className={styles.icon} />
          <span>Tambah Pelanggan</span>
        </button>
      </div>
    </Card>
  );
};

export default QuickActions;
