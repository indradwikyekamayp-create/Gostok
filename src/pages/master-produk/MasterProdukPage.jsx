import React, { useState, useEffect, useContext } from 'react';
import { Package, CheckCircle, AlertCircle, XCircle, Search, Filter, LayoutGrid, List as ListIcon, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { collection, onSnapshot, doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../hooks/useAuth';
import { ToastContext } from '../../context/ToastContext';
import styles from './MasterProdukPage.module.css';
import ProductGrid from './ProductGrid';
import ProductForm from './ProductForm';
import ProductDetailPanel from './ProductDetailPanel';

const MasterProdukPage = () => {
  const { showToast } = useContext(ToastContext);
  const [products, setProducts] = useState([]);
  const [threshold, setThreshold] = useState(10);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [categoryFilter, setCategoryFilter] = useState('Semua Kategori');
  const [sortBy, setSortBy] = useState('Terbaru');
  const [showFilters, setShowFilters] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const { isOwner } = useAuth();

  // Fetch products from Firestore
  useEffect(() => {
    // Fetch products
    const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      const data = [];
      snapshot.forEach(doc => {
        data.push({ id: doc.id, ...doc.data() });
      });
      setProducts(data);
      setLoading(false);
    });

    // Fetch threshold settings
    const unsubSettings = onSnapshot(doc(db, 'settings', 'store_config'), (docSnap) => {
      if (docSnap.exists() && docSnap.data().stokMenipisThreshold) {
        setThreshold(Number(docSnap.data().stokMenipisThreshold));
      }
    });

    return () => {
      unsubProducts();
      unsubSettings();
    };
  }, []);

  // Filtering Logic
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.nama_barang.toLowerCase().includes(searchQuery.toLowerCase()) || p.barcode.includes(searchQuery);
    
    let matchesStatus = true;
    if (statusFilter === 'Stok Aman') matchesStatus = p.stok > threshold;
    if (statusFilter === 'Stok Menipis') matchesStatus = p.stok > 0 && p.stok <= threshold;
    if (statusFilter === 'Stok Habis') matchesStatus = p.stok === 0;

    let matchesCategory = true;
    if (categoryFilter !== 'Semua Kategori') {
      matchesCategory = p.kategori === categoryFilter;
    }
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  filteredProducts.sort((a, b) => {
    if (sortBy === 'A-Z') {
      return (a.nama_barang || '').localeCompare(b.nama_barang || '');
    } else if (sortBy === 'Z-A') {
      return (b.nama_barang || '').localeCompare(a.nama_barang || '');
    } else if (sortBy === 'Stok Terbanyak') {
      return (b.stok || 0) - (a.stok || 0);
    } else if (sortBy === 'Stok Terdikit') {
      return (a.stok || 0) - (b.stok || 0);
    } else {
      // Terbaru (assuming newer have higher timestamps, but if missing, just return 0)
      return (b.createdAt?.toMillis ? b.createdAt.toMillis() : 0) - (a.createdAt?.toMillis ? a.createdAt.toMillis() : 0);
    }
  });

  // Calculate Stats
  const totalProducts = products.length;
  const stokAman = products.filter(p => p.stok > threshold).length;
  const stokMenipis = products.filter(p => p.stok > 0 && p.stok <= threshold).length;
  const stokHabis = products.filter(p => p.stok === 0).length;

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleSaveProduct = async (savedProduct) => {
    try {
      // Remove temporary object URL if it exists so we don't save blob URLs to Firestore
      if (savedProduct.foto && savedProduct.foto.startsWith('blob:')) {
        savedProduct.foto = null; 
        // In a complete app, you'd upload this file to Firebase Storage here and save the download URL
      }

      if (editingProduct) {
        const productRef = doc(db, 'products', editingProduct.id || editingProduct.barcode);
        await updateDoc(productRef, savedProduct);
      } else {
        const productRef = doc(db, 'products', savedProduct.barcode);
        await setDoc(productRef, savedProduct);
      }
      setIsFormOpen(false);
      showToast('Produk berhasil disimpan!', 'success');
    } catch (error) {
      console.error("Error saving product:", error);
      showToast("Gagal menyimpan produk: " + error.message, 'error');
    }
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1>Master Produk</h1>
          <p>Kelola seluruh data produk toko Anda</p>
        </div>
        <button className={styles.addButton} onClick={handleAddProduct}>
          <Plus size={18} /> Tambah Produk
        </button>
      </header>

      {/* Dashboard Cards */}
      <div className={styles.dashboardCards}>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.iconBlue}`}><Package size={24} /></div>
          <div className={styles.statInfo}>
            <span className={styles.statTitle}>Total Produk</span>
            <span className={styles.statValue}>{totalProducts}</span>
            <span className={styles.statDesc}>Semua produk</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.iconGreen}`}><CheckCircle size={24} /></div>
          <div className={styles.statInfo}>
            <span className={styles.statTitle}>Stok Aman</span>
            <span className={styles.statValue}>{stokAman}</span>
            <span className={styles.statDesc}>Stok di atas minimum</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.iconYellow}`}><AlertCircle size={24} /></div>
          <div className={styles.statInfo}>
            <span className={styles.statTitle}>Stok Menipis</span>
            <span className={styles.statValue}>{stokMenipis}</span>
            <span className={styles.statDesc}>Stok di bawah minimum</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.iconRed}`}><XCircle size={24} /></div>
          <div className={styles.statInfo}>
            <span className={styles.statTitle}>Stok Habis</span>
            <span className={styles.statValue}>{stokHabis}</span>
            <span className={styles.statDesc}>Produk kehabisan stok</span>
          </div>
        </div>
      </div>

      {/* Controls Bar (Search, Filter, Sort, View Toggle) */}
      <div className={styles.controlsBar}>
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} size={18} />
          <input 
            type="text" 
            placeholder="Cari nama produk, barcode, atau SKU..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        
        <div className={styles.toolbarRight}>
          <button 
            className={`${styles.outlineBtn} ${showFilters ? styles.active : ''}`}
            onClick={() => setShowFilters(!showFilters)}
            style={{ backgroundColor: showFilters ? '#e2e8f0' : 'white' }}
          >
            <Filter size={16} /> Filter
          </button>
          <select 
            className={styles.outlineBtn} 
            style={{ appearance: 'auto' }}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="Terbaru">Urutkan: Terbaru</option>
            <option value="A-Z">Urutkan: A-Z</option>
            <option value="Z-A">Urutkan: Z-A</option>
            <option value="Stok Terbanyak">Urutkan: Stok Terbanyak</option>
            <option value="Stok Terdikit">Urutkan: Stok Terdikit</option>
          </select>
          <div className={styles.viewToggle}>
            <button 
              className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.active : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              className={`${styles.viewBtn} ${viewMode === 'list' ? styles.active : ''}`}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              <ListIcon size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Pills Filter */}
      {showFilters && (
        <div className={styles.pillsContainer}>
          <div className={styles.pillsGroup}>
            {['Semua', 'Stok Aman', 'Stok Menipis', 'Stok Habis'].map(f => (
              <button 
                key={f} 
                className={`${styles.pill} ${statusFilter === f ? styles.active : ''}`}
                onClick={() => setStatusFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
          
          <div className={styles.pillsGroupSeparator}></div>

          <div className={styles.pillsGroup}>
            {['Semua Kategori', 'Makanan & Minuman', 'Kesehatan', 'Kebutuhan Rumah Tangga', 'Lainnya'].map(c => (
              <button 
                key={c} 
                className={`${styles.pill} ${categoryFilter === c ? styles.active : ''}`}
                onClick={() => setCategoryFilter(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Product List/Grid */}
      <div className={styles.content}>
        <div className={styles.gridWrapper}>
          <ProductGrid 
            products={filteredProducts} 
            viewMode={viewMode}
            onSelect={(p) => setSelectedProduct(p)}
            selectedBarcode={selectedProduct?.barcode}
            onEdit={handleEditProduct}
            threshold={threshold}
          />
        </div>
        
        {selectedProduct && (
          <div className={styles.panelWrapper}>
            <ProductDetailPanel 
              product={selectedProduct}
              onClose={() => setSelectedProduct(null)}
              onEdit={handleEditProduct}
              isOwner={isOwner}
            />
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className={styles.pagination}>
        <div className={styles.pageInfo}>
          Menampilkan 1 - {filteredProducts.length} dari {products.length} produk
        </div>
        <div className={styles.pageControls}>
          <button className={`${styles.pageBtn} ${styles.disabled}`}><ChevronLeft size={16} /></button>
          <button className={`${styles.pageBtn} ${styles.active}`}>1</button>
          <button className={styles.pageBtn}>2</button>
          <button className={styles.pageBtn}>3</button>
          <span className={styles.pageDots}>...</span>
          <button className={styles.pageBtn}>21</button>
          <button className={styles.pageBtn}><ChevronRight size={16} /></button>
          
          <select className={styles.perPageSelect}>
            <option>12 / halaman</option>
            <option>24 / halaman</option>
            <option>48 / halaman</option>
          </select>
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      {isFormOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <ProductForm 
              product={editingProduct} 
              onSave={handleSaveProduct} 
              onCancel={() => setIsFormOpen(false)}
              isOwner={isOwner}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterProdukPage;
