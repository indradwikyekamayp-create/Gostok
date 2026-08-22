import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, AlertCircle, ShoppingCart, PackageX, Calendar } from 'lucide-react';
import { collection, onSnapshot, doc } from 'firebase/firestore';
import { db } from '../../firebase';
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
  const { userData, isOwner } = useAuth();
  const navigate = useNavigate();
  const [chartMetric, setChartMetric] = useState('total');
  
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [settings, setSettings] = useState({ stokMenipisThreshold: 10 });

  useEffect(() => {
    // 1. Fetch Products
    const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      const data = [];
      snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() }));
      setProducts(data);
    });

    // 2. Fetch Customers
    const unsubCustomers = onSnapshot(collection(db, 'customers'), (snapshot) => {
      const data = [];
      snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() }));
      setCustomers(data);
    });

    // 3. Fetch Transactions
    const unsubTransactions = onSnapshot(collection(db, 'transactions'), (snapshot) => {
      const data = [];
      snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() }));
      setTransactions(data);
    });

    // 4. Fetch Settings
    const unsubSettings = onSnapshot(doc(db, 'settings', 'store_config'), (docSnap) => {
      if (docSnap.exists()) {
        setSettings(prev => ({ ...prev, ...docSnap.data() }));
      }
    });

    return () => {
      unsubProducts();
      unsubCustomers();
      unsubTransactions();
      unsubSettings();
    };
  }, []);

  // Compute Metrics
  const today = new Date().toISOString().split('T')[0];
  const todayTxs = transactions.filter(t => t.tanggal?.startsWith(today));
  
  const omzetHariIni = todayTxs.reduce((sum, t) => sum + (t.grandTotal || 0), 0);
  const txCountHariIni = todayTxs.length;
  
  const totalPiutang = customers.reduce((sum, c) => sum + (c.total_hutang_berjalan || 0), 0);
  const lowStockCount = products.filter(p => p.stok <= 10).length;

  // Chart Data (Last 7 Days)
  const last7Days = Array.from({length: 7}, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  const chartData = last7Days.map(dateObj => {
    const dateStr = dateObj.toISOString().split('T')[0];
    const txs = transactions.filter(t => t.tanggal?.startsWith(dateStr));
    const dayName = dateObj.toLocaleDateString('id-ID', { weekday: 'short' });
    return {
      date: dayName,
      total: txs.reduce((sum, t) => sum + (t.grandTotal || 0), 0),
      count: txs.length
    };
  });

  // Top Products
  const prodSales = {};
  transactions.forEach(t => {
    t.cart?.forEach(item => {
      if (!prodSales[item.id]) {
        prodSales[item.id] = { id: item.id, nama: item.nama_barang || item.nama, terjual: 0, omzet: 0 };
      }
      prodSales[item.id].terjual += item.qty;
      prodSales[item.id].omzet += item.subtotal;
    });
  });
  
  const topProducts = Object.values(prodSales)
    .sort((a, b) => b.terjual - a.terjual)
    .slice(0, 5);

  const topProductsColumns = [
    { key: 'no', label: 'No', render: (_, __, index) => index + 1 },
    { key: 'nama', label: 'Nama Produk' },
    { 
      key: 'terjual', 
      label: 'Terjual', 
      align: 'right',
      render: (val) => <span style={{ fontWeight: '600', color: 'var(--color-primary)' }}>{val}</span>
    },
    ...(isOwner ? [{ 
      key: 'omzet', 
      label: 'Omzet', 
      align: 'right',
      render: (val) => <span style={{ color: 'var(--color-text-secondary)' }}>{formatRupiah(val)}</span>
    }] : []),
  ];

  const topDebtors = customers
    .filter(c => c.total_hutang_berjalan > 0)
    .sort((a, b) => b.total_hutang_berjalan - a.total_hutang_berjalan)
    .slice(0, 5)
    .map(c => ({ id: c.id, nama_pelanggan: c.nama_perusahaan || c.nama_pic, total_hutang: c.total_hutang_berjalan }));

  const threshold = settings.stokMenipisThreshold || 10;
  const stokAmanCount = products.filter(p => p.stok > threshold).length;
  const stokHabisCount = products.filter(p => p.stok === 0).length;
  const stokMenipisCount = products.filter(p => p.stok > 0 && p.stok <= threshold).length;
  
  const stockSummaryData = [
    { name: 'Stok Aman', value: stokAmanCount, color: '#3b82f6', percentage: products.length ? Math.round((stokAmanCount/products.length)*100)+'%' : '0%' },
    { name: 'Stok Menipis', value: stokMenipisCount, color: '#f59e0b', percentage: products.length ? Math.round((stokMenipisCount/products.length)*100)+'%' : '0%' },
    { name: 'Stok Habis', value: stokHabisCount, color: '#ef4444', percentage: products.length ? Math.round((stokHabisCount/products.length)*100)+'%' : '0%' }
  ];

  return (
    <div className={styles.dashboard}>
      <div className={styles.headerSection}>
        <div>
          <h1 className={styles.pageTitle}>{isOwner ? 'Dashboard Utama (Owner)' : 'Dashboard Utama (Admin)'}</h1>
          <p className={styles.welcomeText}>
            Selamat datang, {userData?.nama || (isOwner ? 'Owner' : 'Admin')}! 👋
          </p>
        </div>
        <div className={styles.datePickerWrapper}>
          <Calendar size={16} />
          <span>{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
      </div>
      
      <div className={styles.summaryGrid}>
        {isOwner && (
          <div className={styles.heroCard}>
            <h3>Omzet Hari Ini <AlertCircle size={14} style={{ opacity: 0.8 }} /></h3>
            <div className={styles.amount}>{formatRupiah(omzetHariIni || 0)}</div>
            <div className={styles.subtitle}>
              0% dari kemarin
            </div>
            <div className={styles.heroIcon}>
              <TrendingUp size={24} />
            </div>
            {/* Soft wave decoration */}
            <svg className={styles.heroWave} viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg">
              <path fill="#ffffff" fillOpacity="1" d="M0,192L48,197.3C96,203,192,213,288,208C384,203,480,181,576,176C672,171,768,181,864,197.3C960,213,1056,235,1152,218.7C1248,203,1344,149,1392,122.7L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            </svg>
          </div>
        )}
        <SummaryCard 
          title="Piutang Berjalan"
          value={formatRupiah(totalPiutang)}
          icon={AlertCircle}
          color="danger"
          tooltip="Total sisa hutang BON dari seluruh pelanggan yang belum lunas."
        />
        <SummaryCard 
          title="Transaksi Hari Ini"
          value={txCountHariIni}
          icon={ShoppingCart}
          color="success"
          tooltip="Jumlah lembar nota yang diterbitkan hari ini."
        />
        <SummaryCard 
          title="Produk Stok Menipis"
          value={lowStockCount}
          icon={PackageX}
          color="warning"
          tooltip="Jumlah jenis produk yang sisa stoknya menipis."
          subtitle="Perlu restock"
        />
      </div>

      <div className={styles.mainContent}>
        <div className={styles.topRow}>
          <div className={styles.chartSection}>
            <Card padding="lg" className={styles.chartCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 className={styles.sectionTitle} style={{ margin: 0 }}>Penjualan 7 Hari Terakhir</h2>
                {isOwner ? (
                  <select 
                    value={chartMetric}
                    onChange={(e) => setChartMetric(e.target.value)}
                    style={{ padding: '0.25rem 0.5rem', borderRadius: '0.25rem', border: '1px solid #e2e8f0', fontSize: '0.75rem', outline: 'none' }}
                  >
                    <option value="total">Omzet</option>
                    <option value="count">Transaksi</option>
                  </select>
                ) : (
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Jumlah Transaksi</span>
                )}
              </div>
              <SalesChart data={chartData.reverse()} metric={isOwner ? chartMetric : 'count'} />
            </Card>
          </div>

          <div className={styles.topRightSection}>
            <QuickActions />
            <StockSummary data={stockSummaryData} />
          </div>
        </div>

        <div className={styles.bottomRow}>
          <div className={styles.tablesSection}>
            <Card padding="lg">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 className={styles.sectionTitle} style={{ margin: 0 }}>Top 5 Produk Terlaris</h2>
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
                <TopDebtorsTable data={topDebtors} />
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
