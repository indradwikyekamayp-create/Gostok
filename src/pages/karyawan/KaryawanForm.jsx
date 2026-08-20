import React, { useState, useContext } from 'react';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, secondaryAuth } from '../../firebase';
import { ROLES, ROLE_LABELS } from '../../constants/roles';
import { ToastContext } from '../../context/ToastContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import inputStyles from '../../components/common/Input.module.css';

const KaryawanForm = ({ user, onClose }) => {
  const isEditing = !!user;
  const { showToast } = useContext(ToastContext);
  
  const [formData, setFormData] = useState({
    nama: user?.nama || '',
    email: user?.email || '',
    password: '',
    role: user?.role || ROLES.ADMIN,
    aktif: user != null ? user.aktif : true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEditing) {
        const userRef = doc(db, 'users', user.id);
        await updateDoc(userRef, {
          nama: formData.nama,
          role: formData.role,
          aktif: formData.aktif
        });
        showToast('Data karyawan berhasil diupdate!', 'success');
      } else {
        if (!formData.password) {
          throw new Error('Password wajib diisi untuk pengguna baru');
        }
        const userCredential = await createUserWithEmailAndPassword(secondaryAuth, formData.email, formData.password);
        const newUid = userCredential.user.uid;
        
        await setDoc(doc(db, 'users', newUid), {
          nama: formData.nama,
          email: formData.email,
          role: formData.role,
          aktif: formData.aktif
        });
        
        secondaryAuth.signOut();
        showToast('Karyawan berhasil ditambahkan!', 'success');
      }
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#fff', padding: '2rem', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '450px', boxShadow: 'var(--shadow-xl)' }}>
      <h2 style={{ margin: '0 0 1.5rem 0', color: 'var(--color-text-dark)', fontSize: '1.25rem' }}>
        {isEditing ? 'Edit Karyawan' : 'Tambah Karyawan'}
      </h2>
      
      {error && (
        <div style={{ backgroundColor: 'var(--color-danger-light)', color: 'var(--color-danger)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <Input 
          label="Nama Lengkap"
          name="nama"
          value={formData.nama} 
          onChange={handleChange} 
          required 
          placeholder="Masukkan nama lengkap..."
        />

        <Input 
          label="Email"
          type="email" 
          name="email"
          value={formData.email} 
          onChange={handleChange} 
          required 
          disabled={isEditing}
          helperText={isEditing ? 'Email tidak dapat diubah' : ''}
          placeholder="email@perusahaan.com"
        />

        {!isEditing ? (
          <Input 
            label="Password"
            type="password" 
            name="password"
            value={formData.password} 
            onChange={handleChange} 
            required 
            placeholder="Minimal 6 karakter..."
          />
        ) : (
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500', color: 'var(--color-text-dark)' }}>
              Password
            </label>
            <Button 
              type="button" 
              variant="secondary" 
              size="sm"
              onClick={async () => {
                const { sendPasswordResetEmail } = await import('firebase/auth');
                const { auth } = await import('../../firebase');
                try {
                  await sendPasswordResetEmail(auth, formData.email);
                  showToast('Link reset password berhasil dikirim ke email karyawan!', 'success');
                } catch (err) {
                  showToast('Gagal mengirim link reset password', 'error');
                  console.error(err);
                }
              }}
            >
              Kirim Link Reset Password ke Email
            </Button>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', marginTop: '0.25rem' }}>
              Demi keamanan (aturan Firebase), password hanya bisa diubah langsung oleh pemilik email melalui link reset.
            </p>
          </div>
        )}

        <div>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', fontWeight: '500', color: 'var(--color-text-dark)' }}>
            Role / Jabatan <span style={{ color: 'var(--color-danger)' }}>*</span>
          </label>
          <div className={inputStyles.inputWrapper}>
            <select 
              name="role" 
              value={formData.role} 
              onChange={handleChange}
              className={`${inputStyles.input} ${inputStyles['size-md']}`}
              style={{ appearance: 'auto' }}
            >
              {Object.entries(ROLES).map(([key, value]) => (
                <option key={value} value={value}>{ROLE_LABELS[value] || value}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <Button 
            type="button" 
            variant="ghost"
            onClick={onClose}
            disabled={loading}
          >
            Batal
          </Button>
          <Button 
            type="submit"
            variant="primary"
            loading={loading}
          >
            Simpan
          </Button>
        </div>
      </form>
    </div>
  );
};

export default KaryawanForm;
