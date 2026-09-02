import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { db } from '../../firebase';
import ExportButtons from './ExportButtons';
import { Lock, Wallet, BarChart2, PieChart, Info, Search, MoreVertical, Trophy, ArrowUpRight, ArrowDownRight, FileText } from 'lucide-react';
import NotaPreview from '../transaksi-jual/NotaPreview';
import styles from './LaporanPage.module.css';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
}

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric'
  }).format(date);
};

const LaporanKeuntungan = ({ dateRange }) => {
  const [profitData, setProfitData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [activeTab, setActiveTab] = useState('semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [expandedRowId, setExpandedRowId] = useState(null);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const [summary, setSummary] = useState({
    totalOmzet: 0,
    totalModal: 0,
    totalKeuntungan: 0,
    margin: 0,
    maxKeuntungan: 0,
    maxKeuntunganDate: '',
    maxMargin: 0,
    maxMarginDate: '',
    minKeuntungan: 0,
    minKeuntunganDate: '',
    totalTransaksi: 0
  });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'transactions'), (snapshot) => {
      let totalOmzet = 0;
      let totalModal = 0;
      const dataArr = [];
      const dailyMap = {};
      
      let maxKeuntungan = -Infinity;
      let maxKeuntunganDate = '';
      let maxMargin = -Infinity;
      let maxMarginDate = '';
      let minKeuntungan = Infinity;
      let minKeuntunganDate = '';
      let totalTransaksi = 0;

      snapshot.forEach(doc => {
        const data = doc.data();
        let dateStr = '';
        let dateObj = null;
        if (data.tanggal) {
          if (data.tanggal.toDate) {
            dateObj = data.tanggal.toDate();
            dateStr = dateObj.toISOString().split('T')[0];
          } else {
            dateObj = new Date(data.tanggal);
            dateStr = data.tanggal.split('T')[0];
          }
        }
        
        const omzet = data.grandTotal || 0;
        
        let modal = data.totalModal || 0;
        if (modal === 0 && data.cart && Array.isArray(data.cart)) {
          data.cart.forEach(item => {
            const hpp = item.harga_modal || item.hpp || item.modal || 0;
            const qty = item.qty || item.quantity || 1;
            modal += (hpp * qty);
          });
        }
        
        const keuntungan = omzet - modal;
        const margin = omzet > 0 ? (keuntungan / omzet) * 100 : 0;

        totalOmzet += omzet;
        totalModal += modal;
        totalTransaksi += 1;

        if (keuntungan > maxKeuntungan) {
          maxKeuntungan = keuntungan;
          maxKeuntunganDate = dateStr;
        }
        if (keuntungan < minKeuntungan) {
          minKeuntungan = keuntungan;
          minKeuntunganDate = dateStr;
        }
        if (margin > maxMargin) {
          maxMargin = margin;
          maxMarginDate = dateStr;
        }

        dataArr.push({
          id: doc.id,
          noNota: data.noNota || doc.id,
          tanggal: data.tanggal,
          dateStr: dateStr,
          customer: data.customer,
          omzet,
          modal,
          keuntungan,
          margin: margin.toFixed(2),
          paymentMethod: data.paymentMethod || data.metodePembayaran,
          cart: data.cart || [],
          grandTotal: data.grandTotal || 0,
          raw: data
        });

        // Group for chart
        if (dateStr) {
          if (!dailyMap[dateStr]) {
            dailyMap[dateStr] = { date: dateStr, omzet: 0, modal: 0, keuntungan: 0 };
          }
          dailyMap[dateStr].omzet += omzet;
          dailyMap[dateStr].modal += modal;
          dailyMap[dateStr].keuntungan += keuntungan;
        }
      });

      const totalKeuntungan = totalOmzet - totalModal;
      const avgMargin = totalOmzet > 0 ? (totalKeuntungan / totalOmzet) * 100 : 0;

      dataArr.sort((a, b) => {
        const dateA = a.tanggal ? (a.tanggal.toDate ? a.tanggal.toDate() : new Date(a.tanggal)) : new Date(0);
        const dateB = b.tanggal ? (b.tanggal.toDate ? b.tanggal.toDate() : new Date(b.tanggal)) : new Date(0);
        return dateB - dateA;
      });

      // Sort chart data chronologically
      const chartArr = Object.values(dailyMap).sort((a, b) => new Date(a.date) - new Date(b.date)).map(d => ({
        ...d,
        label: new Date(d.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
      }));

      setChartData(chartArr);
      setProfitData(dataArr);
      setSummary({
        totalOmzet,
        totalModal,
        totalKeuntungan,
        margin: avgMargin.toFixed(2),
        maxKeuntungan: maxKeuntungan === -Infinity ? 0 : maxKeuntungan,
        maxKeuntunganDate,
        maxMargin: maxMargin === -Infinity ? 0 : maxMargin,
        maxMarginDate,
        minKeuntungan: minKeuntungan === Infinity ? 0 : minKeuntungan,
        minKeuntunganDate,
        totalTransaksi
      });
    });

    return () => unsub();
  }, []);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab, itemsPerPage]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', padding: '0.75rem', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
          <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold', fontSize: '0.875rem', color: '#0f172a' }}>{label}</p>
          {payload.map((entry, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', marginBottom: '0.25rem', color: '#475569' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: entry.color }}></div>
              <span>{entry.name}:</span>
              <span style={{ fontWeight: '600', color: '#0f172a' }}>{formatCurrency(entry.value)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const filteredProfitData = profitData.filter(row => {
    // Search
    const query = searchQuery.toLowerCase();
    const matchSearch = row.noNota.toLowerCase().includes(query) || 
      (row.customer?.nama_perusahaan || row.customer?.nama_pic || 'umum').toLowerCase().includes(query);
    if (!matchSearch) return false;

    // Tabs
    if (activeTab === 'profit tertinggi') {
      // Handled by sorting later if needed, but let's just keep them all for now and sort
      return true;
    }
    if (activeTab === 'margin tertinggi') {
      return true;
    }
    if (activeTab === 'rugi / laba (-)') {
      return row.keuntungan < 0;
    }
    return true; // semua, transaksi terbanyak
  }).sort((a, b) => {
    if (activeTab === 'profit tertinggi') return b.keuntungan - a.keuntungan;
    if (activeTab === 'margin tertinggi') return b.margin - a.margin;
    // Transaksi terbanyak can't really apply to a single transaction row properly, but we'll leave default sort for it
    return new Date(b.tanggal || 0) - new Date(a.tanggal || 0); // default sort (semua)
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredProfitData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredProfitData.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <ExportButtons 
          data={profitData} 
          columns={['No Nota', 'Tanggal', 'Omzet', 'Modal', 'Keuntungan', 'Margin (%)']}
          filename="Laporan_Keuntungan"
        />
      </div>

      {/* Summary Cards */}
      <div className={styles.grid4}>
        <div className={styles.summaryCard} style={{ padding: '1.25rem', backgroundColor: '#fff', borderRadius: '0.75rem', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <div className={styles.summaryCardIcon} style={{ width: '48px', height: '48px', backgroundColor: '#eff6ff', color: '#3b82f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Lock size={24} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Total Omzet</div>
            <div className={styles.summaryCardValue} style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a' }}>{formatCurrency(summary.totalOmzet)}</div>
          </div>
        </div>

        <div className={styles.summaryCard} style={{ padding: '1.25rem', backgroundColor: '#fff', borderRadius: '0.75rem', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <div className={styles.summaryCardIcon} style={{ width: '48px', height: '48px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Wallet size={24} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Total Modal (HPP)</div>
            <div className={styles.summaryCardValue} style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a' }}>{formatCurrency(summary.totalModal)}</div>
          </div>
        </div>

        <div className={styles.summaryCard} style={{ padding: '1.25rem', backgroundColor: '#fff', borderRadius: '0.75rem', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <div className={styles.summaryCardIcon} style={{ width: '48px', height: '48px', backgroundColor: '#dcfce7', color: '#16a34a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <BarChart2 size={24} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Total Laba Kotor</div>
            <div className={styles.summaryCardValue} style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a' }}>{formatCurrency(summary.totalKeuntungan)}</div>
          </div>
        </div>

        <div className={styles.summaryCard} style={{ padding: '1.25rem', backgroundColor: '#fff', borderRadius: '0.75rem', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <div className={styles.summaryCardIcon} style={{ width: '48px', height: '48px', backgroundColor: '#f3e8ff', color: '#9333ea', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <PieChart size={24} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Rata-rata Margin</div>
            <div className={styles.summaryCardValue} style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a' }}>{summary.margin}%</div>
          </div>
        </div>
      </div>

      {/* Grid Layout for Charts & Insights */}
      <div className={styles.grid2_1}>
        
        {/* Chart Column */}
        <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h4 style={{ fontSize: '0.875rem', fontWeight: '600', margin: 0, color: '#0f172a' }}>Tren Omzet, Modal & Keuntungan</h4>
              <Info size={14} color="#94a3b8" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.6875rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><div style={{ width: '8px', height: '8px', backgroundColor: '#3b82f6', borderRadius: '2px' }}></div>Omzet</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><div style={{ width: '8px', height: '8px', backgroundColor: '#ef4444', borderRadius: '2px' }}></div>Modal</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><div style={{ width: '8px', height: '8px', backgroundColor: '#10b981', borderRadius: '2px' }}></div>Keuntungan</div>
              </div>
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '0.375rem', padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                Tampilkan: Harian <span style={{ fontSize: '0.5rem' }}>▼</span>
              </div>
            </div>
          </div>
          
          <div style={{ height: '250px', width: '100%' }}>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(val) => `Rp${(val/1000000).toFixed(1)}M`} dx={-10} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="omzet" name="Omzet" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="modal" name="Modal" stroke="#ef4444" strokeWidth={2} dot={{ r: 4, fill: '#ef4444' }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="keuntungan" name="Keuntungan" stroke="#10b981" strokeWidth={2} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '0.875rem' }}>
                Belum ada data keuntungan
              </div>
            )}
          </div>
        </div>

        {/* Insights Column */}
        <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h4 style={{ fontSize: '0.875rem', fontWeight: '600', margin: '0 0 1.5rem 0', color: '#0f172a' }}>Insight Keuntungan</h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ArrowUpRight size={18} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#0f172a' }}>Keuntungan Tertinggi</div>
                  <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>Pada {formatDate(summary.maxKeuntunganDate)}</div>
                </div>
              </div>
              <div style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#16a34a' }}>{formatCurrency(summary.maxKeuntungan)}</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#ffedd5', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Trophy size={18} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#0f172a' }}>Margin Tertinggi</div>
                  <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>{formatDate(summary.maxMarginDate)}</div>
                </div>
              </div>
              <div style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#ea580c' }}>{summary.maxMargin}%</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ArrowDownRight size={18} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#0f172a' }}>Keuntungan Terendah</div>
                  <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>{formatDate(summary.minKeuntunganDate)}</div>
                </div>
              </div>
              <div style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#dc2626' }}>{formatCurrency(summary.minKeuntungan)}</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileText size={18} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#0f172a' }}>Total Transaksi</div>
                  <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>Selama periode ini</div>
                </div>
              </div>
              <div style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#3b82f6' }}>{summary.totalTransaksi} transaksi</div>
            </div>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        
        {/* Table Toolbar */}
        <div className={styles.tableToolbar}>
          <div className={styles.pillsWrapper}>
            {['Semua', 'Profit Tertinggi', 'Margin Tertinggi', 'Rugi / Laba (-)', 'Transaksi Terbanyak'].map(tab => {
              const isActive = activeTab === tab.toLowerCase();
              return (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab.toLowerCase())}
                  style={{ 
                    padding: '0.375rem 0.75rem', 
                    borderRadius: '0.375rem', 
                    fontSize: '0.75rem', 
                    fontWeight: '500',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: isActive ? '#1d4ed8' : 'transparent',
                    color: isActive ? '#fff' : '#475569',
                    transition: 'all 0.2s'
                  }}
                >
                  {tab}
                </button>
              )
            })}
          </div>
          <div className={styles.searchInputWrapper} style={{ position: 'relative' }}>
            <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Cari No. Nota / Pelanggan..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ 
                padding: '0.375rem 0.75rem 0.375rem 2rem', 
                borderRadius: '0.375rem', 
                border: '1px solid #e2e8f0', 
                fontSize: '0.75rem',
                outline: 'none',
                width: '250px'
              }} 
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className={styles.responsiveTable} style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.75rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '1rem 1.5rem', fontWeight: '600', color: '#64748b' }}>Daftar Transaksi</th>
                <th colSpan="7"></th>
              </tr>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '0.75rem 1.5rem', fontWeight: '600', color: '#64748b' }}>No. Nota</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: '600', color: '#64748b' }}>Tanggal</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: '600', color: '#64748b' }}>Pelanggan</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: '600', color: '#64748b', textAlign: 'right' }}>Omzet</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: '600', color: '#64748b', textAlign: 'right' }}>Modal (HPP)</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: '600', color: '#64748b', textAlign: 'right' }}>Laba Kotor</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: '600', color: '#64748b', textAlign: 'center' }}>Margin</th>
                <th style={{ padding: '0.75rem 1.5rem', fontWeight: '600', color: '#64748b', textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length > 0 ? paginatedData.map((row, i) => (
                <React.Fragment key={i}>
                  <tr style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: expandedRowId === row.id ? '#f8fafc' : 'transparent', transition: 'background-color 150ms ease' }}>
                    <td 
                      data-label="No. Nota"
                      onClick={() => setExpandedRowId(expandedRowId === row.id ? null : row.id)}
                      style={{ padding: '0.75rem 1.5rem', color: '#3b82f6', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                    >
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#3b82f6' }}></div>
                      {row.noNota}
                    </td>
                    <td data-label="Tanggal" style={{ padding: '0.75rem 1rem', color: '#475569' }}>
                      {row.tanggal ? (row.tanggal.toDate ? row.tanggal.toDate() : new Date(row.tanggal)).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                    </td>
                    <td data-label="Pelanggan" style={{ padding: '0.75rem 1rem', color: '#475569' }}>{row.customer?.nama_perusahaan || row.customer?.nama_pic || 'Umum'}</td>
                    <td data-label="Omzet" style={{ padding: '0.75rem 1rem', textAlign: 'right', color: '#0f172a' }}>{formatCurrency(row.omzet)}</td>
                    <td data-label="Modal (HPP)" style={{ padding: '0.75rem 1rem', textAlign: 'right', color: '#475569' }}>{formatCurrency(row.modal)}</td>
                    <td data-label="Laba Kotor" style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: '600', color: row.keuntungan >= 0 ? '#10b981' : '#ef4444' }}>
                      {row.keuntungan > 0 ? '+' : ''}{formatCurrency(row.keuntungan)}
                    </td>
                    <td data-label="Margin" style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: '600', color: row.margin >= 0 ? '#10b981' : '#ef4444' }}>
                      {row.margin}%
                    </td>
                    <td data-label="Aksi" style={{ padding: '0.75rem 1.5rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <button onClick={() => setSelectedTransaction(row)} style={{ border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: '0.6875rem', cursor: 'pointer', padding: '0.25rem 0.5rem', borderRadius: '0.25rem' }}>
                          Detail
                        </button>
                        <button style={{ border: '1px solid #e2e8f0', background: '#fff', borderRadius: '0.25rem', padding: '0.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#64748b' }}>
                          <MoreVertical size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedRowId === row.id && row.raw?.cart && (
                    <tr>
                      <td colSpan="8" style={{ padding: '1rem', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                        <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                          <h5 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#1e293b' }}>Detail Produk</h5>
                          <table className={styles.responsiveTable} style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
                            <thead>
                              <tr>
                                <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>Barang</th>
                                <th style={{ textAlign: 'center', padding: '0.5rem', borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>Qty</th>
                                <th style={{ textAlign: 'right', padding: '0.5rem', borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>Harga Jual</th>
                                <th style={{ textAlign: 'right', padding: '0.5rem', borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>Modal (HPP)</th>
                                <th style={{ textAlign: 'right', padding: '0.5rem', borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>Profit</th>
                              </tr>
                            </thead>
                            <tbody>
                              {row.raw.cart.map((item, idx) => {
                                const hargaJual = item.harga_jual || item.harga || 0;
                                const hargaModal = item.harga_modal || item.hpp || item.modal || 0;
                                const untungItem = hargaJual - hargaModal;
                                return (
                                  <tr key={idx}>
                                    <td data-label="Barang" style={{ padding: '0.75rem 0.5rem', borderBottom: '1px solid #f1f5f9', color: '#0f172a', fontWeight: '500' }}>{item.nama_barang}</td>
                                    <td data-label="Qty" style={{ padding: '0.75rem 0.5rem', borderBottom: '1px solid #f1f5f9', textAlign: 'center', color: '#475569' }}>{item.qty || item.quantity || 1}</td>
                                    <td data-label="Harga Jual" style={{ padding: '0.75rem 0.5rem', borderBottom: '1px solid #f1f5f9', textAlign: 'right', color: '#0f172a' }}>{formatCurrency(hargaJual)}</td>
                                    <td data-label="Modal" style={{ padding: '0.75rem 0.5rem', borderBottom: '1px solid #f1f5f9', textAlign: 'right', color: '#475569' }}>{formatCurrency(hargaModal)}</td>
                                    <td data-label="Profit" style={{ padding: '0.75rem 0.5rem', borderBottom: '1px solid #f1f5f9', textAlign: 'right', fontWeight: '600', color: untungItem >= 0 ? '#10b981' : '#ef4444' }}>
                                      {untungItem > 0 ? '+' : ''}{formatCurrency(untungItem)}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )) : (
                <tr>
                  <td colSpan="8" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Belum ada data transaksi</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', borderTop: '1px solid #f1f5f9' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Menampilkan {paginatedData.length} dari {filteredProfitData.length} transaksi
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0', borderRadius: '0.25rem', backgroundColor: '#fff', color: currentPage === 1 ? '#cbd5e1' : '#64748b', cursor: currentPage === 1 ? 'default' : 'pointer' }}
              >&lt;</button>
              <button style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #1d4ed8', borderRadius: '0.25rem', backgroundColor: '#1d4ed8', color: '#fff', fontWeight: 'bold', cursor: 'default' }}>
                {currentPage}
              </button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0', borderRadius: '0.25rem', backgroundColor: '#fff', color: (currentPage === totalPages || totalPages === 0) ? '#cbd5e1' : '#64748b', cursor: (currentPage === totalPages || totalPages === 0) ? 'default' : 'pointer' }}
              >&gt;</button>
            </div>
            <select 
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              style={{ padding: '0.25rem 0.5rem', border: '1px solid #e2e8f0', borderRadius: '0.25rem', fontSize: '0.75rem', color: '#475569', outline: 'none' }}
            >
              <option value={10}>10 / halaman</option>
              <option value={20}>20 / halaman</option>
              <option value={50}>50 / halaman</option>
            </select>
          </div>
        </div>
      </div>
      
      {selectedTransaction && (
        <NotaPreview 
          transaction={selectedTransaction} 
          onClose={() => setSelectedTransaction(null)} 
        />
      )}
    </div>
  );
};

export default LaporanKeuntungan;
