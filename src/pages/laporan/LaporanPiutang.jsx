import React from 'react';
import ExportButtons from './ExportButtons';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric'
  }).format(date);
};

const LaporanPiutang = () => {
  const summary = {
    totalPiutang: 125000000,
    jumlahPelanggan: 18
  };

  const piutangData = [
    { nama: 'Toko Abadi', jumlahNota: 5, totalHutang: 45000000, notaTertua: '2026-06-15' },
    { nama: 'Toko Sinar Makmur', jumlahNota: 3, totalHutang: 32000000, notaTertua: '2026-07-20' },
    { nama: 'Budi Santoso', jumlahNota: 2, totalHutang: 15000000, notaTertua: '2026-08-01' },
    { nama: 'Toko Maju Jaya', jumlahNota: 1, totalHutang: 5000000, notaTertua: '2026-08-10' },
    { nama: 'Andi M.', jumlahNota: 1, totalHutang: 3000000, notaTertua: '2026-08-15' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Laporan Piutang Pelanggan</h2>
        <ExportButtons 
          data={piutangData} 
          columns={['Nama Pelanggan', 'Jumlah Nota Belum Lunas', 'Total Hutang', 'Nota Tertua']}
          filename="Laporan_Piutang"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ padding: '20px', backgroundColor: 'hsl(0, 70%, 95%)', borderRadius: '8px', border: '1px solid hsl(0, 70%, 80%)' }}>
          <div style={{ fontSize: '14px', color: '#555', marginBottom: '8px' }}>Total Piutang Berjalan</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'hsl(0, 70%, 40%)' }}>{formatCurrency(summary.totalPiutang)}</div>
        </div>
        <div style={{ padding: '20px', backgroundColor: 'hsl(38, 92%, 95%)', borderRadius: '8px', border: '1px solid hsl(38, 92%, 80%)' }}>
          <div style={{ fontSize: '14px', color: '#555', marginBottom: '8px' }}>Pelanggan dengan Hutang</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'hsl(38, 92%, 40%)' }}>{summary.jumlahPelanggan} <span style={{fontSize: '16px', fontWeight: 'normal'}}>Orang/Toko</span></div>
        </div>
      </div>

      <div>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f0f0f0', borderBottom: '2px solid #ddd' }}>
              <th style={{ padding: '12px' }}>Nama Pelanggan</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Jumlah Nota</th>
              <th style={{ padding: '12px' }}>Nota Tertua</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Total Hutang (Rp)</th>
            </tr>
          </thead>
          <tbody>
            {piutangData.map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #eee', cursor: 'pointer' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                <td style={{ padding: '12px', fontWeight: '500', color: 'hsl(215, 50%, 30%)' }}>{row.nama}</td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  <span style={{ backgroundColor: '#eee', padding: '2px 8px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold'}}>{row.jumlahNota}</span>
                </td>
                <td style={{ padding: '12px' }}>{formatDate(row.notaTertua)}</td>
                <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: 'hsl(0, 70%, 40%)' }}>
                  {formatCurrency(row.totalHutang)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LaporanPiutang;
