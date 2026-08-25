import React, { useState, useContext, useEffect } from 'react';
import { Trash2, History, AlertTriangle, Plus, Minus, Search, Keyboard } from 'lucide-react';
import { collection, doc, writeBatch, query, where, getDocs, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase';
import { ToastContext } from '../../context/ToastContext';
import styles from './KerugianPage.module.css';
import scanStyles from '../barang-masuk/ScanInput.module.css';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';

const formatRupiah = (value) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value || 0);
};

const KerugianPage = () => {
  const { showToast } = useContext(ToastContext);
  const [items, setItems] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showRiwayat, setShowRiwayat] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [history, setHistory] = useState([]);
  
  // Auto-suggest states
  const [allProducts, setAllProducts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputMode, setInputMode] = useState('scan'); // 'scan' | 'manual'

  // Fetch recent history and all products for suggestions
  useEffect(() => {
    // Fetch products for manual input dropdown
    const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      const data = [];
      snapshot.forEach(d => data.push({ id: d.id, ...d.data() }));
      setAllProducts(data);
    });

    return () => unsubProducts();
  }, []);

  useEffect(() => {
    if (!showRiwayat) return;
    const q = query(collection(db, 'waste_logs'), orderBy('tanggal', 'desc'), limit(50));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = [];
      snapshot.forEach(d => data.push({ id: d.id, ...d.data() }));
      setHistory(data);
    });
    return () => unsub();
  }, [showRiwayat]);

  // Handle typing in search box
  const handleInputChange = (e) => {
    const val = e.target.value;
    setSearchInput(val);
    
    if (val.trim().length > 1) {
      const filtered = allProducts.filter(p => 
        p.nama_barang.toLowerCase().includes(val.toLowerCase()) || 
        p.barcode.includes(val)
      ).slice(0, 5); // show max 5 suggestions
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const addProductToWaste = (product) => {
    setItems(prev => {
      const existing = prev.findIndex(i => i.id === product.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing].qty += 1;
        return updated;
      } else {
        return [{
          ...product,
          qty: 1,
          alasan: 'Expired'
        }, ...prev];
      }
    });
    setSearchInput('');
    setShowSuggestions(false);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchInput.trim()) return;

    // Direct match from state instead of fetching again (faster)
    const product = allProducts.find(p => p.barcode === searchInput.trim() || p.nama_barang.toLowerCase() === searchInput.trim().toLowerCase());
    
    if (product) {
      addProductToWaste(product);
    } else {
      showToast('Produk tidak ditemukan di master data', 'error');
    }
  };

  const handleEditQty = (index, newQty) => {
    const qty = Number(newQty);
    if (qty < 1) return;
    
    setItems(prev => {
      const updated = [...prev];
      if (qty > updated[index].stok) {
        showToast(`Stok maksimal ${updated[index].stok}`, 'warning');
        updated[index].qty = updated[index].stok;
      } else {
        updated[index].qty = qty;
      }
      return updated;
    });
  };

  const handleChangeAlasan = (index, alasan) => {
    setItems(prev => {
      const updated = [...prev];
      updated[index].alasan = alasan;
      return updated;
    });
  };

  const handleDelete = (index) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveKerugian = async () => {
    if (items.length === 0) return;
    setIsSaving(true);
    
    try {
      const batch = writeBatch(db);
      
      let totalLoss = 0;
      
      for (const item of items) {
        // Calculate loss based on HPP (harga_modal). If not available, use harga_jual as fallback
        const modal = item.harga_modal > 0 ? item.harga_modal : item.harga_jual;
        totalLoss += modal * item.qty;

        // Reduce stock
        const prodRef = doc(db, 'products', item.id);
        const newStock = Math.max(0, (item.stok || 0) - item.qty);
        batch.update(prodRef, { stok: newStock });
      }

      // Record waste log
      const wasteEntry = {
        tanggal: new Date().toISOString(),
        total_items: items.reduce((sum, item) => sum + item.qty, 0),
        total_kerugian: totalLoss,
        items: items.map(i => ({
          id: i.id,
          nama_barang: i.nama_barang,
          qty: i.qty,
          alasan: i.alasan,
          modal_satuan: i.harga_modal > 0 ? i.harga_modal : i.harga_jual
        }))
      };
      
      const wasteRef = doc(collection(db, 'waste_logs'));
      batch.set(wasteRef, wasteEntry);
      
      await batch.commit();
      showToast('Barang rusak/expired berhasil dicatat!', 'success');
      setItems([]);
    } catch (err) {
      console.error(err);
      showToast('Gagal menyimpan data: ' + err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Trash2 size={24} color="#ef4444" />
            <h1 style={{ margin: 0 }}>Barang Keluar (Kerugian)</h1>
          </div>
          <p className={styles.subtitle}>Catat barang expired atau rusak untuk penyesuaian stok</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.btnSecondary} onClick={() => setShowRiwayat(true)}>
            <History size={18} /> Riwayat Pembuangan
          </button>
          <button 
            className={styles.btnPrimary} 
            disabled={items.length === 0 || isSaving}
            onClick={handleSaveKerugian}
            style={{ backgroundColor: items.length > 0 ? '#ef4444' : '#94a3b8', borderColor: items.length > 0 ? '#ef4444' : '#94a3b8' }}
          >
            <Trash2 size={18} />
            {isSaving ? 'Menyimpan...' : 'Simpan Pembuangan'}
          </button>
        </div>
      </header>

      <div className={styles.contentArea}>
        {/* Left Side: Scan / Input */}
        <section className={styles.scanSection}>
          
          <div className={scanStyles.scanTop} style={{ marginBottom: '1.5rem' }}>
            <div className={scanStyles.modeToggleArea}>
              <span className={scanStyles.modeLabel}>Mode Scanner</span>
              <div className={scanStyles.toggleGroup}>
                <button 
                  className={`${scanStyles.toggleBtn} ${inputMode === 'scan' ? scanStyles.active : ''}`}
                  onClick={() => setInputMode('scan')}
                >
                  <Search size={18} />
                  Mode Scanner
                </button>
                <button 
                  className={`${scanStyles.toggleBtn} ${inputMode === 'manual' ? scanStyles.active : ''}`}
                  onClick={() => setInputMode('manual')}
                >
                  <Keyboard size={18} />
                  Input Manual
                </button>
              </div>
            </div>

            <div className={scanStyles.scanInputArea}>
              {inputMode === 'manual' ? (
                <div style={{ position: 'relative' }}>
                  <form className={scanStyles.scanBarContainer} onSubmit={handleSearch}>
                    <Search className={scanStyles.scanIcon} size={20} />
                    <input
                      type="text"
                      autoFocus
                      placeholder="Ketik nama produk atau barcode..."
                      value={searchInput}
                      onChange={handleInputChange}
                      className={scanStyles.scanInput}
                    />
                    <button type="submit" className={scanStyles.cariBtn}>
                      Cari
                    </button>
                  </form>
                  <p className={scanStyles.scanHint} style={{ marginTop: '0.5rem' }}>Ketik kode produk atau nama secara manual lalu tekan Cari</p>
                  
                  {/* Auto-suggest dropdown */}
                  {showSuggestions && suggestions.length > 0 && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px', backgroundColor: 'white', border: '1px solid #cbd5e1', borderRadius: '0.375rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', zIndex: 10, overflow: 'hidden' }}>
                      {suggestions.map(s => (
                        <div 
                          key={s.id}
                          onClick={() => addProductToWaste(s)}
                          style={{ padding: '0.75rem 1rem', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between' }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                        >
                          <span style={{ fontWeight: 500, color: '#0f172a' }}>{s.nama_barang}</span>
                          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Stok: {s.stok}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className={scanStyles.scanAnimationBox}>
                  <div className={scanStyles.barcodeGraphic}>
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(i => <div key={i} className={scanStyles.bar}></div>)}
                    <div className={scanStyles.laser}></div>
                  </div>
                  <p className={scanStyles.scanText}>Siap Melakukan Scan...</p>
                  <p className={scanStyles.scanSubtext}>Arahkan barcode produk ke scanner Anda</p>
                  
                  <form onSubmit={handleSearch}>
                    <input
                      type="text"
                      value={searchInput}
                      onChange={handleInputChange}
                      className={scanStyles.hiddenInput}
                      autoFocus
                      onBlur={(e) => {
                        if (inputMode === 'scan') {
                          setTimeout(() => e.target.focus(), 100);
                        }
                      }}
                    />
                  </form>
                </div>
              )}
            </div>
          </div>

          <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#fff7ed', borderRadius: '0.5rem', border: '1px solid #fed7aa' }}>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <AlertTriangle size={18} color="#ea580c" />
              <strong style={{ color: '#9a3412', fontSize: '0.875rem' }}>Peringatan</strong>
            </div>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#9a3412', lineHeight: 1.5 }}>
              Data yang disimpan akan <strong>mengurangi stok</strong> secara permanen dan tercatat sebagai kerugian di pembukuan Anda.
            </p>
          </div>
        </section>

        {/* Right Side: List & Summary */}
        <section className={styles.listSection} style={{ padding: '1.5rem', overflowY: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600' }}>Daftar Barang Keluar</h2>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.875rem', color: '#64748b', display: 'block' }}>Total Item: {items.reduce((s, i) => s + i.qty, 0)}</span>
              <strong style={{ color: '#ef4444' }}>Kerugian: {formatRupiah(items.reduce((s, i) => s + (i.qty * (i.harga_modal || i.harga_jual)), 0))}</strong>
            </div>
          </div>
          
          {items.length === 0 ? (
            <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#94a3b8' }}>
              <Trash2 size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
              <h4 style={{ fontSize: '1rem', margin: 0 }}>Belum ada daftar barang</h4>
              <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Gunakan panel di sebelah kiri untuk mencari produk.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {items.map((item, index) => (
                <div key={item.id + index} style={{ display: 'flex', alignItems: 'center', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', backgroundColor: '#f8fafc' }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 0.25rem', color: '#0f172a', fontSize: '1rem' }}>{item.nama_barang}</h4>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Barcode: {item.barcode} | Sisa Stok Sistem: {item.stok}</p>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <select 
                      value={item.alasan}
                      onChange={(e) => handleChangeAlasan(index, e.target.value)}
                      style={{ padding: '0.5rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1', fontSize: '0.875rem', backgroundColor: 'white' }}
                    >
                      <option value="Expired">Expired</option>
                      <option value="Rusak">Rusak</option>
                    </select>
                    
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '0.375rem', overflow: 'hidden', backgroundColor: 'white' }}>
                      <button onClick={() => handleEditQty(index, item.qty - 1)} style={{ padding: '0.5rem', background: '#f8fafc', border: 'none', borderRight: '1px solid #cbd5e1', cursor: 'pointer' }}><Minus size={14} /></button>
                      <input 
                        type="number" 
                        value={item.qty}
                        onChange={(e) => handleEditQty(index, e.target.value)}
                        style={{ width: '50px', textAlign: 'center', border: 'none', padding: '0.5rem 0', outline: 'none', fontWeight: '600' }}
                      />
                      <button onClick={() => handleEditQty(index, item.qty + 1)} style={{ padding: '0.5rem', background: '#f8fafc', border: 'none', borderLeft: '1px solid #cbd5e1', cursor: 'pointer' }}><Plus size={14} /></button>
                    </div>
                    
                    <button onClick={() => handleDelete(index)} style={{ padding: '0.5rem', color: '#ef4444', background: '#fee2e2', borderRadius: '0.375rem', border: 'none', cursor: 'pointer' }}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Riwayat Modal */}
      {showRiwayat && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', width: '100%', maxWidth: '800px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Riwayat Kerugian / Buang Barang</h2>
              <button onClick={() => setShowRiwayat(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' }}>Tutup</button>
            </div>
            
            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
              {history.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#64748b' }}>Belum ada riwayat kerugian.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {history.map(h => (
                    <div key={h.id} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', borderBottom: '1px dashed #cbd5e1', paddingBottom: '0.75rem' }}>
                        <span style={{ fontWeight: 600 }}>{new Date(h.tanggal).toLocaleString('id-ID')}</span>
                        <span style={{ color: '#ef4444', fontWeight: 600 }}>Total Rugi: {formatRupiah(h.total_kerugian)}</span>
                      </div>
                      <table style={{ width: '100%', fontSize: '0.875rem' }}>
                        <thead>
                          <tr style={{ color: '#64748b', textAlign: 'left' }}>
                            <th style={{ paddingBottom: '0.5rem' }}>Barang</th>
                            <th style={{ paddingBottom: '0.5rem' }}>Alasan</th>
                            <th style={{ paddingBottom: '0.5rem', textAlign: 'right' }}>Qty</th>
                          </tr>
                        </thead>
                        <tbody>
                          {h.items?.map((it, idx) => (
                            <tr key={idx}>
                              <td style={{ paddingTop: '0.25rem' }}>{it.nama_barang}</td>
                              <td style={{ paddingTop: '0.25rem' }}>
                                <span style={{ padding: '0.125rem 0.375rem', backgroundColor: it.alasan === 'Expired' ? '#fef08a' : '#fecaca', borderRadius: '4px', fontSize: '0.75rem' }}>
                                  {it.alasan}
                                </span>
                              </td>
                              <td style={{ paddingTop: '0.25rem', textAlign: 'right' }}>{it.qty}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KerugianPage;
