import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, AlertCircle, ShoppingCart, PackageX, Calendar } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import SummaryCard from './SummaryCard';
import SalesChart from './SalesChart';
import TopDebtorsTable from './TopDebtorsTable';
import QuickActions from './QuickActions';
import RecentActivity from './RecentActivity';
import StockSummary from './StockSummary';
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
  const { userData } = useAuth();
  const navigate = useNavigate();
  const [chartMetric, setChartMetric] = useState('total');
  
  // Mock data to be replaced with Firebase later
  const topProducts = [
    { id: '1', nama: 'Indomie Goreng', terjual: 450, omzet: 1575000 },
    { id: '2', nama: 'Beras Rojolele 5kg', terjual: 120, omzet: 1440000 },
    { id: '3', nama: 'Minyak Goreng Bimoli 2L', terjual: 95, omzet: 1330000 },
    { id: '4', nama: 'Gula Pasir 1kg', terjual: 80, omzet: 960000 },
    { id: '5', nama: 'Tepung Terigu Segitiga 1kg', terjual: 75, omzet: 787500 },
  ];

  const topProductsColumns = [
    { key: 'no', label: 'No', render: (_, __, index) => index + 1 },
    { key: 'nama', label: 'Nama Produk' },
    { 
      key: 'terjual', 
      label: 'Terjual', 
      align: 'right',
      render: (val) => <span style={{ fontWeight: '600', color: 'var(--color-primary)' }}>{val}</span>
    },
    { 
      key: 'omzet', 
      label: 'Omzet', 
      align: 'right',
      render: (val) => <span style={{ color: 'var(--color-text-secondary)' }}>{formatRupiah(val)}</span>
    },
  ];

  return (
    <div className={styles.dashboard}>
      <div className={styles.headerSection}>
        <div>
          <h1 className={styles.pageTitle}>Dashboard Utama</h1>
          <p className={styles.welcomeText}>
            Selamat datang, {userData?.nama || 'Owner'}! 👋
          </p>
        </div>
        <div className={styles.datePickerWrapper}>
          <Calendar size={16} />
          <span>18 Mei 2025</span>
        </div>
      </div>
      
      <div className={styles.summaryGrid}>
        <SummaryCard 
          title="Omzet Hari Ini"
          value={formatRupiah(12500000)}
          icon={TrendingUp}
          color="primary"
          tooltip="Total kotor penjualan hari ini (Cash + Transfer + BON). Bukan keuntungan bersih."
          trend="up"
          trendValue="18%"
          trendText="dari kemarin"
        />
        <SummaryCard 
          title="Piutang Berjalan"
          value={formatRupiah(35000000)}
          icon={AlertCircle}
          color="danger"
          tooltip="Total sisa hutang BON dari seluruh pelanggan yang belum lunas."
          trend="up"
          trendValue="12%"
          trendText="dari kemarin"
        />
        <SummaryCard 
          title="Transaksi Hari Ini"
          value="48"
          icon={ShoppingCart}
          color="success"
          tooltip="Jumlah lembar nota yang diterbitkan hari ini."
          trend="up"
          trendValue="15%"
          trendText="dari kemarin"
        />
        <SummaryCard 
          title="Produk Stok Menipis"
          value="12"
          icon={PackageX}
          color="warning"
          tooltip="Jumlah jenis produk yang sisa stoknya mendekati atau habis (0)."
          subtitle="Perlu restock"
        />
      </div>

      <div className={styles.mainContent}>
        <div className={styles.topRow}>
          <div className={styles.chartSection}>
            <Card padding="lg" className={styles.chartCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 className={styles.sectionTitle} style={{ margin: 0 }}>Penjualan 7 Hari Terakhir</h2>
                <select 
                  value={chartMetric}
                  onChange={(e) => setChartMetric(e.target.value)}
                  style={{ padding: '0.25rem 0.5rem', borderRadius: '0.25rem', border: '1px solid #e2e8f0', fontSize: '0.75rem', outline: 'none' }}
                >
                  <option value="total">Omzet</option>
                  <option value="count">Transaksi</option>
                </select>
              </div>
              <SalesChart metric={chartMetric} />
            </Card>
          </div>

          <div className={styles.topRightSection}>
            <QuickActions />
            <StockSummary />
          </div>
        </div>

        <div className={styles.bottomRow}>
          <div className={styles.tablesSection}>
            <Card padding="lg">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 className={styles.sectionTitle} style={{ margin: 0 }}>Top 5 Produk Terlaris Bulan Ini</h2>
                <button 
                  onClick={() => navigate('/master-produk')}
                  style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: '0.25rem', padding: '0.25rem 0.5rem', fontSize: '0.75rem', cursor: 'pointer' }}
                >
                  Lihat semua
                </button>
              </div>
              <div className={styles.tableWrapper}>
                <Table 
                  columns={topProductsColumns}
                  data={topProducts}
                  emptyMessage="Belum ada data penjualan"
                />
              </div>
            </Card>

            <Card padding="lg">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 className={styles.sectionTitle} style={{ margin: 0 }}>Top 5 Piutang Terbesar</h2>
                <button 
                  onClick={() => navigate('/pelanggan')}
                  style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: '0.25rem', padding: '0.25rem 0.5rem', fontSize: '0.75rem', cursor: 'pointer' }}
                >
                  Lihat semua
                </button>
              </div>
              <div className={styles.tableWrapper}>
                <TopDebtorsTable />
              </div>
            </Card>
          </div>

          <div className={styles.bottomRightSection}>
            <RecentActivity />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
