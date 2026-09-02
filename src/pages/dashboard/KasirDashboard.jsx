import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PackagePlus, ShoppingCart, Users, Package, History, Clock, Database, ServerCrash, Wifi, WifiOff, LogOut, Search } from 'lucide-react';
import styles from './DashboardPage.module.css';
import { useAuth } from '../../hooks/useAuth';

const KasirDashboard = () => {
  const navigate = useNavigate();
  const { isAdmin, userData, logout } = useAuth();
  const [time, setTime] = useState(new Date());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showLacakModal, setShowLacakModal] = useState(false);
  const [lacakQuery, setLacakQuery] = useState('');

  useEffect(() => {
    let isMounted = true;
    
    const checkRealInternet = async () => {
      if (!navigator.onLine) {
        if (isMounted) setIsOnline(false);
        return;
      }
      try {
        // Pancing request kecil ke luar untuk ngetes internet asli (bypass cache)
        await fetch('https://www.google.com/favicon.ico?_=' + new Date().getTime(), { mode: 'no-cors' });
        if (isMounted) setIsOnline(true);
      } catch (error) {
        if (isMounted) setIsOnline(false);
      }
    };

    const handleOnline = () => checkRealInternet();
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cek setiap 10 detik
    const pingTimer = setInterval(checkRealInternet, 10000);
    checkRealInternet(); // Cek awal

    const clockTimer = setInterval(() => setTime(new Date()), 1000);
    
    return () => {
      isMounted = false;
      clearInterval(clockTimer);
      clearInterval(pingTimer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const formatDate = (date) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('id-ID', options);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className={styles.dashboard}>
      
      {/* Welcome & Live Clock Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: '2rem', borderRadius: '1.5rem', border: '1px solid #e2e8f0', marginBottom: '0.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.025)' }}>
        <div>
          <h1 className={styles.pageTitle} style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>
            Halo, {userData?.nama || (isAdmin ? 'Admin' : 'Kasir')}! 👋
          </h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '1rem' }}>Selamat bertugas hari ini. Mesin kasir siap digunakan.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', backgroundColor: '#f8fafc', padding: '1rem 1.5rem', borderRadius: '1rem', border: '1px solid #f1f5f9' }}>
          <div style={{ padding: '0.75rem', backgroundColor: '#eff6ff', borderRadius: '50%', color: '#3b82f6' }}>
            <Clock size={28} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b', letterSpacing: '0.5px' }}>{formatTime(time)}</div>
            <div style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: '500' }}>{formatDate(time)}</div>
          </div>
        </div>
      </div>

      <div className={styles.posGrid}>
        
        <div 
          className={`${styles.posCard} ${styles.posCardPrimary}`}
          onClick={() => navigate('/transaksi-jual')}
        >
          <div className={styles.posIconContainer}>
            <ShoppingCart size={40} />
          </div>
          <div>
            <h3 className={styles.posCardTitle}>Transaksi Jual</h3>
            <p className={styles.posCardSubtitle}>Buka mesin kasir</p>
          </div>
        </div>

        <div 
          className={styles.posCard} 
          onClick={() => navigate('/pelanggan')}
        >
          <div className={styles.posIconContainer}>
            <Users size={40} />
          </div>
          <div>
            <h3 className={styles.posCardTitle}>Data Pelanggan</h3>
            <p className={styles.posCardSubtitle}>Kelola member pelanggan</p>
          </div>
        </div>

        <div 
          className={styles.posCard} 
          onClick={() => navigate('/master-produk')}
        >
          <div className={styles.posIconContainer}>
            <Package size={40} />
          </div>
          <div>
            <h3 className={styles.posCardTitle}>Master Produk</h3>
            <p className={styles.posCardSubtitle}>Daftar semua produk</p>
          </div>
        </div>

        <div 
          className={styles.posCard} 
          onClick={() => navigate('/barang-masuk')}
        >
          <div className={styles.posIconContainer}>
            <PackagePlus size={40} />
          </div>
          <div>
            <h3 className={styles.posCardTitle}>Barang Masuk</h3>
            <p className={styles.posCardSubtitle}>Catat stok masuk</p>
          </div>
        </div>

        <div 
          className={styles.posCard} 
          onClick={() => navigate('/riwayat')}
        >
          <div className={styles.posIconContainer}>
            <History size={40} />
          </div>
          <div>
            <h3 className={styles.posCardTitle}>Riwayat Transaksi</h3>
            <p className={styles.posCardSubtitle}>Lihat riwayat kasir</p>
          </div>
        </div>

        <div 
          className={styles.posCard} 
          onClick={() => setShowLacakModal(true)}
        >
          <div className={styles.posIconContainer}>
            <Search size={40} />
          </div>
          <div>
            <h3 className={styles.posCardTitle}>Lacak Pesanan</h3>
            <p className={styles.posCardSubtitle}>Cari struk / pembayaran</p>
          </div>
        </div>

      </div>

      {/* System Status Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: '1rem 1.5rem', borderRadius: '1rem', border: '1px solid #e2e8f0', marginTop: 'auto', boxShadow: '0 -2px 10px rgba(0,0,0,0.02)' }}>
        
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: isOnline ? '#0f172a' : '#ef4444' }}>
            {isOnline ? <Database size={18} color="#10b981" /> : <ServerCrash size={18} color="#ef4444" />}
            <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Server: {isOnline ? 'Aktif' : 'Error'}</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: isOnline ? '#0f172a' : '#ef4444' }}>
            {isOnline ? <Wifi size={18} color="#10b981" /> : <WifiOff size={18} color="#ef4444" />}
            <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Internet: {isOnline ? 'Terhubung' : 'Terputus'}</span>
          </div>
        </div>

        <button 
          onClick={logout}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', padding: '0.5rem 1.25rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem', transition: 'all 0.2s' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fecaca'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
        >
          <LogOut size={16} />
          <span>Keluar Sistem</span>
        </button>

      </div>

      {/* Modal Lacak Pesanan */}
      {showLacakModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent} style={{ padding: '24px' }}>
            <h2 style={{ marginTop: 0, marginBottom: '16px', fontSize: '1.25rem', color: '#1e293b' }}>Lacak Pesanan / Pembayaran</h2>
            <p style={{ color: '#64748b', marginBottom: '20px', fontSize: '0.9rem' }}>
              Masukkan Nomer Invoice (Contoh: INV-...) atau nama pelanggan untuk mencari struk atau riwayat pembayaran.
            </p>
            <input 
              type="text" 
              value={lacakQuery}
              onChange={(e) => setLacakQuery(e.target.value)}
              placeholder="Ketik nomer invoice..."
              style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', marginBottom: '20px', fontSize: '1rem', boxSizing: 'border-box' }}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && lacakQuery.trim()) {
                  navigate(`/riwayat?search=${encodeURIComponent(lacakQuery.trim())}`);
                }
              }}
            />
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setShowLacakModal(false)}
                style={{ padding: '10px 16px', border: '1px solid #e2e8f0', backgroundColor: '#fff', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', color: '#64748b' }}
              >
                Batal
              </button>
              <button 
                onClick={() => {
                  if (lacakQuery.trim()) {
                    navigate(`/riwayat?search=${encodeURIComponent(lacakQuery.trim())}`);
                  }
                }}
                style={{ padding: '10px 16px', border: 'none', backgroundColor: '#3b82f6', color: '#fff', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}
              >
                Cari Pesanan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KasirDashboard;
