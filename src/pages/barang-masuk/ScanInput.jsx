import React, { useState, useRef, useEffect } from 'react';
import { Search, ScanLine, Keyboard, CheckCircle2, AlertTriangle, Plus, Minus, Info, Save } from 'lucide-react';
import styles from './ScanInput.module.css';

// Mock DB
const MOCK_DB = {
  '8999999999999': { barcode: '8999999999999', nama_barang: 'Indomie Goreng', satuan: 'pcs', stok: 240, img: '/placeholder.jpg' },
  '8998888888888': { barcode: '8998888888888', nama_barang: 'Minyak Bimoli 2L', satuan: 'pcs', stok: 85, img: null }
};

const ScanInput = ({ onScan, onNewProduct }) => {
  const [mode, setMode] = useState('scan'); // 'scan' | 'manual'
  const [inputVal, setInputVal] = useState('');
  
  // Status state
  const [scannedProduct, setScannedProduct] = useState(null);
  const [notFoundBarcode, setNotFoundBarcode] = useState(null);
  
  // Form states for existing product
  const [qty, setQty] = useState(1);
  
  // Form states for new product
  const [newProductName, setNewProductName] = useState('');
  const [newProductUnit, setNewProductUnit] = useState('pcs');
  const [newProductQty, setNewProductQty] = useState(1);
  
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [mode]);

  const handleSearch = (e) => {
    e?.preventDefault();
    if (!inputVal.trim()) return;

    const barcode = inputVal.trim();
    const product = MOCK_DB[barcode];
    
    if (product) {
      setScannedProduct(product);
      setNotFoundBarcode(null);
      setQty(1);
    } else {
      setScannedProduct(null);
      setNotFoundBarcode(barcode);
      setNewProductName('');
      setNewProductUnit('pcs');
      setNewProductQty(1);
    }
  };

  const handleAddExisting = (e) => {
    e.preventDefault();
    if (!qty || isNaN(qty) || Number(qty) <= 0) return;

    onScan({
      ...scannedProduct,
      qty: Number(qty),
      keterangan: '',
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    });

    resetAll();
  };

  const handleAddNew = (e) => {
    e.preventDefault();
    if (!newProductName || !newProductQty) return;

    // Call onNewProduct to register it (mock)
    onNewProduct(notFoundBarcode);

    // Also add it to the scan list
    onScan({
      barcode: notFoundBarcode,
      nama_barang: newProductName,
      satuan: newProductUnit,
      qty: Number(newProductQty),
      keterangan: 'Barang Baru',
      waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    });

    resetAll();
  };

  const resetAll = () => {
    setScannedProduct(null);
    setNotFoundBarcode(null);
    setInputVal('');
    inputRef.current?.focus();
  };

  return (
    <div className={styles.scanWrapper}>
      {/* Top Scan Area */}
      <div className={styles.scanTop}>
        <div className={styles.modeToggleArea}>
          <span className={styles.modeLabel}>Mode Input</span>
          <div className={styles.toggleGroup}>
            <button 
              className={`${styles.toggleBtn} ${mode === 'scan' ? styles.active : ''}`}
              onClick={() => setMode('scan')}
            >
              <ScanLine size={18} />
              Scan Barcode
            </button>
            <button 
              className={`${styles.toggleBtn} ${mode === 'manual' ? styles.active : ''}`}
              onClick={() => setMode('manual')}
            >
              <Keyboard size={18} />
              Input Manual
            </button>
          </div>
        </div>

        <div className={styles.scanInputArea}>
          {mode === 'manual' ? (
            <>
              <form className={styles.scanBarContainer} onSubmit={handleSearch}>
                <ScanLine className={styles.scanIcon} size={20} />
                <input
                  ref={inputRef}
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder="Ketik kode produk secara manual..."
                  className={styles.scanInput}
                />
                <button type="submit" className={styles.cariBtn}>
                  <Search size={18} />
                  Cari
                </button>
              </form>
              <p className={styles.scanHint}>Ketik kode produk atau nama secara manual lalu tekan Cari</p>
            </>
          ) : (
            <div className={styles.scanAnimationBox}>
              <div className={styles.barcodeGraphic}>
                {[1,2,3,4,5,6,7,8,9,10,11,12].map(i => <div key={i} className={styles.bar}></div>)}
                <div className={styles.laser}></div>
              </div>
              <p className={styles.scanText}>Siap Melakukan Scan...</p>
              <p className={styles.scanSubtext}>Arahkan barcode produk ke scanner Anda</p>
              
              <form onSubmit={handleSearch}>
                <input
                  ref={inputRef}
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  className={styles.hiddenInput}
                  autoFocus
                  onBlur={(e) => {
                    // Always try to keep focus if in scan mode so it's ready for hardware scanner
                    if (mode === 'scan') {
                      setTimeout(() => e.target.focus(), 100);
                    }
                  }}
                />
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Conditional Cards Area (Mockup shows them side-by-side but they appear based on state) */}
      {(scannedProduct || notFoundBarcode) && (
        <div className={styles.statusCards}>
          
          {/* Blue Card - Found */}
          {scannedProduct && (
            <div className={`${styles.card} ${styles.cardBlue}`}>
              <div className={styles.cardHeader}>
                <CheckCircle2 size={18} />
                PRODUK DITEMUKAN
              </div>
              <div className={styles.cardBody}>
                <div className={styles.productInfoRow}>
                  {scannedProduct.img ? (
                    <img src={scannedProduct.img} alt={scannedProduct.nama_barang} className={styles.productImage} />
                  ) : (
                    <div className={styles.productImage} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', color: '#999' }}>
                      No Img
                    </div>
                  )}
                  
                  <div className={styles.productDetails}>
                    <div className={styles.productNameRow}>
                      <h3 className={styles.productName}>{scannedProduct.nama_barang}</h3>
                      <span className={styles.badge}>{scannedProduct.satuan}</span>
                    </div>
                    <div className={styles.productMeta}>
                      <span className={styles.metaLabel}>SKU / Barcode</span>
                      <span className={styles.metaValue}>{scannedProduct.barcode}</span>
                      <span className={styles.metaLabel}>Stok saat ini</span>
                      <span className={styles.metaValue}>{scannedProduct.stok} {scannedProduct.satuan}</span>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleAddExisting}>
                  <div className={styles.inputGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Jumlah Masuk</label>
                      <div className={styles.stepper}>
                        <button type="button" className={styles.stepBtn} onClick={() => setQty(Math.max(1, qty - 1))}>
                          <Minus size={16} />
                        </button>
                        <input 
                          type="number" 
                          className={styles.stepInput} 
                          value={qty} 
                          onChange={(e) => setQty(Number(e.target.value))}
                          min="1"
                        />
                        <button type="button" className={styles.stepBtn} onClick={() => setQty(qty + 1)}>
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Satuan</label>
                      <input type="text" className={styles.input} value={scannedProduct.satuan} disabled />
                    </div>
                  </div>
                  
                  <div style={{ marginTop: '1.5rem' }}>
                    <button type="submit" className={styles.btnAddBlue}>
                      <Plus size={18} />
                      Tambahkan ke Daftar
                    </button>
                    <p className={styles.cardHint} style={{ marginTop: '0.75rem' }}>
                      <Info size={14} />
                      Produk akan ditambahkan ke daftar barang masuk
                    </p>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Yellow Card - Not Found */}
          {notFoundBarcode && (
            <div className={`${styles.card} ${styles.cardYellow}`}>
              <div className={styles.cardHeader}>
                <AlertTriangle size={18} />
                PRODUK TIDAK DITEMUKAN
              </div>
              <div className={styles.cardBody}>
                <form onSubmit={handleAddNew}>
                  <div className={styles.formGroup} style={{ marginBottom: '1rem' }}>
                    <label className={styles.label}>Kode Barcode</label>
                    <input type="text" className={styles.input} value={notFoundBarcode} disabled />
                  </div>
                  
                  <div className={styles.formGroup} style={{ marginBottom: '1rem' }}>
                    <label className={styles.label}>Nama Produk</label>
                    <input 
                      type="text" 
                      className={styles.input} 
                      placeholder="Masukkan nama produk" 
                      value={newProductName}
                      onChange={(e) => setNewProductName(e.target.value)}
                      required
                    />
                  </div>

                  <div className={styles.inputGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Satuan</label>
                      <select 
                        className={styles.input}
                        value={newProductUnit}
                        onChange={(e) => setNewProductUnit(e.target.value)}
                      >
                        <option value="pcs">pcs</option>
                        <option value="dus">dus</option>
                        <option value="kg">kg</option>
                      </select>
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Jumlah Masuk</label>
                      <input 
                        type="number" 
                        className={styles.input} 
                        value={newProductQty}
                        onChange={(e) => setNewProductQty(Number(e.target.value))}
                        min="1"
                        required
                      />
                    </div>
                  </div>

                  <div style={{ marginTop: '1.5rem' }}>
                    <button type="submit" className={styles.btnAddYellow}>
                      <Save size={18} />
                      Simpan Produk & Tambahkan
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
          
        </div>
      )}
    </div>
  );
};

export default ScanInput;
