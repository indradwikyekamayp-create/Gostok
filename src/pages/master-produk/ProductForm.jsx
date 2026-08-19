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
    foto: product?.foto || null,
    // Multi-Satuan Fields
    has_multi_satuan: product?.has_multi_satuan || false,
    satuan_besar: product?.satuan_besar || '',
    konversi: product?.konversi || ''
  });
  const [loading, setLoading] = useState(false);

  const isEditing = !!product;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
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
        stok: Number(formData.stok),
        konversi: formData.has_multi_satuan ? Number(formData.konversi) : 1
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

      {/* Satuan Area */}
      <div className={styles.sectionCard}>
        <h3 className={styles.sectionTitle}>Pengaturan Satuan</h3>
        
        <div className={styles.field}>
          <label>Satuan Dasar (Eceran, cth: pcs)</label>
          <input 
            type="text" 
            name="satuan" 
            value={formData.satuan} 
            onChange={handleChange} 
            required 
            placeholder="pcs"
          />
        </div>

        <div className={styles.checkboxField}>
          <input 
            type="checkbox" 
            id="has_multi_satuan"
            name="has_multi_satuan"
            checked={formData.has_multi_satuan}
            onChange={handleChange}
          />
          <label htmlFor="has_multi_satuan">Produk ini memiliki satuan besar (Grosir / Dus / Pack)</label>
        </div>

        {formData.has_multi_satuan && (
          <div className={styles.multiSatuanBox}>
            <div className={styles.row}>
              <div className={styles.field}>
                <label>Satuan Besar (cth: dus)</label>
                <input 
                  type="text" 
                  name="satuan_besar" 
                  value={formData.satuan_besar} 
                  onChange={handleChange} 
                  required={formData.has_multi_satuan}
                  placeholder="dus"
                />
              </div>
              <div className={styles.field}>
                <label>Isi per {formData.satuan_besar || 'Satuan Besar'} (Konversi)</label>
                <div className={styles.inputWithSuffix}>
                  <input 
                    type="number" 
                    name="konversi" 
                    value={formData.konversi} 
                    onChange={handleChange} 
                    required={formData.has_multi_satuan}
                    min="2"
                    placeholder="24"
                  />
                  <span className={styles.suffix}>{formData.satuan || 'pcs'}</span>
                </div>
              </div>
            </div>
            <p className={styles.helpText}>1 {formData.satuan_besar || 'Satuan Besar'} sama dengan {formData.konversi || 'X'} {formData.satuan || 'Satuan Dasar'}. Stok akan dihitung dalam satuan dasar.</p>
          </div>
        )}
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
            <label>Harga Jual (Rp) - Satuan Dasar</label>
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
          <label>Stok Awal ({formData.satuan || 'satuan'})</label>
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
