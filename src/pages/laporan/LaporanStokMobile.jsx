import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Box, FileText } from 'lucide-react';
import ExportButtons from './ExportButtons';

const LaporanStokMobile = () => {
  const [stockData, setStockData] = useState([]);
  const [summary, setSummary] = useState({
    totalProduk: 0,
    stokAman: 0,
    stokMenipis: 0,
    stokHabis: 0,
    threshold: 10
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubProducts;
    
    const unsubSettings = onSnapshot(doc(db, 'settings', 'store_config'), (docSnap) => {
      const threshold = docSnap.exists() && docSnap.data().stokMenipisThreshold 
        ? Number(docSnap.data().stokMenipisThreshold) 
        : 10;
      
      unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
        let totalProduk = 0;
        let stokAman = 0;
        let stokMenipis = 0;
        let stokHabis = 0;
        const data = [];

        snapshot.forEach(doc => {
          const product = doc.data();
          let status = 'Aman';
          if (product.stok === 0) status = 'Habis';
          else if (product.stok <= threshold) status = 'Menipis';
          
          data.push({ ...product, id: doc.id, status });
          
          totalProduk += 1;
          
          if (product.stok === 0) {
            stokHabis += 1;
          } else if (product.stok <= threshold) {
            stokMenipis += 1;
          } else {
            stokAman += 1;
          }
        });

        // Simple sorting: Habis > Menipis > Aman
        data.sort((a, b) => {
           const order = { 'Habis': 0, 'Menipis': 1, 'Aman': 2 };
           if (order[a.status] !== order[b.status]) return order[a.status] - order[b.status];
           return (a.stok || 0) - (b.stok || 0);
        });

        setStockData(data);
        setSummary({ totalProduk, stokAman, stokMenipis, stokHabis, threshold });
        setLoading(false);
      });
    });

    return () => {
      unsubSettings();
      if (unsubProducts) unsubProducts();
    };
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
        <div className="animate-spin" style={{ width: '24px', height: '24px', border: '2px solid #e2e8f0', borderTopColor: '#0f172a', borderRadius: '50%' }} />
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '2rem' }}>
      
      {/* Header & Export */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
         <h3 style={{ fontSize: '1.125rem', fontWeight: '600', margin: 0, color: '#0f172a' }}>Laporan Stok</h3>
         <div style={{ transform: 'scale(0.85)', transformOrigin: 'right center' }}>
           <ExportButtons 
             data={stockData} 
             columns={['Nama Barang', 'Barcode', 'Kategori', 'Stok', 'Satuan', 'Status']}
             filename="Laporan_Stok_Mobile"
           />
         </div>
      </div>

      {/* Elegant Minimalist Summary Card */}
      <div style={{ backgroundColor: '#fff', borderRadius: '1rem', border: '1px solid #e2e8f0', padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '1rem', color: '#64748b', fontWeight: 500 }}>Total Inventaris</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
             <span style={{ fontSize: '2.5rem', fontWeight: 700, color: '#0f172a', lineHeight: 1 }}>{summary.totalProduk}</span>
             <span style={{ fontSize: '1rem', color: '#94a3b8' }}>item</span>
          </div>
        </div>
        
        <div style={{ height: '1px', backgroundColor: '#f1f5f9' }} />
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', textAlign: 'center' }}>
          <div>
             <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }}/> Aman
             </div>
             <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#0f172a' }}>{summary.stokAman}</div>
          </div>
          <div style={{ borderLeft: '1px solid #f1f5f9', borderRight: '1px solid #f1f5f9' }}>
             <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#f59e0b' }}/> Menipis
             </div>
             <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#0f172a' }}>{summary.stokMenipis}</div>
          </div>
          <div>
             <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ef4444' }}/> Habis
             </div>
             <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#0f172a' }}>{summary.stokHabis}</div>
          </div>
        </div>
      </div>

      {/* 4-Column Minimalist Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
        {stockData.length > 0 ? (
          stockData.map((item, idx) => {
            const isHabis = item.status === 'Habis';
            const isMenipis = item.status === 'Menipis';
            const dotColor = isHabis ? '#ef4444' : isMenipis ? '#f59e0b' : '#10b981';

            return (
              <div key={idx} style={{ 
                backgroundColor: '#fff', 
                borderRadius: '1rem', 
                padding: '0.75rem', 
                border: '1px solid #e2e8f0',
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}>
                {/* Responsive Image Container */}
                <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', marginBottom: '0.75rem', borderRadius: '0.5rem', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {item.foto ? (
                    <img src={item.foto} alt={item.nama_barang} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <Box size={24} color="#cbd5e1" />
                  )}
                  {/* Minimalist Status Dot with border */}
                  <div style={{ position: 'absolute', top: '6px', right: '6px', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: dotColor, border: '2px solid #fff' }} />
                </div>

                {/* Name */}
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', textAlign: 'center', width: '100%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '0.35rem' }}>
                  {item.nama_barang}
                </div>

                {/* Stock Number */}
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', lineHeight: 1 }}>
                  {item.stok}
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ gridColumn: '1 / -1', padding: '3rem 1rem', textAlign: 'center' }}>
            <FileText size={32} color="#cbd5e1" style={{ margin: '0 auto 1rem' }} />
            <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Belum ada data stok</div>
          </div>
        )}
      </div>

    </div>
  );
};

export default LaporanStokMobile;
