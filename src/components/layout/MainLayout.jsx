import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import styles from './MainLayout.module.css';

const MainLayout = ({ title = 'GoStok' }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
        isMobile={isMobile}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      <div className={`${styles.mainContent} ${isSidebarCollapsed && !isMobile ? styles.contentExpanded : ''} ${isMobile ? styles.contentMobile : ''}`}>
        <Header onToggleSidebar={handleToggleSidebar} title={title} />
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};


export default MainLayout;
