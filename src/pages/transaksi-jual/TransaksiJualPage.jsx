import React, { useState } from 'react';
import CustomerSelector from './CustomerSelector';
import CartPanel from './CartPanel';
import PaymentPanel from './PaymentPanel';
import NotaPreview from './NotaPreview';
import styles from './TransaksiJualPage.module.css';

// Mock Product Database for barcode scanning
const MOCK_PRODUCTS = [
  { id: 'p1', kode_barang: '899999900001', nama_barang: 'Beras Pandan Wangi 5kg', harga_jual: 75000 },
  { id: 'p2', kode_barang: '899999900002', nama_barang: 'Minyak Goreng Bimoli 2L', harga_jual: 35000 },
  { id: 'p3', kode_barang: '899999900003', nama_barang: 'Gula Pasir Gulaku 1kg', harga_jual: 16000 },
  { id: 'p4', kode_barang: '899999900004', nama_barang: 'Indomie Goreng', harga_jual: 3000 },
];

export default function TransaksiJualPage() {
  const [customer, setCustomer] = useState(null);
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [completedTransaction, setCompletedTransaction] = useState(null);

  const handleScanBarcode = (barcode) => {
    // Look up product
    const product = MOCK_PRODUCTS.find((p) => p.kode_barang === barcode);
    
    if (product) {
      setCart((prevCart) => {
        const existingItem = prevCart.find((item) => item.id === product.id);
        if (existingItem) {
          // Increment qty
          return prevCart.map((item) =>
            item.id === product.id
              ? { ...item, qty: item.qty + 1, subtotal: (item.qty + 1) * item.harga_jual }
              : item
          );
        } else {
          // Add new item
          return [...prevCart, { ...product, qty: 1, subtotal: product.harga_jual }];
        }
      });
    } else {
      // Show error (can be a toast in a real app)
      alert('Produk dengan barcode ' + barcode + ' tidak ditemukan');
    }
  };

  const handleSaveTransaction = () => {
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
    setPaymentMethod('');
    setCompletedTransaction(null);
  };

  return (
    <div className={styles.pageContainer}>
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Kasir (Transaksi Jual)</h1>
        <div className={styles.headerCustomer}>
          <CustomerSelector 
            selectedCustomer={customer} 
            onSelectCustomer={setCustomer} 
          />
        </div>
      </header>
      
      <div className={styles.mainContent}>
        <div className={styles.leftColumn}>
          <CartPanel 
            cart={cart} 
            setCart={setCart} 
            onScanBarcode={handleScanBarcode} 
          />
        </div>
        
        <div className={styles.rightColumn}>
          <PaymentPanel 
            customer={customer}
            cart={cart}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
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
    </div>
  );
}
