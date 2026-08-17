import React from 'react';
import { Menu, User, ChevronDown } from 'lucide-react';
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
          <Menu size={24} />
        </button>
        <h1 className={styles.title}>{title}</h1>
      </div>
      
      <div className={styles.right}>
        <span className={styles.watermark}>GoStok</span>
      </div>
    </header>
  );
};

export default Header;
