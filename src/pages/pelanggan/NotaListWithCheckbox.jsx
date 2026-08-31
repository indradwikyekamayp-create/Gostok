import React from 'react';

import styles from './PelangganDetail.module.css';

export default function NotaListWithCheckbox({ notas, selectedIds, onToggle, onSelectAll }) {
  const unpaidNotas = notas.filter(n => n.sisa_hutang > 0);
  const allSelected = unpaidNotas.length > 0 && unpaidNotas.every(n => selectedIds.includes(n.id));

  const handleSelectAllChange = () => {
    if (allSelected) {
      onSelectAll([]);
    } else {
      onSelectAll(unpaidNotas.map(n => n.id));
    }
  };

  const formatRp = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      }).format(date);
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = (status) => {
    switch((status || '').toLowerCase()) {
      case 'lunas': return <span style={{color: '#16a34a', fontWeight: '800', backgroundColor: '#dcfce7', padding: '0.2rem 0.5rem', borderRadius: '1rem', fontSize: '0.65rem', textTransform: 'uppercase'}}>Lunas</span>;
      case 'cicilan':
      case 'cicil': return <span style={{color: '#f59e0b', fontWeight: '800', backgroundColor: '#fef3c7', padding: '0.2rem 0.5rem', borderRadius: '1rem', fontSize: '0.65rem', textTransform: 'uppercase'}}>Cicilan</span>;
      default: return <span style={{color: '#ef4444', fontWeight: '800', backgroundColor: '#fee2e2', padding: '0.2rem 0.5rem', borderRadius: '1rem', fontSize: '0.65rem', textTransform: 'uppercase'}}>Belum Lunas</span>;
    }
  };

  return (
    <div className={styles.notaContainer}>
      <table className={styles.modernTable}>
        <thead>
          <tr>
            <th className={styles.thCheck}>
              <input 
                type="checkbox" 
                checked={allSelected} 
                onChange={handleSelectAllChange}
                disabled={unpaidNotas.length === 0}
                style={{ transform: 'scale(1.2)', cursor: 'pointer' }}
              />
            </th>
            <th>No Nota</th>
            <th className={styles.desktopOnly}>Tanggal</th>
            <th className={styles.desktopOnly}>Total</th>
            <th className={styles.thRight}>Sisa Hutang</th>
            <th className={styles.desktopOnly}>Status</th>
          </tr>
        </thead>
        <tbody>
          {notas.length === 0 ? (
            <tr>
              <td colSpan="6" className={styles.emptyState}>Belum ada transaksi</td>
            </tr>
          ) : notas.map(n => {
            const isUnpaid = n.sisa_hutang > 0;
            const isSelected = selectedIds.includes(n.id);
            
            return (
              <tr 
                key={n.id} 
                className={`${styles.modernRow} ${isSelected ? styles.modernRowSelected : ''}`}
                onClick={(e) => {
                  if(isUnpaid && e.target.tagName !== 'INPUT') onToggle(n.id);
                }}
              >
                <td className={styles.colCheck}>
                  {isUnpaid ? (
                    <input 
                      type="checkbox" 
                      checked={isSelected}
                      onChange={() => onToggle(n.id)}
                      style={{ transform: 'scale(1.2)', pointerEvents: 'none' }}
                    />
                  ) : <span style={{color: '#cbd5e1'}}>-</span>}
                </td>
                
                <td className={styles.colMain}>
                  <div className={styles.notaTitle}>{n.no_nota}</div>
                  <div className={styles.mobileSubtitle}>{formatDate(n.tanggal)}</div>
                  <div className={styles.mobileSubtitle}>Total: {formatRp(n.total_bayar)}</div>
                  <div className={styles.mobileBadge}>{getStatusBadge(n.status_bayar)}</div>
                </td>
                
                <td className={styles.desktopOnly}>{formatDate(n.tanggal)}</td>
                <td className={styles.desktopOnly}>{formatRp(n.total_bayar)}</td>
                
                <td className={styles.colAmount}>
                  <div className={styles.mobileSisaLabel}>Sisa Hutang</div>
                  <div className={styles.sisaAmount} style={{ color: isUnpaid ? '#ef4444' : '#16a34a' }}>
                    {formatRp(n.sisa_hutang)}
                  </div>
                </td>
                
                <td className={styles.desktopOnly}>
                  {getStatusBadge(n.status_bayar)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
