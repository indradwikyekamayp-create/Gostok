import React, { useState, useEffect, useContext, useMemo } from 'react';
import { collection, onSnapshot, doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import ProductGrid from './ProductGrid';
import ProductDetailPanel from './ProductDetailPanel';
import ProductForm from './ProductForm';
import { ToastContext } from '../../context/ToastContext';
import { useAuth } from '../../hooks/useAuth';
import styles from './MasterProdukPage.module.css';
import { 
  Plus, 
  Search, 
  Filter, 
  LayoutGrid, 
  List as ListIcon,
  ChevronLeft,
  ChevronRight,
  Package,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';

import useIsMobile from '../../hooks/useIsMobile';
import MasterProdukMobile from './MasterProdukMobile';

function MasterProdukDesktop({ 
  products, filteredProducts, totalProducts, stokAman, stokMenipis, stokHabis,
  searchQuery, setSearchQuery,
  statusFilter, setStatusFilter,
  categoryFilter, setCategoryFilter,
  sortBy, setSortBy,
  viewMode, setViewMode,
  handleAddProduct, handleEditProduct, handleSaveProduct,
  isFormOpen, setIsFormOpen,
  editingProduct,
  isOwner, threshold,
  selectedProduct, setSelectedProduct,
  showFilters, setShowFilters,
  isKasir,
  currentPage, setCurrentPage,
  itemsPerPage, setItemsPerPage
}) {
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );
  
  // Create pagination range (e.g. 1, 2, 3, ..., 10)
  const renderPaginationButtons = () => {
    const buttons = [];
    const maxButtons = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = startPage + maxButtons - 1;
    
    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    if (startPage > 1) {
      buttons.push(<button key="1" className={styles.pageBtn} onClick={() => setCurrentPage(1)}>1</button>);
      if (startPage > 2) buttons.push(<span key="dots1" className={styles.pageDots}>...</span>);
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button 
          key={i} 
          className={`${styles.pageBtn} ${currentPage === i ? styles.active : ''}`}
          onClick={() => setCurrentPage(i)}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) buttons.push(<span key="dots2" className={styles.pageDots}>...</span>);
      buttons.push(<button key={totalPages} className={styles.pageBtn} onClick={() => setCurrentPage(totalPages)}>{totalPages}</button>);
    }

    return buttons;
  };
  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <h1>Master Produk</h1>
          <p>Kelola seluruh data produk toko Anda</p>
        </div>
        {!isKasir && (
          <button className={styles.addButton} onClick={handleAddProduct}>
            <Plus size={18} /> Tambah Produk
          </button>
        )}
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

      {/* Controls Bar */}
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
            products={currentProducts} 
            viewMode={viewMode}
            onSelect={(p) => setSelectedProduct(p)}
            selectedBarcode={selectedProduct?.barcode}
            onEdit={handleEditProduct}
            threshold={threshold}
            isKasir={isKasir}
          />
        </div>
        
        {selectedProduct && (
          <div className={styles.panelWrapper}>
            <ProductDetailPanel 
              product={selectedProduct}
              onClose={() => setSelectedProduct(null)}
              onEdit={handleEditProduct}
              isOwner={isOwner}
              isKasir={isKasir}
            />
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className={styles.pagination}>
        <div className={styles.pageInfo}>
          Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredProducts.length)} dari {filteredProducts.length} produk (Total: {products.length})
        </div>
        <div className={styles.pageControls}>
          <button 
            className={`${styles.pageBtn} ${currentPage === 1 ? styles.disabled : ''}`}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={16} />
          </button>
          
          {renderPaginationButtons()}
          
          <button 
            className={`${styles.pageBtn} ${currentPage === totalPages ? styles.disabled : ''}`}
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight size={16} />
          </button>
          
          <select 
            className={styles.perPageSelect}
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={10}>10 / halaman</option>
            <option value={20}>20 / halaman</option>
            <option value={50}>50 / halaman</option>
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
}

const MasterProdukPage = () => {
  const isMobile = useIsMobile();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [categoryFilter, setCategoryFilter] = useState('Semua Kategori');
  const [sortBy, setSortBy] = useState('Terbaru');
  const [viewMode, setViewMode] = useState('grid');
  
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, categoryFilter, sortBy]);

  const { showToast } = useContext(ToastContext);
  const { isOwner, isAdmin, isKasir } = useAuth();
  const [threshold, setThreshold] = useState(10);

  useEffect(() => {
    // Listen to threshold setting
    const unsubSettings = onSnapshot(doc(db, 'settings', 'store_config'), (docSnap) => {
      if (docSnap.exists() && docSnap.data().stockThreshold) {
        setThreshold(docSnap.data().stockThreshold);
      }
    });

    const productsRef = collection(db, 'products');
    const unsubscribe = onSnapshot(productsRef, (snapshot) => {
      const productsData = [];
      snapshot.forEach((doc) => {
        productsData.push({ id: doc.id, ...doc.data() });
      });
      setProducts(productsData);
      setLoading(false);
    });

    return () => {
      unsubscribe();
      unsubSettings();
    };
  }, []);

  const filteredProducts = useMemo(() => {
    let result = products;

    // Search
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(p => 
        (p.nama_barang && p.nama_barang.toLowerCase().includes(lowerQuery)) ||
        (p.barcode && p.barcode.toLowerCase().includes(lowerQuery))
      );
    }

    // Status Filter
    if (statusFilter !== 'Semua') {
      result = result.filter(p => {
        const qty = Number(p.stok || p.stok_tersedia || 0);
        if (statusFilter === 'Stok Aman') return qty > threshold;
        if (statusFilter === 'Stok Menipis') return qty > 0 && qty <= threshold;
        if (statusFilter === 'Stok Habis') return qty <= 0;
        return true;
      });
    }

    // Category Filter
    if (categoryFilter !== 'Semua Kategori') {
      result = result.filter(p => p.kategori === categoryFilter);
    }

    // Sorting
    switch (sortBy) {
      case 'A-Z':
        result.sort((a, b) => a.nama_barang.localeCompare(b.nama_barang));
        break;
      case 'Z-A':
        result.sort((a, b) => b.nama_barang.localeCompare(a.nama_barang));
        break;
      case 'Stok Terbanyak':
        result.sort((a, b) => Number(b.stok || b.stok_tersedia || 0) - Number(a.stok || a.stok_tersedia || 0));
        break;
      case 'Stok Terdikit':
        result.sort((a, b) => Number(a.stok || a.stok_tersedia || 0) - Number(b.stok || b.stok_tersedia || 0));
        break;
      case 'Terbaru':
      default:
        // Assuming no createdAt field right now, just default order
        break;
    }

    return result;
  }, [products, searchQuery, statusFilter, categoryFilter, sortBy, threshold]);

  const totalProducts = products.length;
  const stokAman = products.filter(p => Number(p.stok || p.stok_tersedia || 0) > threshold).length;
  const stokMenipis = products.filter(p => Number(p.stok || p.stok_tersedia || 0) > 0 && Number(p.stok || p.stok_tersedia || 0) <= threshold).length;
  const stokHabis = products.filter(p => Number(p.stok || p.stok_tersedia || 0) <= 0).length;

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

  const commonProps = {
    products, filteredProducts, totalProducts, stokAman, stokMenipis, stokHabis,
    searchQuery, setSearchQuery,
    statusFilter, setStatusFilter,
    categoryFilter, setCategoryFilter,
    sortBy, setSortBy,
    viewMode, setViewMode,
    handleAddProduct, handleEditProduct, handleSaveProduct,
    isFormOpen, setIsFormOpen,
    editingProduct,
    isOwner, threshold,
    selectedProduct, setSelectedProduct,
    showFilters, setShowFilters,
    isKasir,
    currentPage, setCurrentPage,
    itemsPerPage, setItemsPerPage
  };

  return isMobile ? <MasterProdukMobile {...commonProps} /> : <MasterProdukDesktop {...commonProps} />;
};

export default MasterProdukPage;
