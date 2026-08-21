import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, onSnapshot, collection, query, where, orderBy, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '../../firebase';
import { ToastContext } from '../../context/ToastContext';
import { ArrowLeft } from 'lucide-react';
import styles from './PelangganDetail.module.css';
import NotaListWithCheckbox from './NotaListWithCheckbox';
import PaymentForm from './PaymentForm';
import PelangganForm from './PelangganForm';

export default function PelangganDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [customer, setCustomer] = useState(null);
  const [notas, setNotas] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('nota');
  const [selectedNotas, setSelectedNotas] = useState([]);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  useEffect(() => {
    // 1. Fetch Customer
    const unsubCustomer = onSnapshot(doc(db, 'customers', id), (docSnap) => {
      if (docSnap.exists()) {
        setCustomer({ id: docSnap.id, ...docSnap.data() });
      } else {
        navigate('/pelanggan');
      }
    });

    // 2. Fetch Transactions (Notas)
    const qTransactions = query(
      collection(db, 'transactions'),
      where('customer.id', '==', id)
    );
    const unsubTransactions = onSnapshot(qTransactions, (snapshot) => {
      const transData = [];
      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        transData.push({
          id: docSnap.id,
          no_nota: data.noNota || docSnap.id,
          tanggal: data.tanggal,
          total_bayar: data.grandTotal,
          sisa_hutang: ['bon', 'kredit', 'hutang'].includes((data.paymentMethod || data.metodePembayaran || '').toLowerCase()) ? (data.sisaHutang ?? data.grandTotal) : 0,
          status_bayar: data.statusPembayaran || (['bon', 'kredit', 'hutang'].includes((data.paymentMethod || data.metodePembayaran || '').toLowerCase()) ? 'belum_lunas' : 'lunas'),
          ...data
        });
      });
      // Sort in memory by date desc (newest first)
      transData.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
      setNotas(transData);
    });

    // 3. Fetch Payments
    const qPayments = query(
      collection(db, 'payments'),
      where('customer_id', '==', id)
    );
    const unsubPayments = onSnapshot(qPayments, (snapshot) => {
      const payData = [];
      snapshot.forEach(docSnap => {
        payData.push({ id: docSnap.id, ...docSnap.data() });
      });
      // Sort in memory by date desc
      payData.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
      setPayments(payData);
    });

    setLoading(false);
    return () => {
      unsubCustomer();
      unsubTransactions();
      unsubPayments();
    };
  }, [id, navigate]);

  const formatRp = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
  };

  const { showToast } = useContext(ToastContext);

  const handleToggleNota = (notaId) => {
    setSelectedNotas(prev => 
      prev.includes(notaId) ? prev.filter(id => id !== notaId) : [...prev, notaId]
    );
  };

  const handleSelectAll = (allIds) => {
    setSelectedNotas(allIds);
  };

  if (loading || !customer) {
    return <div className={styles.container}>Loading...</div>;
  }

  const handleSavePayment = async (paymentData) => {
    try {
      const batch = writeBatch(db);
      
      // 1. Create Payment record
      const paymentRef = doc(collection(db, 'payments'));
      batch.set(paymentRef, {
        tanggal: new Date().toISOString(),
        customer_id: id,
        jumlahBayar: paymentData.jumlahBayar,
        metode: paymentData.metode,
        allocations: paymentData.allocations
      });
      
      // 2. Update each transaction
      for (const [notaId, allocatedAmount] of Object.entries(paymentData.allocations)) {
        if (allocatedAmount > 0) {
          const trx = notas.find(n => n.id === notaId);
          if (trx) {
            const newSisaHutang = (trx.sisa_hutang || 0) - allocatedAmount;
            const newStatus = newSisaHutang <= 0 ? 'Lunas' : 'Cicilan';
            
            const trxRef = doc(db, 'transactions', notaId);
            batch.update(trxRef, {
              sisaHutang: newSisaHutang,
              statusPembayaran: newStatus
            });
          }
        }
      }
      
      // 3. Update customer total debt
      const customerRef = doc(db, 'customers', id);
      batch.update(customerRef, {
        total_hutang_berjalan: Math.max(0, (customer.total_hutang_berjalan || 0) - paymentData.jumlahBayar)
      });
      
      await batch.commit();
      showToast('Pembayaran berhasil dicatat!', 'success');
      setShowPaymentForm(false);
      setSelectedNotas([]);
    } catch (err) {
      console.error(err);
      showToast('Gagal mencatat pembayaran: ' + err.message, 'error');
    }
  };

  return (
    <div className={styles.container}>
      <button className={styles.backBtn} onClick={() => navigate('/pelanggan')}>
        <ArrowLeft size={16} /> Kembali ke Daftar
      </button>

      <div className={styles.customerCard}>
        <div className={styles.cardHeader}>
          <div>
            <h1>{customer.nama_perusahaan}</h1>
            <span className={styles.badge}>{customer.jenis_pelanggan}</span>
          </div>
          <button className={styles.editBtn} onClick={() => setShowEditForm(true)}>Edit Profil</button>
        </div>
        
        <div className={styles.cardBody}>
          <div className={styles.infoGrid}>
            <div>
              <p className={styles.label}>Nama PIC</p>
              <p className={styles.value}>{customer.nama_pic || '-'}</p>
            </div>
            <div>
              <p className={styles.label}>No. HP</p>
              <p className={styles.value}>{customer.no_hp || '-'}</p>
            </div>
            <div>
              <p className={styles.label}>Alamat</p>
              <p className={styles.value}>{customer.alamat || '-'}</p>
            </div>
          </div>
          <div className={styles.debtBox}>
            <p>Total Hutang Berjalan</p>
            <h2>{formatRp(notas.reduce((acc, curr) => acc + (curr.sisa_hutang || 0), 0))}</h2>
          </div>
        </div>
      </div>

      <div className={styles.tabs}>
        <button 
          className={activeTab === 'nota' ? styles.tabActive : styles.tab} 
          onClick={() => setActiveTab('nota')}
        >
          Daftar Nota
        </button>
        <button 
          className={activeTab === 'riwayat' ? styles.tabActive : styles.tab} 
          onClick={() => setActiveTab('riwayat')}
        >
          Riwayat Pembayaran
        </button>
      </div>

      <div className={styles.tabContent}>
        {activeTab === 'nota' && (
          <div>
            <NotaListWithCheckbox 
              notas={notas}
              selectedIds={selectedNotas}
              onToggle={handleToggleNota}
              onSelectAll={handleSelectAll}
            />
            
            <div className={styles.actionFooter}>
              <button 
                className={styles.payBtn}
                disabled={selectedNotas.length === 0}
                onClick={() => setShowPaymentForm(true)}
              >
                Catat Pembayaran ({selectedNotas.length} Nota)
              </button>
            </div>
          </div>
        )}

        {activeTab === 'riwayat' && (
          <div className={payments.length === 0 ? styles.riwayatEmpty : ''}>
            {payments.length === 0 ? 'Belum ada riwayat pembayaran.' : (
              <table className={styles.paymentsTable}>
                <thead>
                  <tr>
                    <th style={{textAlign: 'left', padding: '0.75rem'}}>Waktu Pembayaran</th>
                    <th style={{textAlign: 'left', padding: '0.75rem'}}>Metode</th>
                    <th style={{textAlign: 'right', padding: '0.75rem'}}>Nominal Dibayar</th>
                    <th style={{textAlign: 'left', padding: '0.75rem'}}>Rincian Alokasi (Cicilan)</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map(p => (
                    <tr key={p.id} style={{borderBottom: '1px solid #eee'}}>
                      <td style={{padding: '0.75rem'}}>
                        {new Intl.DateTimeFormat('id-ID', {
                          day: '2-digit', month: 'long', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        }).format(new Date(p.tanggal))}
                      </td>
                      <td style={{padding: '0.75rem', textTransform: 'uppercase'}}>{p.metode}</td>
                      <td style={{padding: '0.75rem', textAlign: 'right', fontWeight: 'bold', color: 'var(--color-success-hover)'}}>
                        {formatRp(p.jumlahBayar)}
                      </td>
                      <td style={{padding: '0.75rem'}}>
                        {p.allocations ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {Object.entries(p.allocations).map(([notaId, amount]) => {
                              if (amount <= 0) return null;
                              const notaData = notas.find(n => n.id === notaId);
                              const notaLabel = notaData ? notaData.no_nota : notaId;
                              const isLunas = notaData && notaData.sisa_hutang <= 0;
                              return (
                                <div key={notaId} style={{ fontSize: '0.85rem', color: '#333', backgroundColor: '#f8fafc', padding: '0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', alignItems: 'center' }}>
                                    <span style={{ fontWeight: '600', color: 'var(--color-primary)' }}>{notaLabel}</span>
                                    {isLunas ? (
                                      <span style={{ fontSize: '0.7rem', backgroundColor: 'var(--color-success-hover, hsl(145, 55%, 35%))', color: 'white', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: 'bold' }}>LUNAS</span>
                                    ) : (
                                      <span style={{ fontSize: '0.7rem', backgroundColor: 'var(--color-warning-hover, hsl(38, 92%, 40%))', color: 'white', padding: '0.15rem 0.4rem', borderRadius: '4px', fontWeight: 'bold' }}>SISA: {formatRp(notaData ? notaData.sisa_hutang : 0)}</span>
                                    )}
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.8rem' }}>
                                    <span>Total Nota: {formatRp(notaData ? notaData.total_bayar : 0)}</span>
                                    <span>Dibayar: <strong style={{ color: 'var(--color-success-hover)' }}>{formatRp(amount)}</strong></span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {showPaymentForm && (
        <PaymentForm 
          selectedNotas={notas.filter(n => selectedNotas.includes(n.id))}
          onClose={() => setShowPaymentForm(false)}
          onSave={handleSavePayment}
        />
      )}

      {showEditForm && (
        <PelangganForm 
          customer={customer}
          onSave={() => setShowEditForm(false)}
          onCancel={() => setShowEditForm(false)}
        />
      )}
    </div>
  );
}
