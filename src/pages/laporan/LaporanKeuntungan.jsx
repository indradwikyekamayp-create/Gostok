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

const LaporanKeuntungan = ({ dateRange }) => {
  const [profitData, setProfitData] = useState([]);
  const [summary, setSummary] = useState({
    totalOmzet: 0,
    totalModal: 0,
    totalKeuntungan: 0,
    margin: 0
  });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'transactions'), (snapshot) => {
      let totalOmzet = 0;
      let totalModal = 0;
      const dataArr = [];

      snapshot.forEach(doc => {
        const data = doc.data();
        const dateStr = data.tanggal ? (data.tanggal.toDate ? data.tanggal.toDate().toISOString() : data.tanggal) : '';
        const omzet = data.grandTotal || 0;
        
        // Calculate HPP/modal if not explicitly stored. Assuming items array has hpp or modal field, or fallback to 0.
        let modal = 0;
        if (data.items && Array.isArray(data.items)) {
          data.items.forEach(item => {
            const hpp = item.hpp || item.modal || 0;
            const qty = item.qty || item.quantity || 1;
            modal += (hpp * qty);
          });
        }
        
        const keuntungan = omzet - modal;
        const margin = omzet > 0 ? (keuntungan / omzet) * 100 : 0;

        totalOmzet += omzet;
        totalModal += modal;

        dataArr.push({
          noNota: data.noNota || doc.id,
          tanggal: dateStr,
          omzet,
          modal,
          keuntungan,
          margin: margin.toFixed(2)
        });
      });

      const totalKeuntungan = totalOmzet - totalModal;
      const avgMargin = totalOmzet > 0 ? (totalKeuntungan / totalOmzet) * 100 : 0;

      // Sort by newest first
      dataArr.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

      setProfitData(dataArr);
      setSummary({
        totalOmzet,
        totalModal,
        totalKeuntungan,
        margin: avgMargin.toFixed(2)
      });
    });

    return () => unsub();
  }, []);

  return (
    <div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.125rem', margin: 0, color: 'var(--color-text, #333)' }}>Laporan Keuntungan</h3>
        <ExportButtons 
          data={profitData} 
          columns={['No Nota', 'Tanggal', 'Omzet', 'Modal', 'Keuntungan', 'Margin (%)']}
          filename="Laporan_Keuntungan"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ padding: '1.25rem', backgroundColor: 'var(--color-surface, #fff)', borderRadius: 'var(--radius-lg, 0.5rem)', border: '1px solid var(--color-border-light, #eee)', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary, #666)', marginBottom: '0.25rem' }}>Total Omzet</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--color-text, #333)' }}>{formatCurrency(summary.totalOmzet)}</div>
        </div>
        <div style={{ padding: '1.25rem', backgroundColor: 'var(--color-surface, #fff)', borderRadius: 'var(--radius-lg, 0.5rem)', border: '1px solid var(--color-border-light, #eee)', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary, #666)', marginBottom: '0.25rem' }}>Total Modal (HPP)</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--color-danger, #dc3545)' }}>{formatCurrency(summary.totalModal)}</div>
        </div>
        <div style={{ padding: '1.25rem', backgroundColor: 'var(--color-surface, #fff)', borderRadius: 'var(--radius-lg, 0.5rem)', border: '1px solid var(--color-border-light, #eee)', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary, #666)', marginBottom: '0.25rem' }}>Total Keuntungan (Laba Kotor)</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--color-success-hover, hsl(145, 55%, 35%))' }}>{formatCurrency(summary.totalKeuntungan)}</div>
        </div>
        <div style={{ padding: '1.25rem', backgroundColor: 'var(--color-surface, #fff)', borderRadius: 'var(--radius-lg, 0.5rem)', border: '1px solid var(--color-border-light, #eee)', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary, #666)', marginBottom: '0.25rem' }}>Rata-rata Margin</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--color-primary, hsl(215, 50%, 30%))' }}>{summary.margin}%</div>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr>
              <th style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--color-bg, #f9fafb)', fontWeight: '600', color: 'var(--color-text, #333)', borderBottom: '1px solid var(--color-border-light, #eee)' }}>No Nota</th>
              <th style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--color-bg, #f9fafb)', fontWeight: '600', color: 'var(--color-text, #333)', borderBottom: '1px solid var(--color-border-light, #eee)' }}>Tanggal</th>
              <th style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--color-bg, #f9fafb)', fontWeight: '600', color: 'var(--color-text, #333)', borderBottom: '1px solid var(--color-border-light, #eee)', textAlign: 'right' }}>Omzet</th>
              <th style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--color-bg, #f9fafb)', fontWeight: '600', color: 'var(--color-text, #333)', borderBottom: '1px solid var(--color-border-light, #eee)', textAlign: 'right' }}>Modal</th>
              <th style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--color-bg, #f9fafb)', fontWeight: '600', color: 'var(--color-text, #333)', borderBottom: '1px solid var(--color-border-light, #eee)', textAlign: 'right' }}>Keuntungan</th>
              <th style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--color-bg, #f9fafb)', fontWeight: '600', color: 'var(--color-text, #333)', borderBottom: '1px solid var(--color-border-light, #eee)', textAlign: 'right' }}>Margin %</th>
            </tr>
          </thead>
          <tbody>
            {profitData.length > 0 ? profitData.map((row, i) => (
              <tr key={i} style={{ transition: 'background-color 150ms ease' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary-50, #f5f8ff)'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--color-border-light, #eee)' }}>{row.noNota}</td>
                <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--color-border-light, #eee)' }}>{formatDate(row.tanggal)}</td>
                <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--color-border-light, #eee)', textAlign: 'right' }}>{formatCurrency(row.omzet)}</td>
                <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--color-border-light, #eee)', textAlign: 'right' }}>{formatCurrency(row.modal)}</td>
                <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--color-border-light, #eee)', textAlign: 'right', fontWeight: 'bold', color: row.keuntungan >= 0 ? 'var(--color-success-hover, hsl(145, 55%, 35%))' : 'var(--color-danger-hover, hsl(0, 70%, 40%))' }}>
                  {row.keuntungan > 0 ? '+' : ''}{formatCurrency(row.keuntungan)}
                </td>
                <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--color-border-light, #eee)', textAlign: 'right', fontWeight: 'bold', color: row.margin >= 0 ? 'var(--color-success-hover, hsl(145, 55%, 35%))' : 'var(--color-danger-hover, hsl(0, 70%, 40%))' }}>
                  {row.margin}%
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="6" style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--color-border-light, #eee)', textAlign: 'center' }}>Belum ada data keuntungan</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LaporanKeuntungan;
