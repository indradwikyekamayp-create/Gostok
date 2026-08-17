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

const LaporanKeuntungan = ({ dateRange }) => {
  const summary = {
    totalOmzet: 150000000,
    totalModal: 120000000,
    totalKeuntungan: 30000000,
    margin: 20
  };

  const profitData = [
    { noNota: 'INV-20260817-001', tanggal: '2026-08-17', omzet: 500000, modal: 400000, keuntungan: 100000, margin: 20 },
    { noNota: 'INV-20260817-002', tanggal: '2026-08-17', omzet: 1500000, modal: 1200000, keuntungan: 300000, margin: 20 },
    { noNota: 'INV-20260816-001', tanggal: '2026-08-16', omzet: 800000, modal: 600000, keuntungan: 200000, margin: 25 },
    { noNota: 'INV-20260815-001', tanggal: '2026-08-15', omzet: 250000, modal: 200000, keuntungan: 50000, margin: 20 },
    { noNota: 'INV-20260815-002', tanggal: '2026-08-15', omzet: 3200000, modal: 2600000, keuntungan: 600000, margin: 18.75 },
  ];

  return (
    <div>
      <div style={{ backgroundColor: '#fff3cd', border: '1px solid #ffeeba', color: '#856404', padding: '12px', borderRadius: '4px', marginBottom: '20px', fontSize: '14px', fontWeight: 'bold' }}>
        ⚠️ AKSES TERBATAS: Data pada halaman ini bersifat rahasia dan hanya boleh diakses oleh Pemilik (Owner).
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Laporan Keuntungan</h2>
        <ExportButtons 
          data={profitData} 
          columns={['No Nota', 'Tanggal', 'Omzet', 'Modal', 'Keuntungan', 'Margin (%)']}
          filename="Laporan_Keuntungan"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' }}>
          <div style={{ fontSize: '14px', color: '#555', marginBottom: '8px' }}>Total Omzet</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>{formatCurrency(summary.totalOmzet)}</div>
        </div>
        <div style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' }}>
          <div style={{ fontSize: '14px', color: '#555', marginBottom: '8px' }}>Total Modal (HPP)</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc3545' }}>{formatCurrency(summary.totalModal)}</div>
        </div>
        <div style={{ padding: '20px', backgroundColor: 'hsl(145, 55%, 95%)', borderRadius: '8px', border: '1px solid hsl(145, 55%, 80%)' }}>
          <div style={{ fontSize: '14px', color: '#555', marginBottom: '8px' }}>Total Keuntungan (Laba Kotor)</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'hsl(145, 55%, 35%)' }}>{formatCurrency(summary.totalKeuntungan)}</div>
        </div>
        <div style={{ padding: '20px', backgroundColor: 'hsl(215, 50%, 95%)', borderRadius: '8px', border: '1px solid hsl(215, 50%, 80%)' }}>
          <div style={{ fontSize: '14px', color: '#555', marginBottom: '8px' }}>Rata-rata Margin</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'hsl(215, 50%, 30%)' }}>{summary.margin}%</div>
        </div>
      </div>

      <div>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f0f0f0', borderBottom: '2px solid #ddd' }}>
              <th style={{ padding: '12px' }}>No Nota</th>
              <th style={{ padding: '12px' }}>Tanggal</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Omzet</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Modal</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Keuntungan</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Margin %</th>
            </tr>
          </thead>
          <tbody>
            {profitData.map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px' }}>{row.noNota}</td>
                <td style={{ padding: '12px' }}>{formatDate(row.tanggal)}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{formatCurrency(row.omzet)}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{formatCurrency(row.modal)}</td>
                <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: row.keuntungan >= 0 ? 'hsl(145, 55%, 35%)' : 'hsl(0, 70%, 40%)' }}>
                  {row.keuntungan > 0 ? '+' : ''}{formatCurrency(row.keuntungan)}
                </td>
                <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: row.margin >= 0 ? 'hsl(145, 55%, 35%)' : 'hsl(0, 70%, 40%)' }}>
                  {row.margin}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LaporanKeuntungan;
