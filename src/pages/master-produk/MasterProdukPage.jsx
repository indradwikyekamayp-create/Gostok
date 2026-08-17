import React, { useState, useEffect } from 'react';
import styles from './MasterProdukPage.module.css';
import ProductGrid from './ProductGrid';
import ProductDetailPanel from './ProductDetailPanel';
import ProductForm from './ProductForm';
// import { useProducts } from '../../hooks/useProducts'; // Will be used when Firebase is connected

// Mock data
const MOCK_PRODUCTS = [
  { barcode: '1234567890', nama_barang: 'Kopi Kapal Api', kategori: 'Minuman', asal: 'Lokal', satuan: 'pcs', harga_jual: 15000, harga_modal: 12000, stok: 15, foto: null },
  { barcode: '0987654321', nama_barang: 'Biskuit Roma', kategori: 'Makanan', asal: 'Lokal', satuan: 'dus', harga_jual: 50000, harga_modal: 40000, stok: 5, foto: null },
  { barcode: '1122334455', nama_barang: 'Coklat Toblerone', kategori: 'Makanan', asal: 'Impor', satuan: 'pcs', harga_jual: 35000, harga_modal: 25000, stok: 2, foto: null },
];

const MasterProdukPage = () => {
  const [products, setProducts] = useState(MOCK_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('Semua');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Mock owner status
  const isOwner = true;

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.nama_barang.toLowerCase().includes(searchQuery.toLowerCase()) || p.barcode.includes(searchQuery);
    let matchesFilter = true;
    if (filter === 'Impor') matchesFilter = p.asal === 'Impor';
    if (filter === 'Lokal') matchesFilter = p.asal === 'Lokal';
    if (filter === 'Stok Menipis') matchesFilter = p.stok < 10;
    
    return matchesSearch && matchesFilter;
  });

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
  };

  const handleCloseDetail = () => {
    setSelectedProduct(null);
  };

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
    setSelectedProduct(savedProduct);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.searchBar}>
          <input 
            type="text" 
            placeholder="Cari produk (Nama atau Barcode)..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        <button className={styles.addButton} onClick={handleAddProduct}>+ Tambah Produk</button>
      </header>
      
      <div className={styles.filters}>
        {['Semua', 'Impor', 'Lokal', 'Stok Menipis'].map(f => (
          <button 
            key={f} 
            className={`${styles.filterChip} ${filter === f ? styles.active : ''}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <div className={styles.content}>
        <div className={styles.mainGrid}>
          <ProductGrid 
            products={filteredProducts} 
            onSelect={handleSelectProduct}
            selectedBarcode={selectedProduct?.barcode}
          />
        </div>
        
        {selectedProduct && (
          <div className={styles.sidePanel}>
            <ProductDetailPanel 
              product={selectedProduct} 
              onClose={handleCloseDetail}
              onEdit={() => handleEditProduct(selectedProduct)}
              isOwner={isOwner}
            />
          </div>
        )}
      </div>

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
