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

  const getStatusBadge = (status) => {
    switch(status) {
      case 'lunas': return <span style={{color: 'hsl(145, 55%, 42%)', fontWeight: 'bold'}}>Lunas</span>;
      case 'cicil': return <span style={{color: 'hsl(38, 92%, 50%)', fontWeight: 'bold'}}>Cicilan</span>;
      default: return <span style={{color: 'hsl(0, 70%, 50%)', fontWeight: 'bold'}}>Belum Lunas</span>;
    }
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #eaeaea' }}>
            <th style={{ padding: '12px' }}>
              <input 
                type="checkbox" 
                checked={allSelected} 
                onChange={handleSelectAllChange}
                disabled={unpaidNotas.length === 0}
              />
            </th>
            <th style={{ padding: '12px' }}>No Nota</th>
            <th style={{ padding: '12px' }}>Tanggal</th>
            <th style={{ padding: '12px' }}>Total</th>
            <th style={{ padding: '12px' }}>Sisa Hutang</th>
            <th style={{ padding: '12px' }}>Status</th>
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
                  borderBottom: '1px solid #eaeaea',
                  backgroundColor: isSelected ? 'hsl(215, 50%, 97%)' : 'transparent'
                }}
              >
                <td style={{ padding: '12px' }}>
                  {isUnpaid && (
                    <input 
                      type="checkbox" 
                      checked={isSelected}
                      onChange={() => onToggle(n.id)}
                    />
                  )}
                </td>
                <td style={{ padding: '12px' }}>{n.no_nota}</td>
                <td style={{ padding: '12px' }}>{n.tanggal}</td>
                <td style={{ padding: '12px' }}>{formatRp(n.total_bayar)}</td>
                <td style={{ padding: '12px', fontWeight: 'bold' }}>{formatRp(n.sisa_hutang)}</td>
                <td style={{ padding: '12px' }}>{getStatusBadge(n.status_bayar)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
