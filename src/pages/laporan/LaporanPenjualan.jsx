import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { db } from '../../firebase';
import ExportButtons from './ExportButtons';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

const LaporanPenjualan = ({ dateRange }) => {
  const [salesData, setSalesData] = useState([]);
  const [summary, setSummary] = useState({
    totalPenjualan: 0,
    jumlahTransaksi: 0,
    rataRata: 0
  });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'transactions'), (snapshot) => {
      let totalPenjualan = 0;
      let jumlahTransaksi = 0;
      const dailySales = {};

      snapshot.forEach(doc => {
        const data = doc.data();
        // Ignore unpaid BON if you want, but typically penjualan tracks omzet regardless
        const dateStr = data.tanggal ? (data.tanggal.toDate ? data.tanggal.toDate().toISOString().split('T')[0] : data.tanggal.split('T')[0]) : '';
        const total = data.grandTotal || 0;

        totalPenjualan += total;
        jumlahTransaksi += 1;

        if (dateStr) {
          if (!dailySales[dateStr]) dailySales[dateStr] = 0;
          dailySales[dateStr] += total;
        }
      });

      const formattedSalesData = Object.keys(dailySales)
        .sort((a, b) => new Date(a) - new Date(b))
        .map(date => ({
          tanggal: date,
          total: dailySales[date]
        }));

      setSalesData(formattedSalesData);
      setSummary({
        totalPenjualan,
        jumlahTransaksi,
        rataRata: jumlahTransaksi > 0 ? (totalPenjualan / jumlahTransaksi) : 0
      });
    });

    return () => unsub();
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.125rem', margin: 0, color: 'var(--color-text, #333)' }}>Ringkasan Penjualan</h3>
        <ExportButtons 
          data={salesData} 
          columns={['Tanggal', 'Total Penjualan']}
          filename="Laporan_Penjualan"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ padding: '1.25rem', backgroundColor: 'var(--color-surface, #fff)', borderRadius: 'var(--radius-lg, 0.5rem)', border: '1px solid var(--color-border-light, #eee)', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary, #666)', marginBottom: '0.25rem' }}>Total Penjualan</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--color-primary, hsl(215, 50%, 30%))' }}>{formatCurrency(summary.totalPenjualan)}</div>
        </div>
        <div style={{ padding: '1.25rem', backgroundColor: 'var(--color-surface, #fff)', borderRadius: 'var(--radius-lg, 0.5rem)', border: '1px solid var(--color-border-light, #eee)', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary, #666)', marginBottom: '0.25rem' }}>Jumlah Transaksi</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--color-success-hover, hsl(145, 55%, 35%))' }}>{summary.jumlahTransaksi}</div>
        </div>
        <div style={{ padding: '1.25rem', backgroundColor: 'var(--color-surface, #fff)', borderRadius: 'var(--radius-lg, 0.5rem)', border: '1px solid var(--color-border-light, #eee)', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary, #666)', marginBottom: '0.25rem' }}>Rata-rata per Transaksi</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--color-warning-hover, hsl(38, 92%, 40%))' }}>{formatCurrency(summary.rataRata)}</div>
        </div>
      </div>

      <div>
        <h4 style={{ fontSize: '1rem', margin: '0 0 0.75rem 0', color: 'var(--color-text, #333)' }}>Grafik Penjualan Harian</h4>
        <div style={{ height: '300px', backgroundColor: 'var(--color-surface, #fff)', border: '1px solid var(--color-border-light, #eee)', borderRadius: 'var(--radius-lg, 0.5rem)', marginBottom: '1.5rem', padding: '1rem' }}>
          {salesData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="tanggal" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis 
                  axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dx={-10}
                  tickFormatter={(val) => `Rp${(val/1000000).toFixed(1)}M`}
                />
                <Tooltip 
                  formatter={(value) => formatCurrency(value)}
                  labelStyle={{color: '#333', fontWeight: 'bold'}}
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="total" fill="hsl(215, 50%, 40%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary, #666)' }}>
              Belum ada data penjualan
            </div>
          )}
        </div>
      </div>

      <div>
        <h4 style={{ fontSize: '1rem', margin: '0 0 0.75rem 0', color: 'var(--color-text, #333)' }}>Daftar Transaksi</h4>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr>
                <th style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--color-bg, #f9fafb)', fontWeight: '600', color: 'var(--color-text, #333)', borderBottom: '1px solid var(--color-border-light, #eee)' }}>Tanggal</th>
                <th style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--color-bg, #f9fafb)', fontWeight: '600', color: 'var(--color-text, #333)', borderBottom: '1px solid var(--color-border-light, #eee)', textAlign: 'right' }}>Total Penjualan</th>
              </tr>
            </thead>
            <tbody>
              {salesData.length > 0 ? salesData.map((row, i) => (
                <tr key={i} style={{ transition: 'background-color 150ms ease' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary-50, #f5f8ff)'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--color-border-light, #eee)' }}>{row.tanggal}</td>
                  <td style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--color-border-light, #eee)', textAlign: 'right' }}>{formatCurrency(row.total)}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="2" style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--color-border-light, #eee)', textAlign: 'center' }}>Belum ada data penjualan</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LaporanPenjualan;
