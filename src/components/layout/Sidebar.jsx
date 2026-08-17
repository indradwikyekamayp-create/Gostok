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
  const { user, logout } = useAuth();
  
  // Default values to prevent errors if user is null during loading/transition
  const userRole = user?.role || 'staff';
  const userName = user?.name || 'Pengguna';
  
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
    { path: '/produk', label: 'Master Produk', icon: <Package size={20} /> },
    { path: '/masuk', label: 'Barang Masuk', icon: <PackagePlus size={20} /> },
    { path: '/jual', label: 'Transaksi Jual', icon: <ShoppingCart size={20} /> },
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
            <span className={styles.logoText}>GoStok</span>
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
