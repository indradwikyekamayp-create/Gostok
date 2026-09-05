import React from 'react';
import { History, Check } from 'lucide-react';
import useIsMobile from '../../hooks/useIsMobile';
import styles from './PelangganDetail.module.css';

export default function NotaListWithCheckbox({ notas, selectedIds, onToggle, onSelectAll, onViewHistory }) {
  const isMobile = useIsMobile();
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

  const getDerivedStatus = (n) => {
    if (n.sisa_hutang <= 0) return 'lunas';
    if (n.sisa_hutang < n.total_bayar) return 'cicilan';
    return 'belum_lunas';
  };

  const getStatusBadge = (status) => {
    switch((status || '').toLowerCase()) {
      case 'lunas': return <span style={{color: '#16a34a', fontWeight: '800', backgroundColor: '#dcfce7', padding: '0.2rem 0.5rem', borderRadius: '1rem', fontSize: '0.65rem', textTransform: 'uppercase'}}>Lunas</span>;
      case 'cicilan':
      case 'cicil': return <span style={{color: '#f59e0b', fontWeight: '800', backgroundColor: '#fef3c7', padding: '0.2rem 0.5rem', borderRadius: '1rem', fontSize: '0.65rem', textTransform: 'uppercase'}}>Cicilan</span>;
      default: return <span style={{color: '#ef4444', fontWeight: '800', backgroundColor: '#fee2e2', padding: '0.2rem 0.5rem', borderRadius: '1rem', fontSize: '0.65rem', textTransform: 'uppercase'}}>Belum Lunas</span>;
    }
  };

  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingBottom: '2rem' }}>
        {notas.length > 0 && (
          <div 
            onClick={handleSelectAllChange}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: '#fff', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <input type="checkbox" checked={allSelected} readOnly style={{ transform: 'scale(1.2)' }} />
              <span style={{ fontWeight: '700', color: '#334155', fontSize: '0.9rem' }}>Pilih Semua Nota Hutang</span>
            </div>
          </div>
        )}

        {notas.length === 0 ? (
          <div className={styles.emptyState}>Belum ada transaksi</div>
        ) : notas.map(n => {
          const isUnpaid = n.sisa_hutang > 0;
          const isSelected = selectedIds.includes(n.id);
          const telahDibayar = Math.max(0, n.total_bayar - n.sisa_hutang);
          
          return (
            <div 
              key={n.id}
              onClick={() => isUnpaid && onToggle(n.id)}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '1rem',
                padding: '1rem',
                backgroundColor: isSelected ? '#eff6ff' : '#fff',
                border: isSelected ? '1px solid #93c5fd' : '1px solid #e2e8f0',
                borderRadius: '1rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                transition: 'all 0.2s',
                cursor: isUnpaid ? 'pointer' : 'default'
              }}
            >
              <div style={{ paddingTop: '0.25rem' }}>
                {isUnpaid ? (
                  <input type="checkbox" checked={isSelected} readOnly style={{ transform: 'scale(1.2)' }} />
                ) : (
                  <div style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={12} color="#94a3b8" />
                  </div>
                )}
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={{ fontWeight: '700', color: '#1e293b', fontSize: '0.95rem', lineHeight: 1.2 }}>{n.no_nota}</span>
                  {getStatusBadge(getDerivedStatus(n))}
                </div>
                
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{formatDate(n.tanggal)}</div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem', padding: '0.6rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem', border: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Total Transaksi</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#334155' }}>{formatRp(n.total_bayar)}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: '700', textTransform: 'uppercase' }}>Sisa Hutang</span>
                    <span style={{ fontSize: '0.95rem', fontWeight: '800', color: isUnpaid ? '#ef4444' : '#16a34a' }}>{formatRp(n.sisa_hutang)}</span>
                  </div>
                </div>
                
                {telahDibayar > 0 && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onViewHistory && onViewHistory(n.id); }}
                    style={{ marginTop: '0.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', background: '#eff6ff', color: '#3b82f6', border: '1px solid #bfdbfe', borderRadius: '0.5rem', padding: '0.5rem', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer' }}
                  >
                    <History size={14} /> Riwayat Pembayaran
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Desktop Rendering
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
            <th>Tanggal</th>
            <th style={{ textAlign: 'right' }}>Total</th>
            <th style={{ textAlign: 'right' }}>Telah Dibayar</th>
            <th style={{ textAlign: 'right' }}>Sisa Hutang</th>
            <th style={{ textAlign: 'center' }}>Status</th>
            <th style={{ textAlign: 'center' }}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {notas.length === 0 ? (
            <tr>
              <td colSpan="8" className={styles.emptyState}>Belum ada transaksi</td>
            </tr>
          ) : notas.map(n => {
            const isUnpaid = n.sisa_hutang > 0;
            const isSelected = selectedIds.includes(n.id);
            const telahDibayar = Math.max(0, n.total_bayar - n.sisa_hutang);
            
            return (
              <tr 
                key={n.id} 
                className={`${styles.modernRow} ${isSelected ? styles.modernRowSelected : ''}`}
                onClick={(e) => {
                  if(isUnpaid && e.target.tagName !== 'INPUT' && e.target.tagName !== 'BUTTON' && !e.target.closest('button')) onToggle(n.id);
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
                </td>
                
                <td>{formatDate(n.tanggal)}</td>
                <td style={{ textAlign: 'right', fontWeight: '600', color: '#334155' }}>{formatRp(n.total_bayar)}</td>
                <td style={{ textAlign: 'right', fontWeight: '600', color: '#16a34a' }}>{formatRp(telahDibayar)}</td>
                
                <td style={{ textAlign: 'right' }}>
                  <div className={styles.sisaAmount} style={{ color: isUnpaid ? '#ef4444' : '#16a34a', fontWeight: '800', fontSize: '0.9rem' }}>
                    {formatRp(n.sisa_hutang)}
                  </div>
                </td>
                
                <td style={{ textAlign: 'center' }}>
                  {getStatusBadge(getDerivedStatus(n))}
                </td>
                
                <td style={{textAlign: 'center'}}>
                  {telahDibayar > 0 && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); onViewHistory && onViewHistory(n.id); }}
                      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#eff6ff', color: '#3b82f6', border: '1px solid #bfdbfe', borderRadius: '0.375rem', padding: '0.375rem', cursor: 'pointer', transition: 'all 0.2s' }}
                      title="Lihat Riwayat Cicilan"
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#dbeafe'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#eff6ff'; }}
                    >
                      <History size={16} />
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
