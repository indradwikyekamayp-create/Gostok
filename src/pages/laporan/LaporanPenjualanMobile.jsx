import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { db } from '../../firebase';
import { Wallet, ShoppingBag, Receipt, Tag, TrendingUp, ChevronRight, FileText } from 'lucide-react';
import NotaPreview from '../transaksi-jual/NotaPreview';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

const formatShortCurrency = (amount) => {
  if (amount >= 1000000) return `Rp ${(amount / 1000000).toFixed(1)}jt`;
  if (amount >= 1000) return `Rp ${(amount / 1000).toFixed(0)}rb`;
  return `Rp ${amount}`;
};

export default function LaporanPenjualanMobile({ dateRange }) {
  const [transactions, setTransactions] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [summary, setSummary] = useState({
    totalPenjualan: 0,
    jumlahTransaksi: 0,
    rataRata: 0,
    totalItem: 0
  });
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'transactions'), (snapshot) => {
      let data = [];
      snapshot.forEach(doc => {
        data.push({ id: doc.id, ...doc.data() });
      });
      
      // Filter by date range
      if (dateRange.startDate && dateRange.endDate) {
        const start = new Date(dateRange.startDate);
        start.setHours(0,0,0,0);
        const end = new Date(dateRange.endDate);
        end.setHours(23,59,59,999);
        
        data = data.filter(trx => {
          const trxDate = trx.tanggal?.toDate ? trx.tanggal.toDate() : new Date(trx.tanggal);
          return trxDate >= start && trxDate <= end;
        });
      }

      data.sort((a,b) => {
        const dateA = a.tanggal?.toDate ? a.tanggal.toDate() : new Date(a.tanggal);
        const dateB = b.tanggal?.toDate ? b.tanggal.toDate() : new Date(b.tanggal);
        return dateB - dateA; // newest first
      });

      setTransactions(data);

      // Compute Summary
      const sum = { totalPenjualan: 0, jumlahTransaksi: data.length, totalItem: 0 };
      const dailySales = {};

      data.forEach(trx => {
        sum.totalPenjualan += (trx.grandTotal || 0);
        sum.totalItem += (trx.cart ? trx.cart.reduce((a, b) => a + (b.qty || 0), 0) : 0);
        
        const dateObj = trx.tanggal?.toDate ? trx.tanggal.toDate() : new Date(trx.tanggal);
        const dateStr = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        
        if (!dailySales[dateStr]) {
          dailySales[dateStr] = { tanggal: dateStr, total: 0, dateObj: dateObj };
        }
        dailySales[dateStr].total += (trx.grandTotal || 0);
      });

      sum.rataRata = sum.jumlahTransaksi > 0 ? sum.totalPenjualan / sum.jumlahTransaksi : 0;
      setSummary(sum);

      // Format for chart (last 7 days active)
      let chartData = Object.values(dailySales).sort((a,b) => a.dateObj - b.dateObj).slice(-7);
      setSalesData(chartData);
    });

    return () => unsub();
  }, [dateRange]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ backgroundColor: '#0f172a', padding: '0.75rem', borderRadius: '0.75rem', color: '#fff', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
          <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.75rem', color: '#94a3b8' }}>{label}</p>
          <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 800 }}>{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(transactions.length / itemsPerPage);

  const paginatedTransactions = transactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* 2x2 Grid Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        
        {/* Total Penjualan */}
        <div style={{ backgroundColor: '#1d4ed8', borderRadius: '1.25rem', padding: '1rem', color: '#fff', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: '-10px', top: '-10px', opacity: 0.1 }}>
            <Wallet size={80} />
          </div>
          <div style={{ position: 'relative', zIndex: 2 }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
              <Wallet size={16} />
            </div>
            <div style={{ fontSize: '0.75rem', color: '#bfdbfe', marginBottom: '0.25rem' }}>Total Pendapatan</div>
            <div style={{ fontSize: '1.125rem', fontWeight: 800, whiteSpace: 'nowrap' }}>
              {formatShortCurrency(summary.totalPenjualan)}
            </div>
          </div>
        </div>

        {/* Jumlah Transaksi */}
        <div style={{ backgroundColor: '#fff', borderRadius: '1.25rem', padding: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#f1f5f9', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
            <Receipt size={16} />
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Total Transaksi</div>
          <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a' }}>
            {summary.jumlahTransaksi} <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>Nota</span>
          </div>
        </div>

        {/* Rata-rata */}
        <div style={{ backgroundColor: '#fff', borderRadius: '1.25rem', padding: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
            <TrendingUp size={16} />
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Rata-rata Nota</div>
          <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a' }}>
            {formatShortCurrency(summary.rataRata)}
          </div>
        </div>

        {/* Total Item */}
        <div style={{ backgroundColor: '#fff', borderRadius: '1.25rem', padding: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
            <ShoppingBag size={16} />
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Barang Terjual</div>
          <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a' }}>
            {summary.totalItem} <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8' }}>Item</span>
          </div>
        </div>

      </div>

      {/* Bar Chart Card */}
      <div style={{ backgroundColor: '#fff', borderRadius: '1.5rem', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 1.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 4, height: 16, backgroundColor: '#3b82f6', borderRadius: 2 }} />
          Grafik Penjualan
        </h3>
        
        {salesData.length > 0 ? (
          <div style={{ height: 200, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <XAxis dataKey="tanggal" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9', radius: 4 }} />
                <Bar dataKey="total" radius={[6, 6, 6, 6]} maxBarSize={40}>
                  {salesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === salesData.length - 1 ? '#2563eb' : '#93c5fd'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.875rem' }}>
            Belum ada data penjualan
          </div>
        )}
      </div>

      {/* Recent Transactions List */}
      <div style={{ backgroundColor: '#fff', borderRadius: '1.5rem', padding: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 4, height: 16, backgroundColor: '#10b981', borderRadius: 2 }} />
            Transaksi Terakhir
          </h3>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', backgroundColor: '#f1f5f9', padding: '0.25rem 0.5rem', borderRadius: '1rem' }}>
            {transactions.length} Total
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {paginatedTransactions.map((trx, i) => {
            const dateObj = trx.tanggal?.toDate ? trx.tanggal.toDate() : new Date(trx.tanggal);
            const timeStr = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
            
            return (
              <div 
                key={trx.id || i} 
                className="flutter-ripple"
                onClick={() => setSelectedTransaction(trx)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', borderRadius: '1rem', border: '1px solid #f1f5f9', backgroundColor: '#fafaf9' }}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '0.75rem', backgroundColor: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <FileText size={18} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {trx.customer?.nama_perusahaan || trx.customer?.nama_pic || 'Pelanggan Umum'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.125rem' }}>
                    {timeStr} • {trx.noNota || `#TRX-${trx.id.substring(0,6)}`}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 800, color: '#16a34a' }}>
                    {formatCurrency(trx.grandTotal)}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '0.125rem' }}>
                    {trx.paymentMethod?.toUpperCase() || '-'}
                  </div>
                </div>
              </div>
            );
          })}
          
          {transactions.length === 0 && (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#94a3b8', fontSize: '0.875rem' }}>
              Belum ada transaksi
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', backgroundColor: currentPage === 1 ? '#f8fafc' : '#fff', color: currentPage === 1 ? '#cbd5e1' : '#0f172a', fontWeight: 600, fontSize: '0.8125rem' }}
              >
                Prev
              </button>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#64748b' }}>
                Halaman {currentPage} dari {totalPages}
              </div>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', backgroundColor: currentPage === totalPages ? '#f8fafc' : '#fff', color: currentPage === totalPages ? '#cbd5e1' : '#0f172a', fontWeight: 600, fontSize: '0.8125rem' }}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {selectedTransaction && (
        <NotaPreview 
          transaction={selectedTransaction} 
          onClose={() => setSelectedTransaction(null)} 
        />
      )}
    </div>
  );
}
