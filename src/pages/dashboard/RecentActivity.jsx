import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import Card from '../../components/common/Card';
import styles from './RecentActivity.module.css';

const formatTime = (dateStr) => {
  const dateObj = typeof dateStr === 'string' ? new Date(dateStr) : dateStr?.toDate ? dateStr.toDate() : new Date();
  
  const day = dateObj.getDate();
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const month = monthNames[dateObj.getMonth()];
  const year = dateObj.getFullYear();
  const hours = dateObj.getHours().toString().padStart(2, '0');
  const minutes = dateObj.getMinutes().toString().padStart(2, '0');
  
  return `${day} ${month} ${year}, ${hours}:${minutes} WIB`;
};

const RecentActivity = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'transactions'), (snap) => {
      const data = [];
      snap.forEach(doc => {
        const t = doc.data();
        let dateObj = t.tanggal;
        if (dateObj?.toDate) dateObj = dateObj.toDate();
        else if (typeof dateObj === 'string') dateObj = new Date(dateObj);
        else dateObj = new Date();

        data.push({
          id: doc.id,
          title: `Penjualan ${t.noNota || doc.id}`,
          subtitle: `Pelanggan: ${t.customer?.nama_perusahaan || t.customer?.nama_pic || t.customer?.nama || t.pelanggan?.nama || 'Umum'}`,
          time: formatTime(dateObj),
          icon: ShoppingCart,
          color: 'success',
          rawDate: dateObj
        });
      });
      data.sort((a, b) => b.rawDate - a.rawDate);
      setActivities(data.slice(0, 5));
    });
    return () => unsub();
  }, []);

  return (
    <Card padding="lg">
      <div className={styles.header}>
        <h2 className={styles.title}>Aktivitas Terakhir</h2>
        <button className={styles.linkBtn} onClick={() => navigate('/riwayat')}>
          Lihat semua
        </button>
      </div>
      <div className={styles.list}>
        {activities.map((item) => {
          const Icon = item.icon;
          const iconClass = styles[item.color] || styles.primary;
          
          return (
            <div key={item.id} className={styles.item}>
              <div className={`${styles.iconWrapper} ${iconClass}`}>
                <Icon size={16} />
              </div>
              <div className={styles.content}>
                <p className={styles.itemTitle}>{item.title}</p>
                <div className={styles.itemMeta}>
                  {item.subtitle && (
                    <>
                      <span className={styles.itemSubtitle}>{item.subtitle}</span>
                      <span className={styles.dot}>•</span>
                    </>
                  )}
                  <span className={styles.time}>{item.time}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default RecentActivity;
