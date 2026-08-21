import React, { useState, useContext } from 'react';
import { X } from 'lucide-react';
import { getAuth, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { ToastContext } from '../../context/ToastContext';
import styles from './ChangePasswordModal.module.css';

export default function ChangePasswordModal({ isOpen, onClose }) {
  const { showToast } = useContext(ToastContext);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('Password baru dan konfirmasi tidak cocok!', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('Password baru minimal 6 karakter', 'error');
      return;
    }

    setLoading(true);
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        showToast('Sesi pengguna tidak valid.', 'error');
        setLoading(false);
        return;
      }

      // Re-authenticate first
      const credential = EmailAuthProvider.credential(user.email, oldPassword);
      await reauthenticateWithCredential(user, credential);

      // Change password
      await updatePassword(user, newPassword);
      
      showToast('Password berhasil diubah!', 'success');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onClose();
    } catch (error) {
      console.error("Gagal ganti password", error);
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        showToast('Password lama salah!', 'error');
      } else if (error.code === 'auth/too-many-requests') {
        showToast('Terlalu banyak percobaan, coba lagi nanti.', 'error');
      } else {
        showToast('Terjadi kesalahan: ' + error.message, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Ganti Password</h2>
          <button className={styles.closeBtn} onClick={onClose} disabled={loading}>
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className={styles.content}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Password Lama</label>
              <input 
                type="password" 
                className={styles.input}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="Masukkan password saat ini"
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Password Baru</label>
              <input 
                type="password" 
                className={styles.input}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Masukkan password baru"
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Konfirmasi Password Baru</label>
              <input 
                type="password" 
                className={styles.input}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ketik ulang password baru"
                required
              />
            </div>
          </div>
          
          <div className={styles.footer}>
            <button type="button" className={styles.btnSecondary} onClick={onClose} disabled={loading}>
              Batal
            </button>
            <button type="submit" className={styles.btnPrimary} disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
