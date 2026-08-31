import React, { useState, useRef, useEffect, useContext } from 'react';
import { Search, ScanBarcode, List, Grid, Image as ImageIcon, Plus, Keyboard } from 'lucide-react';
import Card from '../../components/common/Card';
import { ToastContext } from '../../context/ToastContext';
import styles from './ProductGrid.module.css';
import scanStyles from '../barang-masuk/ScanInput.module.css';

const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number);
};

export default function ProductGrid({ products, onAddToCart, onScanBarcode }) {
  const { showToast } = useContext(ToastContext);
  const barcodeInputRef = useRef(null);
  const [activeFilter, setActiveFilter] = useState('scan'); // 'scan' | 'manual' | 'daftar' | 'promo'
  const [viewMode, setViewMode] = useState('grid');
  const [category, setCategory] = useState('Semua Kategori');
  const [inputVal, setInputVal] = useState('');

  // Auto focus barcode input on mount or mode change
  useEffect(() => {
    if (activeFilter === 'scan' || activeFilter === 'manual') {
      barcodeInputRef.current?.focus();
    }
  }, [activeFilter]);

  const handleBarcodeSubmit = (e) => {
    e.preventDefault();
    const barcode = activeFilter === 'scan' ? inputVal : e.target.barcode.value;
    if (barcode.trim()) {
      onScanBarcode(barcode.trim());
      if (activeFilter === 'scan') {
        setInputVal('');
      } else {
        e.target.reset();
      }
    }
    barcodeInputRef.current?.focus();
  };

  const handleLoadMore = () => {
    showToast('Memuat lebih banyak produk... (Fitur segera hadir)', 'info');
  };

  const filteredProducts = products.filter((product) => {
    if (category !== 'Semua Kategori' && product.kategori !== category) {
      return false;
    }
    if (activeFilter === 'promo') {
      return product.harga_promo != null || product.isPromo;
    }
    return true;
  });

  return (
    <div className={styles.container}>
      <Card className={styles.scanCard} padding="lg" style={{ marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        {/* Header Row: All Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
          
          {/* Left: Input Mode Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#64748b' }}>Mode Input:</span>
            <div style={{ display: 'flex', background: '#f1f5f9', padding: '0.25rem', borderRadius: '0.5rem', gap: '0.25rem' }}>
              <button 
                onClick={() => setActiveFilter('scan')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', background: activeFilter === 'scan' ? '#fff' : 'transparent', color: activeFilter === 'scan' ? '#1e40af' : '#64748b', fontWeight: activeFilter === 'scan' ? 600 : 500, boxShadow: activeFilter === 'scan' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.875rem' }}
              >
                <ScanBarcode size={16} /> Scan Barcode
              </button>
              <button 
                onClick={() => setActiveFilter('manual')}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', background: activeFilter === 'manual' ? '#fff' : 'transparent', color: activeFilter === 'manual' ? '#1e40af' : '#64748b', fontWeight: activeFilter === 'manual' ? 600 : 500, boxShadow: activeFilter === 'manual' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.875rem' }}
              >
                <Keyboard size={16} /> Input Manual
              </button>
            </div>
          </div>

          {/* Right: Menu Pills */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              className={`${styles.pill} ${activeFilter === 'daftar' ? styles.activePill : ''}`}
              onClick={() => setActiveFilter('daftar')}
              style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
            >
              <List size={16} /> Daftar Produk
            </button>
            <button 
              className={`${styles.pill} ${activeFilter === 'promo' ? styles.activePill : ''}`}
              onClick={() => setActiveFilter('promo')}
              style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
            >
              <Search size={16} /> Promo
            </button>
          </div>
        </div>

        {/* Content Row: Scan Box or Input */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem 0' }}>
          
          {activeFilter === 'manual' ? (
            <div style={{ width: '100%', maxWidth: '500px' }}>
              <form className={scanStyles.scanBarContainer} onSubmit={handleBarcodeSubmit} style={{ padding: '0.25rem 0.5rem', borderRadius: '0.75rem', border: '1px solid #cbd5e1', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                <ScanBarcode className={scanStyles.scanIcon} size={20} color="#94a3b8" />
                <input
                  ref={barcodeInputRef}
                  name="barcode"
                  type="text"
                  placeholder="Ketik kode produk secara manual..."
                  className={scanStyles.scanInput}
                  autoComplete="off"
                  style={{ fontSize: '0.95rem' }}
                />
                <button type="submit" className={scanStyles.cariBtn} style={{ borderRadius: '0.5rem', padding: '0.5rem 1rem' }}>
                  <Search size={16} /> Cari
                </button>
              </form>
              <p className={scanStyles.scanHint} style={{ textAlign: 'center', marginTop: '0.75rem' }}>Ketik kode produk secara manual lalu tekan Cari</p>
            </div>
          ) : activeFilter === 'scan' ? (
            <div className={scanStyles.scanAnimationBox} style={{ width: '100%', maxWidth: '500px', height: '200px', padding: '1.5rem', minHeight: 'auto', borderRadius: '1rem', border: '2px dashed #93c5fd', background: '#eff6ff' }}>
              <div className={scanStyles.barcodeGraphic} style={{ transform: 'scale(0.8)', marginBottom: '0.25rem' }}>
                {[1,2,3,4,5,6,7,8,9,10,11,12].map(i => <div key={i} className={scanStyles.bar}></div>)}
                <div className={scanStyles.laser}></div>
              </div>
              <p className={scanStyles.scanText} style={{ fontSize: '0.95rem', color: '#1e40af' }}>Siap Melakukan Scan...</p>
              <p className={scanStyles.scanSubtext} style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Arahkan barcode produk ke scanner Anda</p>
              
              <form onSubmit={handleBarcodeSubmit}>
                <input
                  ref={barcodeInputRef}
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  className={scanStyles.hiddenInput}
                  autoComplete="off"
                  autoFocus
                />
              </form>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#64748b', padding: '2rem 0' }}>
              <p style={{ margin: 0 }}>Menampilkan {activeFilter === 'daftar' ? 'semua produk' : 'produk promo'}</p>
            </div>
          )}
          
        </div>
      </Card>

      {(activeFilter === 'daftar' || activeFilter === 'promo') && (
        <>
          <div className={styles.catalogHeader}>
        <h2 className={styles.catalogTitle}>Daftar Produk</h2>
        <div className={styles.catalogControls}>
          <select 
            className={styles.categorySelect}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="Semua Kategori">Semua Kategori</option>
            <option value="Makanan">Makanan</option>
            <option value="Minuman">Minuman</option>
          </select>
          <div className={styles.viewToggle}>
            <button 
              className={`${styles.toggleBtn} ${viewMode === 'grid' ? styles.activeToggle : ''}`}
              onClick={() => setViewMode('grid')}
              title="Tampilan Grid"
            >
              <Grid size={18} />
            </button>
            <button 
              className={`${styles.toggleBtn} ${viewMode === 'list' ? styles.activeToggle : ''}`}
              onClick={() => setViewMode('list')}
              title="Tampilan List"
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className={`${styles.productGrid} ${viewMode === 'list' ? styles.listView : ''}`}>
        {filteredProducts.map((product) => (
          <div key={product.id} className={styles.productCard}>
            <div className={styles.productImageWrapper}>
              {product.foto ? (
                <img 
                  src={product.foto} 
                  alt={product.nama_barang} 
                  className={styles.productImage}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div 
                className={styles.imagePlaceholder} 
                style={{ display: product.foto ? 'none' : 'flex' }}
              >
                <ImageIcon size={32} color="#cbd5e1" />
              </div>
            </div>
            <div className={styles.productInfo}>
              <h3 className={styles.productName}>{product.nama_barang}</h3>
              <p className={styles.productStock} style={{ marginBottom: '0.15rem' }}>Kode: {product.kode_barang || product.barcode || '-'}</p>
              <p className={styles.productStock}>Stok: {product.stok || 0}</p>
              <div className={styles.productFooter}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <span className={styles.productPrice} style={{ color: (!product.harga_jual || product.harga_jual === 0) ? '#ef4444' : undefined }}>
                    {formatRupiah(product.harga_jual)}
                  </span>
                  {(!product.harga_jual || product.harga_jual === 0) && (
                    <span style={{ fontSize: '0.65rem', backgroundColor: '#fee2e2', color: '#ef4444', padding: '0.125rem 0.35rem', borderRadius: '0.25rem', fontWeight: 800, alignSelf: 'flex-start' }}>
                      BELUM DISET
                    </span>
                  )}
                </div>
                <button 
                  className={styles.addBtn}
                  onClick={() => onAddToCart(product)}
                  title="Tambah ke keranjang"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {filteredProducts.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
            Tidak ada produk di kategori ini.
          </div>
        )}
      </div>
      
      {filteredProducts.length > 0 && (
        <div className={styles.loadMoreContainer}>
          <button className={styles.loadMoreBtn} onClick={handleLoadMore}>
            Muat lebih banyak
          </button>
        </div>
      )}
      </>
      )}
    </div>
  );
}
