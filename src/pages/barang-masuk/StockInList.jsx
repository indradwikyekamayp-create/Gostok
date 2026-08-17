import React from 'react';

const StockInList = ({ items, onEditQty, onDelete }) => {
  if (items.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
        <p>Belum ada barang masuk hari ini.</p>
        <p>Silakan scan produk di atas untuk memulai.</p>
      </div>
    );
  }

  const totalQty = items.reduce((sum, item) => sum + item.qty, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
              <th style={{ padding: '12px 8px' }}>No</th>
              <th style={{ padding: '12px 8px' }}>Barcode</th>
              <th style={{ padding: '12px 8px' }}>Nama Barang</th>
              <th style={{ padding: '12px 8px' }}>Qty</th>
              <th style={{ padding: '12px 8px' }}>Keterangan</th>
              <th style={{ padding: '12px 8px' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px 8px' }}>{idx + 1}</td>
                <td style={{ padding: '12px 8px', color: '#666', fontFamily: 'monospace' }}>{item.barcode}</td>
                <td style={{ padding: '12px 8px', fontWeight: '500' }}>{item.nama_barang}</td>
                <td style={{ padding: '12px 8px' }}>
                  <input 
                    type="number"
                    value={item.qty}
                    onChange={(e) => onEditQty(idx, Number(e.target.value))}
                    style={{ width: '60px', padding: '4px 8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    min="1"
                  /> <span style={{ fontSize: '12px', color: '#666' }}>{item.satuan}</span>
                </td>
                <td style={{ padding: '12px 8px' }}>{item.keterangan || '-'}</td>
                <td style={{ padding: '12px 8px' }}>
                  <button 
                    onClick={() => {
                      if (window.confirm('Hapus item ini?')) {
                        onDelete(idx);
                      }
                    }}
                    style={{ background: 'none', border: 'none', color: 'hsl(0, 70%, 50%)', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div style={{ padding: '20px', borderTop: '1px solid #eee', backgroundColor: '#f9f9f9', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
        <span>Total Item: {items.length}</span>
        <span>Total Qty: {totalQty}</span>
      </div>
    </div>
  );
};

export default StockInList;
