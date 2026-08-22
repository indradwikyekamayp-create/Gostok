import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { 
  LayoutDashboard, 
  Package, 
  PackagePlus, 
  ShoppingCart, 
  Users, 
  History, 
  BarChart3, 
  LogOut,
  Settings,
  Key,
  X,
  Trash2
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { ROLES } from '../../constants/roles';
import ChangePasswordModal from '../auth/ChangePasswordModal';
import styles from './Sidebar.module.css';

const Sidebar = ({ isCollapsed, onToggle, isMobile, setMobileMenuOpen }) => {
  const { userData, isOwner, logout } = useAuth();
  const [storeName, setStoreName] = useState('PT. WELINDO SUKSES BERSAMA');
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'store_config'), (docSnap) => {
      if (docSnap.exists() && docSnap.data().namaToko) {
        let nama = docSnap.data().namaToko;
        if (nama === 'AyoStock!') nama = 'PT. WELINDO SUKSES BERSAMA';
        setStoreName(nama);
      }
    });
    return () => unsub();
  }, []);
  
  // Fetch from userData instead of user
  const userRole = userData?.role || 'kasir';
  const userName = userData?.nama || 'Pengguna';
  
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/transaksi-jual', label: 'Transaksi Jual', icon: <ShoppingCart size={20} /> },
    { path: '/pelanggan', label: 'Pelanggan', icon: <Users size={20} /> },
    { path: '/riwayat', label: 'Riwayat', icon: <History size={20} /> },
  ];

  if (userRole === ROLES?.OWNER || userRole === 'owner' || userRole === ROLES?.ADMIN || userRole === 'admin') {
    // Sisipkan menu Admin/Owner di indeks ke-1
    menuItems.splice(1, 0, { path: '/master-produk', label: 'Master Produk', icon: <Package size={20} /> });
    menuItems.splice(2, 0, { path: '/barang-masuk', label: 'Barang Masuk', icon: <PackagePlus size={20} /> });
    menuItems.splice(3, 0, { path: '/kerugian', label: 'Kerugian', icon: <Trash2 size={20} /> });
  }

  if (userRole === ROLES?.OWNER || userRole === 'owner') {
    menuItems.push({ path: '/laporan', label: 'Laporan', icon: <BarChart3 size={20} /> });
    menuItems.push({ path: '/karyawan', label: 'Karyawan', icon: <Users size={20} /> });
    menuItems.push({ path: '/pengaturan', label: 'Pengaturan', icon: <Settings size={20} /> });
  }

  const handleNavClick = () => {
    if (isMobile && setMobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  };

  return (
    <>
      {isMobile && !isCollapsed && (
        <div className={styles.overlay} onClick={() => setMobileMenuOpen(false)} />
      )}
      <aside 
        className={`${styles.sidebar} ${isCollapsed && !isMobile ? styles.collapsed : ''} ${isMobile && !isCollapsed ? styles.mobileOpen : ''}`}
      >
        <div className={styles.header}>
          <div className={styles.logo}>
            <img src="/logo/AyoStock!.png" alt="AyoStock!" className={styles.logoImg} />
            {(!isCollapsed || isMobile) && (
              <div style={{ textAlign: 'center', marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: '700', color: 'hsl(215, 50%, 30%)', letterSpacing: '0.5px' }}>
                  POS Manajemen
                </span>
                <span style={{ fontSize: '0.65rem', fontWeight: '600', color: '#64748b' }}>
                  {storeName}
                </span>
              </div>
            )}
          </div>
          {isMobile && (
            <button className={styles.closeButton} onClick={() => setMobileMenuOpen(false)}>
              <X size={24} />
            </button>
          )}
        </div>

        <nav className={styles.nav}>
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={handleNavClick}
              className={({ isActive }) => 
                isActive ? `${styles.navItem} ${styles.active}` : styles.navItem
              }
              title={isCollapsed && !isMobile ? item.label : ''}
            >
              <span className={styles.icon}>{item.icon}</span>
              <span className={styles.label}>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className={styles.footer}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>
              {getInitials(userName)}
            </div>
            <div className={styles.userDetails}>
              <span className={styles.userName}>{userName}</span>
              <span className={styles.userRole}>
                {userRole === 'owner' ? 'Pemilik' : userRole === 'admin' ? 'Admin' : 'Kasir'}
              </span>
            </div>
          </div>
          <div className={styles.footerActions}>
            <button 
              className={styles.passwordButton} 
              onClick={() => setShowPasswordModal(true)}
              title={isCollapsed && !isMobile ? "Ganti Password" : ""}
            >
              <Key size={20} />
              <span className={styles.label}>Ganti Password</span>
            </button>
            <button 
              className={styles.logoutButton} 
              onClick={logout}
              title={isCollapsed && !isMobile ? "Keluar" : ""}
            >
              <LogOut size={20} />
              <span className={styles.label}>Keluar</span>
            </button>
          </div>
        </div>
      </aside>

      <ChangePasswordModal 
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </>
  );
};

export default Sidebar;
