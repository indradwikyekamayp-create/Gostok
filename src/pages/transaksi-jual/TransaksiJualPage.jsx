import React, { useState, useEffect, useContext } from 'react';
import { collection, onSnapshot, doc, setDoc, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '../../firebase';
import CustomerSelector from './CustomerSelector';
import ProductGrid from './ProductGrid';
import CartPanel from './CartPanel';
import NotaPreview from './NotaPreview';
import PelangganForm from '../pelanggan/PelangganForm';
import { ToastContext } from '../../context/ToastContext';
import styles from './TransaksiJualPage.module.css';

export default function TransaksiJualPage() {
  const { showToast } = useContext(ToastContext);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [cart, setCart] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [completedTransaction, setCompletedTransaction] = useState(null);
  const [showCustomerForm, setShowCustomerForm] = useState(false);

  useEffect(() => {
    // Listen to customers
    const custRef = collection(db, 'customers');
    const unsubCust = onSnapshot(custRef, (snapshot) => {
      const data = [];
      snapshot.forEach(doc => data.push({ ...doc.data(), id: doc.id }));
      setCustomers(data);
    });

    // Listen to products
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
    // Synchronize cart with latest product data (e.g. real-time price updates)
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
    const product = products.find((p) => p.barcode === barcode || p.kode_barang === barcode);
    if (product) {
      handleAddToCart(product);
    } else {
      showToast('Produk dengan barcode ' + barcode + ' tidak ditemukan', 'warning');
    }
  };

  const handleSaveTransaction = async (paymentMethod, catatan) => {
    if (!customer || cart.length === 0 || !paymentMethod) return;
    
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
      
      const newTransaction = {
        noNota,
        tanggal: now.toISOString(),
        customer,
        cart,
        paymentMethod,
        catatan,
        grandTotal,
        totalModal,
        keuntungan: grandTotal - totalModal
      };
      
      const batch = writeBatch(db);
      
      // Create transaction document
      const txRef = doc(collection(db, 'transactions'));
      batch.set(txRef, { ...newTransaction, id: txRef.id });

      // Update product stocks
      for (const item of cart) {
        const prodRef = doc(db, 'products', item.id);
        const newStock = Math.max(0, (item.stok || 0) - item.qty);
        batch.update(prodRef, { stok: newStock });
      }

      // If Piutang (Kredit), update customer total hutang
      const pmStr = (paymentMethod || '').toLowerCase();
      if (pmStr === 'bon' || pmStr === 'kredit') {
        const custRef = doc(db, 'customers', customer.id);
        const newHutang = (customer.total_hutang_berjalan || 0) + grandTotal;
        batch.update(custRef, { total_hutang_berjalan: newHutang });
      }

      await batch.commit();

      setCompletedTransaction({ ...newTransaction, id: txRef.id, displayDate: new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(new Date()) });
      showToast('Transaksi berhasil disimpan! Nota siap dicetak.', 'success');
    } catch (err) {
      console.error('Error saving transaction:', err);
      showToast('Gagal menyimpan transaksi: ' + err.message, 'error');
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
      showToast('Pelanggan baru berhasil ditambahkan', 'success');
    } catch (err) {
      console.error(err);
      showToast('Gagal menyimpan pelanggan baru', 'error');
    }
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
            products={products} 
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
            hasCustomer={!!customer}
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
