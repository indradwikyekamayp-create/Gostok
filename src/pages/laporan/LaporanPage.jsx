import React, { useState } from 'react';
import styles from './LaporanPage.module.css';
import LaporanPenjualan from './LaporanPenjualan';
import LaporanStok from './LaporanStok';
import LaporanPiutang from './LaporanPiutang';
import LaporanKeuntungan from './LaporanKeuntungan';
import DateRangePicker from '../../components/common/DateRangePicker';

const LaporanPage = () => {
  const [activeTab, setActiveTab] = useState('penjualan');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className={styles.container}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 className={styles.title}>Laporan & Analisis</h1>
          <p className={styles.subtitle}>Pantau performa bisnis Anda secara lengkap dan akurat</p>
        </div>
        
        {(activeTab === 'penjualan' || activeTab === 'keuntungan') && (
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid #e2e8f0', backgroundColor: '#fff', borderRadius: '0.5rem', padding: '0 0.75rem', height: '36px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', transition: 'border-color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.borderColor = '#cbd5e1'} onMouseOut={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}>
              <input type="date" style={{ border: 'none', outline: 'none', background: 'transparent', color: '#334155', fontSize: '0.8125rem', fontWeight: '500', padding: 0 }} value={dateRange.startDate} onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})} />
              <span style={{ color: '#cbd5e1' }}>—</span>
              <input type="date" style={{ border: 'none', outline: 'none', background: 'transparent', color: '#334155', fontSize: '0.8125rem', fontWeight: '500', padding: 0 }} value={dateRange.endDate} onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})} />
            </div>
            <button style={{ height: '36px', padding: '0 0.875rem', display: 'flex', alignItems: 'center', gap: '0.375rem', border: '1px solid #e2e8f0', backgroundColor: '#fff', borderRadius: '0.5rem', color: '#334155', fontSize: '0.8125rem', fontWeight: '500', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', transition: 'all 0.2s' }} onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#f8fafc'; e.currentTarget.style.borderColor = '#cbd5e1'; }} onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.borderColor = '#e2e8f0'; }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
              Filter
            </button>
          </div>
        )}
      </header>

      <div className={styles.tabsContainer}>
        <div className={styles.tabsList}>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'penjualan' ? styles.active : ''}`}
            onClick={() => handleTabChange('penjualan')}
          >
            Penjualan
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'stok' ? styles.active : ''}`}
            onClick={() => handleTabChange('stok')}
          >
            Stok Barang
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'piutang' ? styles.active : ''}`}
            onClick={() => handleTabChange('piutang')}
          >
            Piutang Pelanggan
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'keuntungan' ? styles.active : ''}`}
            onClick={() => handleTabChange('keuntungan')}
          >
            Keuntungan (Owner)
          </button>
        </div>
      </div>

      <div className={styles.tabContent}>
        {activeTab === 'penjualan' && <LaporanPenjualan dateRange={dateRange} />}
        {activeTab === 'stok' && <LaporanStok />}
        {activeTab === 'piutang' && <LaporanPiutang />}
        {activeTab === 'keuntungan' && <LaporanKeuntungan dateRange={dateRange} />}
      </div>
    </div>
  );
};

export default LaporanPage;
