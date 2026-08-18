import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, FileText, ShoppingCart, ArrowDownToLine } from 'lucide-react';
import Card from '../../components/common/Card';
import styles from './RecentActivity.module.css';

const activities = [
  {
    id: 1,
    title: 'Stok menipis: Indomie Goreng (tersisa 10)',
    time: '10 menit yang lalu',
    icon: Package,
    color: 'warning'
  },
  {
    id: 2,
    title: 'Piutang jatuh tempo: Warung Bu Ani',
    subtitle: 'Rp 3.200.000',
    time: '2 jam yang lalu',
    icon: FileText,
    color: 'primary'
  },
  {
    id: 3,
    title: 'Transaksi besar hari ini',
    subtitle: 'Rp 5.500.000',
    time: '3 jam yang lalu',
    icon: ShoppingCart,
    color: 'success'
  },
  {
    id: 4,
    title: 'Barang masuk baru',
    subtitle: '25 item',
    time: '5 jam yang lalu',
    icon: ArrowDownToLine,
    color: 'purple'
  }
];

const RecentActivity = () => {
  const navigate = useNavigate();

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
