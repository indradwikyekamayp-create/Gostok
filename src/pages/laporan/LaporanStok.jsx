import React from 'react';
import ExportButtons from './ExportButtons';

const LaporanStok = () => {
  const summary = {
    totalProduk: 450,
    stokHabis: 12,
    stokMenipis: 45
  };

  const stockData = [
    { nama: 'Semen Tiga Roda', barcode: '8991234567890', kategori: 'Material Dasar', stok: 0, satuan: 'Sak', status: 'Habis' },
    { nama: 'Cat Avian 5kg', barcode: '8999876543210', kategori: 'Cat', stok: 3, satuan: 'Kaleng', status: 'Menipis' },
    { nama: 'Paku 5cm', barcode: '8991112223334', kategori: 'Besi & Paku', stok: 5, satuan: 'Kotak', status: 'Menipis' },
    { nama: 'Besi Beton 10mm', barcode: '8994445556667', kategori: 'Material Dasar', stok: 150, satuan: 'Batang', status: 'Aman' },
    { nama: 'Triplek 18mm', barcode: '8997778889990', kategori: 'Kayu', stok: 200, satuan: 'Lembar', status: 'Aman' },
  ];

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Laporan Stok Barang</h2>
        <ExportButtons 
          data={stockData} 
          columns={['Nama Barang', 'Barcode', 'Kategori', 'Stok', 'Satuan', 'Status']}
          filename="Laporan_Stok"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ padding: '20px', backgroundColor: 'hsl(215, 50%, 95%)', borderRadius: '8px', border: '1px solid hsl(215, 50%, 80%)' }}>
          <div style={{ fontSize: '14px', color: '#555', marginBottom: '8px' }}>Total Produk</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'hsl(215, 50%, 30%)' }}>{summary.totalProduk}</div>
        </div>
        <div style={{ padding: '20px', backgroundColor: 'hsl(0, 70%, 95%)', borderRadius: '8px', border: '1px solid hsl(0, 70%, 80%)' }}>
          <div style={{ fontSize: '14px', color: '#555', marginBottom: '8px' }}>Produk Stok Habis (0)</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'hsl(0, 70%, 40%)' }}>{summary.stokHabis}</div>
        </div>
        <div style={{ padding: '20px', backgroundColor: 'hsl(38, 92%, 95%)', borderRadius: '8px', border: '1px solid hsl(38, 92%, 80%)' }}>
          <div style={{ fontSize: '14px', color: '#555', marginBottom: '8px' }}>Produk Menipis (&lt;10)</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'hsl(38, 92%, 40%)' }}>{summary.stokMenipis}</div>
        </div>
      </div>

      <div>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f0f0f0', borderBottom: '2px solid #ddd' }}>
              <th style={{ padding: '12px' }}>Nama Barang</th>
              <th style={{ padding: '12px' }}>Barcode</th>
              <th style={{ padding: '12px' }}>Kategori</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Stok</th>
              <th style={{ padding: '12px' }}>Satuan</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {stockData.map((row, i) => {
              const statusStyle = getStatusColor(row.status);
              return (
                <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}>{row.nama}</td>
                  <td style={{ padding: '12px' }}>{row.barcode}</td>
                  <td style={{ padding: '12px' }}>{row.kategori}</td>
                  <td style={{ padding: '12px', textAlign: 'right', fontWeight: row.stok < 10 ? 'bold' : 'normal', color: row.stok === 0 ? 'hsl(0, 70%, 50%)' : 'inherit' }}>{row.stok}</td>
                  <td style={{ padding: '12px' }}>{row.satuan}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <span style={{ 
                      backgroundColor: statusStyle.bg, 
                      color: statusStyle.color,
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LaporanStok;
