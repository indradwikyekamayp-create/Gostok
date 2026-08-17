import React, { useState } from 'react';
import styles from './ProductForm.module.css';

const ProductForm = ({ product, onSave, onCancel, isOwner }) => {
  const [formData, setFormData] = useState({
    barcode: product?.barcode || '',
    nama_barang: product?.nama_barang || '',
    kategori: product?.kategori || 'Lainnya',
    asal: product?.asal || 'Lokal',
    satuan: product?.satuan || '',
    harga_jual: product?.harga_jual || '',
    harga_modal: product?.harga_modal || '',
    stok: product?.stok || 0,
    foto: product?.foto || null
  });
  const [loading, setLoading] = useState(false);

  const isEditing = !!product;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate save
    setTimeout(() => {
      onSave({
        ...formData,
        harga_jual: Number(formData.harga_jual),
        harga_modal: Number(formData.harga_modal),
        stok: Number(formData.stok)
      });
      setLoading(false);
    }, 500);
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2>{isEditing ? 'Edit Produk' : 'Tambah Produk Baru'}</h2>
      
      <div className={styles.field}>
        <label>Barcode</label>
        <input 
          type="text" 
          name="barcode" 
          value={formData.barcode} 
          onChange={handleChange} 
          disabled={isEditing}
          required 
        />
      </div>

      <div className={styles.field}>
        <label>Nama Barang</label>
        <input 
          type="text" 
          name="nama_barang" 
          value={formData.nama_barang} 
          onChange={handleChange} 
          required 
        />
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label>Kategori</label>
          <select name="kategori" value={formData.kategori} onChange={handleChange}>
            <option value="Makanan">Makanan</option>
            <option value="Minuman">Minuman</option>
            <option value="Lainnya">Lainnya</option>
          </select>
        </div>

        <div className={styles.field}>
          <label>Asal</label>
          <select name="asal" value={formData.asal} onChange={handleChange}>
            <option value="Lokal">Lokal</option>
            <option value="Impor">Impor</option>
          </select>
        </div>
      </div>

      <div className={styles.field}>
        <label>Satuan (contoh: pcs, dus)</label>
        <input 
          type="text" 
          name="satuan" 
          value={formData.satuan} 
          onChange={handleChange} 
          required 
        />
      </div>

      {isOwner && (
        <div className={styles.row}>
          <div className={styles.field}>
            <label>Harga Modal (Rp)</label>
            <input 
              type="number" 
              name="harga_modal" 
              value={formData.harga_modal} 
              onChange={handleChange} 
              required 
            />
          </div>
          <div className={styles.field}>
            <label>Harga Jual (Rp)</label>
            <input 
              type="number" 
              name="harga_jual" 
              value={formData.harga_jual} 
              onChange={handleChange} 
              required 
            />
          </div>
        </div>
      )}

      {!isEditing && (
        <div className={styles.field}>
          <label>Stok Awal</label>
          <input 
            type="number" 
            name="stok" 
            value={formData.stok} 
            onChange={handleChange} 
            required 
          />
        </div>
      )}

      <div className={styles.actions}>
        <button type="button" onClick={onCancel} className={styles.cancelBtn} disabled={loading}>Batal</button>
        <button type="submit" className={styles.saveBtn} disabled={loading}>
          {loading ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
