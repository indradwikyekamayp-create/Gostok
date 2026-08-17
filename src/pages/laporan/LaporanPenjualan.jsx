import React from 'react';
import ExportButtons from './ExportButtons';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

const LaporanPenjualan = ({ dateRange }) => {
  // Mock Data
  const summary = {
    totalPenjualan: 45500000,
    jumlahTransaksi: 120,
    rataRata: 379166
  };

  const salesData = [
    { tanggal: '2026-08-10', total: 5000000 },
    { tanggal: '2026-08-11', total: 6200000 },
    { tanggal: '2026-08-12', total: 4800000 },
    { tanggal: '2026-08-13', total: 7500000 },
    { tanggal: '2026-08-14', total: 8100000 },
    { tanggal: '2026-08-15', total: 6900000 },
    { tanggal: '2026-08-16', total: 7000000 }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Ringkasan Penjualan</h2>
        <ExportButtons 
          data={salesData} 
          columns={['Tanggal', 'Total Penjualan']}
          filename="Laporan_Penjualan"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ padding: '20px', backgroundColor: 'hsl(215, 50%, 95%)', borderRadius: '8px', border: '1px solid hsl(215, 50%, 80%)' }}>
          <div style={{ fontSize: '14px', color: '#555', marginBottom: '8px' }}>Total Penjualan</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'hsl(215, 50%, 30%)' }}>{formatCurrency(summary.totalPenjualan)}</div>
        </div>
        <div style={{ padding: '20px', backgroundColor: 'hsl(145, 55%, 95%)', borderRadius: '8px', border: '1px solid hsl(145, 55%, 80%)' }}>
          <div style={{ fontSize: '14px', color: '#555', marginBottom: '8px' }}>Jumlah Transaksi</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'hsl(145, 55%, 35%)' }}>{summary.jumlahTransaksi}</div>
        </div>
        <div style={{ padding: '20px', backgroundColor: 'hsl(38, 92%, 95%)', borderRadius: '8px', border: '1px solid hsl(38, 92%, 80%)' }}>
          <div style={{ fontSize: '14px', color: '#555', marginBottom: '8px' }}>Rata-rata per Transaksi</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'hsl(38, 92%, 40%)' }}>{formatCurrency(summary.rataRata)}</div>
        </div>
      </div>

      <div>
        <h3>Grafik Penjualan Harian</h3>
        {/* Placeholder for Recharts Bar Chart */}
        <div style={{ height: '300px', backgroundColor: '#f9f9f9', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #ccc', borderRadius: '8px', marginBottom: '30px' }}>
          [ Bar Chart Visualization Placeholder ]
        </div>
      </div>

      <div>
        <h3>Daftar Transaksi</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f0f0f0', borderBottom: '2px solid #ddd' }}>
              <th style={{ padding: '12px' }}>Tanggal</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Total Penjualan</th>
            </tr>
          </thead>
          <tbody>
            {salesData.map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px' }}>{row.tanggal}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{formatCurrency(row.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LaporanPenjualan;
