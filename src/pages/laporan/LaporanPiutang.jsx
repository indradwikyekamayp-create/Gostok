import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import ExportButtons from './ExportButtons';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric'
  }).format(date);
};

const LaporanPiutang = () => {
  const [piutangData, setPiutangData] = useState([]);
  const [summary, setSummary] = useState({
    totalPiutang: 0,
    jumlahPelanggan: 0
  });

  useEffect(() => {
    // Assuming we fetch from transactions where payment is BON and not Lunas
    const unsub = onSnapshot(collection(db, 'transactions'), (snapshot) => {
      let totalPiutang = 0;
      const customersMap = {};

      snapshot.forEach(doc => {
        const data = doc.data();
        const pm = (data.paymentMethod || data.metodePembayaran || '').toLowerCase();
        const isHutang = pm === 'bon' || pm === 'kredit' || pm === 'hutang';
        const isLunas = data.paymentStatus === 'lunas' || data.statusPembayaran === 'lunas';
        
        if (isHutang && !isLunas) {
          const hutang = data.sisaHutang !== undefined ? data.sisaHutang : (data.grandTotal || 0);
          totalPiutang += hutang;
          
          const custName = data.customer?.nama_perusahaan || data.customer?.nama_pic || data.customer?.nama || data.namaPelanggan || data.customerName || 'Pelanggan Umum';
          const dateStr = data.tanggal ? (data.tanggal.toDate ? data.tanggal.toDate().toISOString() : data.tanggal) : '';

          if (!customersMap[custName]) {
            customersMap[custName] = {
              nama: custName,
              jumlahNota: 0,
              totalHutang: 0,
              notaTertua: dateStr
            };
          }
          
          customersMap[custName].jumlahNota += 1;
          customersMap[custName].totalHutang += hutang;
          
          if (dateStr && (!customersMap[custName].notaTertua || new Date(dateStr) < new Date(customersMap[custName].notaTertua))) {
            customersMap[custName].notaTertua = dateStr;
          }
        }
      });

      const dataArr = Object.values(customersMap).sort((a, b) => b.totalHutang - a.totalHutang);

      setPiutangData(dataArr);
      setSummary({
        totalPiutang,
        jumlahPelanggan: dataArr.length
      });
    });

    return () => unsub();
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.125rem', margin: 0, color: 'var(--color-text, #333)' }}>Laporan Piutang Pelanggan</h3>
        <ExportButtons 
          data={piutangData} 
          columns={['Nama Pelanggan', 'Jumlah Nota Belum Lunas', 'Total Hutang', 'Nota Tertua']}
          filename="Laporan_Piutang"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ padding: '1.25rem', backgroundColor: 'var(--color-surface, #fff)', borderRadius: 'var(--radius-lg, 0.5rem)', border: '1px solid var(--color-border-light, #eee)', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary, #666)', marginBottom: '0.25rem' }}>Total Piutang Berjalan</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-danger-hover, hsl(0, 70%, 40%))' }}>{formatCurrency(summary.totalPiutang)}</div>
        </div>
        <div style={{ padding: '1.25rem', backgroundColor: 'var(--color-surface, #fff)', borderRadius: 'var(--radius-lg, 0.5rem)', border: '1px solid var(--color-border-light, #eee)', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary, #666)', marginBottom: '0.25rem' }}>Pelanggan dengan Hutang</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-warning-hover, hsl(38, 92%, 40%))' }}>{summary.jumlahPelanggan} <span style={{fontSize: '0.875rem', fontWeight: 'normal'}}>Orang/Toko</span></div>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr>
              <th style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--color-bg, #f9fafb)', fontWeight: '600', color: 'var(--color-text, #333)', borderBottom: '1px solid var(--color-border-light, #eee)' }}>Nama Pelanggan</th>
              <th style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--color-bg, #f9fafb)', fontWeight: '600', color: 'var(--color-text, #333)', borderBottom: '1px solid var(--color-border-light, #eee)', textAlign: 'center' }}>Jumlah Nota</th>
              <th style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--color-bg, #f9fafb)', fontWeight: '600', color: 'var(--color-text, #333)', borderBottom: '1px solid var(--color-border-light, #eee)' }}>Nota Tertua</th>
              <th style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--color-bg, #f9fafb)', fontWeight: '600', color: 'var(--color-text, #333)', borderBottom: '1px solid var(--color-border-light, #eee)', textAlign: 'right' }}>Total Hutang (Rp)</th>
            </tr>
          </thead>
          <tbody>
            {piutangData.length > 0 ? piutangData.map((row, i) => (
              <tr key={i} style={{ cursor: 'pointer', transition: 'background-color 150ms ease' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary-50, #f5f8ff)'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--color-border-light, #eee)', fontWeight: '500', color: 'var(--color-primary, hsl(215, 50%, 30%))' }}>{row.nama}</td>
                <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--color-border-light, #eee)', textAlign: 'center' }}>
                  <span style={{ backgroundColor: 'var(--color-bg, #f0f0f0)', padding: '0.125rem 0.5rem', borderRadius: 'var(--radius-full, 0.75rem)', fontSize: '0.75rem', fontWeight: 'bold'}}>{row.jumlahNota}</span>
                </td>
                <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--color-border-light, #eee)' }}>{formatDate(row.notaTertua)}</td>
                <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--color-border-light, #eee)', textAlign: 'right', fontWeight: 'bold', color: 'var(--color-danger-hover, hsl(0, 70%, 40%))' }}>
                  {formatCurrency(row.totalHutang)}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="4" style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--color-border-light, #eee)', textAlign: 'center' }}>Belum ada data piutang</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LaporanPiutang;
