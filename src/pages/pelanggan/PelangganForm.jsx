import React, { useState, useContext } from 'react';
import { X } from 'lucide-react';
import { ToastContext } from '../../context/ToastContext';
import styles from './PelangganForm.module.css';

export default function PelangganForm({ customer, onSave, onCancel }) {
  const { showToast } = useContext(ToastContext);
  const [formData, setFormData] = useState({
    nama_perusahaan: customer?.nama_perusahaan || '',
    nama_pic: customer?.nama_pic || '',
    jenis_pelanggan: customer?.jenis_pelanggan || 'CV',
    alamat: customer?.alamat || '',
    no_hp: customer?.no_hp || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nama_perusahaan) {
      showToast('Nama perusahaan wajib diisi', 'warning');
      return;
    }
    onSave(formData);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>{customer ? 'Edit Pelanggan' : 'Tambah Pelanggan Baru'}</h2>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Nama Perusahaan *</label>
            <input 
              type="text" 
              required
              value={formData.nama_perusahaan}
              onChange={(e) => setFormData({...formData, nama_perusahaan: e.target.value})}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Nama PIC</label>
            <input 
              type="text" 
              value={formData.nama_pic}
              onChange={(e) => setFormData({...formData, nama_pic: e.target.value})}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Jenis Pelanggan</label>
            <select 
              value={formData.jenis_pelanggan}
              onChange={(e) => setFormData({...formData, jenis_pelanggan: e.target.value})}
            >
              <option value="CV">CV</option>
              <option value="PT">PT</option>
              <option value="Perorangan">Perorangan</option>
            </select>
          </div>
          
          <div className={styles.formGroup}>
            <label>No. HP</label>
            <input 
              type="text" 
              value={formData.no_hp}
              onChange={(e) => setFormData({...formData, no_hp: e.target.value})}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Alamat</label>
            <textarea 
              rows="3"
              value={formData.alamat}
              onChange={(e) => setFormData({...formData, alamat: e.target.value})}
            />
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onCancel}>Batal</button>
            <button type="submit" className={styles.saveBtn}>Simpan</button>
          </div>
        </form>
      </div>
    </div>
  );
}
