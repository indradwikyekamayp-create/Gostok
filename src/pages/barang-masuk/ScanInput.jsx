import React, { useState, useRef, useEffect } from 'react';
import styles from './BarangMasukPage.module.css';

// Mock DB
const MOCK_DB = {
  '1234567890': { barcode: '1234567890', nama_barang: 'Kopi Kapal Api', satuan: 'pcs' },
  '0987654321': { barcode: '0987654321', nama_barang: 'Biskuit Roma', satuan: 'dus' }
};

const ScanInput = ({ onScan, onNewProduct }) => {
  const [inputVal, setInputVal] = useState('');
  const [scannedProduct, setScannedProduct] = useState(null);
  const [qty, setQty] = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  const inputRef = useRef(null);
  const qtyRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleScan = (e) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const product = MOCK_DB[inputVal.trim()];
    if (product) {
      setScannedProduct(product);
      setErrorMsg('');
      setTimeout(() => qtyRef.current?.focus(), 10);
    } else {
      setErrorMsg('Produk baru terdeteksi!');
      // optional: let user register it
    }
  };

  const handleQtySubmit = (e) => {
    e.preventDefault();
    if (!qty || isNaN(qty) || Number(qty) <= 0) return;

    onScan({
      ...scannedProduct,
      qty: Number(qty),
      keterangan,
      waktu: new Date().toISOString()
    });

    // Reset flow
    setScannedProduct(null);
    setInputVal('');
    setQty('');
    setKeterangan('');
    setErrorMsg('');
    inputRef.current?.focus();
  };

  return (
    <div>
      {!scannedProduct ? (
        <form onSubmit={handleScan} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Scan Barcode..."
            style={{ padding: '16px', fontSize: '20px', flex: 1, borderRadius: '8px', border: '1px solid #ccc' }}
            autoFocus
          />
          <button type="submit" style={{ padding: '16px 24px', fontSize: '18px', backgroundColor: 'hsl(215, 50%, 30%)', color: 'white', border: 'none', borderRadius: '8px' }}>
            Cari
          </button>
        </form>
      ) : (
        <form onSubmit={handleQtySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '8px' }}>
            <h3 style={{ margin: '0 0 10px 0' }}>{scannedProduct.nama_barang}</h3>
            <p style={{ margin: 0, color: '#666' }}>Barcode: {scannedProduct.barcode}</p>
          </div>
          
          <div style={{ display: 'flex', gap: '15px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Qty Masuk ({scannedProduct.satuan})</label>
              <input
                ref={qtyRef}
                type="number"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                style={{ width: '100%', padding: '12px', fontSize: '18px', borderRadius: '6px', border: '1px solid #ccc' }}
                required
                min="1"
              />
            </div>
            <div style={{ flex: 2 }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Keterangan (opsional)</label>
              <input
                type="text"
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                placeholder="Batch / No. Container"
                style={{ width: '100%', padding: '12px', fontSize: '18px', borderRadius: '6px', border: '1px solid #ccc' }}
              />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="submit" style={{ flex: 1, padding: '16px', fontSize: '18px', backgroundColor: 'hsl(145, 55%, 42%)', color: 'white', border: 'none', borderRadius: '8px' }}>
              Simpan Stok Masuk
            </button>
            <button type="button" onClick={() => {
              setScannedProduct(null);
              setInputVal('');
              setTimeout(() => inputRef.current?.focus(), 10);
            }} style={{ padding: '16px', fontSize: '18px', backgroundColor: '#ccc', border: 'none', borderRadius: '8px' }}>
              Batal
            </button>
          </div>
        </form>
      )}

      {errorMsg && (
        <div style={{ marginTop: '15px', padding: '15px', backgroundColor: 'hsl(38, 92%, 50%)', color: 'white', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{errorMsg}</span>
          <button onClick={() => onNewProduct(inputVal)} style={{ padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>+ Tambah Produk</button>
        </div>
      )}
    </div>
  );
};

export default ScanInput;
