import React, { useState, useEffect } from 'react';
import { Package, CheckCircle, AlertCircle, XCircle, Search, Filter, LayoutGrid, List as ListIcon, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { collection, onSnapshot, doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../hooks/useAuth';
import styles from './MasterProdukPage.module.css';
import ProductGrid from './ProductGrid';
import ProductForm from './ProductForm';

const MasterProdukPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [categoryFilter, setCategoryFilter] = useState('Semua Kategori');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const { isOwner } = useAuth();

  // Fetch products from Firestore
  useEffect(() => {
    const productsRef = collection(db, 'products');
    const unsubscribe = onSnapshot(productsRef, (snapshot) => {
      const productsData = [];
      snapshot.forEach((doc) => {
        productsData.push({ ...doc.data(), id: doc.id });
      });
      setProducts(productsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filtering Logic
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.nama_barang.toLowerCase().includes(searchQuery.toLowerCase()) || p.barcode.includes(searchQuery);
    
    let matchesStatus = true;
    if (statusFilter === 'Stok Aman') matchesStatus = p.stok > 10;
    if (statusFilter === 'Stok Menipis') matchesStatus = p.stok > 0 && p.stok <= 10;
    if (statusFilter === 'Stok Habis') matchesStatus = p.stok === 0;

    let matchesCategory = true;
    if (categoryFilter !== 'Semua Kategori') {
      matchesCategory = p.kategori === categoryFilter;
    }
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Calculate Stats
  const totalProducts = products.length;
  const stokAman = products.filter(p => p.stok > 10).length;
  const stokMenipis = products.filter(p => p.stok > 0 && p.stok <= 10).length;
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
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Gagal menyimpan produk: " + error.message);
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
          <button className={styles.outlineBtn}>
            <Filter size={16} /> Filter
          </button>
          <select className={styles.outlineBtn} style={{ appearance: 'auto' }}>
            <option>Urutkan: Terbaru</option>
            <option>Urutkan: A-Z</option>
            <option>Urutkan: Stok Terbanyak</option>
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

      {/* Product List/Grid */}
      <div className={styles.content}>
        <ProductGrid 
          products={filteredProducts} 
          viewMode={viewMode}
          onEdit={handleEditProduct}
        />
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
