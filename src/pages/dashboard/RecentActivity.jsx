import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import Card from '../../components/common/Card';
import styles from './RecentActivity.module.css';

const formatTimeAgo = (dateStr) => {
  const dateObj = typeof dateStr === 'string' ? new Date(dateStr) : dateStr?.toDate ? dateStr.toDate() : new Date();
  const diffMs = Date.now() - dateObj.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins} menit lalu`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs} jam lalu`;
  return `${Math.floor(diffHrs / 24)} hari lalu`;
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
          subtitle: `Pelanggan: ${t.pelanggan?.nama || 'Umum'}`,
          time: formatTimeAgo(dateObj),
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
