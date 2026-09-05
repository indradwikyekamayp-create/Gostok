import React, { useState, useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutGrid, Package, Plus, Receipt, Menu as MenuIcon, BarChart3, PackagePlus, Trash2, Users, Settings, LogOut, X, ScanBarcode, ShoppingCart } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { ROLES } from '../../constants/roles';
import { ToastContext } from '../../context/ToastContext';
import styles from './MobileBottomNav.module.css';

const MobileBottomNav = () => {
  const navigate = useNavigate();
  const { userData, logout } = useAuth();
  const { showToast } = useContext(ToastContext);
  const [showMore, setShowMore] = useState(false);
  const [showScanMenu, setShowScanMenu] = useState(false);
  
  const userRole = userData?.role || 'kasir';
  const isOwner = userRole === ROLES.OWNER || userRole === 'owner';
  const isAdmin = isOwner || userRole === ROLES.ADMIN || userRole === 'admin';

  return (
    <>
      <div className={styles.bottomNav}>
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => `${styles.navItem} ${isActive && !showMore && !showScanMenu ? styles.active : ''}`}
          onClick={() => { setShowMore(false); setShowScanMenu(false); }}
        >
          <LayoutGrid size={24} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink 
          to="/master-produk" 
          className={({ isActive }) => `${styles.navItem} ${isActive && !showMore && !showScanMenu ? styles.active : ''}`}
          onClick={(e) => {
            if (!isAdmin) {
              e.preventDefault();
              showToast('Hanya admin yang bisa akses Master Produk', 'error');
            } else {
              setShowMore(false); setShowScanMenu(false);
            }
          }}
          style={{ opacity: isAdmin ? 1 : 0.5 }}
        >
          <Package size={24} />
          <span>Produk</span>
        </NavLink>

        <div className={styles.fabWrapper}>
          <button className={styles.fab} onClick={() => { setShowMore(false); setShowScanMenu(true); }}>
            <ScanBarcode size={26} color="white" />
            <div className={styles.scanLine}></div>
          </button>
        </div>

        <NavLink 
          to="/riwayat" 
          className={({ isActive }) => `${styles.navItem} ${isActive && !showMore && !showScanMenu ? styles.active : ''}`}
          onClick={() => { setShowMore(false); setShowScanMenu(false); }}
        >
          <Receipt size={24} />
          <span>Transaksi</span>
        </NavLink>

        <button 
          className={`${styles.navItem} ${showMore ? styles.active : ''}`}
          onClick={() => { setShowScanMenu(false); setShowMore(!showMore); }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
        >
          <MenuIcon size={24} />
          <span>Menu</span>
        </button>
      </div>

      {/* Bottom Sheet Menu for 'More' */}
      {showMore && (
        <div className={styles.bottomSheetOverlay} onClick={() => setShowMore(false)}>
          <div className={styles.bottomSheet} onClick={e => e.stopPropagation()}>
            <div className={styles.sheetHeader}>
              <h3>Menu Lainnya</h3>
              <button onClick={() => setShowMore(false)} className={styles.closeBtn}><X size={20} /></button>
            </div>
            <div className={styles.sheetContent}>
              
              <div className={styles.menuGrid}>
                <button className={styles.menuBox} onClick={() => { setShowMore(false); navigate('/barang-masuk'); }}>
                  <div className={styles.menuIcon}><PackagePlus size={24} color="#3b82f6" /></div>
                  <span>Barang Masuk</span>
                </button>
                <button className={styles.menuBox} onClick={() => { setShowMore(false); navigate('/pelanggan'); }}>
                  <div className={styles.menuIcon}><Users size={24} color="#10b981" /></div>
                  <span>Pelanggan</span>
                </button>
              </div>

              {isAdmin && (
                <div className={styles.menuGrid} style={{ marginTop: '1rem' }}>
                  <button className={styles.menuBox} onClick={() => { setShowMore(false); navigate('/kerugian'); }}>
                    <div className={styles.menuIcon}><Trash2 size={24} color="#ef4444" /></div>
                    <span>Kerugian</span>
                  </button>
                </div>
              )}
              
              {isOwner && (
                <div className={styles.menuGrid} style={{ marginTop: '1rem' }}>
                  <button className={styles.menuBox} onClick={() => { setShowMore(false); navigate('/laporan'); }}>
                    <div className={styles.menuIcon}><BarChart3 size={24} color="#8b5cf6" /></div>
                    <span>Laporan</span>
                  </button>
                  <button className={styles.menuBox} onClick={() => { setShowMore(false); navigate('/karyawan'); }}>
                    <div className={styles.menuIcon}><Users size={24} color="#f59e0b" /></div>
                    <span>Karyawan</span>
                  </button>
                  <button className={styles.menuBox} onClick={() => { setShowMore(false); navigate('/pengaturan'); }}>
                    <div className={styles.menuIcon}><Settings size={24} color="#64748b" /></div>
                    <span>Pengaturan</span>
                  </button>
                </div>
              )}

              <div style={{ marginTop: '2rem' }}>
                <button 
                  onClick={() => { setShowMore(false); logout(); }}
                  style={{ width: '100%', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', backgroundColor: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '0.5rem', fontWeight: '600' }}
                >
                  <LogOut size={20} /> Keluar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Sheet Menu for 'Scan/Transaksi' */}
      {showScanMenu && (
        <div className={styles.bottomSheetOverlay} onClick={() => setShowScanMenu(false)}>
          <div className={styles.bottomSheet} onClick={e => e.stopPropagation()}>
            <div className={styles.sheetHeader}>
              <h3>Pilih Transaksi</h3>
              <button onClick={() => setShowScanMenu(false)} className={styles.closeBtn}><X size={20} /></button>
            </div>
            <div className={styles.sheetContent}>
              <div className={styles.menuGrid}>
                <button 
                  className={styles.menuBox} 
                  style={{ background: 'linear-gradient(135deg, #eff6ff, #dbeafe)', border: '1px solid #bfdbfe' }}
                  onClick={() => { setShowScanMenu(false); navigate('/transaksi-jual'); }}
                >
                  <div className={styles.menuIcon} style={{ background: '#3b82f6', color: 'white' }}><ShoppingCart size={24} /></div>
                  <span style={{ color: '#1e40af', fontWeight: '600' }}>Transaksi Jual</span>
                </button>

                <button 
                  className={styles.menuBox} 
                  style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', border: '1px solid #bbf7d0' }}
                  onClick={() => { setShowScanMenu(false); navigate('/barang-masuk'); }}
                >
                  <div className={styles.menuIcon} style={{ background: '#22c55e', color: 'white' }}><PackagePlus size={24} /></div>
                  <span style={{ color: '#166534', fontWeight: '600' }}>Barang Masuk</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileBottomNav;
