import React from 'react';

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
      case 'lunas': return <span style={{color: 'hsl(145, 55%, 42%)', fontWeight: '600'}}>Lunas</span>;
      case 'cicilan':
      case 'cicil': return <span style={{color: 'hsl(38, 92%, 50%)', fontWeight: '600'}}>Cicilan</span>;
      default: return <span style={{color: 'hsl(0, 70%, 50%)', fontWeight: '600'}}>Belum Lunas</span>;
    }
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #eaeaea' }}>
            <th style={{ padding: '10px 12px', color: '#475569', fontWeight: '600' }}>
              <input 
                type="checkbox" 
                checked={allSelected} 
                onChange={handleSelectAllChange}
                disabled={unpaidNotas.length === 0}
              />
            </th>
            <th style={{ padding: '10px 12px', color: '#475569', fontWeight: '600' }}>No Nota</th>
            <th style={{ padding: '10px 12px', color: '#475569', fontWeight: '600' }}>Tanggal</th>
            <th style={{ padding: '10px 12px', color: '#475569', fontWeight: '600' }}>Total</th>
            <th style={{ padding: '10px 12px', color: '#475569', fontWeight: '600' }}>Sisa Hutang</th>
            <th style={{ padding: '10px 12px', color: '#475569', fontWeight: '600' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {notas.map(n => {
            const isUnpaid = n.sisa_hutang > 0;
            const isSelected = selectedIds.includes(n.id);
            
            return (
              <tr 
                key={n.id} 
                style={{ 
                  borderBottom: '1px solid #f1f5f9',
                  backgroundColor: isSelected ? 'hsl(215, 50%, 97%)' : 'transparent',
                  color: '#334155'
                }}
              >
                <td style={{ padding: '8px 12px' }}>
                  {isUnpaid && (
                    <input 
                      type="checkbox" 
                      checked={isSelected}
                      onChange={() => onToggle(n.id)}
                    />
                  )}
                </td>
                <td style={{ padding: '8px 12px' }}>{n.no_nota}</td>
                <td style={{ padding: '8px 12px' }}>{formatDate(n.tanggal)}</td>
                <td style={{ padding: '8px 12px' }}>{formatRp(n.total_bayar)}</td>
                <td style={{ padding: '8px 12px', fontWeight: '600' }}>{formatRp(n.sisa_hutang)}</td>
                <td style={{ padding: '8px 12px' }}>{getStatusBadge(n.status_bayar)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
