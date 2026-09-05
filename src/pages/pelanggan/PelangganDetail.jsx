import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, onSnapshot, collection, query, where, orderBy, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '../../firebase';
import { ToastContext } from '../../context/ToastContext';
import { ArrowLeft } from 'lucide-react';
import styles from './PelangganDetail.module.css';
import NotaListWithCheckbox from './NotaListWithCheckbox';
import PaymentForm from './PaymentForm';
import PaymentReceiptPreview from './PaymentReceiptPreview';
import PelangganForm from './PelangganForm';

export default function PelangganDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [customer, setCustomer] = useState(null);
  const [notas, setNotas] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('nota');
  const [notaFilter, setNotaFilter] = useState('semua');
  const [selectedNotas, setSelectedNotas] = useState([]);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [receiptPayment, setReceiptPayment] = useState(null);
  const [historyNotaId, setHistoryNotaId] = useState(null);

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
      
      // Auto open receipt for the new payment
      setReceiptPayment({
        id: paymentRef.id,
        tanggal: new Date().toISOString(),
        metode: paymentData.metode,
        jumlahBayar: paymentData.jumlahBayar,
        allocations: paymentData.allocations
      });
    } catch (err) {
      console.error(err);
      showToast('Gagal mencatat pembayaran: ' + err.message, 'error');
    }
  };

  return (
    <div className={`${styles.container} flutter-page`}>
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
        {activeTab === 'nota' && (() => {
          const filteredNotas = notas.filter(n => {
            const method = (n.paymentMethod || n.metodePembayaran || '').toLowerCase();
            if (notaFilter === 'cash') return method === 'cash' || method === 'tunai';
            if (notaFilter === 'transfer') return method === 'transfer';
            if (notaFilter === 'hutang') return ['bon', 'kredit', 'hutang'].includes(method);
            return true;
          });

          return (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div className={styles.filterContainer} style={{ flexShrink: 0 }}>
                <button 
                  className={notaFilter === 'semua' ? styles.filterBtnActive : styles.filterBtn}
                  onClick={() => setNotaFilter('semua')}
                >
                  Semua
                </button>
                <button 
                  className={notaFilter === 'cash' ? styles.filterBtnActive : styles.filterBtn}
                  onClick={() => setNotaFilter('cash')}
                >
                  Cash
                </button>
                <button 
                  className={notaFilter === 'transfer' ? styles.filterBtnActive : styles.filterBtn}
                  onClick={() => setNotaFilter('transfer')}
                >
                  Transfer
                </button>
                <button 
                  className={notaFilter === 'hutang' ? styles.filterBtnActive : styles.filterBtn}
                  onClick={() => setNotaFilter('hutang')}
                >
                  Hutang
                </button>
              </div>
              
              <div style={{ paddingBottom: '1rem' }}>
                <NotaListWithCheckbox 
                  notas={filteredNotas}
                  selectedIds={selectedNotas}
                  onToggle={handleToggleNota}
                  onSelectAll={handleSelectAll}
                  onViewHistory={(notaId) => setHistoryNotaId(notaId)}
                />
              </div>
              
              <div className={`${styles.actionFooter} ${styles.desktopOnlyBtn}`} style={{ flexShrink: 0 }}>
                <button 
                  className={styles.payBtn}
                  disabled={selectedNotas.length === 0}
                  onClick={() => setShowPaymentForm(true)}
                >
                  Catat Pembayaran ({selectedNotas.length} Nota)
                </button>
              </div>
            </div>
          );
        })()}

        {activeTab === 'riwayat' && (
          <div className={payments.length === 0 ? styles.riwayatEmpty : ''} style={{ display: 'flex', flexDirection: 'column' }}>
            {payments.length === 0 ? 'Belum ada riwayat pembayaran.' : (
              <div className={styles.riwayatContainer} style={{ paddingBottom: '1rem' }}>
                <table className={styles.riwayatTable}>
                  <thead>
                    <tr>
                      <th className={styles.desktopOnly}>Waktu Pembayaran</th>
                      <th className={styles.desktopOnly}>Metode</th>
                      <th className={styles.desktopOnly} style={{textAlign: 'right'}}>Nominal Dibayar</th>
                      <th>Detail Alokasi</th>
                      <th style={{textAlign: 'center'}}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map(p => (
                      <tr key={p.id} className={styles.riwayatRow}>
                        <td className={styles.desktopOnly}>
                          <span className={styles.riwayatWaktu}>
                            {new Intl.DateTimeFormat('id-ID', {
                              day: '2-digit', month: 'long', year: 'numeric',
                              hour: '2-digit', minute: '2-digit'
                            }).format(new Date(p.tanggal))}
                          </span>
                        </td>
                        <td className={styles.desktopOnly}>
                          <span className={styles.riwayatMetode}>{p.metode}</span>
                        </td>
                        <td className={styles.desktopOnly}>
                          <div className={styles.riwayatNominal}>{formatRp(p.jumlahBayar)}</div>
                        </td>
                        
                        {/* Mobile merged header column */}
                        <td className={styles.mobileOnlyHeader}>
                           <div>
                             <div className={styles.riwayatWaktu}>
                               {new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(p.tanggal))}
                             </div>
                             <div className={styles.riwayatMetode}>{p.metode}</div>
                           </div>
                           <div className={styles.riwayatNominalContainer}>
                             <div className={styles.riwayatNominalLabel}>TOTAL DIBAYAR</div>
                             <div className={styles.riwayatNominal}>{formatRp(p.jumlahBayar)}</div>
                           </div>
                        </td>

                        <td className={styles.riwayatAlokasi}>
                          {p.allocations ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                              {Object.entries(p.allocations).map(([notaId, amount]) => {
                                if (amount <= 0) return null;
                                const notaData = notas.find(n => n.id === notaId);
                                const notaLabel = notaData ? notaData.no_nota : notaId;
                                const isLunas = notaData && notaData.sisa_hutang <= 0;
                                return (
                                  <div key={notaId} style={{ fontSize: '0.8125rem', color: '#334155', backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                                      <span style={{ fontWeight: '700', color: '#1e3a8a' }}>{notaLabel}</span>
                                      {isLunas ? (
                                        <span style={{ fontSize: '0.65rem', backgroundColor: '#16a34a', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '1rem', fontWeight: 'bold', letterSpacing: '0.5px' }}>LUNAS</span>
                                      ) : (
                                        <span style={{ fontSize: '0.65rem', backgroundColor: '#f59e0b', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '1rem', fontWeight: 'bold', letterSpacing: '0.5px' }}>SISA: {formatRp(notaData ? notaData.sisa_hutang : 0)}</span>
                                      )}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '0.75rem', flexWrap: 'wrap' }}>
                                      <span>Total Nota: {formatRp(notaData ? notaData.total_bayar : 0)}</span>
                                      <span>Dibayar: <strong style={{ color: '#16a34a', fontSize: '0.8125rem' }}>{formatRp(amount)}</strong></span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : '-'}
                        </td>
                        <td>
                          <button 
                            onClick={() => setReceiptPayment(p)}
                            className={styles.riwayatAksiBtn}
                          >
                            🖨️ Cetak Struk
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
          onSave={async (data) => {
            const customerRef = doc(db, 'customers', id);
            await setDoc(customerRef, data, { merge: true });
            setShowEditForm(false);
          }}
          onCancel={() => setShowEditForm(false)}
        />
      )}

      {receiptPayment && (
        <PaymentReceiptPreview 
          payment={receiptPayment}
          customer={customer}
          notas={notas}
          onClose={() => setReceiptPayment(null)}
        />
      )}

      {historyNotaId && (() => {
        const targetNota = notas.find(n => n.id === historyNotaId);
        const relatedPayments = payments.filter(p => p.allocations && p.allocations[historyNotaId] > 0);
        
        return (
          <div 
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }} 
            onClick={() => setHistoryNotaId(null)}
          >
            <div 
              style={{ background: 'white', borderRadius: '0.75rem', width: '100%', maxWidth: '400px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', overflow: 'hidden' }} 
              onClick={e => e.stopPropagation()}
            >
              <div style={{ padding: '1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc' }}>
                <h3 style={{ margin: 0, fontSize: '1.125rem', color: '#1e293b' }}>Riwayat Cicilan</h3>
                <button 
                  onClick={() => setHistoryNotaId(null)}
                  style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#64748b', lineHeight: 1 }}
                >&times;</button>
              </div>
              <div style={{ padding: '1.25rem' }}>
                <div style={{ marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '2px dashed #e2e8f0' }}>
                  <div style={{ fontSize: '0.875rem', color: '#64748b' }}>No. Invoice</div>
                  <div style={{ fontWeight: '700', color: '#0f172a' }}>{targetNota ? targetNota.no_nota : historyNotaId}</div>
                </div>
                
                {relatedPayments.length === 0 ? (
                  <p style={{ color: '#64748b', textAlign: 'center', margin: '2rem 0' }}>Belum ada riwayat cicilan.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {relatedPayments.map((p) => (
                      <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: '#f1f5f9', borderRadius: '0.5rem' }}>
                        <div>
                          <div style={{ fontWeight: '600', color: '#334155', fontSize: '0.875rem' }}>
                            {new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(p.tanggal))}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.125rem' }}>
                            Metode: {p.metode}
                          </div>
                        </div>
                        <div style={{ fontWeight: '700', color: '#16a34a', fontSize: '1rem' }}>
                          {formatRp(p.allocations[historyNotaId])}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Floating Bottom Bar (Mobile/Flutter Style) */}
      {activeTab === 'nota' && selectedNotas.length > 0 && (
        <div className={styles.floatingBottomBar}>
          <div className={styles.floatingSummary}>
            <span className={styles.floatingCount}>{selectedNotas.length} Nota Dipilih</span>
            <span className={styles.floatingTotal}>
              {formatRp(notas.filter(n => selectedNotas.includes(n.id)).reduce((sum, n) => sum + (n.sisa_hutang || 0), 0))}
            </span>
          </div>
          <button 
            className={styles.floatingBtnPrimary} 
            disabled={selectedNotas.length === 0}
            onClick={() => setShowPaymentForm(true)}
          >
            Bayar
          </button>
        </div>
      )}
    </div>
  );
}

// Trigger HMR
