import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import ExportButtons from './ExportButtons';
import { Package, AlertOctagon, AlertTriangle } from 'lucide-react';
import styles from './LaporanPage.module.css';

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
  const getStatusStyle = (status) => {
    switch(status) {
      case 'Habis': return { bg: '#fee2e2', color: '#dc2626' };
      case 'Menipis': return { bg: '#ffedd5', color: '#ea580c' };
      case 'Aman': return { bg: '#dcfce7', color: '#16a34a' };
      default: return { bg: '#f1f5f9', color: '#64748b' };
    }
  };
  return (
    <div>
      <div className={styles.tableToolbar} style={{ marginBottom: '1.5rem', border: 'none', padding: 0 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: '600', margin: 0, color: '#0f172a' }}>Laporan Stok Barang</h3>
        <ExportButtons 
          data={stockData} 
          columns={['Nama Barang', 'Barcode', 'Kategori', 'Stok', 'Satuan', 'Status']}
          filename="Laporan_Stok"
        />
      </div>

      <div className={styles.grid3}>
        <div style={{ padding: '1.25rem', backgroundColor: '#fff', borderRadius: '0.75rem', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <div style={{ width: '48px', height: '48px', backgroundColor: '#eff6ff', color: '#3b82f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Package size={24} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Total Produk</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a' }}>{summary.totalProduk}</div>
          </div>
        </div>

        <div style={{ padding: '1.25rem', backgroundColor: '#fff', borderRadius: '0.75rem', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <div style={{ width: '48px', height: '48px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <AlertOctagon size={24} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Produk Stok Habis (0)</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a' }}>{summary.stokHabis}</div>
          </div>
        </div>

        <div style={{ padding: '1.25rem', backgroundColor: '#fff', borderRadius: '0.75rem', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <div style={{ width: '48px', height: '48px', backgroundColor: '#ffedd5', color: '#ea580c', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <AlertTriangle size={24} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Produk Menipis (&le;{summary.threshold || 10})</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a' }}>{summary.stokMenipis}</div>
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '1rem', fontWeight: '600', color: '#64748b', fontSize: '0.75rem' }}>Nama Barang</th>
                <th style={{ padding: '1rem', fontWeight: '600', color: '#64748b', fontSize: '0.75rem' }}>Barcode</th>
                <th style={{ padding: '1rem', fontWeight: '600', color: '#64748b', fontSize: '0.75rem' }}>Kategori</th>
                <th style={{ padding: '1rem', fontWeight: '600', color: '#64748b', fontSize: '0.75rem', textAlign: 'center' }}>Stok</th>
                <th style={{ padding: '1rem', fontWeight: '600', color: '#64748b', fontSize: '0.75rem', textAlign: 'center' }}>Satuan</th>
                <th style={{ padding: '1rem', fontWeight: '600', color: '#64748b', fontSize: '0.75rem', textAlign: 'center' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {stockData.length > 0 ? stockData.map((row, i) => {
                const statusStyle = getStatusStyle(row.status);
                return (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 150ms ease' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td style={{ padding: '0.75rem 1rem', color: '#0f172a', fontWeight: '500' }}>{row.nama_barang}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#475569' }}>{row.barcode || row.id}</td>
                    <td style={{ padding: '0.75rem 1rem', color: '#475569' }}>{row.kategori}</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#0f172a', fontWeight: '500' }}>{row.stok}</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center', color: '#475569' }}>{row.satuan}</td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      <span style={{ 
                        backgroundColor: statusStyle.bg, 
                        color: statusStyle.color,
                        padding: '0.25rem 0.625rem',
                        borderRadius: '9999px',
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
                  <td colSpan="6" style={{ padding: '2rem 1rem', textAlign: 'center', color: '#64748b' }}>Belum ada data stok</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LaporanStok;
