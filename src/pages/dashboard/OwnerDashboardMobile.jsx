import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, ShoppingCart, Package, DollarSign, Calendar, ChevronDown, Filter, ArrowUp, ArrowDown, Activity, Users, FileText, MoreHorizontal, AlertTriangle, Settings, X, Store, Bell } from 'lucide-react';
import { collection, onSnapshot, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../hooks/useAuth';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const formatRupiah = (value) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

const formatShortDate = (date) => {
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }).format(date);
};

const formatFullDate = (date) => {
  return new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(date);
};

const OwnerDashboardMobile = () => {
  const { userData } = useAuth();
  const navigate = useNavigate();
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [stockIns, setStockIns] = useState([]);
  const [payments, setPayments] = useState([]);
  const [storeName, setStoreName] = useState('PT. WELINDO SUKSES BERSAMA');
  const [activityTab, setActivityTab] = useState('penjualan'); // 'penjualan', 'barang_masuk', 'pembayaran'
  const [chartPeriod, setChartPeriod] = useState('7 Hari Terakhir');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filterPeriods = ['Hari Ini', '7 Hari Terakhir', '30 Hari Terakhir', 'Bulan Ini', 'Tahun Ini'];

  // Fake period state for UI mockup accuracy
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 6);

  useEffect(() => {
    const unsubStore = onSnapshot(doc(db, 'settings', 'store_config'), (docSnap) => {
      if (docSnap.exists() && docSnap.data().namaToko) {
        setStoreName(docSnap.data().namaToko);
      }
    });

    const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      const data = [];
      snapshot.forEach(d => data.push({ id: d.id, ...d.data() }));
      setProducts(data);
    });

    const unsubCustomers = onSnapshot(collection(db, 'customers'), (snapshot) => {
      const data = [];
      snapshot.forEach(d => data.push({ id: d.id, ...d.data() }));
      setCustomers(data);
    });

    const unsubTransactions = onSnapshot(collection(db, 'transactions'), (snapshot) => {
      const data = [];
      snapshot.forEach(d => data.push({ id: d.id, ...d.data() }));
      setTransactions(data);
    });

    const unsubStockIns = onSnapshot(collection(db, 'stock_ins'), (snapshot) => {
      const data = [];
      snapshot.forEach(d => data.push({ id: d.id, ...d.data() }));
      setStockIns(data);
    });

    const unsubPayments = onSnapshot(collection(db, 'payments'), (snapshot) => {
      const data = [];
      snapshot.forEach(d => data.push({ id: d.id, ...d.data() }));
      setPayments(data);
    });

    return () => {
      unsubStore();
      unsubProducts();
      unsubCustomers();
      unsubTransactions();
      unsubStockIns();
      unsubPayments();
    };
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const todayTxs = transactions.filter(t => t.tanggal?.startsWith(today));
  
  const omzetHariIni = todayTxs.reduce((sum, t) => sum + (t.grandTotal || 0), 0);
  const txCountHariIni = todayTxs.length;
  
  const totalPiutang = customers.reduce((sum, c) => sum + (c.total_hutang_berjalan || 0), 0);
  const totalHutangCustomers = customers.filter(c => c.total_hutang_berjalan > 0).length;

  const last7Days = Array.from({length: 7}, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  const chartData = last7Days.map(dateObj => {
    const dateStr = dateObj.toISOString().split('T')[0];
    const txs = transactions.filter(t => t.tanggal?.startsWith(dateStr));
    return {
      date: formatShortDate(dateObj),
      total: txs.reduce((sum, t) => sum + (t.grandTotal || 0), 0),
    };
  });

  // Helper for time string
  const formatTimeStr = (tanggal) => {
    if (!tanggal) return '';
    const d = new Date(tanggal);
    const isHariIni = d.toISOString().split('T')[0] === today;
    let timeStr = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
    if (!isHariIni) {
      timeStr = formatShortDate(d) + ', ' + timeStr;
    }
    return timeStr;
  };

  // Recent Activities
  const recentPenjualan = [...transactions].sort((a,b) => new Date(b.tanggal || 0) - new Date(a.tanggal || 0)).slice(0, 5).map(tx => ({
    id: tx.id,
    type: 'trx',
    title: `Transaksi penjualan #${tx.noNota || tx.id.slice(0,6)}`,
    amount: formatRupiah(tx.grandTotal || 0),
    time: formatTimeStr(tx.tanggal),
    icon: <ShoppingCart size={18} color="#16a34a" />,
    iconBg: '#dcfce7'
  }));

  const recentBarangMasuk = [...stockIns].sort((a,b) => new Date(b.tanggal || 0) - new Date(a.tanggal || 0)).slice(0, 5).map(st => {
    const itemName = st.items && st.items.length > 0 ? st.items[0].nama_barang : 'Barang';
    const totalItems = st.total_items || 0;
    return {
      id: st.id,
      type: 'stock',
      title: `Barang masuk ${itemName}${st.items && st.items.length > 1 ? ' dll' : ''}`,
      amount: `${totalItems} pcs`,
      time: formatTimeStr(st.tanggal),
      icon: <Package size={18} color="#3b82f6" />,
      iconBg: '#eff6ff'
    };
  });

  const recentPembayaran = [...payments].sort((a,b) => new Date(b.tanggal || 0) - new Date(a.tanggal || 0)).slice(0, 5).map(py => {
    const customer = customers.find(c => c.id === py.customer_id);
    const customerName = customer ? (customer.nama_perusahaan || customer.nama_pic) : 'Pelanggan';
    return {
      id: py.id,
      type: 'payment',
      title: `Pembayaran cicilan dari ${customerName}`,
      amount: formatRupiah(py.jumlahBayar || 0),
      time: formatTimeStr(py.tanggal),
      icon: <Users size={18} color="#f59e0b" />,
      iconBg: '#fff7ed'
    };
  });

  let displayedActivities = [];
  if (activityTab === 'penjualan') displayedActivities = recentPenjualan;
  else if (activityTab === 'barang_masuk') displayedActivities = recentBarangMasuk;
  else if (activityTab === 'pembayaran') displayedActivities = recentPembayaran;

  return (
    <div className="flutter-page" style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '80px', fontFamily: '"Inter", sans-serif' }}>
      
      {/* Luxury Blue Header */}
      <div className="animate-breathing-gradient" style={{ 
        position: 'relative',
        background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 80%, #60a5fa 100%)',
        padding: '1.25rem 1.25rem 3.5rem 1.25rem',
        borderBottomLeftRadius: '2rem',
        borderBottomRightRadius: '2rem',
        overflow: 'hidden',
        color: '#fff',
        boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.4)'
      }}>
        {/* Abstract Pattern Circles */}
        <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', zIndex: 0 }}></div>
        <div style={{ position: 'absolute', bottom: '-40px', left: '-20px', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', zIndex: 0 }}></div>
        <div style={{ position: 'absolute', top: '40px', right: '60px', width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', zIndex: 0 }}></div>

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div style={{ fontSize: '0.6875rem', fontWeight: '700', color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {storeName}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.25rem 0.625rem', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '1rem', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <Calendar size={12} color="#fff" />
              <span style={{ fontSize: '0.625rem', fontWeight: 600, color: '#fff', letterSpacing: '0.3px' }}>{formatFullDate(new Date())}</span>
            </div>
          </div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' }}>
            Halo, {userData?.nama || 'Owner'}! 👋
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#e0e7ff', marginTop: '0.25rem', fontWeight: 500 }}>
            Pantau performa bisnismu hari ini.
          </p>
        </div>
      </div>

      {/* Summary Cards Grid (Overlapping Header) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '0 1rem', marginTop: '-2rem', position: 'relative', zIndex: 10 }}>
        
        {/* Penjualan */}
        <div className="flutter-ripple" style={{ backgroundColor: '#fff', borderRadius: '1rem', padding: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: '0.5rem', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingBag size={16} color="#3b82f6" />
            </div>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>Penjualan</span>
          </div>
          <div style={{ fontSize: '0.9375rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '0.25rem' }}>{formatRupiah(omzetHariIni)}</div>
          <div style={{ fontSize: '0.625rem', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <ArrowUp size={10} /> 12.5% <span style={{ color: '#94a3b8', fontWeight: 400 }}>dari periode lalu</span>
          </div>
        </div>

        {/* Transaksi */}
        <div className="flutter-ripple" style={{ backgroundColor: '#fff', borderRadius: '1rem', padding: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: '0.5rem', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingCart size={16} color="#16a34a" />
            </div>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>Transaksi</span>
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '0.25rem' }}>{txCountHariIni}</div>
          <div style={{ fontSize: '0.625rem', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <ArrowUp size={10} /> 2 <span style={{ color: '#94a3b8', fontWeight: 400 }}>dari periode lalu</span>
          </div>
        </div>

        {/* Produk */}
        <div className="flutter-ripple" style={{ backgroundColor: '#fff', borderRadius: '1rem', padding: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: '0.5rem', backgroundColor: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Package size={16} color="#9333ea" />
            </div>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>Produk</span>
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '0.25rem' }}>{products.length}</div>
          <div style={{ fontSize: '0.625rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span style={{ fontWeight: 'bold' }}>—</span> 0% <span style={{ color: '#94a3b8', fontWeight: 400 }}>dari periode lalu</span>
          </div>
        </div>

        {/* Hutang */}
        <div className="flutter-ripple" style={{ backgroundColor: '#fff', borderRadius: '1rem', padding: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <div style={{ width: 32, height: 32, borderRadius: '0.5rem', backgroundColor: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={16} color="#dc2626" />
            </div>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>Hutang</span>
          </div>
          <div style={{ fontSize: '0.9375rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '0.25rem' }}>{formatRupiah(totalPiutang)}</div>
          <div style={{ fontSize: '0.625rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            {totalHutangCustomers} pelanggan
          </div>
        </div>

      </div>

      {/* Menu Cepat */}
      <div style={{ padding: '1.5rem 1rem 1rem 1rem' }}>
        <h2 style={{ fontSize: '0.9375rem', fontWeight: 'bold', color: '#0f172a', margin: '0 0 1rem 0' }}>Menu Cepat</h2>
        
        <div style={{ 
          backgroundColor: '#fff', 
          borderRadius: '1.25rem', 
          padding: '1.25rem 0.5rem', 
          border: '1px solid #e2e8f0', 
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)',
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '1.25rem 0.25rem'
        }}>
          
          {/* Always Visible Row */}
          <div className="flutter-ripple" onClick={() => navigate('/transaksi-jual')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', borderRadius: '0.75rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: '1rem', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
               <ShoppingCart size={20} strokeWidth={2} />
            </div>
            <span style={{ fontSize: '0.625rem', fontWeight: 600, color: '#334155', textAlign: 'center', lineHeight: 1.2 }}>Transaksi<br/>Jual</span>
          </div>

          <div className="flutter-ripple" onClick={() => navigate('/barang-masuk')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', borderRadius: '0.75rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: '1rem', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
               <Package size={20} strokeWidth={2} />
            </div>
            <span style={{ fontSize: '0.625rem', fontWeight: 600, color: '#334155', textAlign: 'center', lineHeight: 1.2 }}>Barang<br/>Masuk</span>
          </div>

          <div className="flutter-ripple" onClick={() => navigate('/pelanggan')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', borderRadius: '0.75rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: '1rem', backgroundColor: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
               <Users size={20} strokeWidth={2} />
            </div>
            <span style={{ fontSize: '0.625rem', fontWeight: 600, color: '#334155', textAlign: 'center', lineHeight: 1.2 }}>Pelanggan</span>
          </div>

          <div className="flutter-ripple" onClick={() => navigate('/laporan')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', borderRadius: '0.75rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: '1rem', backgroundColor: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9333ea' }}>
               <FileText size={20} strokeWidth={2} />
            </div>
            <span style={{ fontSize: '0.625rem', fontWeight: 600, color: '#334155', textAlign: 'center', lineHeight: 1.2 }}>Laporan</span>
          </div>

          <div className="flutter-ripple" onClick={() => setShowMoreMenu(!showMoreMenu)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', borderRadius: '0.75rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: '1rem', backgroundColor: showMoreMenu ? '#e2e8f0' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', transition: 'all 0.3s' }}>
               <MoreHorizontal size={20} strokeWidth={2} />
            </div>
            <span style={{ fontSize: '0.625rem', fontWeight: 600, color: '#334155', textAlign: 'center', lineHeight: 1.2 }}>{showMoreMenu ? 'Tutup' : 'Lainnya'}</span>
          </div>

          {/* Expanded Menu Items */}
          {showMoreMenu && (
            <>

              <div className="flutter-ripple flutter-fade" onClick={() => navigate('/kerugian')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', borderRadius: '0.75rem' }}>
                <div style={{ width: 44, height: 44, borderRadius: '1rem', backgroundColor: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
                  <AlertTriangle size={20} strokeWidth={2} />
                </div>
                <span style={{ fontSize: '0.625rem', fontWeight: 600, color: '#334155', textAlign: 'center', lineHeight: 1.2 }}>Kerugian</span>
              </div>

              <div className="flutter-ripple flutter-fade" onClick={() => navigate('/karyawan')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', borderRadius: '0.75rem' }}>
                <div style={{ width: 44, height: 44, borderRadius: '1rem', backgroundColor: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0ea5e9' }}>
                  <Users size={20} strokeWidth={2} />
                </div>
                <span style={{ fontSize: '0.625rem', fontWeight: 600, color: '#334155', textAlign: 'center', lineHeight: 1.2 }}>Karyawan</span>
              </div>

              <div className="flutter-ripple flutter-fade" onClick={() => navigate('/pengaturan')} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', borderRadius: '0.75rem' }}>
                <div style={{ width: 44, height: 44, borderRadius: '1rem', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                  <Settings size={20} strokeWidth={2} />
                </div>
                <span style={{ fontSize: '0.625rem', fontWeight: 600, color: '#334155', textAlign: 'center', lineHeight: 1.2 }}>Pengaturan</span>
              </div>
            </>
          )}

        </div>
      </div>

      {/* Chart Section */}
      <div style={{ padding: '0 1rem', marginBottom: '1.5rem' }}>
        <div style={{ backgroundColor: '#fff', borderRadius: '1rem', padding: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '0.9375rem', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>Grafik Penjualan</h2>
            <div style={{ position: 'relative' }}>
              <div 
                className="flutter-ripple" 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                style={{ border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '0.375rem 0.625rem', fontSize: '0.6875rem', fontWeight: 600, color: '#475569', display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', backgroundColor: '#f8fafc' }}
              >
                {chartPeriod} <ChevronDown size={12} style={{ transform: isFilterOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
              </div>
              
              {isFilterOpen && (
                <>
                  <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 40 }} onClick={() => setIsFilterOpen(false)} />
                  <div 
                    className="flutter-fade"
                    style={{ position: 'absolute', top: 'calc(100% + 4px)', right: 0, backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.5rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', zIndex: 50, minWidth: '130px', overflow: 'hidden' }}
                  >
                    {filterPeriods.map((period) => (
                      <div 
                        key={period}
                        onClick={() => { setChartPeriod(period); setIsFilterOpen(false); }}
                        style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem', fontWeight: chartPeriod === period ? 700 : 500, color: chartPeriod === period ? '#1d4ed8' : '#334155', backgroundColor: chartPeriod === period ? '#eff6ff' : '#fff', cursor: 'pointer', borderBottom: '1px solid #f8fafc' }}
                      >
                        {period}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div style={{ height: '200px', width: '100%', marginLeft: '-15px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                <YAxis 
                   axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} 
                   tickFormatter={(val) => `Rp${(val/1000).toFixed(0)}rb`}
                />
                <Tooltip 
                  formatter={(value) => formatRupiah(value)}
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: '1px solid rgba(255,255,255,0.4)', 
                    backgroundColor: 'rgba(255, 255, 255, 0.85)', 
                    backdropFilter: 'blur(8px)', 
                    boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.2)', 
                    fontSize: '12px', 
                    fontWeight: 'bold',
                    color: '#0f172a'
                  }}
                  itemStyle={{ color: '#1d4ed8' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#2563eb" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorTotal)" 
                  isAnimationActive={true}
                  animationDuration={1500}
                  animationEasing="ease-out"
                  style={{ filter: 'drop-shadow(0px 6px 8px rgba(37, 99, 235, 0.4))' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Aktivitas Terakhir */}
      <div style={{ padding: '0 1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '0.9375rem', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>Aktivitas Terakhir</h2>
          <span className="flutter-ripple" style={{ fontSize: '0.8125rem', color: '#3b82f6', fontWeight: 600, padding: '0.25rem 0.5rem', borderRadius: '0.25rem' }}>Lihat Semua</span>
        </div>

        {/* 3 Tabs / Kolom Pemisah */}
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', marginBottom: '1rem', paddingBottom: '0.25rem', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
          <button 
             onClick={() => setActivityTab('penjualan')}
             className="flutter-ripple"
             style={{ 
               padding: '0.375rem 0.75rem', 
               borderRadius: '1rem', 
               fontSize: '0.75rem', 
               fontWeight: 600, 
               border: 'none',
               whiteSpace: 'nowrap',
               backgroundColor: activityTab === 'penjualan' ? '#1d4ed8' : '#e2e8f0',
               color: activityTab === 'penjualan' ? '#fff' : '#475569',
               transition: 'all 0.2s'
             }}
          >
            Penjualan
          </button>
          <button 
             onClick={() => setActivityTab('barang_masuk')}
             className="flutter-ripple"
             style={{ 
               padding: '0.375rem 0.75rem', 
               borderRadius: '1rem', 
               fontSize: '0.75rem', 
               fontWeight: 600, 
               border: 'none',
               whiteSpace: 'nowrap',
               backgroundColor: activityTab === 'barang_masuk' ? '#1d4ed8' : '#e2e8f0',
               color: activityTab === 'barang_masuk' ? '#fff' : '#475569',
               transition: 'all 0.2s'
             }}
          >
            Barang Masuk
          </button>
          <button 
             onClick={() => setActivityTab('pembayaran')}
             className="flutter-ripple"
             style={{ 
               padding: '0.375rem 0.75rem', 
               borderRadius: '1rem', 
               fontSize: '0.75rem', 
               fontWeight: 600, 
               border: 'none',
               whiteSpace: 'nowrap',
               backgroundColor: activityTab === 'pembayaran' ? '#1d4ed8' : '#e2e8f0',
               color: activityTab === 'pembayaran' ? '#fff' : '#475569',
               transition: 'all 0.2s'
             }}
          >
            Pembayaran Hutang
          </button>
        </div>

        <div style={{ backgroundColor: '#fff', borderRadius: '1.25rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
          
          {displayedActivities.length > 0 ? displayedActivities.map((act, index) => {
            const isLast = index === displayedActivities.length - 1;
            
            // Split title for styling if it contains an invoice/nota number
            let mainTitle = act.title;
            let subTitle = '';
            
            if (act.title.includes('#')) {
              const parts = act.title.split('#');
              mainTitle = parts[0].trim();
              subTitle = '#' + parts[1];
            }

            return (
             <div 
               key={act.id} 
               className="flutter-ripple"
               style={{ 
                 display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem',
                 borderBottom: isLast ? 'none' : '1px solid #f1f5f9',
                 animation: 'flutterListFade 0.4s ease-out forwards',
                 opacity: 0,
                 animationDelay: `${index * 0.05}s`
               }}
             >
               <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: act.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                 {act.icon}
               </div>
               
               <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                 <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                   {mainTitle}
                 </div>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.6875rem', color: '#94a3b8' }}>
                   {subTitle && <span style={{ fontWeight: 600, color: '#64748b' }}>{subTitle}</span>}
                   {subTitle && <span>•</span>}
                   <span>{act.time}</span>
                 </div>
               </div>
               
               <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: (act.type === 'trx' || act.type === 'payment') ? '#16a34a' : '#0f172a', textAlign: 'right', whiteSpace: 'nowrap' }}>
                 {(act.type === 'trx' || act.type === 'payment') ? '+' : ''}{act.amount}
               </div>
             </div>
            )
          }) : (
            <div style={{ textAlign: 'center', color: '#64748b', fontSize: '0.875rem', padding: '2rem 1rem' }}>Belum ada aktivitas di kategori ini.</div>
          )}

        </div>
      </div>

    </div>
  );
};

export default OwnerDashboardMobile;
