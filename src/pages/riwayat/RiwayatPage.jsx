import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import styles from './RiwayatPage.module.css';
import FilterBar from './FilterBar';
import TransactionTable from './TransactionTable';
import NotaPreview from '../transaksi-jual/NotaPreview';

const RiwayatPage = () => {
  const [storeName, setStoreName] = useState('PT. WELINDO SUKSES BERSAMA');
  const [transactions, setTransactions] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    customer: '',
    product: '',
    status: 'Semua'
  });

  useEffect(() => {
    const q = query(collection(db, 'transactions'), orderBy('tanggal', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = [];
      snapshot.forEach(doc => {
        data.push({ ...doc.data(), _id: doc.id });
      });
      // Convert older transactions to match the UI shape if needed
      const normalizedData = data.map(t => ({
        id: t.id || t._id,
        no_nota: t.noNota || t.id || t._id,
        tanggal: t.tanggal,
        pelanggan: { nama: t.customer?.nama_perusahaan || t.customer?.nama_pic || 'Umum' },
        total_bayar: t.grandTotal,
        status_bayar: (
          ['bon', 'kredit', 'hutang'].includes((t.paymentMethod || t.metodePembayaran || '').toLowerCase())
        ) ? 'belum_lunas' : 'lunas',
        sisa_hutang: (
          ['bon', 'kredit', 'hutang'].includes((t.paymentMethod || t.metodePembayaran || '').toLowerCase())
        ) ? t.grandTotal : 0,
        items: t.cart?.map(c => ({
          id: c.id,
          nama_barang: c.nama_barang,
          kode_barang: c.barcode || c.kode_barang || c.id || '-',
          qty: c.qty,
          harga: c.harga_jual,
          subtotal: c.subtotal
        })) || [],
        raw: t
      }));
      setAllTransactions(normalizedData);
      setLoading(false);
    });

    const unsubSettings = onSnapshot(doc(db, 'settings', 'store_config'), (docSnap) => {
      if (docSnap.exists() && docSnap.data().namaToko) {
        let nama = docSnap.data().namaToko;
        if (nama === 'AyoStock!') nama = 'PT. WELINDO SUKSES BERSAMA';
        setStoreName(nama);
      }
    });

    return () => {
      unsubscribe();
      unsubSettings();
    };
  }, []);

  useEffect(() => {
    let filtered = [...allTransactions];
    
    if (filters.customer) {
      const search = filters.customer.toLowerCase();
      filtered = filtered.filter(t => 
        t.pelanggan.nama.toLowerCase().includes(search) || 
        t.no_nota.toLowerCase().includes(search)
      );
    }
    if (filters.status !== 'Semua') {
      const statusMap = { 'Lunas': 'lunas', 'Belum Lunas': 'belum_lunas', 'Cicilan': 'cicil' };
      filtered = filtered.filter(t => t.status_bayar === statusMap[filters.status]);
    }
    if (filters.product) {
      filtered = filtered.filter(t => t.items.some(item => item.nama_barang.toLowerCase().includes(filters.product.toLowerCase())));
    }
    if (filters.startDate) {
      filtered = filtered.filter(t => new Date(t.tanggal) >= new Date(filters.startDate));
    }
    if (filters.endDate) {
      const end = new Date(filters.endDate);
      end.setDate(end.getDate() + 1);
      filtered = filtered.filter(t => new Date(t.tanggal) < end);
    }

    setTransactions(filtered);
  }, [filters, allTransactions]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleViewDetail = (transaction) => {
    // Toggling is handled in the table component now
  };

  const handleReprint = (transaction) => {
    setSelectedTransaction(transaction.raw);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Riwayat Transaksi</h1>
        <p className={styles.subtitle}>{storeName}</p>
      </header>

      <section className={styles.filterSection}>
        <FilterBar 
          filters={filters} 
          onFilterChange={handleFilterChange} 
        />
      </section>

      <section className={styles.tableSection}>
        <TransactionTable 
          transactions={transactions} 
          loading={loading}
          onViewDetail={handleViewDetail}
          onReprint={handleReprint}
        />
      </section>

      {selectedTransaction && (
        <NotaPreview 
          transaction={selectedTransaction} 
          onClose={() => setSelectedTransaction(null)} 
        />
      )}
    </div>
  );
};

export default RiwayatPage;
