import React, { useState, useRef, useEffect, useContext } from 'react';
import { Search, ScanLine, Keyboard, CheckCircle2, AlertTriangle, Plus, Minus, Info, Save } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { ToastContext } from '../../context/ToastContext';
import styles from './ScanInput.module.css';

const ScanInput = ({ onScan, onNewProduct }) => {
  const { showToast } = useContext(ToastContext);
  const [mode, setMode] = useState('scan'); // 'scan' | 'manual'
  const [inputVal, setInputVal] = useState('');
  
  // Status state
  const [scannedProduct, setScannedProduct] = useState(null);
  const [notFoundBarcode, setNotFoundBarcode] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  
  // Form states for existing product
  const [qty, setQty] = useState(1);
  const [selectedUnit, setSelectedUnit] = useState(''); // 'dasar' or 'besar'
  
  // Form states for new product
  const [newProductName, setNewProductName] = useState('');
  const [newProductUnit, setNewProductUnit] = useState('pcs');
  const [newProductQty, setNewProductQty] = useState(1);
  
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [mode]);

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!inputVal.trim()) return;

    const barcode = inputVal.trim();
    setIsSearching(true);
    
    try {
      const q = query(collection(db, 'products'), where('barcode', '==', barcode));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const product = { ...querySnapshot.docs[0].data(), id: querySnapshot.docs[0].id };
        setScannedProduct(product);
        setNotFoundBarcode(null);
        setQty(1);
        setSelectedUnit(product.has_multi_satuan ? 'besar' : 'dasar');
      } else {
        setScannedProduct(null);
        setNotFoundBarcode(barcode);
        setNewProductName('');
        setNewProductUnit('pcs');
        setNewProductQty(1);
      }
    } catch (err) {
      console.error(err);
      showToast('Terjadi kesalahan saat mencari produk', 'error');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddExisting = (e) => {
    e.preventDefault();
    if (!qty || isNaN(qty) || Number(qty) <= 0) return;

    // Hitung konversi jika memilih satuan besar
    let finalQty = Number(qty);
    let finalUnit = scannedProduct.satuan;
    let keterangan = '';

    if (scannedProduct.has_multi_satuan && selectedUnit === 'besar') {
      finalQty = Number(qty) * scannedProduct.konversi;
      keterangan = `(Masuk: ${qty} ${scannedProduct.satuan_besar})`;
    }

    onScan({
      ...scannedProduct,
      qty: finalQty,
      keterangan: keterangan,
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
                    // BUT only if we are not currently interacting with a result card
                    if (mode === 'scan' && !scannedProduct && !notFoundBarcode) {
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
                      <label className={styles.label}>Satuan Masuk</label>
                      {scannedProduct.has_multi_satuan ? (
                        <select 
                          className={styles.input} 
                          value={selectedUnit} 
                          onChange={(e) => setSelectedUnit(e.target.value)}
                        >
                          <option value="besar">{scannedProduct.satuan_besar} (1 = {scannedProduct.konversi} {scannedProduct.satuan})</option>
                          <option value="dasar">{scannedProduct.satuan} (Eceran)</option>
                        </select>
                      ) : (
                        <input type="text" className={styles.input} value={scannedProduct.satuan} disabled />
                      )}
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Jumlah</label>
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
                  </div>
                  
                  <div style={{ marginTop: '1.5rem' }}>
                    <button type="submit" className={styles.btnAddBlue}>
                      <Plus size={18} />
                      Tambahkan ke Daftar
                    </button>
                    {scannedProduct.has_multi_satuan && selectedUnit === 'besar' ? (
                      <p className={styles.cardHint} style={{ marginTop: '0.75rem', color: 'hsl(215, 50%, 30%)', fontWeight: '500' }}>
                        <Info size={14} />
                        Sistem otomatis menambahkan {qty * scannedProduct.konversi} {scannedProduct.satuan} ke stok gudang.
                      </p>
                    ) : (
                      <p className={styles.cardHint} style={{ marginTop: '0.75rem' }}>
                        <Info size={14} />
                        Produk akan ditambahkan ke daftar barang masuk
                      </p>
                    )}
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
                      <label className={styles.label}>Satuan (Dasar)</label>
                      <select 
                        className={styles.input}
                        value={newProductUnit}
                        onChange={(e) => setNewProductUnit(e.target.value)}
                      >
                        <option value="pcs">pcs</option>
                        <option value="dus">dus</option>
                        <option value="kg">kg</option>
                        <option value="liter">liter</option>
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
                    <p className={styles.cardHint} style={{ marginTop: '0.75rem' }}>
                      *Untuk setting konversi Dus, bisa dilakukan di Master Produk nanti.
                    </p>
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
