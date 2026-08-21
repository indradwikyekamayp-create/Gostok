import React, { useState, useEffect } from 'react';
import { Menu, Search, Bell, HelpCircle, ChevronDown, User } from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../hooks/useAuth';
import styles from './Header.module.css';

const Header = ({ onToggleSidebar, title }) => {
  const [notifCount, setNotifCount] = useState(0);
  const { userData } = useAuth();
  
  const userName = userData?.nama || 'Pengguna';

  useEffect(() => {
    import('firebase/firestore').then(({ doc, onSnapshot: onSnap }) => {
      const unsubSettings = onSnap(doc(db, 'settings', 'store_config'), (docSnap) => {
        const threshold = docSnap.exists() && docSnap.data().stokMenipisThreshold 
          ? Number(docSnap.data().stokMenipisThreshold) 
          : 10;
          
        const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
          let count = 0;
          snapshot.forEach(productDoc => {
            if (productDoc.data().stok > 0 && productDoc.data().stok <= threshold) count++;
          });
          setNotifCount(count);
        });
      });
      return () => unsubSettings();
    });
  }, []);

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
        <div className={styles.actions}>
          <button className={styles.iconButton} title={notifCount > 0 ? `${notifCount} produk stok menipis` : 'Tidak ada notifikasi baru'}>
            <div className={styles.bellWrapper}>
              <Bell size={20} />
              {notifCount > 0 && <span className={styles.badge}>{notifCount > 99 ? '99+' : notifCount}</span>}
            </div>
          </button>
          
          <button className={styles.iconButton}>
            <HelpCircle size={20} />
          </button>
          
          <button className={styles.profileDropdown}>
            <div style={{ backgroundColor: '#e2e8f0', borderRadius: '50%', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={14} color="#475569" />
            </div>
            <span className={styles.watermark} style={{ fontWeight: '500', color: '#334155', fontSize: '0.875rem' }}>{userName}</span>
            <ChevronDown size={14} className={styles.chevron} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
