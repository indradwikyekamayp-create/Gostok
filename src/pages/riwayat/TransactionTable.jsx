import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Reset page when transactions change (filter applied)
  useEffect(() => {
    setCurrentPage(1);
  }, [transactions]);

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const totalPages = Math.max(1, Math.ceil((transactions?.length || 0) / itemsPerPage));
  const currentTransactions = transactions?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  ) || [];

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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
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
          {currentTransactions.map((trx) => (
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

      {/* Pagination */}
      <div className={styles.pagination}>
        <div className={styles.pageInfo}>
          Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, transactions.length)} dari {transactions.length} transaksi
        </div>
        <div className={styles.pageControls}>
          <button 
            className={`${styles.pageBtn} ${currentPage === 1 ? styles.disabled : ''}`}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={16} />
          </button>
          
          {renderPaginationButtons()}
          
          <button 
            className={`${styles.pageBtn} ${currentPage === totalPages ? styles.disabled : ''}`}
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight size={16} />
          </button>
          
          <select 
            className={styles.perPageSelect}
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={10}>10 / halaman</option>
            <option value={20}>20 / halaman</option>
            <option value={50}>50 / halaman</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default TransactionTable;
