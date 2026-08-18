import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  PackagePlus, 
  ShoppingCart, 
  Users, 
  History, 
  BarChart3, 
  LogOut,
  X 
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { ROLES } from '../../constants/roles';
import styles from './Sidebar.module.css';

const Sidebar = ({ isCollapsed, onToggle, isMobile, setMobileMenuOpen }) => {
  const { userData, isOwner, logout } = useAuth();
  
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
    { path: '/master-produk', label: 'Master Produk', icon: <Package size={20} /> },
    { path: '/barang-masuk', label: 'Barang Masuk', icon: <PackagePlus size={20} /> },
    { path: '/transaksi-jual', label: 'Transaksi Jual', icon: <ShoppingCart size={20} /> },
    { path: '/pelanggan', label: 'Pelanggan', icon: <Users size={20} /> },
    { path: '/riwayat', label: 'Riwayat', icon: <History size={20} /> },
  ];

  if (userRole === ROLES?.OWNER || userRole === 'owner') {
    menuItems.push({ path: '/laporan', label: 'Laporan', icon: <BarChart3 size={20} /> });
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
                {userRole === 'owner' ? 'Pemilik' : 'Staf'}
              </span>
            </div>
          </div>
          <button 
            className={styles.logoutButton} 
            onClick={logout}
            title={isCollapsed && !isMobile ? "Keluar" : ""}
          >
            <LogOut size={20} />
            <span className={styles.label}>Keluar</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
