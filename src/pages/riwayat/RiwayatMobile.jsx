import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Search, ChevronDown, CheckCircle, Clock, SearchX, X, Filter, ArrowRight, CheckCircle2 } from 'lucide-react';
import NotaPreview from '../transaksi-jual/NotaPreview';

const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'decimal',
    minimumFractionDigits: 0,
  }).format(number);
};

export default function RiwayatMobile({ 
  transactions, 
  loading, 
  filters, 
  onFilterChange,
  storeName 
}) {
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [searchInput, setSearchInput] = useState(filters.customer || '');

  // We map the desktop filters 'status' to simple tabs
  const activeTab = filters.status;
  const tabs = ['Semua', 'Lunas', 'Belum Lunas'];

  const handleTabClick = (status) => {
    onFilterChange({ ...filters, status });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onFilterChange({ ...filters, customer: searchInput, product: searchInput });
  };

  return (
    <>
      <div className="flutter-page" style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '90px', fontFamily: '"Inter", sans-serif' }}>
        
        {/* Sticky Header */}
        <div style={{ position: 'sticky', top: 0, zIndex: 30, backgroundColor: '#fff', padding: '1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem 0' }}>Riwayat Transaksi</h1>
          <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '0 0 1rem 0' }}>{storeName}</p>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} style={{ position: 'relative', marginBottom: '1rem' }}>
            <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text"
              placeholder="Cari nota, pelanggan, atau produk..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{ width: '100%', padding: '0.875rem 1rem 0.875rem 2.75rem', borderRadius: '1rem', border: '1px solid #cbd5e1', fontSize: '0.9375rem', outline: 'none', backgroundColor: '#f8fafc' }}
            />
            {searchInput && (
              <button type="button" onClick={() => { setSearchInput(''); onFilterChange({...filters, customer: '', product: ''}); }} style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', padding: '0.5rem' }}>
                <X size={16} />
              </button>
            )}
          </form>

          {/* Quick Filter Tabs & Advanced Filter Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', paddingTop: '0.25rem', scrollbarWidth: 'none' }}>
            <button 
              className="flutter-ripple"
              onClick={() => setShowFilterSheet(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.5rem 0.75rem', borderRadius: '2rem', border: '1px solid #cbd5e1', backgroundColor: '#fff', color: '#475569', fontSize: '0.875rem', fontWeight: 600, flexShrink: 0 }}
            >
              <Filter size={14} /> Filter
              {(filters.startDate || filters.endDate) && (
                 <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#3b82f6', marginLeft: '2px' }} />
              )}
            </button>
            
            <div style={{ width: '1px', height: '24px', backgroundColor: '#e2e8f0', margin: '0 0.25rem', flexShrink: 0 }} />

            {tabs.map(tab => (
              <button 
                key={tab}
                className="flutter-ripple"
                onClick={() => handleTabClick(tab)}
                style={{ 
                  padding: '0.5rem 1rem', 
                  borderRadius: '2rem', 
                  border: activeTab === tab ? 'none' : '1px solid #cbd5e1', 
                  backgroundColor: activeTab === tab ? '#1d4ed8' : '#f8fafc', 
                  color: activeTab === tab ? '#fff' : '#64748b', 
                  fontSize: '0.875rem', 
                  fontWeight: activeTab === tab ? 700 : 600,
                  flexShrink: 0,
                  transition: 'all 0.2s'
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Transaction List */}
        <div style={{ padding: '1rem' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Memuat riwayat...</div>
          ) : transactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#94a3b8' }}>
              <SearchX size={48} opacity={0.2} style={{ margin: '0 auto 1rem auto' }} />
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#475569' }}>Tidak ada transaksi</div>
              <div style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>Coba ubah filter pencarian Anda.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {transactions.map(trx => (
                <div 
                  key={trx.id} 
                  className="flutter-ripple"
                  onClick={() => setSelectedTransaction(trx.raw)}
                  style={{ backgroundColor: '#fff', borderRadius: '1rem', padding: '1.25rem', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1rem' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: trx.status_bayar === 'lunas' ? '#dcfce7' : '#fef08a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {trx.status_bayar === 'lunas' ? <CheckCircle2 size={20} color="#16a34a" /> : <Clock size={20} color="#ca8a04" />}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#0f172a' }}>{trx.no_nota}</div>
                        <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '0.125rem' }}>{trx.pelanggan.nama}</div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.125rem' }}>{new Date(trx.tanggal).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1rem', fontWeight: 800, color: trx.status_bayar === 'lunas' ? '#16a34a' : '#ea580c' }}>
                        Rp {formatRupiah(trx.total_bayar)}
                      </div>
                      <div style={{ display: 'inline-block', padding: '0.25rem 0.5rem', borderRadius: '0.5rem', backgroundColor: trx.status_bayar === 'lunas' ? '#dcfce7' : '#fef08a', color: trx.status_bayar === 'lunas' ? '#16a34a' : '#ca8a04', fontSize: '0.7rem', fontWeight: 800, marginTop: '0.375rem' }}>
                        {trx.status_bayar === 'lunas' ? 'LUNAS' : 'BON / HUTANG'}
                      </div>
                    </div>
                  </div>
                  
                  {trx.items && trx.items.length > 0 && (
                    <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '0.8125rem', color: '#475569' }}>
                        <span style={{ fontWeight: 700, color: '#0f172a' }}>{trx.items.length} Macam Barang</span> ({trx.items.reduce((acc, item) => acc + (item.qty || 0), 0)} Total Qty)
                      </div>
                      <ArrowRight size={14} color="#94a3b8" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Advanced Filter Bottom Sheet */}
      {showFilterSheet && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <div className="flutter-fade" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)' }} onClick={() => setShowFilterSheet(false)} />
          <div className="flutter-sheet" style={{ backgroundColor: '#fff', borderTopLeftRadius: '1.5rem', borderTopRightRadius: '1.5rem', padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 99999 }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>Filter Riwayat</h2>
              <button onClick={() => setShowFilterSheet(false)} style={{ background: 'none', border: 'none', color: '#64748b' }}><X size={24} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Tanggal Mulai</label>
                <input 
                  type="date" 
                  value={filters.startDate}
                  onChange={(e) => onFilterChange({ ...filters, startDate: e.target.value })}
                  style={{ width: '100%', padding: '0.875rem', borderRadius: '0.75rem', border: '1px solid #cbd5e1', fontSize: '0.9375rem', outline: 'none' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Tanggal Akhir</label>
                <input 
                  type="date" 
                  value={filters.endDate}
                  onChange={(e) => onFilterChange({ ...filters, endDate: e.target.value })}
                  style={{ width: '100%', padding: '0.875rem', borderRadius: '0.75rem', border: '1px solid #cbd5e1', fontSize: '0.9375rem', outline: 'none' }} 
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                 onClick={() => {
                   onFilterChange({ ...filters, startDate: '', endDate: '' });
                   setShowFilterSheet(false);
                 }}
                 style={{ flex: 1, padding: '1rem', borderRadius: '1rem', backgroundColor: '#fff', border: '1px solid #cbd5e1', color: '#475569', fontWeight: 700, fontSize: '0.9375rem' }}
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

      {/* Reusing existing NotaPreview component */}
      {selectedTransaction && (
        <NotaPreview 
          transaction={selectedTransaction} 
          onClose={() => setSelectedTransaction(null)} 
        />
      )}
    </>
  );
}
