import React, { useState, useRef, useEffect, useContext } from 'react';
import { Search, ScanBarcode, List, Grid, Image as ImageIcon, Plus, Keyboard } from 'lucide-react';
import Card from '../../components/common/Card';
import { ToastContext } from '../../context/ToastContext';
import styles from './ProductGrid.module.css';

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
  const [activeFilter, setActiveFilter] = useState('daftar');
  const [viewMode, setViewMode] = useState('grid');
  const [category, setCategory] = useState('Semua Kategori');

  // Auto focus barcode input on mount
  useEffect(() => {
    barcodeInputRef.current?.focus();
  }, []);

  const handleBarcodeSubmit = (e) => {
    e.preventDefault();
    const barcode = e.target.barcode.value;
    if (barcode.trim()) {
      onScanBarcode(barcode.trim());
      e.target.reset();
    }
    barcodeInputRef.current?.focus();
  };

  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
    if (filter === 'manual') {
      barcodeInputRef.current?.focus();
    }
  };

  const handleLoadMore = () => {
    showToast('Memuat lebih banyak produk... (Fitur segera hadir)', 'info');
  };

  const filteredProducts = products.filter((product) => {
    if (category !== 'Semua Kategori' && product.kategori !== category) {
      return false;
    }
    return true;
  });

  return (
    <div className={styles.container}>
      <Card className={styles.scanCard} padding="none">
        <form onSubmit={handleBarcodeSubmit} className={styles.scanForm}>
          <div className={styles.scanInputWrapper}>
            <ScanBarcode className={styles.scanIcon} size={24} />
            <input
              ref={barcodeInputRef}
              name="barcode"
              type="text"
              className={styles.scanInput}
              placeholder="Scan barcode atau ketik kode barang..."
              autoComplete="off"
              autoFocus
            />
            <div 
              className={styles.keyboardIcon} 
              onClick={() => barcodeInputRef.current?.focus()}
              title="Fokus ke pencarian (⌘K)"
              style={{ cursor: 'pointer' }}
            >
              <Keyboard size={20} className={styles.keyboardIconSvg} />
            </div>
          </div>
        </form>

        <div className={styles.filterPills}>
          <button 
            className={`${styles.pill} ${activeFilter === 'daftar' ? styles.activePill : ''}`}
            onClick={() => handleFilterClick('daftar')}
          >
            <List size={16} /> Daftar Produk
          </button>
          <button 
            className={`${styles.pill} ${activeFilter === 'favorit' ? styles.activePill : ''}`}
            onClick={() => handleFilterClick('favorit')}
          >
            <Search size={16} /> Produk Favorit
          </button>
          <button 
            className={`${styles.pill} ${activeFilter === 'promo' ? styles.activePill : ''}`}
            onClick={() => handleFilterClick('promo')}
          >
            <Search size={16} /> Promo
          </button>
          <button 
            className={`${styles.pill} ${activeFilter === 'manual' ? styles.activePill : ''}`}
            onClick={() => handleFilterClick('manual')}
          >
            <ScanBarcode size={16} /> Scan Manual
          </button>
        </div>
      </Card>

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
              <p className={styles.productStock}>Stok: {product.stok || Math.floor(Math.random() * 100) + 10}</p>
              <div className={styles.productFooter}>
                <span className={styles.productPrice}>{formatRupiah(product.harga_jual)}</span>
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
    </div>
  );
}
