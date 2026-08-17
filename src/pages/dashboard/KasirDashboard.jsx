import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PackagePlus, ShoppingCart } from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import styles from './DashboardPage.module.css';

const formatRupiah = (value) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

const KasirDashboard = () => {
  const navigate = useNavigate();

  // Mock data for transactions to be replaced with Firebase later
  const recentTransactions = [
    { no_nota: 'TRX-20231015-001', pelanggan: 'Umum', total: 150000, status: 'Lunas', waktu: '08:15' },
    { no_nota: 'TRX-20231015-002', pelanggan: 'Toko Budi Maju', total: 4500000, status: 'BON', waktu: '09:30' },
    { no_nota: 'TRX-20231015-003', pelanggan: 'Warung Bu Ani', total: 850000, status: 'Lunas', waktu: '11:45' },
    { no_nota: 'TRX-20231015-004', pelanggan: 'Umum', total: 45000, status: 'Lunas', waktu: '13:20' },
  ];

  const transactionColumns = [
    { key: 'no_nota', label: 'No. Nota' },
    { key: 'waktu', label: 'Waktu' },
    { key: 'pelanggan', label: 'Pelanggan' },
    { 
      key: 'total', 
      label: 'Total', 
      align: 'right',
      render: (val) => <span style={{ fontWeight: '500' }}>{formatRupiah(val)}</span>
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (val) => (
        <span className={val === 'Lunas' ? styles.statusSuccess : styles.statusDanger}>
          {val}
        </span>
      )
    },
  ];

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.pageTitle}>Dashboard Kasir</h1>

      <div className={styles.actionGrid}>
        <Button 
          size="xl" 
          icon={PackagePlus} 
          onClick={() => navigate('/barang-masuk')}
          className={styles.actionButton}
        >
          + Barang Masuk
        </Button>
        <Button 
          size="xl" 
          icon={ShoppingCart} 
          onClick={() => navigate('/transaksi-jual')}
          className={styles.actionButton}
        >
          + Transaksi Jual
        </Button>
      </div>

      <Card padding="lg" className={styles.recentTransactions}>
        <h2 className={styles.sectionTitle}>Transaksi Hari Ini</h2>
        <div className={styles.tableWrapper}>
          <Table 
            columns={transactionColumns} 
            data={recentTransactions} 
            emptyMessage="Belum ada transaksi hari ini"
          />
        </div>
      </Card>
    </div>
  );
};

export default KasirDashboard;
