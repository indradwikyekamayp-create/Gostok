import React from 'react';
import styles from './PelangganList.module.css';

export default function PelangganList({ customers, onSelect, loading }) {
  if (loading) {
    return <div className={styles.emptyState}>Memuat data pelanggan...</div>;
  }

  if (!customers || customers.length === 0) {
    return <div className={styles.emptyState}>Tidak ada pelanggan ditemukan.</div>;
  }

  const formatRp = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
  };

  const getDebtBadge = (amount) => {
    if (amount === 0) {
      return <span className={`${styles.debtBadge} ${styles.debtNone}`}>Tidak ada hutang</span>;
    } else if (amount > 10000000) {
      return <span className={`${styles.debtBadge} ${styles.debtHigh}`}>Hutang menumpuk</span>;
    } else {
      return <span className={`${styles.debtBadge} ${styles.debtMedium}`}>Cicilan berjalan</span>;
    }
  };

  return (
    <div className={styles.grid}>
      {customers.map((c) => (
        <div 
          key={c.id} 
          onClick={() => onSelect(c)}
          className={styles.card}
        >
          <div className={styles.cardHeader}>
            <h3 className={styles.companyName}>{c.nama_perusahaan}</h3>
            <span className={styles.badge}>{c.jenis_pelanggan}</span>
          </div>
          
          <div className={styles.details}>
            <p><strong>PIC:</strong> {c.nama_pic}</p>
            <p><strong>No. HP:</strong> {c.no_hp}</p>
          </div>
          
          <div className={styles.footer}>
            <div className={styles.debtInfo}>
              <p className={styles.debtLabel}>Total Hutang:</p>
              <p className={styles.debtValue}>{formatRp(c.total_hutang_berjalan)}</p>
            </div>
            <div>
              {getDebtBadge(c.total_hutang_berjalan)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
