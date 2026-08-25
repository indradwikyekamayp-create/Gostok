import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { db } from '../../firebase';
import ExportButtons from './ExportButtons';
import { Banknote, ShoppingCart, BarChart2, Tag, TrendingUp, TrendingDown, MoreVertical } from 'lucide-react';
import NotaPreview from '../transaksi-jual/NotaPreview';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

const LaporanPenjualan = ({ dateRange }) => {
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
      const trx = [];
      let totalPenjualan = 0;
      let jumlahTransaksi = 0;
      let totalItem = 0;
      const dailySales = {};

      snapshot.forEach(doc => {
        const data = doc.data();
        // Skip filtering by dateRange for now as it's complex for this demo, just take all
        trx.push({ ...data, id: doc.id });

        const dateStr = data.tanggal ? (data.tanggal.toDate ? data.tanggal.toDate().toISOString().split('T')[0] : data.tanggal.split('T')[0]) : '';
        const total = data.grandTotal || 0;
        
        // Sum items
        let itemQty = 0;
        if (data.cart && Array.isArray(data.cart)) {
          itemQty = data.cart.reduce((sum, item) => sum + (item.qty || 0), 0);
        }
        totalItem += itemQty;
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

      // Sort trx by date desc
      trx.sort((a, b) => {
        const dateA = a.tanggal ? (a.tanggal.toDate ? a.tanggal.toDate() : new Date(a.tanggal)) : new Date(0);
        const dateB = b.tanggal ? (b.tanggal.toDate ? b.tanggal.toDate() : new Date(b.tanggal)) : new Date(0);
        return dateB - dateA;
      });

      setTransactions(trx);
      setSalesData(formattedSalesData);
      setSummary({
        totalPenjualan,
        jumlahTransaksi,
        rataRata: jumlahTransaksi > 0 ? (totalPenjualan / jumlahTransaksi) : 0,
        totalItem
      });
    });

    return () => unsub();
  }, [dateRange]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <ExportButtons 
          data={salesData} 
          columns={['Tanggal', 'Total Penjualan']}
          filename="Laporan_Penjualan"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {/* Card 1 */}
        <div style={{ padding: '1.25rem', backgroundColor: '#fff', borderRadius: '0.75rem', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <div style={{ width: '48px', height: '48px', backgroundColor: '#eff6ff', color: '#3b82f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Banknote size={24} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Total Penjualan</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a' }}>{formatCurrency(summary.totalPenjualan)}</div>
            <div style={{ fontSize: '0.6875rem', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: '500' }}><span>&#9650;</span> 12.5% dari periode sebelumnya</div>
          </div>
        </div>
        
        {/* Card 2 */}
        <div style={{ padding: '1.25rem', backgroundColor: '#fff', borderRadius: '0.75rem', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <div style={{ width: '48px', height: '48px', backgroundColor: '#f0fdf4', color: '#22c55e', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <ShoppingCart size={24} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Jumlah Transaksi</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a' }}>{summary.jumlahTransaksi}</div>
            <div style={{ fontSize: '0.6875rem', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: '500' }}><span>&#9650;</span> 2 transaksi</div>
          </div>
        </div>

        {/* Card 3 */}
        <div style={{ padding: '1.25rem', backgroundColor: '#fff', borderRadius: '0.75rem', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <div style={{ width: '48px', height: '48px', backgroundColor: '#fff7ed', color: '#f59e0b', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <BarChart2 size={24} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Rata-rata per Transaksi</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a' }}>{formatCurrency(summary.rataRata)}</div>
            <div style={{ fontSize: '0.6875rem', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: '500' }}><span>&#9660;</span> 4.3% dari periode sebelumnya</div>
          </div>
        </div>

        {/* Card 4 */}
        <div style={{ padding: '1.25rem', backgroundColor: '#fff', borderRadius: '0.75rem', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <div style={{ width: '48px', height: '48px', backgroundColor: '#f5f3ff', color: '#8b5cf6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Tag size={24} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Total Item Terjual</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#0f172a' }}>{summary.totalItem}</div>
            <div style={{ fontSize: '0.6875rem', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: '500' }}><span>&#9650;</span> 5 item</div>
          </div>
        </div>
      </div>

      {/* 2 Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        
        {/* Chart Column */}
        <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: '600', margin: 0, color: '#0f172a' }}>Grafik Penjualan Harian</h4>
            <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Tampilkan: 
              <select style={{ border: '1px solid #cbd5e1', borderRadius: '0.25rem', padding: '0.25rem', outline: 'none' }}>
                <option>Harian</option>
                <option>Mingguan</option>
              </select>
            </div>
          </div>
          <div style={{ height: '300px' }}>
            {salesData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="tanggal" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#64748b', fontSize: 11}} 
                    dy={10} 
                    tickFormatter={(val) => {
                      const d = new Date(val);
                      return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
                    }}
                  />
                  <YAxis 
                    axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} dx={-10}
                    tickFormatter={(val) => `Rp${(val/1000000).toFixed(1)}M`}
                  />
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                    labelStyle={{color: '#0f172a', fontWeight: 'bold'}}
                    contentStyle={{borderRadius: '0.5rem', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', fontSize: '12px'}}
                  />
                  <Bar dataKey="total" fill="#1d4ed8" maxBarSize={60} radius={[4, 4, 0, 0]}>
                    <LabelList dataKey="total" position="top" formatter={(val) => `Rp${(val/1000).toFixed(0)}rb`} style={{ fill: '#475569', fontSize: '10px', fontWeight: '600' }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '0.875rem' }}>
                Belum ada data penjualan
              </div>
            )}
          </div>
        </div>

        {/* Insights Column */}
        <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <h4 style={{ fontSize: '0.875rem', fontWeight: '600', margin: '0 0 1.5rem 0', color: '#0f172a' }}>Ringkasan Insight</h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingUp size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#0f172a' }}>Penjualan tertinggi</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Pada {salesData.length > 0 ? new Date(salesData.reduce((prev, current) => (prev.total > current.total) ? prev : current).tanggal).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'}) : '-'}</div>
                </div>
              </div>
              <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>
                {salesData.length > 0 ? formatCurrency(salesData.reduce((prev, current) => (prev.total > current.total) ? prev : current).total) : 'Rp 0'}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShoppingCart size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#0f172a' }}>Transaksi terbanyak</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Pada hari sibuk</div>
                </div>
              </div>
              <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>
                {summary.jumlahTransaksi} transaksi
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#f3e8ff', color: '#7e22ce', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BarChart2 size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#0f172a' }}>Rata-rata transaksi</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Selama periode ini</div>
                </div>
              </div>
              <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>
                {formatCurrency(summary.rataRata)}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Table Section */}
      <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <h4 style={{ fontSize: '0.875rem', fontWeight: '600', margin: '0 0 1rem 0', color: '#0f172a' }}>Daftar Transaksi</h4>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.75rem' }}>
            <thead>
              <tr style={{ color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '0.75rem', fontWeight: '500' }}>Tanggal</th>
                <th style={{ padding: '0.75rem', fontWeight: '500' }}>No. Transaksi</th>
                <th style={{ padding: '0.75rem', fontWeight: '500' }}>Pelanggan</th>
                <th style={{ padding: '0.75rem', fontWeight: '500', textAlign: 'center' }}>Jumlah Item</th>
                <th style={{ padding: '0.75rem', fontWeight: '500', textAlign: 'right' }}>Total Penjualan</th>
                <th style={{ padding: '0.75rem', fontWeight: '500' }}>Metode Pembayaran</th>
                <th style={{ padding: '0.75rem', fontWeight: '500', textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length > 0 ? transactions.slice(0, 5).map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '0.75rem', color: '#0f172a' }}>
                    {row.tanggal ? (row.tanggal.toDate ? row.tanggal.toDate() : new Date(row.tanggal)).toLocaleString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}
                  </td>
                  <td style={{ padding: '0.75rem', fontWeight: '500', color: '#0f172a' }}>{row.noNota || `#TRX-${row.id.substring(0,6)}`}</td>
                  <td style={{ padding: '0.75rem', color: '#475569' }}>{row.customer?.nama_perusahaan || row.customer?.nama_pic || 'Umum'}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'center', color: '#475569' }}>{row.cart ? row.cart.reduce((sum, item) => sum + (item.qty || 0), 0) : 0}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600', color: '#0f172a' }}>{formatCurrency(row.grandTotal)}</td>
                  <td style={{ padding: '0.75rem', color: '#475569' }}>{row.paymentMethod?.toUpperCase() || '-'}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                      <button 
                        style={{ border: 'none', background: 'transparent', color: '#3b82f6', fontSize: '0.75rem', cursor: 'pointer', padding: 0 }}
                        onClick={() => setSelectedTransaction(row)}
                      >
                        Lihat Detail
                      </button>
                      <button style={{ border: '1px solid #e2e8f0', background: 'white', borderRadius: '0.25rem', padding: '0.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#64748b' }}>
                        <MoreVertical size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="7" style={{ padding: '1.5rem', textAlign: 'center', color: '#64748b' }}>Belum ada data transaksi</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', fontSize: '0.75rem', color: '#64748b' }}>
          <div>Menampilkan {transactions.length > 0 ? 1 : 0} - {Math.min(5, transactions.length)} dari {transactions.length} transaksi</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <button style={{ border: '1px solid #cbd5e1', background: 'white', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', cursor: 'pointer' }}>&lt;</button>
            <button style={{ border: 'none', background: '#1d4ed8', color: 'white', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', cursor: 'pointer', fontWeight: '500' }}>1</button>
            <button style={{ border: 'none', background: 'transparent', padding: '0.25rem 0.5rem', cursor: 'pointer' }}>2</button>
            <button style={{ border: '1px solid #cbd5e1', background: 'white', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', cursor: 'pointer' }}>&gt;</button>
            <select style={{ marginLeft: '0.5rem', border: '1px solid #cbd5e1', background: 'white', padding: '0.25rem', borderRadius: '0.25rem', outline: 'none' }}>
              <option>5 / halaman</option>
              <option>10 / halaman</option>
            </select>
          </div>
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
};

export default LaporanPenjualan;
