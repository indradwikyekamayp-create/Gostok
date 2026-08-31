import React, { useState, useEffect, useContext, useMemo } from 'react';
import { collection, onSnapshot, doc, setDoc, updateDoc, writeBatch, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { ToastContext } from '../../context/ToastContext';
import { AuthContext } from '../../context/AuthContext';
import { Search, ScanBarcode, Plus, Minus, ShoppingBag, ShoppingCart, X, ChevronRight, User, UserPlus } from 'lucide-react';
import NotaPreview from './NotaPreview';
import PelangganForm from '../pelanggan/PelangganForm';

const formatRupiah = (value) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

export default function TransaksiJualMobile() {
  const { showToast } = useContext(ToastContext);
  const { user, userData } = useContext(AuthContext);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  
  const [customer, setCustomer] = useState(null);
  const [cart, setCart] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [completedTransaction, setCompletedTransaction] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [showCartSheet, setShowCartSheet] = useState(false);
  const [showCustomerSheet, setShowCustomerSheet] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [jatuhTempo, setJatuhTempo] = useState('');
  const [isHutangMode, setIsHutangMode] = useState(false);

  useEffect(() => {
    if (!showCartSheet) {
      setIsHutangMode(false);
    }
  }, [showCartSheet]);

  useEffect(() => {
    const custRef = collection(db, 'customers');
    const unsubCust = onSnapshot(custRef, (snapshot) => {
      const data = [];
      snapshot.forEach(doc => data.push({ ...doc.data(), id: doc.id }));
      setCustomers(data);
    });

    const prodRef = collection(db, 'products');
    const unsubProd = onSnapshot(prodRef, (snapshot) => {
      const data = [];
      snapshot.forEach(doc => data.push({ ...doc.data(), id: doc.id }));
      setProducts(data);
    });

    return () => {
      unsubCust();
      unsubProd();
    };
  }, []);

  useEffect(() => {
    setCart((prevCart) => {
      let changed = false;
      const newCart = prevCart.map((cartItem) => {
        const latestProduct = products.find((p) => p.id === cartItem.id);
        if (latestProduct) {
          if (
            latestProduct.harga_jual !== cartItem.harga_jual ||
            latestProduct.nama_barang !== cartItem.nama_barang
          ) {
            changed = true;
            return {
              ...cartItem,
              harga_jual: latestProduct.harga_jual,
              nama_barang: latestProduct.nama_barang,
              subtotal: (cartItem.qty || 0) * latestProduct.harga_jual,
            };
          }
        }
        return cartItem;
      });
      return changed ? newCart : prevCart;
    });
  }, [products]);

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.kategori).filter(Boolean));
    return ['Semua', ...Array.from(cats)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.nama_barang?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.barcode?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = activeCategory === 'Semua' || p.kategori === activeCategory;
      return matchesSearch && matchesCat;
    });
  }, [products, searchQuery, activeCategory]);

  const getQtyInCart = (productId) => {
    const item = cart.find(c => c.id === productId);
    return item ? item.qty : 0;
  };

  const handleAddToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    const currentQty = existingItem ? existingItem.qty : 0;
    
    if (currentQty + 1 > (product.stok || 0)) {
      showToast(`Stok ${product.nama_barang} tidak cukup (Sisa: ${product.stok || 0})`, 'error');
      return;
    }

    setCart((prevCart) => {
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, qty: item.qty + 1, subtotal: (item.qty + 1) * item.harga_jual }
            : item
        );
      } else {
        return [...prevCart, { ...product, qty: 1, subtotal: product.harga_jual }];
      }
    });
  };

  const handleSetQty = (product, newQty) => {
    let qty = parseInt(newQty);
    if (isNaN(qty)) return; // biarkan kosong saat mengetik

    if (qty > (product.stok || 0)) {
      showToast(`Stok ${product.nama_barang} tidak cukup (Sisa: ${product.stok || 0})`, 'error');
      qty = product.stok || 0;
    }

    setCart(prev => {
      if (qty <= 0) {
        return prev.filter(item => item.id !== product.id);
      }
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, qty, subtotal: qty * item.harga_jual } : item);
      }
      return [...prev, { ...product, qty, subtotal: qty * product.harga_jual }];
    });
  };

  const handleRemoveFromCart = (productId) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === productId);
      if (existingItem && existingItem.qty > 1) {
        return prevCart.map((item) =>
          item.id === productId
            ? { ...item, qty: item.qty - 1, subtotal: (item.qty - 1) * item.harga_jual }
            : item
        );
      } else {
        return prevCart.filter((item) => item.id !== productId);
      }
    });
  };

  const totalCartAmount = cart.reduce((acc, item) => acc + item.subtotal, 0);
  const totalCartQty = cart.reduce((acc, item) => acc + item.qty, 0);

  const handleSaveTransaction = async (paymentMethod = 'Tunai', jatuhTempoDate = null) => {
    let finalJatuhTempo = jatuhTempoDate;
    if ((paymentMethod.toLowerCase() === 'bon' || paymentMethod.toLowerCase() === 'kredit' || paymentMethod.toLowerCase() === 'hutang') && !finalJatuhTempo) {
      const jt = new Date();
      jt.setDate(jt.getDate() + 14);
      finalJatuhTempo = jt.toISOString();
    }
    
    if (cart.length === 0) {
      showToast('Keranjang masih kosong', 'warning');
      return;
    }
    
    if (!customer) {
      showToast('Silakan pilih pelanggan terlebih dahulu!', 'warning');
      return;
    }
    
    const selectedCustomer = customer;
    
    setIsSaving(true);
    
    try {
      const grandTotal = cart.reduce((acc, item) => acc + item.subtotal, 0);
      const totalModal = cart.reduce((acc, item) => acc + (item.qty * (item.harga_modal || 0)), 0);
      
      const now = new Date();
      const year = now.getFullYear().toString().slice(-2);
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      
      const noNota = `INV-${year}${month}${day}-${hours}${minutes}${seconds}`;
      
      const storeConfigSnap = await getDoc(doc(db, 'settings', 'store_config'));
      const store_config = storeConfigSnap.exists() ? storeConfigSnap.data() : null;

      const newTransaction = {
        noNota,
        tanggal: now.toISOString(),
        customer: selectedCustomer,
        cart,
        paymentMethod,
        catatan: '',
        jatuhTempo: finalJatuhTempo || null,
        grandTotal,
        totalModal,
        keuntungan: grandTotal - totalModal,
        kasir: {
          uid: user?.uid || 'unknown',
          nama: userData?.nama || user?.displayName || user?.email || 'Admin',
          role: userData?.role || 'Admin'
        },
        store_config
      };
      
      const batch = writeBatch(db);
      
      const txRef = doc(collection(db, 'transactions'));
      batch.set(txRef, { ...newTransaction, id: txRef.id });

      for (const item of cart) {
        const prodRef = doc(db, 'products', item.id);
        const newStock = Math.max(0, (item.stok || 0) - item.qty);
        batch.update(prodRef, { stok: newStock });
      }

      if (paymentMethod.toLowerCase() === 'bon' || paymentMethod.toLowerCase() === 'kredit' || paymentMethod.toLowerCase() === 'hutang') {
        if (selectedCustomer.id !== 'umum') {
          const custRef = doc(db, 'customers', selectedCustomer.id);
          const newHutang = (selectedCustomer.total_hutang_berjalan || 0) + grandTotal;
          batch.update(custRef, { total_hutang_berjalan: newHutang });
        }
      }

      await batch.commit();

      setCompletedTransaction({ ...newTransaction, id: txRef.id, displayDate: new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(new Date()) });
      setShowCartSheet(false);
      showToast('Transaksi berhasil!', 'success');
    } catch (err) {
      console.error('Error saving transaction:', err);
      showToast('Gagal memproses transaksi: ' + err.message, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseNota = () => {
    setCustomer(null);
    setCart([]);
    setCompletedTransaction(null);
  };

  const handleSaveCustomer = async (newCustomerData) => {
    try {
      const custRef = doc(collection(db, 'customers'));
      const newCustomer = {
        ...newCustomerData,
        nama_pic: newCustomerData.nama_pic || '-',
        total_hutang_berjalan: 0
      };
      await setDoc(custRef, newCustomer);
      
      setCustomer({ ...newCustomer, id: custRef.id });
      setShowCustomerForm(false);
      setShowCustomerSheet(false);
      showToast('Pelanggan baru berhasil ditambahkan', 'success');
    } catch (error) {
      console.error("Error adding customer:", error);
      showToast('Gagal menambahkan pelanggan', 'error');
    }
  };

  return (
    <>
      <div className="flutter-page" style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '90px', fontFamily: '"Inter", sans-serif' }}>
      
      {/* Top Navbar */}
      <div style={{ backgroundColor: '#fff', padding: '1rem', position: 'sticky', top: 0, zIndex: 30, borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={18} color="#64748b" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Cari nama barang / barcode..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: '1rem', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '0.875rem', outline: 'none' }}
            />
          </div>
          <button className="flutter-ripple" style={{ width: '48px', height: '48px', borderRadius: '1rem', backgroundColor: '#eff6ff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
            <ScanBarcode size={24} />
          </button>
        </div>

        {/* Customer Selector Minimal */}
        <div 
           className="flutter-ripple" 
           onClick={() => setShowCustomerSheet(true)}
           style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.75rem', padding: '0.5rem 0.75rem', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.75rem' }}
        >
          <User size={16} color="#64748b" />
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: customer ? '#0f172a' : '#ef4444', flex: 1 }}>
            {customer ? (customer.nama_perusahaan || customer.nama_pic) : 'Pilih Pelanggan (Wajib)'}
          </span>
          <ChevronRight size={16} color="#cbd5e1" />
        </div>
      </div>

      {/* Categories Swipe */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', padding: '1rem', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
        {categories.map(cat => (
          <button 
             key={cat}
             onClick={() => setActiveCategory(cat)}
             className="flutter-ripple"
             style={{ 
               padding: '0.5rem 1rem', 
               borderRadius: '2rem', 
               fontSize: '0.8125rem', 
               fontWeight: 600, 
               border: '1px solid',
               borderColor: activeCategory === cat ? '#3b82f6' : '#e2e8f0',
               whiteSpace: 'nowrap',
               backgroundColor: activeCategory === cat ? '#eff6ff' : '#fff',
               color: activeCategory === cat ? '#1d4ed8' : '#475569',
               transition: 'all 0.2s'
             }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div style={{ padding: '0 1rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
        {filteredProducts.map(product => {
          const qty = getQtyInCart(product.id);
          return (
            <div key={product.id} style={{ backgroundColor: '#fff', borderRadius: '1rem', border: '1px solid #e2e8f0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              
              {product.foto ? (
                <div style={{ height: '120px', width: '100%', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem' }}>
                  <img src={product.foto} alt={product.nama_barang} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                </div>
              ) : (
                <div style={{ height: '120px', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', fontSize: '2rem', fontWeight: 800 }}>
                  {product.nama_barang.substring(0,2).toUpperCase()}
                </div>
              )}

              <div style={{ padding: '0.75rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.3, marginBottom: '0.25rem' }}>{product.nama_barang}</div>
                  <div style={{ fontSize: '0.6875rem', color: '#64748b', marginBottom: '0.125rem' }}>Kode: {product.kode_barang || product.barcode || '-'}</div>
                  <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>Sisa: {product.stok || 0}</div>
                </div>
                <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: (!product.harga_jual || product.harga_jual === 0) ? '#ef4444' : '#16a34a' }}>
                      {formatRupiah(product.harga_jual)}
                    </div>
                    {(!product.harga_jual || product.harga_jual === 0) && (
                      <span style={{ fontSize: '0.5rem', backgroundColor: '#fee2e2', color: '#ef4444', padding: '0.15rem 0.3rem', borderRadius: '0.25rem', fontWeight: 800 }}>
                        BELUM DISET
                      </span>
                    )}
                  </div>
                  
                  {qty > 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.25rem' }}>
                       <button onClick={() => handleRemoveFromCart(product.id)} style={{ width: 24, height: 24, borderRadius: '0.5rem', backgroundColor: '#fee2e2', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
                         <Minus size={12} strokeWidth={3} />
                       </button>
                       <input 
                         type="number"
                         value={qty}
                         onChange={(e) => {
                           const val = e.target.value;
                           if(val === '') handleSetQty(product, 0);
                           else handleSetQty(product, val);
                         }}
                         style={{ width: '36px', textAlign: 'center', fontSize: '0.875rem', fontWeight: 700, border: 'none', outline: 'none', backgroundColor: 'transparent', padding: 0 }}
                       />
                       <button onClick={() => handleAddToCart(product)} style={{ width: 24, height: 24, borderRadius: '0.5rem', backgroundColor: '#dcfce7', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
                         <Plus size={12} strokeWidth={3} />
                       </button>
                    </div>
                  ) : (
                    <button className="flutter-ripple" onClick={() => handleAddToCart(product)} style={{ width: '100%', padding: '0.4rem', borderRadius: '0.5rem', backgroundColor: '#3b82f6', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.75rem', fontWeight: 600 }}>
                      <Plus size={14} strokeWidth={3} style={{ marginRight: '2px' }} /> Tambah
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {filteredProducts.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
          <ShoppingBag size={48} opacity={0.2} style={{ margin: '0 auto 1rem auto' }} />
          <div style={{ fontWeight: 600 }}>Produk tidak ditemukan</div>
        </div>
      )}
    </div>

    {/* Luxury Floating Cart FAB */}
    {totalCartQty > 0 && !showCartSheet && (
      <div className="flutter-sheet animate-slide-in-up" style={{ position: 'fixed', bottom: '90px', right: '1.5rem', zIndex: 45 }}>
        <button 
           className="flutter-ripple"
           onClick={() => setShowCartSheet(true)}
           style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 10px 25px -5px rgba(29, 78, 216, 0.6), 0 8px 10px -6px rgba(29, 78, 216, 0.5)' }}
        >
          <ShoppingCart size={26} strokeWidth={2.5} />
        </button>
        <div style={{ position: 'absolute', top: '-5px', right: '-5px', backgroundColor: '#ef4444', color: '#fff', fontSize: '0.75rem', fontWeight: 800, padding: '0.25rem 0.5rem', borderRadius: '1rem', border: '2px solid #fff', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
          {totalCartQty}
        </div>
      </div>
    )}

    {/* Cart Bottom Sheet (Marketplace Style) */}
    {showCartSheet && (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 70, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        <div className="flutter-fade" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)' }} onClick={() => setShowCartSheet(false)} />
        <div className="flutter-sheet" style={{ backgroundColor: '#fff', borderTopLeftRadius: '1.5rem', borderTopRightRadius: '1.5rem', padding: '1.5rem 1rem', maxHeight: '90vh', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 71 }}>
          
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
            <div style={{ width: '40px', height: '6px', backgroundColor: '#cbd5e1', borderRadius: '3px' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>Keranjang Belanja</h2>
            <div style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.875rem', fontWeight: 700 }}>
              {totalCartQty} Produk
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1.5rem', paddingRight: '0.25rem' }}>
            {cart.map((item, index) => (
              <div key={item.id} style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', paddingBottom: '1.25rem', borderBottom: '1px solid #f1f5f9' }}>
                
                {/* Thumbnail with Number Badge */}
                <div style={{ position: 'relative', width: '72px', height: '72px', borderRadius: '0.75rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, backgroundColor: '#0f172a', color: '#fff', fontSize: '0.65rem', fontWeight: 800, padding: '0.15rem 0.4rem', borderBottomRightRadius: '0.5rem', zIndex: 2 }}>
                    {index + 1}
                  </div>
                  {item.foto ? (
                    <img src={item.foto} alt={item.nama_barang} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }} />
                  ) : (
                    <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#94a3b8' }}>{item.nama_barang.substring(0, 2).toUpperCase()}</div>
                  )}
                </div>

                {/* Details */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.3, marginBottom: '0.25rem' }}>
                      {item.nama_barang}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>
                      Kode: {item.kode_barang || item.barcode || '-'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: (!item.harga_jual || item.harga_jual === 0) ? '#ef4444' : '#16a34a' }}>
                        {formatRupiah(item.harga_jual)}
                      </div>
                      {(!item.harga_jual || item.harga_jual === 0) && (
                        <span style={{ fontSize: '0.5rem', backgroundColor: '#fee2e2', color: '#ef4444', padding: '0.15rem 0.3rem', borderRadius: '0.25rem', fontWeight: 800 }}>
                          BELUM DISET
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Qty Controls */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>
                      Total: {formatRupiah(item.harga_jual * item.qty)}
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', border: '1px solid #cbd5e1', borderRadius: '0.5rem', padding: '0.25rem', backgroundColor: '#fff' }}>
                       <button onClick={() => handleRemoveFromCart(item.id)} style={{ width: 26, height: 26, borderRadius: '0.375rem', backgroundColor: '#fee2e2', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
                         <Minus size={14} strokeWidth={3} />
                       </button>
                       <input 
                         type="number"
                         value={item.qty}
                         onChange={(e) => {
                           const val = e.target.value;
                           if(val === '') handleSetQty(item, 0);
                           else handleSetQty(item, val);
                         }}
                         style={{ width: '36px', textAlign: 'center', fontSize: '0.875rem', fontWeight: 700, border: 'none', outline: 'none', backgroundColor: 'transparent', padding: 0, color: '#0f172a' }}
                       />
                       <button onClick={() => handleAddToCart(item)} style={{ width: 26, height: 26, borderRadius: '0.375rem', backgroundColor: '#dcfce7', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
                         <Plus size={14} strokeWidth={3} />
                       </button>
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div>

          <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '1rem', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.875rem', color: '#475569' }}>Total Produk</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>{totalCartQty} Item</span>
            </div>
            <div style={{ borderBottom: '1px dashed #cbd5e1', margin: '0.5rem 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#0f172a' }}>TOTAL BIAYA</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1d4ed8' }}>{formatRupiah(totalCartAmount)}</span>
            </div>
          </div>

          {isHutangMode && (
            <div className="flutter-fade" style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Tanggal Jatuh Tempo Hutang</label>
              <input 
                type="date" 
                value={jatuhTempo}
                onChange={(e) => setJatuhTempo(e.target.value)}
                style={{ width: '100%', padding: '0.875rem', borderRadius: '0.75rem', border: '1px solid #cbd5e1', fontSize: '0.9375rem', outline: 'none' }}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            {isHutangMode ? (
              <>
                <button 
                   className="flutter-ripple"
                   onClick={() => setIsHutangMode(false)}
                   style={{ flex: 1, padding: '1rem', borderRadius: '1rem', backgroundColor: '#fff', border: '1px solid #cbd5e1', color: '#475569', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  Batal
                </button>
                <button 
                   className="flutter-ripple"
                   onClick={() => handleSaveTransaction('Hutang', jatuhTempo ? new Date(jatuhTempo).toISOString() : null)}
                   disabled={isSaving || !customer}
                   style={{ flex: 2, padding: '1rem', borderRadius: '1rem', backgroundColor: (!customer || isSaving) ? '#cbd5e1' : '#1d4ed8', border: 'none', color: '#fff', fontWeight: 700, fontSize: '0.9375rem' }}
                >
                  {isSaving ? 'Memproses...' : 'Simpan Hutang'}
                </button>
              </>
            ) : (
              <>
                <button 
                   className="flutter-ripple"
                   onClick={() => setShowCartSheet(false)}
                   style={{ padding: '1rem', borderRadius: '1rem', backgroundColor: '#fff', border: '1px solid #cbd5e1', color: '#475569', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <X size={20} />
                </button>
                <button 
                   onClick={() => setIsHutangMode(true)}
                   disabled={!customer}
                   style={{ flex: 1, padding: '1rem', borderRadius: '1rem', backgroundColor: '#fff', border: '1px solid #cbd5e1', color: !customer ? '#94a3b8' : '#475569', fontWeight: 700, fontSize: '0.9375rem', opacity: !customer ? 0.6 : 1 }}
                >
                  Hutang
                </button>
                <button 
                   className="flutter-ripple"
                   onClick={() => handleSaveTransaction('Tunai')}
                   disabled={isSaving || !customer}
                   style={{ flex: 1.5, padding: '1rem', borderRadius: '1rem', backgroundColor: (!customer || isSaving) ? '#cbd5e1' : '#16a34a', border: 'none', color: '#fff', fontWeight: 700, fontSize: '0.9375rem' }}
                >
                  {isSaving ? 'Memproses...' : 'Tunai'}
                </button>
              </>
            )}
          </div>

        </div>
      </div>
    )}

    {/* Customer List Bottom Sheet */}
    {showCustomerSheet && (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 60, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        <div className="flutter-fade" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setShowCustomerSheet(false)} />
        <div className="flutter-sheet" style={{ backgroundColor: '#fff', borderTopLeftRadius: '1.5rem', borderTopRightRadius: '1.5rem', padding: '1.5rem 1rem', maxHeight: '70vh', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 61 }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 800, margin: 0 }}>Pilih Pelanggan</h2>
            <button onClick={() => setShowCustomerSheet(false)} style={{ background: 'none', border: 'none', color: '#64748b' }}><X size={24} /></button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            <div 
              onClick={() => { setShowCustomerSheet(false); setShowCustomerForm(true); }}
              style={{ padding: '1rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '1rem' }}
            >
              <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><UserPlus size={20} color="#1d4ed8" /></div>
              <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#1d4ed8' }}>+ Tambahkan Pelanggan Baru</div>
            </div>
            
            {customers.map(c => (
              <div 
                key={c.id}
                onClick={() => { setCustomer(c); setShowCustomerSheet(false); }}
                style={{ padding: '1rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '1rem' }}
              >
                <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={20} color="#64748b" /></div>
                <div style={{ flex: 1 }}>
                   <div style={{ fontSize: '0.9375rem', fontWeight: customer?.id === c.id ? 700 : 500, color: customer?.id === c.id ? '#1d4ed8' : '#0f172a' }}>{c.nama_perusahaan || c.nama_pic}</div>
                   {c.no_hp && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{c.no_hp}</div>}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    )}

    {/* Mobile Tambah Pelanggan Form Sheet */}
    {showCustomerForm && (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 80, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        <div className="flutter-fade" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setShowCustomerForm(false)} />
        <div className="flutter-sheet" style={{ backgroundColor: '#fff', borderTopLeftRadius: '1.5rem', borderTopRightRadius: '1.5rem', padding: '1.5rem 1rem', maxHeight: '90vh', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 81 }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 800, margin: 0 }}>Pelanggan Baru</h2>
            <button onClick={() => setShowCustomerForm(false)} style={{ background: 'none', border: 'none', color: '#64748b' }}><X size={24} /></button>
          </div>

          <form 
            style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.target);
              if (!fd.get('nama_perusahaan')) {
                showToast('Nama pelanggan wajib diisi!', 'warning');
                return;
              }
              handleSaveCustomer({
                nama_perusahaan: fd.get('nama_perusahaan'),
                nama_pic: fd.get('nama_pic'),
                no_hp: fd.get('no_hp'),
                jenis_pelanggan: 'CV'
              });
            }}
          >
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Nama Pelanggan/Perusahaan <span style={{ color: '#ef4444' }}>*</span></label>
              <input name="nama_perusahaan" type="text" placeholder="Masukkan nama..." style={{ width: '100%', padding: '0.875rem', borderRadius: '0.75rem', border: '1px solid #cbd5e1', fontSize: '0.9375rem', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Nama PIC (Opsional)</label>
              <input name="nama_pic" type="text" placeholder="Nama penanggung jawab..." style={{ width: '100%', padding: '0.875rem', borderRadius: '0.75rem', border: '1px solid #cbd5e1', fontSize: '0.9375rem', outline: 'none' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>No. HP / WhatsApp</label>
              <input name="no_hp" type="tel" placeholder="0812..." style={{ width: '100%', padding: '0.875rem', borderRadius: '0.75rem', border: '1px solid #cbd5e1', fontSize: '0.9375rem', outline: 'none' }} />
            </div>

            <div style={{ marginTop: '0.5rem' }}>
              <button type="submit" className="flutter-ripple" style={{ width: '100%', padding: '1rem', borderRadius: '1rem', backgroundColor: '#1d4ed8', border: 'none', color: '#fff', fontWeight: 700, fontSize: '0.9375rem', boxShadow: '0 4px 6px rgba(29, 78, 216, 0.3)' }}>
                Simpan Pelanggan
              </button>
            </div>
          </form>

        </div>
      </div>
    )}

    {completedTransaction && (
       <NotaPreview 
          transaction={completedTransaction} 
          onClose={handleCloseNota}
       />
    )}
  </>
  );
}