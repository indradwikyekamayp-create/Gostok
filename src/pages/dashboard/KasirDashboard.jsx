import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PackagePlus, ShoppingCart, Users } from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import styles from './DashboardPage.module.css';

import { useAuth } from '../../hooks/useAuth';

const formatRupiah = (value) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

const KasirDashboard = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [recentTransactions, setRecentTransactions] = React.useState([]);

  React.useEffect(() => {
    const unsub = onSnapshot(collection(db, 'transactions'), (snapshot) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const data = [];
      snapshot.forEach((doc) => {
        const trans = doc.data();
        let dateObj = trans.tanggal;
        if (dateObj && dateObj.toDate) {
          dateObj = dateObj.toDate();
        } else if (typeof dateObj === 'string') {
          dateObj = new Date(dateObj);
        } else {
          return; // Skip invalid dates
        }

        // Only include today's transactions
        if (dateObj >= today) {
          const pm = (trans.paymentMethod || trans.metodePembayaran || '').toLowerCase();
          const isHutang = pm === 'bon' || pm === 'kredit' || pm === 'hutang';
          
          let finalStatus = 'Lunas';
          if (isHutang && trans.statusPembayaran !== 'lunas' && trans.paymentStatus !== 'lunas') {
            finalStatus = 'Belum Lunas';
          } else if (trans.statusPembayaran === 'belum_lunas' || trans.paymentStatus === 'belum_lunas') {
            finalStatus = 'Belum Lunas';
          }

          const waktu = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
          data.push({
            id: doc.id,
            no_nota: trans.noNota || trans.id || doc.id,
            waktu,
            pelanggan: trans.customer?.nama_perusahaan || trans.customer?.nama_pic || trans.customer?.nama || trans.pelanggan?.nama || 'Umum',
            total: trans.grandTotal || 0,
            status: finalStatus,
            rawDate: dateObj
          });
        }
      });
      
      // Sort by newest first
      data.sort((a, b) => b.rawDate - a.rawDate);
      setRecentTransactions(data);
    });

    return () => unsub();
  }, []);

  const transactionColumns = [
    { key: 'no_nota', label: 'No. Nota' },
    { key: 'waktu', label: 'Waktu' },
    { key: 'pelanggan', label: 'Pelanggan' },
    { 
      key: 'total', 
      label: 'Total', 
      align: 'right',
      render: (val) => <span style={{ fontWeight: '500' }}>{formatRupiah(val)}</span>
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (val) => (
        <span className={val === 'Lunas' ? styles.statusSuccess : styles.statusDanger}>
          {val}
        </span>
      )
    },
  ];

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.pageTitle}>{isAdmin ? 'Dashboard Admin' : 'Dashboard Kasir'}</h1>

      <div className={styles.actionGrid} style={{ gridTemplateColumns: isAdmin ? 'repeat(3, 1fr)' : undefined }}>
        {isAdmin && (
          <Button 
            size="xl" 
            variant="secondary"
            icon={PackagePlus} 
            onClick={() => navigate('/barang-masuk')}
            className={styles.actionButton}
          >
            + Barang Masuk
          </Button>
        )}
        <Button 
          size="xl" 
          icon={ShoppingCart} 
          onClick={() => navigate('/transaksi-jual')}
          className={styles.actionButton}
        >
          + Transaksi Jual
        </Button>
        <Button 
          size="xl" 
          variant="secondary"
          icon={Users}
          onClick={() => navigate('/pelanggan')}
          className={styles.actionButton}
        >
          Data Pelanggan
        </Button>
      </div>

      <Card padding="lg" className={styles.recentTransactions}>
        <h2 className={styles.sectionTitle}>Transaksi Hari Ini</h2>
        <div className={styles.tableWrapper}>
          <Table 
            columns={transactionColumns} 
            data={recentTransactions} 
            emptyMessage="Belum ada transaksi hari ini"
          />
        </div>
      </Card>
    </div>
  );
};

export default KasirDashboard;
