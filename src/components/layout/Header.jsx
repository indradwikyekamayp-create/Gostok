import React, { useState, useEffect, useRef } from 'react';
import { Menu, Search, Bell, ChevronDown, User, ReceiptText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../hooks/useAuth';
import styles from './Header.module.css';
import LacakStrukModal from '../LacakStrukModal';

const Header = ({ onToggleSidebar, title, isMobile }) => {
  const [lowStockItems, setLowStockItems] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const notifRef = useRef(null);
  const { userData } = useAuth();
  
  const userName = userData?.nama || 'Pengguna';
  const navigate = useNavigate();

  useEffect(() => {
    import('firebase/firestore').then(({ doc, onSnapshot: onSnap }) => {
      const unsubSettings = onSnap(doc(db, 'settings', 'store_config'), (docSnap) => {
        const threshold = docSnap.exists() && docSnap.data().stokMenipisThreshold 
          ? Number(docSnap.data().stokMenipisThreshold) 
          : 10;
          
        const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
          let items = [];
          snapshot.forEach(productDoc => {
            const data = productDoc.data();
            if (data.stok > 0 && data.stok <= threshold) {
              items.push({ id: productDoc.id, ...data });
            }
          });
          setLowStockItems(items);
        });
      });
      return () => unsubSettings();
    });
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const notifCount = lowStockItems.length;

  return (
    <header className={styles.header} style={isMobile ? { borderBottom: '1px solid #f1f5f9', backgroundColor: '#fff', padding: '0.5rem 1rem', position: 'sticky', top: 0, zIndex: 50 } : {}}>
      <div className={styles.left}>
        {/* On mobile, we hide the hamburger menu as requested */}
        {!isMobile && (
          <button 
            className={styles.menuButton} 
            onClick={onToggleSidebar}
            aria-label="Toggle Sidebar"
          >
            <Menu size={24} />
          </button>
        )}
        
        {isMobile ? (
          <img src="/logo/AyoStock!.png" alt="AyoStock" style={{ height: '60px', objectFit: 'contain', marginLeft: '-4px' }} />
        ) : (
          <h1 className={styles.title}>{title}</h1>
        )}
      </div>
      
      <div className={styles.right}>
        <div className={styles.actions}>
          {!isMobile && (
            <button 
              className={styles.iconButton} 
              title="Lacak Struk Pembayaran"
              onClick={() => setShowSearchModal(true)}
            >
              <ReceiptText size={20} />
            </button>
          )}

          <div style={{ position: 'relative' }} ref={notifRef}>
            <button 
              className={styles.iconButton} 
              title={notifCount > 0 ? `${notifCount} produk stok menipis` : 'Tidak ada notifikasi baru'}
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            >
              <div className={styles.bellWrapper}>
                <Bell size={24} color={isMobile ? '#0f172a' : 'currentColor'} />
                {notifCount > 0 && <span className={styles.badge} style={isMobile ? { backgroundColor: '#ef4444', border: '2px solid #f8fafc' } : {}}>{notifCount > 99 ? '99+' : notifCount}</span>}
              </div>
            </button>
            
            {showNotifDropdown && (
              <div className={styles.notifDropdown}>
                <div className={styles.notifHeader}>Notifikasi Stok Menipis</div>
                {notifCount === 0 ? (
                  <div className={styles.emptyNotif}>Stok semua produk aman 👍</div>
                ) : (
                  <div className={styles.notifList}>
                    {lowStockItems.slice(0, 10).map((item) => (
                      <div 
                        key={item.id} 
                        className={styles.notifItem}
                        onClick={() => {
                          setShowNotifDropdown(false);
                          navigate('/master-produk');
                        }}
                      >
                        <span className={styles.notifItemTitle}>{item.nama_barang}</span>
                        <span className={styles.notifItemDesc}>Sisa stok: {item.stok} {item.satuan}</span>
                      </div>
                    ))}
                    {notifCount > 10 && (
                      <div className={styles.notifItem} style={{ textAlign: 'center', color: '#3b82f6', fontWeight: 600 }}>
                        Lihat {notifCount - 10} lainnya di Master Produk
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {!isMobile && (
            <button className={styles.profileDropdown}>
              <div style={{ backgroundColor: '#e2e8f0', borderRadius: '50%', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={14} color="#475569" />
              </div>
              <span className={styles.watermark} style={{ fontWeight: '500', color: '#334155', fontSize: '0.875rem' }}>{userName}</span>
              <ChevronDown size={14} className={styles.chevron} />
            </button>
          )}
        </div>
      </div>

      {showSearchModal && <LacakStrukModal onClose={() => setShowSearchModal(false)} />}
    </header>
  );
};

export default Header;
