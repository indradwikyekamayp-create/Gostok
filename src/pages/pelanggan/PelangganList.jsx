import React from 'react';
import styles from './PelangganPage.module.css'; // Will reuse some styles or have its own

export default function PelangganList({ customers, onSelect, loading }) {
  if (loading) {
    return <div>Memuat data pelanggan...</div>;
  }

  if (!customers || customers.length === 0) {
    return <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Tidak ada pelanggan ditemukan.</div>;
  }

  const formatRp = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
  };

  const getDebtBadge = (amount) => {
    if (amount === 0) {
      return <span style={{ backgroundColor: 'hsl(145, 55%, 42%)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>Tidak ada hutang</span>;
    } else if (amount > 10000000) {
      return <span style={{ backgroundColor: 'hsl(0, 70%, 50%)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>Hutang menumpuk</span>;
    } else {
      return <span style={{ backgroundColor: 'hsl(38, 92%, 50%)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>Cicilan berjalan</span>;
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
      {customers.map((c) => (
        <div 
          key={c.id} 
          onClick={() => onSelect(c)}
          style={{
            border: '1px solid #eaeaea',
            borderRadius: '8px',
            padding: '16px',
            cursor: 'pointer',
            transition: 'box-shadow 0.2s',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            backgroundColor: 'white'
          }}
          onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
          onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
        >
          <div>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', color: 'hsl(215, 50%, 30%)' }}>{c.nama_perusahaan}</h3>
            <span style={{ fontSize: '12px', color: '#666', backgroundColor: '#f0f0f0', padding: '2px 6px', borderRadius: '4px' }}>{c.jenis_pelanggan}</span>
          </div>
          
          <div style={{ color: '#555', fontSize: '14px' }}>
            <p style={{ margin: '4px 0' }}><strong>PIC:</strong> {c.nama_pic}</p>
            <p style={{ margin: '4px 0' }}><strong>No. HP:</strong> {c.no_hp}</p>
          </div>
          
          <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>Total Hutang:</p>
              <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>{formatRp(c.total_hutang_berjalan)}</p>
            </div>
            <div>
              {getDebtBadge(c.total_hutang_berjalan)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
