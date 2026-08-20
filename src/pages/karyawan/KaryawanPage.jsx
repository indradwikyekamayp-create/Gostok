import React, { useState, useEffect, useContext } from 'react';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { Plus, Edit2, PowerOff, CheckCircle } from 'lucide-react';
import { db } from '../../firebase';
import { useAuth } from '../../hooks/useAuth';
import { ROLE_LABELS } from '../../constants/roles';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { ToastContext } from '../../context/ToastContext';
import KaryawanForm from './KaryawanForm';

const KaryawanPage = () => {
  const { isOwner } = useAuth();
  const { showToast } = useContext(ToastContext);
  const [karyawan, setKaryawan] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogConfig, setDialogConfig] = useState({ id: null, nama: '', currentStatus: true });

  useEffect(() => {
    if (!isOwner) return;
    
    const unsub = onSnapshot(collection(db, 'users'), (snapshot) => {
      const data = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      setKaryawan(data);
    });

    return () => unsub();
  }, [isOwner]);

  if (!isOwner) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Akses Ditolak</h2>
        <p>Hanya Owner yang dapat mengakses halaman ini.</p>
      </div>
    );
  }

  const promptToggleAktif = (id, nama, currentStatus) => {
    setDialogConfig({ id, nama, currentStatus });
    setDialogOpen(true);
  };

  const confirmToggleAktif = async () => {
    const { id, nama, currentStatus } = dialogConfig;
    const action = currentStatus ? 'menonaktifkan' : 'mengaktifkan';
    try {
      await updateDoc(doc(db, 'users', id), { aktif: !currentStatus });
      showToast(`Berhasil ${action} karyawan ${nama}`, 'success');
    } catch (err) {
      console.error(err);
      showToast('Terjadi kesalahan saat memproses permintaan', 'error');
    } finally {
      setDialogOpen(false);
    }
  };

  const columns = [
    { key: 'nama', label: 'Nama' },
    { key: 'email', label: 'Email' },
    { 
      key: 'role', 
      label: 'Role',
      render: (role) => (
        <span style={{
          padding: '4px 8px',
          borderRadius: '4px',
          backgroundColor: role === 'owner' ? '#e0e7ff' : role === 'admin' ? '#fce7f3' : '#dcfce7',
          color: role === 'owner' ? '#3730a3' : role === 'admin' ? '#be185d' : '#166534',
          fontSize: '0.75rem',
          fontWeight: 'bold'
        }}>
          {ROLE_LABELS[role] || role}
        </span>
      )
    },
    {
      key: 'aktif',
      label: 'Status',
      render: (aktif) => (
        <span style={{
          padding: '4px 8px',
          borderRadius: '4px',
          backgroundColor: aktif ? '#dcfce7' : '#fee2e2',
          color: aktif ? '#166534' : '#991b1b',
          fontSize: '0.75rem',
          fontWeight: 'bold'
        }}>
          {aktif ? 'Aktif' : 'Nonaktif'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Aksi',
      align: 'right',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button 
            onClick={() => { setEditingUser(row); setShowForm(true); }}
            style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: '4px' }}
            title="Edit Karyawan"
          >
            <Edit2 size={16} />
          </button>
          <button 
            onClick={() => promptToggleAktif(row.id, row.nama, row.aktif)}
            style={{ background: 'none', border: 'none', color: row.aktif ? '#ef4444' : '#10b981', cursor: 'pointer', padding: '4px' }}
            title={row.aktif ? "Nonaktifkan" : "Aktifkan"}
          >
            {row.aktif ? <PowerOff size={16} /> : <CheckCircle size={16} />}
          </button>
        </div>
      )
    }
  ];

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', margin: '0 0 0.5rem 0', color: '#1e293b' }}>Kelola Karyawan</h1>
          <p style={{ margin: 0, color: '#64748b' }}>Tambah dan atur hak akses akun karyawan.</p>
        </div>
        <button 
          onClick={() => { setEditingUser(null); setShowForm(true); }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'hsl(215, 50%, 30%)', color: '#fff', border: 'none', padding: '0.75rem 1.25rem', borderRadius: '0.5rem', fontWeight: '500', cursor: 'pointer' }}
        >
          <Plus size={18} /> Tambah Karyawan
        </button>
      </div>

      <Card padding="lg">
        <Table 
          columns={columns} 
          data={karyawan} 
          emptyMessage="Belum ada data karyawan"
        />
      </Card>

      {showForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <KaryawanForm 
            user={editingUser}
            onClose={() => setShowForm(false)}
          />
        </div>
      )}

      <ConfirmDialog 
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={confirmToggleAktif}
        title="Konfirmasi"
        message={`Yakin ingin ${dialogConfig.currentStatus ? 'menonaktifkan' : 'mengaktifkan'} karyawan ${dialogConfig.nama}?`}
        variant={dialogConfig.currentStatus ? 'danger' : 'success'}
      />
    </div>
  );
};

export default KaryawanPage;
