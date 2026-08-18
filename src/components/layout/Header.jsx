import React from 'react';
import { Menu, Search, Bell, HelpCircle, ChevronDown } from 'lucide-react';
import styles from './Header.module.css';

const Header = ({ onToggleSidebar, title }) => {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button 
          className={styles.menuButton} 
          onClick={onToggleSidebar}
          aria-label="Toggle Sidebar"
        >
          <Menu size={20} />
        </button>
        <h1 className={styles.title}>{title}</h1>
      </div>
      
      <div className={styles.right}>
        <div className={styles.searchWrapper}>
          <Search size={16} className={styles.searchIcon} />
          <input 
            type="text" 
            className={styles.searchInput} 
            placeholder="Cari produk, pelanggan, transaksi..." 
          />
          <kbd className={styles.searchShortcut}>Ctrl + K</kbd>
        </div>
        
        <div className={styles.actions}>
          <button className={styles.iconButton}>
            <div className={styles.bellWrapper}>
              <Bell size={20} />
              <span className={styles.badge}>5</span>
            </div>
          </button>
          
          <button className={styles.iconButton}>
            <HelpCircle size={20} />
          </button>
          
          <button className={styles.profileDropdown}>
            <span className={styles.watermark}>AyoStock!</span>
            <ChevronDown size={14} className={styles.chevron} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
