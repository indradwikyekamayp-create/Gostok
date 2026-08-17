import React from 'react';
import { TrendingUp, AlertCircle, ShoppingCart, PackageX } from 'lucide-react';
import SummaryCard from './SummaryCard';
import SalesChart from './SalesChart';
import TopDebtorsTable from './TopDebtorsTable';
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

const OwnerDashboard = () => {
  // Mock data to be replaced with Firebase later
  const topProducts = [
    { id: '1', nama: 'Indomie Goreng', terjual: 450 },
    { id: '2', nama: 'Beras Rojolele 5kg', terjual: 120 },
    { id: '3', nama: 'Minyak Goreng Bimoli 2L', terjual: 95 },
    { id: '4', nama: 'Gula Pasir Gulaku 1kg', terjual: 88 },
    { id: '5', nama: 'Kopi Kapal Api 165g', terjual: 75 },
  ];

  const topProductsColumns = [
    { key: 'nama', label: 'Nama Produk' },
    { 
      key: 'terjual', 
      label: 'Terjual', 
      align: 'right',
      render: (val) => <span style={{ fontWeight: '500' }}>{val}</span>
    },
  ];

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.pageTitle}>Dashboard Utama</h1>
      
      <div className={styles.summaryGrid}>
        <SummaryCard 
          title="Omzet Hari Ini"
          value={formatRupiah(12500000)}
          icon={TrendingUp}
          color="primary"
        />
        <SummaryCard 
          title="Piutang Berjalan"
          value={formatRupiah(35000000)}
          icon={AlertCircle}
          color="danger"
        />
        <SummaryCard 
          title="Transaksi Hari Ini"
          value="48"
          icon={ShoppingCart}
          color="success"
        />
        <SummaryCard 
          title="Produk Stok Menipis"
          value="12"
          icon={PackageX}
          color="warning"
        />
      </div>

      <div className={styles.mainContent}>
        <div className={styles.chartSection}>
          <Card padding="lg">
            <h2 className={styles.sectionTitle}>Penjualan 7 Hari Terakhir</h2>
            <SalesChart />
          </Card>
        </div>

        <div className={styles.sideGrid}>
          <Card padding="lg">
            <h2 className={styles.sectionTitle}>Top 5 Hutang Terbesar</h2>
            <div className={styles.tableWrapper}>
              <TopDebtorsTable />
            </div>
          </Card>
          
          <Card padding="lg">
            <h2 className={styles.sectionTitle}>Produk Terlaris Bulan Ini</h2>
            <div className={styles.tableWrapper}>
              <Table 
                columns={topProductsColumns}
                data={topProducts}
                emptyMessage="Belum ada data penjualan"
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
