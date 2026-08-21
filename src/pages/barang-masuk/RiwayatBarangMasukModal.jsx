import React, { useState, useEffect } from 'react';
import { X, History, ChevronDown, Search } from 'lucide-react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import styles from './RiwayatBarangMasukModal.module.css';

const RiwayatBarangMasukModal = ({ onClose }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
    
    // Fetch stock ins
    const q = query(collection(db, 'stock_ins'), orderBy('tanggal', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = [];
      snapshot.forEach(doc => {
        data.push({ id: doc.id, ...doc.data() });
      });
      setHistory(data);
      setLoading(false);
    });

    return () => {
      document.body.style.overflow = 'auto';
      unsubscribe();
    };
  }, []);

  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Filter history based on search term
  const filteredHistory = history.filter(record => {
    if (!searchTerm) return true;
    
    const term = searchTerm.toLowerCase();
    
    // Check if date matches
    const dateStr = formatDate(record.tanggal).toLowerCase();
    if (dateStr.includes(term)) return true;
    
    // Check if any item matches (name or barcode)
    return record.items?.some(item => 
      (item.nama_barang && item.nama_barang.toLowerCase().includes(term)) ||
      (item.barcode && item.barcode.toLowerCase().includes(term))
    );
  });

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2><History size={20} /> Riwayat Barang Masuk</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.searchContainer}>
            <Search size={18} className={styles.searchIcon} />
            <input 
              type="text" 
              className={styles.searchInput}
              placeholder="Cari berdasarkan nama barang, barcode, atau tanggal (contoh: 21 Agu)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={history.length === 0 && !searchTerm}
            />
          </div>

          {loading ? (
            <div className={styles.loading}>Memuat riwayat...</div>
          ) : history.length === 0 ? (
            <div className={styles.emptyState}>
              Belum ada riwayat barang masuk.
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className={styles.emptyState}>
              Tidak ada riwayat yang sesuai dengan pencarian "{searchTerm}".
            </div>
          ) : (
            <div className={styles.list}>
              {filteredHistory.map((record) => (
                <div key={record.id} className={styles.recordCard}>
                  <div 
                    className={styles.recordHeader} 
                    onClick={() => toggleExpand(record.id)}
                  >
                    <div className={styles.recordDate}>
                      {formatDate(record.tanggal)}
                    </div>
                    <div className={styles.recordMeta}>
                      <span className={styles.badge}>{record.total_items} Item Masuk</span>
                      <ChevronDown 
                        size={20} 
                        className={`${styles.chevron} ${expandedId === record.id ? styles.chevronOpen : ''}`} 
                      />
                    </div>
                  </div>

                  {expandedId === record.id && (
                    <div className={styles.recordBody}>
                      <table className={styles.itemsTable}>
                        <thead>
                          <tr>
                            <th>Kode Barcode</th>
                            <th>Nama Barang</th>
                            <th>Qty</th>
                            <th>Satuan</th>
                          </tr>
                        </thead>
                        <tbody>
                          {record.items.map((item, index) => (
                            <tr key={index}>
                              <td>{item.barcode || '-'}</td>
                              <td>{item.nama_barang}</td>
                              <td>{item.qty}</td>
                              <td>{item.satuan}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RiwayatBarangMasukModal;
