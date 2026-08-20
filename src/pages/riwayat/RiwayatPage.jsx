import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import styles from './RiwayatPage.module.css';
import FilterBar from './FilterBar';
import TransactionTable from './TransactionTable';

const RiwayatPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
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
        no_nota: t.id || t._id,
        tanggal: t.tanggal,
        pelanggan: { nama: t.customer?.nama_perusahaan || t.customer?.nama_pic || 'Umum' },
        total_bayar: t.grandTotal,
        status_bayar: t.paymentMethod === 'Kredit' ? 'belum_lunas' : 'lunas',
        sisa_hutang: t.paymentMethod === 'Kredit' ? t.grandTotal : 0,
        items: t.cart?.map(c => ({
          id: c.id,
          nama_barang: c.nama_barang,
          qty: c.qty,
          harga: c.harga_jual,
          subtotal: c.subtotal
        })) || []
      }));
      setAllTransactions(normalizedData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let filtered = [...allTransactions];
    
    if (filters.customer) {
      filtered = filtered.filter(t => t.pelanggan.nama.toLowerCase().includes(filters.customer.toLowerCase()));
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
    console.log('View detail', transaction);
  };

  const handleReprint = (transaction) => {
    console.log('Reprint nota', transaction);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Riwayat Transaksi</h1>
        <p className={styles.subtitle}>PT. WELINDO SUKSES BERSAMA</p>
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
    </div>
  );
};

export default RiwayatPage;
