import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import ExportButtons from './ExportButtons';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric'
  }).format(date);
};

const LaporanPiutang = () => {
  const [piutangData, setPiutangData] = useState([]);
  const [summary, setSummary] = useState({
    totalPiutang: 0,
    jumlahPelanggan: 0
  });

  useEffect(() => {
    // Assuming we fetch from transactions where payment is BON and not Lunas
    const unsub = onSnapshot(collection(db, 'transactions'), (snapshot) => {
      let totalPiutang = 0;
      const customersMap = {};

      snapshot.forEach(doc => {
        const data = doc.data();
        const pm = (data.paymentMethod || data.metodePembayaran || '').toLowerCase();
        const isHutang = pm === 'bon' || pm === 'kredit' || pm === 'hutang';
        const isLunas = data.paymentStatus === 'lunas' || data.statusPembayaran === 'lunas';
        
        if (isHutang && !isLunas) {
          const hutang = data.sisaHutang !== undefined ? data.sisaHutang : (data.grandTotal || 0);
          totalPiutang += hutang;
          
          const custName = data.customer?.nama_perusahaan || data.customer?.nama_pic || data.customer?.nama || data.namaPelanggan || data.customerName || 'Pelanggan Umum';
          const dateStr = data.tanggal ? (data.tanggal.toDate ? data.tanggal.toDate().toISOString() : data.tanggal) : '';

          if (!customersMap[custName]) {
            customersMap[custName] = {
              nama: custName,
              jumlahNota: 0,
              totalHutang: 0,
              notaTertua: dateStr,
              notas: []
            };
          }
          
          customersMap[custName].jumlahNota += 1;
          customersMap[custName].totalHutang += hutang;
          customersMap[custName].notas.push({
            noNota: data.noNota || doc.id,
            tanggal: dateStr,
            sisaHutang: hutang,
            totalNota: data.grandTotal || 0,
            status: data.statusPembayaran || (hutang > 0 ? 'Cicilan' : 'Lunas')
          });
          
          if (dateStr && (!customersMap[custName].notaTertua || new Date(dateStr) < new Date(customersMap[custName].notaTertua))) {
            customersMap[custName].notaTertua = dateStr;
          }
        }
      });

      const dataArr = Object.values(customersMap).sort((a, b) => b.totalHutang - a.totalHutang);

      setPiutangData(dataArr);
      setSummary({
        totalPiutang,
        jumlahPelanggan: dataArr.length
      });
    });

    return () => unsub();
  }, []);

  const [expandedCustomer, setExpandedCustomer] = useState(null);

  const toggleExpand = (nama) => {
    setExpandedCustomer(expandedCustomer === nama ? null : nama);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.125rem', margin: 0, color: 'var(--color-text, #333)' }}>Laporan Piutang Pelanggan</h3>
        <ExportButtons 
          data={piutangData} 
          columns={['Nama Pelanggan', 'Jumlah Nota Belum Lunas', 'Total Hutang', 'Nota Tertua']}
          filename="Laporan_Piutang"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ padding: '1.25rem', backgroundColor: 'var(--color-surface, #fff)', borderRadius: 'var(--radius-lg, 0.5rem)', border: '1px solid var(--color-border-light, #eee)', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary, #666)', marginBottom: '0.25rem' }}>Total Piutang Berjalan</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-danger-hover, hsl(0, 70%, 40%))' }}>{formatCurrency(summary.totalPiutang)}</div>
        </div>
        <div style={{ padding: '1.25rem', backgroundColor: 'var(--color-surface, #fff)', borderRadius: 'var(--radius-lg, 0.5rem)', border: '1px solid var(--color-border-light, #eee)', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary, #666)', marginBottom: '0.25rem' }}>Pelanggan dengan Hutang</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-warning-hover, hsl(38, 92%, 40%))' }}>{summary.jumlahPelanggan} <span style={{fontSize: '0.875rem', fontWeight: 'normal'}}>Orang/Toko</span></div>
        </div>
      </div>

      <div style={{ overflowX: 'auto', backgroundColor: '#fff', borderRadius: '0.5rem', border: '1px solid #eee' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr>
              <th style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--color-bg, #f9fafb)', fontWeight: '600', color: 'var(--color-text, #333)', borderBottom: '1px solid var(--color-border-light, #eee)' }}>Nama Pelanggan</th>
              <th style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--color-bg, #f9fafb)', fontWeight: '600', color: 'var(--color-text, #333)', borderBottom: '1px solid var(--color-border-light, #eee)', textAlign: 'center' }}>Jumlah Nota</th>
              <th style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--color-bg, #f9fafb)', fontWeight: '600', color: 'var(--color-text, #333)', borderBottom: '1px solid var(--color-border-light, #eee)' }}>Nota Tertua</th>
              <th style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--color-bg, #f9fafb)', fontWeight: '600', color: 'var(--color-text, #333)', borderBottom: '1px solid var(--color-border-light, #eee)', textAlign: 'right' }}>Total Hutang (Rp)</th>
            </tr>
          </thead>
          <tbody>
            {piutangData.length > 0 ? piutangData.map((row, i) => (
              <React.Fragment key={i}>
                <tr 
                  onClick={() => toggleExpand(row.nama)}
                  style={{ cursor: 'pointer', transition: 'background-color 150ms ease', backgroundColor: expandedCustomer === row.nama ? 'var(--color-primary-50, #f5f8ff)' : 'transparent' }} 
                  onMouseOver={(e) => { if (expandedCustomer !== row.nama) e.currentTarget.style.backgroundColor = 'var(--color-primary-50, #f5f8ff)' }} 
                  onMouseOut={(e) => { if (expandedCustomer !== row.nama) e.currentTarget.style.backgroundColor = 'transparent' }}
                >
                  <td style={{ padding: '0.75rem 1rem', borderBottom: expandedCustomer === row.nama ? 'none' : '1px solid var(--color-border-light, #eee)', fontWeight: '500', color: 'var(--color-primary, hsl(215, 50%, 30%))' }}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                      <span style={{ transform: expandedCustomer === row.nama ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s', display: 'inline-block' }}>▶</span>
                      {row.nama}
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', borderBottom: expandedCustomer === row.nama ? 'none' : '1px solid var(--color-border-light, #eee)', textAlign: 'center' }}>
                    <span style={{ backgroundColor: 'var(--color-bg, #f0f0f0)', padding: '0.125rem 0.5rem', borderRadius: 'var(--radius-full, 0.75rem)', fontSize: '0.75rem', fontWeight: 'bold'}}>{row.jumlahNota}</span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', borderBottom: expandedCustomer === row.nama ? 'none' : '1px solid var(--color-border-light, #eee)' }}>{formatDate(row.notaTertua)}</td>
                  <td style={{ padding: '0.75rem 1rem', borderBottom: expandedCustomer === row.nama ? 'none' : '1px solid var(--color-border-light, #eee)', textAlign: 'right', fontWeight: 'bold', color: 'var(--color-danger-hover, hsl(0, 70%, 40%))' }}>
                    {formatCurrency(row.totalHutang)}
                  </td>
                </tr>
                {expandedCustomer === row.nama && (
                  <tr>
                    <td colSpan="4" style={{ padding: '0', borderBottom: '1px solid var(--color-border-light, #eee)' }}>
                      <div style={{ padding: '1rem', backgroundColor: 'var(--color-primary-50, #f5f8ff)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.375rem', overflow: 'hidden' }}>
                          <thead style={{ backgroundColor: '#f8fafc' }}>
                            <tr>
                              <th style={{ padding: '0.5rem 1rem', borderBottom: '1px solid #e2e8f0' }}>No Nota</th>
                              <th style={{ padding: '0.5rem 1rem', borderBottom: '1px solid #e2e8f0' }}>Tanggal Transaksi</th>
                              <th style={{ padding: '0.5rem 1rem', borderBottom: '1px solid #e2e8f0', textAlign: 'right' }}>Total Belanja</th>
                              <th style={{ padding: '0.5rem 1rem', borderBottom: '1px solid #e2e8f0', textAlign: 'right' }}>Sisa Hutang</th>
                            </tr>
                          </thead>
                          <tbody>
                            {row.notas.map((nota, j) => (
                              <tr key={j}>
                                <td style={{ padding: '0.5rem 1rem', borderBottom: '1px solid #f1f5f9', fontWeight: '500' }}>{nota.noNota}</td>
                                <td style={{ padding: '0.5rem 1rem', borderBottom: '1px solid #f1f5f9' }}>{formatDate(nota.tanggal)}</td>
                                <td style={{ padding: '0.5rem 1rem', borderBottom: '1px solid #f1f5f9', textAlign: 'right', color: '#64748b' }}>{formatCurrency(nota.totalNota)}</td>
                                <td style={{ padding: '0.5rem 1rem', borderBottom: '1px solid #f1f5f9', textAlign: 'right', fontWeight: 'bold', color: 'var(--color-warning-hover, hsl(38, 92%, 40%))' }}>
                                  {nota.sisaHutang <= 0 ? (
                                    <span style={{ fontSize: '0.7rem', backgroundColor: 'var(--color-success-hover, hsl(145, 55%, 35%))', color: 'white', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: 'bold' }}>LUNAS</span>
                                  ) : (
                                    formatCurrency(nota.sisaHutang)
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            )) : (
              <tr>
                <td colSpan="4" style={{ padding: '1rem', borderBottom: '1px solid var(--color-border-light, #eee)', textAlign: 'center' }}>Belum ada data piutang</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LaporanPiutang;
