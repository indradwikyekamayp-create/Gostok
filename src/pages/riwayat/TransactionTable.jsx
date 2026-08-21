import React, { useState } from 'react';
import styles from './TransactionTable.module.css';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const StatusBadge = ({ status }) => {
  let className = styles.badge;
  let text = '';
  switch (status) {
    case 'lunas':
      className += ` ${styles.badgeLunas}`;
      text = 'Lunas';
      break;
    case 'belum_lunas':
      className += ` ${styles.badgeBelumLunas}`;
      text = 'Belum Lunas / BON';
      break;
    case 'cicil':
      className += ` ${styles.badgeCicil}`;
      text = 'Cicilan';
      break;
    default:
      text = status;
  }
  
  return <span className={className}>{text}</span>;
};

const TransactionTable = ({ transactions, loading, onViewDetail, onReprint }) => {
  const [expandedRow, setExpandedRow] = useState(null);

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  if (loading) {
    return <div className={styles.loading}>Memuat data...</div>;
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>Tidak ada transaksi ditemukan.</p>
      </div>
    );
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>No Nota</th>
            <th>Tanggal</th>
            <th>Pelanggan</th>
            <th>Total (Rp)</th>
            <th>Status</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((trx) => (
            <React.Fragment key={trx.id}>
              <tr 
                className={`${styles.row} ${expandedRow === trx.id ? styles.rowExpanded : ''}`}
                onClick={() => toggleRow(trx.id)}
              >
                <td>{trx.no_nota}</td>
                <td>{formatDate(trx.tanggal)}</td>
                <td>{trx.pelanggan.nama}</td>
                <td className={styles.numeric}>{formatCurrency(trx.total_bayar)}</td>
                <td><StatusBadge status={trx.status_bayar} /></td>
                <td className={styles.actions}>
                  <button 
                    className={styles.btnDetail}
                    onClick={(e) => { e.stopPropagation(); toggleRow(trx.id); }}
                  >
                    {expandedRow === trx.id ? 'Tutup' : 'Detail'}
                  </button>
                </td>
              </tr>
              {expandedRow === trx.id && (
                <tr className={styles.expandedContentRow}>
                  <td colSpan={6} className={styles.expandedContentCell}>
                    <div className={styles.detailContainer}>
                      <h4>Detail Pesanan</h4>
                      <table className={styles.innerTable}>
                        <thead>
                          <tr>
                            <th>Kode Barang</th>
                            <th>Nama Barang</th>
                            <th>Qty</th>
                            <th>Harga Satuan</th>
                            <th>Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {trx.items.map((item) => (
                            <tr key={item.id}>
                              <td>{item.kode_barang}</td>
                              <td>{item.nama_barang}</td>
                              <td>{item.qty}</td>
                              <td className={styles.numeric}>{formatCurrency(item.harga)}</td>
                              <td className={styles.numeric}>{formatCurrency(item.subtotal)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td colSpan={4} style={{ textAlign: 'right', fontWeight: 'bold' }}>Total Bayar</td>
                            <td className={styles.numeric} style={{ fontWeight: 'bold' }}>{formatCurrency(trx.total_bayar)}</td>
                          </tr>
                          {trx.status_bayar !== 'lunas' && (
                            <tr>
                              <td colSpan={4} style={{ textAlign: 'right', fontWeight: 'bold', color: 'hsl(0, 70%, 50%)' }}>Sisa Hutang</td>
                              <td className={styles.numeric} style={{ fontWeight: 'bold', color: 'hsl(0, 70%, 50%)' }}>{formatCurrency(trx.sisa_hutang || trx.total_bayar)}</td>
                            </tr>
                          )}
                        </tfoot>
                      </table>
                      <div className={styles.detailActions}>
                        <button className={styles.btnReprint} onClick={(e) => { e.stopPropagation(); onReprint(trx); }}>
                          Cetak Ulang Nota
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;
