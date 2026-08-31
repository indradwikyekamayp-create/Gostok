import React, { useState, useEffect, useContext } from 'react';
import { collection, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import styles from './PelangganPage.module.css';
import PelangganList from './PelangganList';
import PelangganForm from './PelangganForm';
import { useNavigate } from 'react-router-dom';
import { ToastContext } from '../../context/ToastContext';

export default function PelangganPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useContext(ToastContext);

  useEffect(() => {
    const custRef = collection(db, 'customers');
    const unsubscribe = onSnapshot(custRef, (snapshot) => {
      const data = [];
      snapshot.forEach(doc => {
        data.push({ ...doc.data(), id: doc.id });
      });
      setCustomers(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredCustomers = customers.filter(c => 
    c.nama_perusahaan?.toLowerCase().includes(search.toLowerCase()) || 
    c.nama_pic?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (customer) => {
    navigate(`/pelanggan/${customer.id}`);
  };

  const handleSave = async (data) => {
    try {
      const newRef = doc(collection(db, 'customers'));
      await setDoc(newRef, { ...data, total_hutang_berjalan: 0 });
      setShowForm(false);
    } catch (err) {
      console.error(err);
      showToast('Gagal menyimpan pelanggan', 'error');
    }
  };

  return (
    <div className={`${styles.container} flutter-page`}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <h1>Daftar Pelanggan</h1>
          <p>Kelola data pelanggan dan pantau hutang piutang.</p>
        </div>
        <button className={`${styles.addButton} flutter-ripple`} onClick={() => setShowForm(true)}>
          + Tambah Pelanggan
        </button>
      </header>

      <div className={styles.searchContainer}>
        <input 
          type="text" 
          placeholder="Cari pelanggan atau PIC..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      <main className={styles.content}>
        <PelangganList 
          customers={filteredCustomers} 
          onSelect={handleSelect} 
          loading={false}
        />
      </main>

      {showForm && (
        <PelangganForm 
          customer={null} 
          onSave={handleSave} 
          onCancel={() => setShowForm(false)} 
        />
      )}
    </div>
  );
}
