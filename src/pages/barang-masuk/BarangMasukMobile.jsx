import React, { useState, useEffect, useContext, useMemo } from 'react';
import { collection, onSnapshot, doc, writeBatch, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { ToastContext } from '../../context/ToastContext';
import { AuthContext } from '../../context/AuthContext';
import { Search, ScanBarcode, Plus, Minus, PackagePlus, X, Info, Package, Save, CheckCircle2, AlertTriangle } from 'lucide-react';
import MobileScanner from '../../components/common/MobileScanner';
import { useNavigate } from 'react-router-dom';

export default function BarangMasukMobile() {
  const { showToast } = useContext(ToastContext);
  const { user, userData } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([]); // Daftar barang yang akan di-restock
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Sheet states
  const [showProductSheet, setShowProductSheet] = useState(false);
  const [activeProduct, setActiveProduct] = useState(null); // Produk yang sedang di-edit qty-nya (bisa produk existing atau baru)
  const [inputQty, setInputQty] = useState(1);
  const [inputUnit, setInputUnit] = useState('dasar'); // 'dasar' atau 'besar'
  
  // State for new product
  const [isNewProduct, setIsNewProduct] = useState(false);
  const [newBarcode, setNewBarcode] = useState('');
  const [newName, setNewName] = useState('');
  const [newUnit, setNewUnit] = useState('pcs');

  useEffect(() => {
    const prodRef = collection(db, 'products');
    const unsubProd = onSnapshot(prodRef, (snapshot) => {
      const data = [];
      snapshot.forEach(doc => data.push({ ...doc.data(), id: doc.id }));
      setProducts(data);
    });
    return () => unsubProd();
  }, []);

  const filteredProducts = useMemo(() => {
    if (!searchQuery) return [];
    return products.filter(p => 
      p.nama_barang?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.barcode?.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 10);
  }, [products, searchQuery]);

  const handleScanSuccess = async (decodedText) => {
    setShowScanner(false);
    
    // Cari apakah barcode ada di master produk
    const product = products.find(p => p.barcode === decodedText || p.kode_barang === decodedText);
    
    if (product) {
      // Buka sheet untuk atur jumlah masuk
      setActiveProduct(product);
      setIsNewProduct(false);
      setInputQty(1);
      setInputUnit(product.has_multi_satuan ? 'besar' : 'dasar');
      setShowProductSheet(true);
    } else {
      // Produk tidak ditemukan -> mode tambah produk baru
      setActiveProduct(null);
      setIsNewProduct(true);
      setNewBarcode(decodedText);
      setNewName('');
      setNewUnit('pcs');
      setInputQty(1);
      setShowProductSheet(true);
      showToast(`Barcode ${decodedText} belum terdaftar. Silakan input nama barang.`, 'info');
    }
  };

  const handleManualSearch = (product) => {
    setActiveProduct(product);
    setIsNewProduct(false);
    setInputQty(1);
    setInputUnit(product.has_multi_satuan ? 'besar' : 'dasar');
    setShowProductSheet(true);
    setSearchQuery('');
  };

  const handleConfirmItem = () => {
    if (isNewProduct) {
      if (!newName.trim() || inputQty <= 0) {
        showToast('Nama barang dan jumlah harus diisi dengan benar', 'warning');
        return;
      }
      const newItem = {
        barcode: newBarcode,
        nama_barang: newName,
        satuan: newUnit,
        qty: Number(inputQty),
        keterangan: 'Barang Baru',
        isNew: true
      };
      setItems(prev => [newItem, ...prev]);
      showToast(`${newName} ditambahkan ke daftar masuk`, 'success');
    } else {
      if (inputQty <= 0) return;
      
      let finalQty = Number(inputQty);
      let keterangan = '';
      
      if (activeProduct.has_multi_satuan && inputUnit === 'besar') {
        finalQty = Number(inputQty) * activeProduct.konversi;
        keterangan = `(Masuk: ${inputQty} ${activeProduct.satuan_besar})`;
      }

      const existingIndex = items.findIndex(i => i.id === activeProduct.id && !i.isNew);
      if (existingIndex >= 0) {
        // Update
        const updated = [...items];
        updated[existingIndex].qty += finalQty;
        if (keterangan) updated[existingIndex].keterangan = `(Diupdate +${keterangan})`;
        setItems(updated);
      } else {
        // Add new to list
        setItems(prev => [{
          ...activeProduct,
          qty: finalQty,
          keterangan: keterangan
        }, ...prev]);
      }
      showToast(`${activeProduct.nama_barang} ditambahkan ke daftar masuk`, 'success');
    }
    
    setShowProductSheet(false);
  };

  const handleRemoveItem = (index) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveStockIn = async () => {
    if (items.length === 0) return;
    setIsSaving(true);
    
    try {
      const batch = writeBatch(db);
      
      const stockInEntry = {
        tanggal: new Date().toISOString(),
        total_items: items.reduce((sum, item) => sum + item.qty, 0),
        items: items.map(item => ({
           id: item.id || null,
           barcode: item.barcode || '',
           nama_barang: item.nama_barang,
           qty: item.qty,
           satuan: item.satuan,
           keterangan: item.keterangan || '',
           isNew: item.isNew || false
        })),
        kasir: {
          uid: user?.uid || 'unknown',
          nama: userData?.nama || user?.email || 'Admin',
        }
      };
      
      const stockInRef = doc(collection(db, 'stock_ins'));
      batch.set(stockInRef, stockInEntry);
      
      // Update existing products / create new products
      for (const item of items) {
        if (item.isNew) {
          // Buat produk baru
          const newProdRef = doc(collection(db, 'products'));
          batch.set(newProdRef, {
            nama_barang: item.nama_barang,
            barcode: item.barcode,
            satuan: item.satuan,
            stok: item.qty, // Stok awal
            harga_modal: 0,
            harga_jual: 0,
            has_multi_satuan: false,
            createdAt: new Date().toISOString()
          });
        } else if (item.id) {
          // Update stok produk existing
          const prodRef = doc(db, 'products', item.id);
          const currentStock = products.find(p => p.id === item.id)?.stok || 0;
          batch.update(prodRef, {
            stok: currentStock + item.qty,
            lastStockIn: new Date().toISOString()
          });
        }
      }
      
      await batch.commit();
      showToast('Barang Masuk berhasil disimpan & stok bertambah!', 'success');
      setItems([]);
      navigate('/dashboard'); // Kembali ke dashboard setelah sukses
    } catch (err) {
      console.error(err);
      showToast('Gagal menyimpan barang masuk', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="flutter-page" style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '90px', fontFamily: '"Inter", sans-serif' }}>
        
        {/* Top Navbar & Search */}
        <div style={{ backgroundColor: '#fff', padding: '1rem', position: 'sticky', top: 0, zIndex: 30, borderBottom: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
             <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Barang Masuk</h2>
             <button 
                onClick={() => navigate(-1)} 
                style={{ background: 'none', border: 'none', color: '#64748b', display: 'flex', alignItems: 'center', fontSize: '0.875rem' }}
             >
               <X size={20} /> Batal
             </button>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={18} color="#64748b" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                placeholder="Cari / Input Barcode..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: '1rem', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '0.875rem', outline: 'none' }}
              />
            </div>
            <button 
              className="flutter-ripple" 
              onClick={() => setShowScanner(true)}
              style={{ width: '48px', height: '48px', borderRadius: '1rem', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}
            >
              <ScanBarcode size={24} />
            </button>
          </div>
          
          {/* Hasil Pencarian Manual */}
          {searchQuery && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#fff', borderRadius: '0 0 1rem 1rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', zIndex: 40, maxHeight: '300px', overflowY: 'auto' }}>
              {filteredProducts.map(product => (
                <div 
                  key={product.id} 
                  onClick={() => handleManualSearch(product)}
                  style={{ display: 'flex', padding: '1rem', borderBottom: '1px solid #f1f5f9', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}
                >
                  <div style={{ width: '40px', height: '40px', borderRadius: '0.5rem', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     <Package size={20} color="#64748b" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: '#1e293b' }}>{product.nama_barang}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Stok: {product.stok} {product.satuan} • {product.barcode}</div>
                  </div>
                </div>
              ))}
              {filteredProducts.length === 0 && (
                <div 
                  onClick={() => handleScanSuccess(searchQuery)}
                  style={{ display: 'flex', padding: '1rem', alignItems: 'center', gap: '1rem', cursor: 'pointer', backgroundColor: '#fef2f2' }}
                >
                  <div style={{ width: '40px', height: '40px', borderRadius: '0.5rem', backgroundColor: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                     <Plus size={20} color="#ef4444" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: '#b91c1c' }}>Tambah sebagai produk baru</div>
                    <div style={{ fontSize: '0.75rem', color: '#ef4444' }}>Barcode: {searchQuery}</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Daftar Barang Masuk */}
        <div style={{ padding: '1rem' }}>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#64748b', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Daftar Masuk ({items.length} Item)
          </h3>
          
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
              <PackagePlus size={48} color="#cbd5e1" style={{ margin: '0 auto 1rem' }} />
              <p style={{ margin: 0, fontWeight: 500 }}>Belum ada barang</p>
              <p style={{ margin: '0.5rem 0 0', fontSize: '0.875rem' }}>Scan barcode atau ketik nama barang untuk menambahkan ke daftar ini.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {items.map((item, index) => (
                <div key={index} style={{ backgroundColor: '#fff', borderRadius: '1rem', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: item.isNew ? '1px solid #bbf7d0' : '1px solid #f1f5f9' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                       <span style={{ fontWeight: 600, color: '#1e293b' }}>{item.nama_barang}</span>
                       {item.isNew && <span style={{ fontSize: '0.65rem', backgroundColor: '#dcfce7', color: '#166534', padding: '0.1rem 0.4rem', borderRadius: '1rem', fontWeight: 600 }}>BARU</span>}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                      Barcode: {item.barcode} {item.keterangan ? `• ${item.keterangan}` : ''}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                      <span style={{ fontWeight: 700, color: '#3b82f6', fontSize: '1.1rem' }}>+{item.qty}</span>
                      <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{item.satuan}</span>
                    </div>
                    <button 
                      onClick={() => handleRemoveItem(index)}
                      style={{ background: '#fee2e2', border: 'none', color: '#ef4444', width: '32px', height: '32px', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Floating Bottom Action */}
        {items.length > 0 && (
          <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', padding: '1rem 1rem 1.5rem', boxShadow: '0 -4px 20px rgba(0,0,0,0.1)', borderTopLeftRadius: '1.5rem', borderTopRightRadius: '1.5rem', zIndex: 30 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
               <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Total Kuantitas</span>
               <span style={{ color: '#0f172a', fontWeight: 700, fontSize: '1.25rem' }}>{items.reduce((s, i) => s + i.qty, 0)} Item</span>
            </div>
            <button 
              className="flutter-ripple"
              onClick={handleSaveStockIn}
              disabled={isSaving}
              style={{ width: '100%', padding: '1rem', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '1rem', fontWeight: 600, fontSize: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', opacity: isSaving ? 0.7 : 1 }}
            >
              <Save size={20} />
              {isSaving ? 'Menyimpan...' : 'Simpan Barang Masuk'}
            </button>
          </div>
        )}

      </div>

      {showScanner && (
        <MobileScanner 
          onScanSuccess={handleScanSuccess}
          onClose={() => setShowScanner(false)}
        />
      )}

      {/* Bottom Sheet for Product Input (Qty/Unit) */}
      {showProductSheet && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end' }}>
          <div 
            onClick={() => setShowProductSheet(false)} 
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} 
          />
          <div style={{ width: '100%', backgroundColor: '#fff', borderTopLeftRadius: '1.5rem', borderTopRightRadius: '1.5rem', padding: '1.5rem', position: 'relative', zIndex: 101, animation: 'slideUp 0.3s ease-out' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {isNewProduct ? (
                    <><AlertTriangle size={20} color="#f59e0b" /> Produk Baru</>
                  ) : (
                    <><CheckCircle2 size={20} color="#10b981" /> {activeProduct?.nama_barang}</>
                  )}
                </h3>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#64748b' }}>
                  Barcode: {isNewProduct ? newBarcode : activeProduct?.barcode}
                </p>
              </div>
              <button onClick={() => setShowProductSheet(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', padding: '0.4rem', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={18} />
              </button>
            </div>

            {isNewProduct && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Nama Produk *</label>
                <input 
                  type="text" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Contoh: Indomie Goreng"
                  style={{ width: '100%', padding: '0.875rem', borderRadius: '0.75rem', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Satuan</label>
                {isNewProduct ? (
                  <select 
                    value={newUnit} 
                    onChange={(e) => setNewUnit(e.target.value)}
                    style={{ width: '100%', padding: '0.875rem', borderRadius: '0.75rem', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontSize: '0.9rem', outline: 'none', WebkitAppearance: 'none' }}
                  >
                    <option value="pcs">pcs</option>
                    <option value="dus">dus</option>
                    <option value="kg">kg</option>
                    <option value="botol">botol</option>
                  </select>
                ) : activeProduct?.has_multi_satuan ? (
                  <select 
                    value={inputUnit} 
                    onChange={(e) => setInputUnit(e.target.value)}
                    style={{ width: '100%', padding: '0.875rem', borderRadius: '0.75rem', border: '1px solid #cbd5e1', backgroundColor: '#f8fafc', fontSize: '0.9rem', outline: 'none', WebkitAppearance: 'none' }}
                  >
                    <option value="besar">{activeProduct.satuan_besar} ({activeProduct.konversi} {activeProduct.satuan})</option>
                    <option value="dasar">{activeProduct.satuan} (Eceran)</option>
                  </select>
                ) : (
                  <input 
                    type="text" 
                    value={activeProduct?.satuan || 'pcs'} 
                    disabled
                    style={{ width: '100%', padding: '0.875rem', borderRadius: '0.75rem', border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', fontSize: '0.9rem', color: '#64748b', outline: 'none' }}
                  />
                )}
              </div>
              
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem' }}>Jumlah Masuk</label>
                <div style={{ display: 'flex', alignItems: 'center', borderRadius: '0.75rem', border: '1px solid #cbd5e1', overflow: 'hidden' }}>
                  <button 
                    onClick={() => setInputQty(Math.max(1, inputQty - 1))}
                    style={{ width: '40px', height: '46px', background: '#f8fafc', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', borderRight: '1px solid #cbd5e1' }}
                  ><Minus size={16} /></button>
                  <input 
                    type="number" 
                    value={inputQty} 
                    onChange={(e) => setInputQty(Number(e.target.value))}
                    min="1"
                    style={{ flex: 1, width: '100%', height: '46px', border: 'none', textAlign: 'center', fontSize: '1rem', fontWeight: 600, color: '#0f172a', outline: 'none', MozAppearance: 'textfield' }}
                  />
                  <button 
                    onClick={() => setInputQty(inputQty + 1)}
                    style={{ width: '40px', height: '46px', background: '#f8fafc', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', borderLeft: '1px solid #cbd5e1' }}
                  ><Plus size={16} /></button>
                </div>
              </div>
            </div>

            <button 
              className="flutter-ripple"
              onClick={handleConfirmItem}
              style={{ width: '100%', padding: '1rem', backgroundColor: isNewProduct ? '#f59e0b' : '#10b981', color: '#fff', border: 'none', borderRadius: '1rem', fontWeight: 600, fontSize: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
            >
              <Plus size={20} />
              Tambahkan ke Daftar Masuk
            </button>
            
            {isNewProduct && (
              <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8', marginTop: '1rem', marginBottom: 0 }}>
                *Produk baru akan otomatis disimpan ke database Master Produk
              </p>
            )}

          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}} />
    </>
  );
}
