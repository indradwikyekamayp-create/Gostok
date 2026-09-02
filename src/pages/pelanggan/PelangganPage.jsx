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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);
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

  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / itemsPerPage));
  const currentCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
          customers={currentCustomers} 
          onSelect={handleSelect} 
          loading={loading}
        />
        
        {/* Pagination */}
        <div className={styles.pagination}>
          <div className={styles.pageInfo}>
            Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredCustomers.length)} dari {filteredCustomers.length} pelanggan
          </div>
          <div className={styles.pageControls}>
            <button 
              className={`${styles.pageBtn} ${currentPage === 1 ? styles.disabled : ''}`}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              &lt;
            </button>
            
            {renderPaginationButtons()}
            
            <button 
              className={`${styles.pageBtn} ${currentPage === totalPages ? styles.disabled : ''}`}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              &gt;
            </button>
            
            <select 
              className={styles.perPageSelect}
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={12}>12 / halaman</option>
              <option value={24}>24 / halaman</option>
              <option value={48}>48 / halaman</option>
            </select>
          </div>
        </div>
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
