import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import MobileBottomNav from './MobileBottomNav';
import { useAuth } from '../../hooks/useAuth';
import styles from './MainLayout.module.css';

const MainLayout = ({ title = 'AyoStock!' }) => {
  const { isKasir } = useAuth();
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const isPelangganDetail = location.pathname.startsWith('/pelanggan/') && location.pathname !== '/pelanggan';
  const isLockedLayout = location.pathname === '/transaksi-jual' || location.pathname === '/master-produk' || isPelangganDetail;

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setIsMobile(true);
        setIsSidebarCollapsed(false);
      } else if (width >= 768 && width < 1024) {
        setIsMobile(false);
        setIsSidebarCollapsed(true);
        setMobileMenuOpen(false);
      } else {
        setIsMobile(false);
        setIsSidebarCollapsed(false);
        setMobileMenuOpen(false);
      }
    };

    // Initial check
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleToggleSidebar = () => {
    if (isMobile) {
      setMobileMenuOpen(!mobileMenuOpen);
    } else {
      setIsSidebarCollapsed(!isSidebarCollapsed);
    }
  };

  return (
    <div className={styles.layout}>
      {!isMobile && !isKasir && (
        <Sidebar 
          isCollapsed={isSidebarCollapsed} 
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
          isMobile={isMobile}
          setMobileMenuOpen={setMobileMenuOpen}
        />
      )}
      <div className={`${styles.mainContent} ${isSidebarCollapsed && !isMobile && !isKasir ? styles.contentExpanded : ''} ${isMobile ? styles.contentMobile : ''}`}>
        <Header onToggleSidebar={handleToggleSidebar} title={title} isMobile={isMobile} />
        <main className={`${isLockedLayout ? styles.contentKasir : styles.content} ${isMobile ? styles.mobilePadding : ''}`}>
          <Outlet />
        </main>
      </div>
      {isMobile && <MobileBottomNav />}
    </div>
  );
};

export default MainLayout;
