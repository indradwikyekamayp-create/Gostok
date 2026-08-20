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
      <header className={styles.header}>
        <h1 className={styles.title}>Laporan & Analisis</h1>
        <p className={styles.subtitle}>PT. WELINDO SUKSES BERSAMA</p>
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
        
        {(activeTab === 'penjualan' || activeTab === 'keuntungan') && (
          <div className={styles.dateFilter}>
            <DateRangePicker 
              label=""
              startDate={dateRange.startDate}
              endDate={dateRange.endDate}
              onStartDateChange={(val) => setDateRange({...dateRange, startDate: val})}
              onEndDateChange={(val) => setDateRange({...dateRange, endDate: val})}
            />
          </div>
        )}
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
