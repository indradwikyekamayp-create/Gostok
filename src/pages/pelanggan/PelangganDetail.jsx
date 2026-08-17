import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './PelangganDetail.module.css';
import NotaListWithCheckbox from './NotaListWithCheckbox';
import PaymentForm from './PaymentForm';
import PelangganForm from './PelangganForm';

const mockCustomer = { 
  id: 'c1', nama_perusahaan: 'CV Sumber Rejeki', nama_pic: 'Pak Budi', jenis_pelanggan: 'CV', 
  alamat: 'Jl. Raya No. 123, Surabaya', no_hp: '08123456789', total_hutang_berjalan: 5000000 
};

const mockNotas = [
  { id: 't1', no_nota: 'INV-20260715-0004', tanggal: '2026-07-15', total_bayar: 4500000, sisa_hutang: 2000000, status_bayar: 'cicil' },
  { id: 't2', no_nota: 'INV-20260720-0002', tanggal: '2026-07-20', total_bayar: 3200000, sisa_hutang: 3200000, status_bayar: 'belum_lunas' },
  { id: 't3', no_nota: 'INV-20260801-0001', tanggal: '2026-08-01', total_bayar: 2800000, sisa_hutang: 0, status_bayar: 'lunas' },
];

export default function PelangganDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('nota');
  const [selectedNotas, setSelectedNotas] = useState([]);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  const formatRp = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
  };

  const handleToggleNota = (notaId) => {
    setSelectedNotas(prev => 
      prev.includes(notaId) ? prev.filter(id => id !== notaId) : [...prev, notaId]
    );
  };

  const handleSelectAll = (allIds) => {
    setSelectedNotas(allIds);
  };

  return (
    <div className={styles.container}>
      <button className={styles.backBtn} onClick={() => navigate('/pelanggan')}>
        &larr; Kembali ke Daftar
      </button>

      <div className={styles.customerCard}>
        <div className={styles.cardHeader}>
          <div>
            <h1>{mockCustomer.nama_perusahaan}</h1>
            <span className={styles.badge}>{mockCustomer.jenis_pelanggan}</span>
          </div>
          <button className={styles.editBtn} onClick={() => setShowEditForm(true)}>Edit Profil</button>
        </div>
        
        <div className={styles.cardBody}>
          <div className={styles.infoGrid}>
            <div>
              <p className={styles.label}>Nama PIC</p>
              <p className={styles.value}>{mockCustomer.nama_pic}</p>
            </div>
            <div>
              <p className={styles.label}>No. HP</p>
              <p className={styles.value}>{mockCustomer.no_hp}</p>
            </div>
            <div>
              <p className={styles.label}>Alamat</p>
              <p className={styles.value}>{mockCustomer.alamat}</p>
            </div>
          </div>
          <div className={styles.debtBox}>
            <p>Total Hutang Berjalan</p>
            <h2>{formatRp(mockCustomer.total_hutang_berjalan)}</h2>
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
              notas={mockNotas}
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
          <div className={styles.riwayatEmpty}>
            Belum ada riwayat pembayaran.
          </div>
        )}
      </div>

      {showPaymentForm && (
        <PaymentForm 
          selectedNotas={mockNotas.filter(n => selectedNotas.includes(n.id))}
          onClose={() => setShowPaymentForm(false)}
          onSave={() => {
            setShowPaymentForm(false);
            setSelectedNotas([]);
          }}
        />
      )}

      {showEditForm && (
        <PelangganForm 
          customer={mockCustomer}
          onSave={() => setShowEditForm(false)}
          onCancel={() => setShowEditForm(false)}
        />
      )}
    </div>
  );
}
