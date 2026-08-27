import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, Filter, X, ChevronDown, Check } from 'lucide-react';
import LaporanPenjualanMobile from './LaporanPenjualanMobile';
import LaporanStokMobile from './LaporanStokMobile';
import LaporanPiutang from './LaporanPiutang';
import LaporanKeuntungan from './LaporanKeuntungan';

const tabs = [
  { id: 'penjualan', label: 'Penjualan' },
  { id: 'stok', label: 'Stok Barang' },
  { id: 'piutang', label: 'Piutang' },
  { id: 'keuntungan', label: 'Keuntungan' }
];

export default function LaporanPageMobile() {
  const [activeTab, setActiveTab] = useState('penjualan');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [showFilterSheet, setShowFilterSheet] = useState(false);

  const setPreset = (preset) => {
    let start = new Date();
    let end = new Date();
    if (preset === 'hari_ini') {
      // keep today
    } else if (preset === '7_hari') {
      start.setDate(end.getDate() - 6);
    } else if (preset === 'bulan_ini') {
      start = new Date(end.getFullYear(), end.getMonth(), 1);
    } else if (preset === 'bulan_lalu') {
      start = new Date(end.getFullYear(), end.getMonth() - 1, 1);
      end = new Date(end.getFullYear(), end.getMonth(), 0);
    } else if (preset === 'semua') {
      setDateRange({ startDate: '', endDate: '' });
      setShowFilterSheet(false);
      return;
    }
    
    // Convert local time to YYYY-MM-DD safely
    const formatDate = (d) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };
    
    setDateRange({ startDate: formatDate(start), endDate: formatDate(end) });
    setShowFilterSheet(false);
  };

  return (
    <div className="flutter-page" style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '90px', fontFamily: '"Inter", sans-serif' }}>
      
      {/* Sticky Header */}
      <div style={{ position: 'sticky', top: 0, zIndex: 40, backgroundColor: '#fff', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        
        {/* Title Bar */}
        <div style={{ padding: '1.25rem 1rem 0.5rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem 0' }}>Laporan Bisnis</h1>
            <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>Ringkasan performa hari ini</p>
          </div>
          
          {(activeTab === 'penjualan' || activeTab === 'keuntungan') && (
            <button 
              onClick={() => setShowFilterSheet(true)}
              className="flutter-ripple"
              style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 0.75rem', borderRadius: '2rem', backgroundColor: (dateRange.startDate || dateRange.endDate) ? '#eff6ff' : '#f1f5f9', border: 'none', color: (dateRange.startDate || dateRange.endDate) ? '#1d4ed8' : '#475569', fontSize: '0.8125rem', fontWeight: 700 }}
            >
              <Calendar size={14} />
              {(dateRange.startDate || dateRange.endDate) ? 'Filter Aktif' : 'Semua Waktu'}
              <ChevronDown size={14} />
            </button>
          )}
        </div>

        {/* Scrollable Tabs */}
        <div style={{ padding: '0.5rem 1rem 0.75rem 1rem', display: 'flex', gap: '0.5rem', overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: '1rem' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              className="flutter-ripple"
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '0.625rem 1.25rem',
                borderRadius: '2rem',
                backgroundColor: activeTab === tab.id ? '#0f172a' : '#f1f5f9',
                color: activeTab === tab.id ? '#fff' : '#64748b',
                border: 'none',
                fontSize: '0.875rem',
                fontWeight: activeTab === tab.id ? 700 : 600,
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
                boxShadow: activeTab === tab.id ? '0 4px 6px -1px rgba(15, 23, 42, 0.2)' : 'none'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div style={{ padding: '1rem' }}>
        {activeTab === 'penjualan' && <LaporanPenjualanMobile dateRange={dateRange} />}
        {activeTab === 'stok' && <LaporanStokMobile />}
        {activeTab === 'piutang' && <div style={{ overflowX: 'auto', backgroundColor: '#fff', borderRadius: '1rem', padding: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}><LaporanPiutang /></div>}
        {activeTab === 'keuntungan' && <div style={{ overflowX: 'auto', backgroundColor: '#fff', borderRadius: '1rem', padding: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}><LaporanKeuntungan dateRange={dateRange} /></div>}
      </div>

      {/* Date Filter Bottom Sheet */}
      {showFilterSheet && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <div className="flutter-fade" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)' }} onClick={() => setShowFilterSheet(false)} />
          <div className="flutter-sheet" style={{ backgroundColor: '#fff', borderTopLeftRadius: '1.5rem', borderTopRightRadius: '1.5rem', padding: '1.5rem', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 99999 }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>Pilih Periode</h2>
              <button onClick={() => setShowFilterSheet(false)} style={{ background: 'none', border: 'none', color: '#64748b' }}><X size={24} /></button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <button onClick={() => setPreset('hari_ini')} style={{ padding: '0.5rem 1rem', borderRadius: '2rem', border: '1px solid #cbd5e1', backgroundColor: '#fff', fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>Hari Ini</button>
              <button onClick={() => setPreset('7_hari')} style={{ padding: '0.5rem 1rem', borderRadius: '2rem', border: '1px solid #cbd5e1', backgroundColor: '#fff', fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>7 Hari Terakhir</button>
              <button onClick={() => setPreset('bulan_ini')} style={{ padding: '0.5rem 1rem', borderRadius: '2rem', border: '1px solid #cbd5e1', backgroundColor: '#fff', fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>Bulan Ini</button>
              <button onClick={() => setPreset('bulan_lalu')} style={{ padding: '0.5rem 1rem', borderRadius: '2rem', border: '1px solid #cbd5e1', backgroundColor: '#fff', fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>Bulan Lalu</button>
              <button onClick={() => setPreset('semua')} style={{ padding: '0.5rem 1rem', borderRadius: '2rem', border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>Semua Waktu</button>
            </div>

            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.75rem' }}>Atau Pilih Manual</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Dari Tanggal</label>
                <input 
                  type="date" 
                  value={dateRange.startDate} 
                  onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                  style={{ width: '100%', padding: '1rem', borderRadius: '1rem', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontSize: '0.9375rem', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Sampai Tanggal</label>
                <input 
                  type="date" 
                  value={dateRange.endDate} 
                  onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                  style={{ width: '100%', padding: '1rem', borderRadius: '1rem', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontSize: '0.9375rem', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button 
                onClick={() => { setDateRange({startDate: '', endDate: ''}); setShowFilterSheet(false); }}
                style={{ flex: 1, padding: '1rem', borderRadius: '1rem', backgroundColor: '#fee2e2', border: 'none', color: '#ef4444', fontWeight: 700, fontSize: '0.9375rem' }}
              >
                Reset
              </button>
              <button 
                onClick={() => setShowFilterSheet(false)}
                className="flutter-ripple"
                style={{ flex: 2, padding: '1rem', borderRadius: '1rem', backgroundColor: '#1d4ed8', border: 'none', color: '#fff', fontWeight: 700, fontSize: '0.9375rem' }}
              >
                Terapkan Filter
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
