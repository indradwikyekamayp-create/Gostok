import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import ExportButtons from './ExportButtons';

const LaporanStok = () => {
  const [stockData, setStockData] = useState([]);
  const [summary, setSummary] = useState({
    totalProduk: 0,
    stokHabis: 0,
    stokMenipis: 0,
    totalNilaiStok: 0
  });

  useEffect(() => {
    import('firebase/firestore').then(({ doc, onSnapshot: onSnap }) => {
      // First fetch settings
      const unsubSettings = onSnap(doc(db, 'settings', 'store_config'), (docSnap) => {
        const threshold = docSnap.exists() && docSnap.data().stokMenipisThreshold 
          ? Number(docSnap.data().stokMenipisThreshold) 
          : 10;
        
        // Then listen to products with the current threshold
        const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
          let totalProduk = 0;
          let stokAman = 0;
          let stokMenipis = 0;
          let stokHabis = 0;
          let totalNilaiStok = 0;
          const data = [];

          snapshot.forEach(doc => {
            const product = doc.data();
            let status = 'Aman';
            if (product.stok === 0) status = 'Habis';
            else if (product.stok <= threshold) status = 'Menipis';
            
            data.push({ ...product, id: doc.id, status });
            
            totalProduk += 1;
            totalNilaiStok += (product.stok || 0) * (product.harga_modal || 0);
            
            if (product.stok === 0) {
              stokHabis += 1;
            } else if (product.stok <= threshold) {
              stokMenipis += 1;
            } else {
              stokAman += 1;
            }
          });

          setStockData(data);
          setSummary({ totalProduk, stokAman, stokMenipis, stokHabis, totalNilaiStok, threshold });
        });
      });
      return () => unsubSettings();
    });
  }, []);
  const getStatusColor = (status) => {
    switch(status) {
      case 'Habis': return { bg: 'hsl(0, 70%, 90%)', color: 'hsl(0, 70%, 40%)' };
      case 'Menipis': return { bg: 'hsl(38, 92%, 90%)', color: 'hsl(38, 92%, 40%)' };
      case 'Aman': return { bg: 'hsl(145, 55%, 90%)', color: 'hsl(145, 55%, 35%)' };
      default: return { bg: '#eee', color: '#333' };
    }
  };
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.125rem', margin: 0, color: 'var(--color-text, #333)' }}>Laporan Stok Barang</h3>
        <ExportButtons 
          data={stockData} 
          columns={['Nama Barang', 'Barcode', 'Kategori', 'Stok', 'Satuan', 'Status']}
          filename="Laporan_Stok"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ padding: '1.25rem', backgroundColor: 'var(--color-surface, #fff)', borderRadius: 'var(--radius-lg, 0.5rem)', border: '1px solid var(--color-border-light, #eee)', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary, #666)', marginBottom: '0.25rem' }}>Total Produk</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--color-primary, hsl(215, 50%, 30%))' }}>{summary.totalProduk}</div>
        </div>
        <div style={{ padding: '1.25rem', backgroundColor: 'var(--color-surface, #fff)', borderRadius: 'var(--radius-lg, 0.5rem)', border: '1px solid var(--color-border-light, #eee)', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary, #666)', marginBottom: '0.25rem' }}>Produk Stok Habis (0)</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--color-danger-hover, hsl(0, 70%, 40%))' }}>{summary.stokHabis}</div>
        </div>
        <div style={{ padding: '1.25rem', backgroundColor: 'var(--color-surface, #fff)', borderRadius: 'var(--radius-lg, 0.5rem)', border: '1px solid var(--color-border-light, #eee)', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary, #666)', marginBottom: '0.25rem' }}>Produk Menipis (&le;{summary.threshold || 10})</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--color-warning-hover, hsl(38, 92%, 40%))' }}>{summary.stokMenipis}</div>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr>
              <th style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--color-bg, #f9fafb)', fontWeight: '600', color: 'var(--color-text, #333)', borderBottom: '1px solid var(--color-border-light, #eee)' }}>Nama Barang</th>
              <th style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--color-bg, #f9fafb)', fontWeight: '600', color: 'var(--color-text, #333)', borderBottom: '1px solid var(--color-border-light, #eee)' }}>Barcode</th>
              <th style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--color-bg, #f9fafb)', fontWeight: '600', color: 'var(--color-text, #333)', borderBottom: '1px solid var(--color-border-light, #eee)' }}>Kategori</th>
              <th style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--color-bg, #f9fafb)', fontWeight: '600', color: 'var(--color-text, #333)', borderBottom: '1px solid var(--color-border-light, #eee)', textAlign: 'right' }}>Stok</th>
              <th style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--color-bg, #f9fafb)', fontWeight: '600', color: 'var(--color-text, #333)', borderBottom: '1px solid var(--color-border-light, #eee)' }}>Satuan</th>
              <th style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--color-bg, #f9fafb)', fontWeight: '600', color: 'var(--color-text, #333)', borderBottom: '1px solid var(--color-border-light, #eee)', textAlign: 'center' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {stockData.length > 0 ? stockData.map((row, i) => {
              const statusStyle = getStatusColor(row.status);
              return (
                <tr key={i} style={{ transition: 'background-color 150ms ease' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary-50, #f5f8ff)'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--color-border-light, #eee)' }}>{row.nama_barang}</td>
                  <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--color-border-light, #eee)' }}>{row.barcode || row.id}</td>
                  <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--color-border-light, #eee)' }}>{row.kategori}</td>
                  <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--color-border-light, #eee)', textAlign: 'right', fontWeight: row.stok < 10 ? 'bold' : 'normal', color: row.stok === 0 ? 'var(--color-danger-hover, hsl(0, 70%, 40%))' : 'inherit' }}>{row.stok}</td>
                  <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--color-border-light, #eee)' }}>{row.satuan}</td>
                  <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--color-border-light, #eee)', textAlign: 'center' }}>
                    <span style={{ 
                      backgroundColor: statusStyle.bg, 
                      color: statusStyle.color,
                      padding: '0.25rem 0.5rem',
                      borderRadius: 'var(--radius-full, 0.75rem)',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      display: 'inline-block'
                    }}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan="6" style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--color-border-light, #eee)', textAlign: 'center' }}>Belum ada data stok</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LaporanStok;
