import React, { useState } from 'react';
import CustomerSelector from './CustomerSelector';
import ProductGrid from './ProductGrid';
import CartPanel from './CartPanel';
import NotaPreview from './NotaPreview';
import PelangganForm from '../pelanggan/PelangganForm';
import styles from './TransaksiJualPage.module.css';

// Mock Product Database for barcode scanning
const MOCK_PRODUCTS = [
  { id: 'p1', kode_barang: '899999900001', nama_barang: 'Beras Pandan Wangi 5kg', harga_jual: 75000, stok: 120, kategori: 'Makanan', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=200&q=80' },
  { id: 'p2', kode_barang: '899999900002', nama_barang: 'Minyak Goreng Bimoli 2L', harga_jual: 35000, stok: 95, kategori: 'Makanan', image: 'https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?auto=format&fit=crop&w=200&q=80' },
  { id: 'p3', kode_barang: '899999900003', nama_barang: 'Gula Pasir Gulaku 1kg', harga_jual: 16000, stok: 80, kategori: 'Makanan', image: 'https://images.unsplash.com/photo-1581441363689-1f3c3c414635?auto=format&fit=crop&w=200&q=80' },
  { id: 'p4', kode_barang: '899999900004', nama_barang: 'Indomie Goreng', harga_jual: 3000, stok: 240, kategori: 'Makanan', image: 'https://images.unsplash.com/photo-1612061078272-97422f283287?auto=format&fit=crop&w=200&q=80' },
  { id: 'p5', kode_barang: '899999900005', nama_barang: 'Tepung Terigu Segitiga 1kg', harga_jual: 12000, stok: 75, kategori: 'Makanan', image: 'https://images.unsplash.com/photo-1627485937980-221c88ac04f9?auto=format&fit=crop&w=200&q=80' },
  { id: 'p6', kode_barang: '899999900006', nama_barang: 'Susu Frisian Flag 1L', harga_jual: 17000, stok: 60, kategori: 'Minuman', image: 'https://images.unsplash.com/photo-1563636619276-24a7e6e6b7b6?auto=format&fit=crop&w=200&q=80' },
];

const INITIAL_CUSTOMERS = [
  { id: 'c1', nama_perusahaan: 'CV Sumber Rejeki', nama_pic: 'Pak Budi', total_hutang_berjalan: 5000000 },
  { id: 'c2', nama_perusahaan: 'PT Maju Jaya', nama_pic: 'Bu Siti', total_hutang_berjalan: 0 },
  { id: 'c3', nama_perusahaan: 'UD Makmur Sentosa', nama_pic: 'Pak Ahmad', total_hutang_berjalan: 12500000 },
];

export default function TransaksiJualPage() {
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);
  const [customer, setCustomer] = useState(null);
  const [cart, setCart] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [completedTransaction, setCompletedTransaction] = useState(null);
  const [showCustomerForm, setShowCustomerForm] = useState(false);

  const handleAddToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
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

  const handleScanBarcode = (barcode) => {
    const product = MOCK_PRODUCTS.find((p) => p.kode_barang === barcode);
    if (product) {
      handleAddToCart(product);
    } else {
      alert('Produk dengan barcode ' + barcode + ' tidak ditemukan');
    }
  };

  const handleSaveTransaction = (paymentMethod, catatan) => {
    if (!customer || cart.length === 0 || !paymentMethod) return;
    
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      const grandTotal = cart.reduce((acc, item) => acc + item.subtotal, 0);
      const newTransaction = {
        id: `INV-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(Math.random() * 1000).toString().padStart(4, '0')}`,
        tanggal: new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(new Date()),
        customer,
        cart,
        paymentMethod,
        catatan,
        grandTotal
      };
      
      setCompletedTransaction(newTransaction);
      setIsSaving(false);
      
      // Reset form will happen after closing the nota preview
    }, 800);
  };

  const handleCloseNota = () => {
    // Reset state for next transaction
    setCustomer(null);
    setCart([]);
    setCompletedTransaction(null);
  };

  const handleSaveCustomer = (newCustomerData) => {
    const newCustomer = {
      id: `c${Date.now()}`,
      nama_perusahaan: newCustomerData.nama_perusahaan,
      nama_pic: newCustomerData.nama_pic || '-',
      total_hutang_berjalan: 0
    };
    
    setCustomers((prev) => [...prev, newCustomer]);
    setCustomer(newCustomer);
    setShowCustomerForm(false);
  };

  return (
    <div className={styles.pageContainer}>
      <header className={styles.pageHeader}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>Kasir (Transaksi Jual)</h1>
          <p className={styles.pageSubtitle}>Tambah produk ke keranjang dan selesaikan transaksi</p>
        </div>
        <div className={styles.headerCustomer}>
          <div className={styles.customerSelectorWrapper}>
            <CustomerSelector 
              selectedCustomer={customer} 
              onSelectCustomer={setCustomer}
              customers={customers}
              onAddCustomerClick={() => setShowCustomerForm(true)}
            />
          </div>
          <button 
            className={styles.newCustomerBtn}
            onClick={() => setShowCustomerForm(true)}
          >
            + Pelanggan Baru
          </button>
        </div>
      </header>
      
      <div className={styles.mainContent}>
        <div className={styles.leftColumn}>
          <ProductGrid 
            products={MOCK_PRODUCTS} 
            onAddToCart={handleAddToCart}
            onScanBarcode={handleScanBarcode}
          />
        </div>
        
        <div className={styles.rightColumn}>
          <CartPanel 
            cart={cart} 
            setCart={setCart} 
            onSave={handleSaveTransaction}
            isSaving={isSaving}
          />
        </div>
      </div>

      {completedTransaction && (
        <NotaPreview 
          transaction={completedTransaction} 
          onClose={handleCloseNota} 
        />
      )}

      {showCustomerForm && (
        <PelangganForm 
          onSave={handleSaveCustomer}
          onCancel={() => setShowCustomerForm(false)}
        />
      )}
    </div>
  );
}
