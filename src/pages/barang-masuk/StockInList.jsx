import React from 'react';
import { Calendar, Filter, Eye, Trash2, ChevronRight } from 'lucide-react';
import styles from './StockInList.module.css';

const StockInList = ({ items, onEditQty, onDelete }) => {
  const totalQty = items.reduce((sum, item) => sum + item.qty, 0);

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2 className={styles.title}>Barang Masuk Hari Ini</h2>
          <p className={styles.subtitle}>{items.length} transaksi • {totalQty} item masuk</p>
        </div>
        <div className={styles.headerRight}>
          <button className={styles.filterBtn}>
            <Calendar size={16} />
            {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
          </button>
          <button className={styles.filterBtn}>
            <Filter size={16} />
            Filter
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className={styles.tableContainer}>
        {items.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Belum ada barang masuk hari ini.</p>
            <p>Silakan scan produk di atas untuk memulai.</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>No</th>
                <th>Produk</th>
                <th>Barcode / SKU</th>
                <th>Satuan</th>
                <th>Qty Masuk</th>
                <th>Waktu</th>
                <th>Petugas</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td>
                    <div className={styles.productCell}>
                      {item.foto ? (
                        <img src={item.foto} alt={item.nama_barang} className={styles.productImg} />
                      ) : (
                        <div className={styles.productImgPlaceholder}>Img</div>
                      )}
                      <span className={styles.productName}>{item.nama_barang}</span>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'monospace', color: 'var(--color-text-secondary, #666)' }}>{item.barcode}</td>
                  <td>{item.satuan}</td>
                  <td className={styles.qtyText}>{item.qty}</td>
                  <td>{item.waktu || '10:00'}</td>
                  <td>Dummy Owner</td>
                  <td>
                    <div className={styles.actionCell}>
                      <button className={styles.actionBtn} title="Lihat Detail">
                        <Eye size={16} />
                      </button>
                      <button 
                        className={`${styles.actionBtn} ${styles.delete}`} 
                        onClick={() => {
                          if (window.confirm('Hapus item ini?')) {
                            onDelete(idx);
                          }
                        }}
                        title="Hapus"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <button className={styles.linkBtn}>
          Lihat Semua Riwayat
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default StockInList;
