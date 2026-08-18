import React, { useState } from 'react';
import { Package, CheckCircle, AlertCircle, XCircle, Search, Filter, LayoutGrid, List as ListIcon, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import styles from './MasterProdukPage.module.css';
import ProductGrid from './ProductGrid';
import ProductForm from './ProductForm';

// Mock data (extended)
const MOCK_PRODUCTS = [
  { barcode: '8999999999999', nama_barang: 'Indomie Goreng', kategori: 'Makanan & Minuman', asal: 'Lokal', satuan: 'pcs', harga_jual: 3500, harga_modal: 2800, stok: 240, foto: 'https://images.unsplash.com/photo-1612061078272-97422f283287?auto=format&fit=crop&w=200&q=80' },
  { barcode: '8998888888888', nama_barang: 'Minyak Bimoli 2L', kategori: 'Kebutuhan Rumah', asal: 'Lokal', satuan: 'pcs', harga_jual: 28000, harga_modal: 25000, stok: 15, foto: 'https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?auto=format&fit=crop&w=200&q=80' },
  { barcode: '8997777777777', nama_barang: 'Beras Rojolele 5kg', kategori: 'Kebutuhan Rumah', asal: 'Lokal', satuan: 'pcs', harga_jual: 64000, harga_modal: 55000, stok: 30, foto: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=200&q=80' },
  { barcode: '8996666666666', nama_barang: 'Kopi Kapal Api 165g', kategori: 'Makanan & Minuman', asal: 'Lokal', satuan: 'pcs', harga_jual: 15000, harga_modal: 12000, stok: 8, foto: 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&w=200&q=80' },
  { barcode: '8995555555555', nama_barang: 'Susu Ultra Milk 1L', kategori: 'Makanan & Minuman', asal: 'Lokal', satuan: 'pcs', harga_jual: 18000, harga_modal: 15000, stok: 0, foto: 'https://images.unsplash.com/photo-1563636619276-24a7e6e6b7b6?auto=format&fit=crop&w=200&q=80' },
  { barcode: '8994444444444', nama_barang: 'Roma Biskuit Kelapa', kategori: 'Makanan & Minuman', asal: 'Lokal', satuan: 'dus', harga_jual: 12000, harga_modal: 9000, stok: 5, foto: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=200&q=80' },
  { barcode: '8993333333333', nama_barang: 'Tango Wafer Cokelat', kategori: 'Makanan & Minuman', asal: 'Lokal', satuan: 'pcs', harga_jual: 4000, harga_modal: 3000, stok: 50, foto: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=200&q=80' },
  { barcode: '8992222222222', nama_barang: 'Rinso Anti Noda 1.8kg', kategori: 'Kebutuhan Rumah', asal: 'Lokal', satuan: 'pcs', harga_jual: 39000, harga_modal: 35000, stok: 12, foto: 'https://images.unsplash.com/photo-1584824486509-11459466a203?auto=format&fit=crop&w=200&q=80' },
  { barcode: '8991111111111', nama_barang: 'Pepsodent 190g', kategori: 'Kebutuhan Rumah', asal: 'Lokal', satuan: 'pcs', harga_jual: 9000, harga_modal: 7000, stok: 25, foto: 'https://images.unsplash.com/photo-1554189097-ffe88e998a2b?auto=format&fit=crop&w=200&q=80' },
  { barcode: '8990000000000', nama_barang: 'Lifebuoy Total 10', kategori: 'Kebutuhan Rumah', asal: 'Lokal', satuan: 'pcs', harga_jual: 5000, harga_modal: 3500, stok: 0, foto: null },
];

const MasterProdukPage = () => {
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');
  const [categoryFilter, setCategoryFilter] = useState('Semua Kategori');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const isOwner = true; // Mock owner status

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

  const handleSaveProduct = (savedProduct) => {
    if (editingProduct) {
      setProducts(products.map(p => p.barcode === savedProduct.barcode ? savedProduct : p));
    } else {
      setProducts([...products, savedProduct]);
    }
    setIsFormOpen(false);
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
          {['Semua Kategori', 'Makanan & Minuman', 'Kebutuhan Rumah', 'Elektronik', 'Lainnya'].map(c => (
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
