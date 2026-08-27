import React, { useState, useRef } from 'react';
import { Camera, Save, X, Image as ImageIcon } from 'lucide-react';

const ProductFormMobile = ({ product, onSave, onCancel, isOwner }) => {
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
    has_multi_satuan: product?.has_multi_satuan || false,
    satuan_besar: product?.satuan_besar || '',
    konversi: product?.konversi || ''
  });
  
  const [loading, setLoading] = useState(false);
  const isEditing = !!product;
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, foto: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
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

  // Base input style to mimic flutter material text fields
  const inputStyle = {
    width: '100%',
    padding: '1rem',
    borderRadius: '1rem',
    border: '1px solid #cbd5e1',
    backgroundColor: '#fff',
    fontSize: '0.9375rem',
    outline: 'none',
    color: '#0f172a',
    transition: 'all 0.2s',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.8125rem',
    fontWeight: 700,
    color: '#475569',
    marginBottom: '0.5rem',
    marginLeft: '0.25rem'
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Image Upload Area */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '0.5rem' }}>
        <input 
          type="file" 
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <div 
          onClick={() => fileInputRef.current.click()}
          className="flutter-ripple"
          style={{ 
            width: '100px', height: '100px', borderRadius: '1.5rem', 
            backgroundColor: formData.foto ? '#fff' : '#f1f5f9', 
            border: formData.foto ? '2px solid #e2e8f0' : '2px dashed #cbd5e1',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', position: 'relative', cursor: 'pointer'
          }}
        >
          {formData.foto ? (
            <img src={formData.foto} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <>
              <Camera size={28} color="#94a3b8" style={{ marginBottom: '4px' }} />
              <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>Pilih Foto</span>
            </>
          )}
          {formData.foto && (
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)', padding: '4px', textAlign: 'center', color: '#fff', fontSize: '0.65rem', fontWeight: 700 }}>
              Ganti Foto
            </div>
          )}
        </div>
      </div>

      <div style={{ backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '1.5rem', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={labelStyle}>Barcode / Kode</label>
          <input 
            type="text" name="barcode" value={formData.barcode} onChange={handleChange}
            disabled={isEditing} required style={{ ...inputStyle, backgroundColor: isEditing ? '#f1f5f9' : '#fff' }}
            placeholder="Scan atau ketik kode..."
          />
        </div>
        <div>
          <label style={labelStyle}>Nama Barang</label>
          <input 
            type="text" name="nama_barang" value={formData.nama_barang} onChange={handleChange}
            required style={inputStyle} placeholder="Contoh: Air Mineral 600ml"
          />
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Kategori</label>
            <select name="kategori" value={formData.kategori} onChange={handleChange} style={inputStyle}>
              <option value="Makanan & Minuman">Makanan & Minuman</option>
              <option value="Kesehatan">Kesehatan</option>
              <option value="Kebutuhan Rumah Tangga">Keb. Rumah Tangga</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Asal</label>
            <select name="asal" value={formData.asal} onChange={handleChange} style={inputStyle}>
              <option value="Lokal">Lokal</option>
              <option value="Impor">Impor</option>
            </select>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div style={{ backgroundColor: '#fff', padding: '1.25rem', borderRadius: '1.5rem', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0' }}>Pengaturan Harga</h3>
        
        {/* We ALWAYS show Modal regardless of isOwner to fix the bug where owner couldn't see it */}
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Harga Modal (Beli)</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: '#94a3b8' }}>Rp</span>
              <input 
                type="number" name="harga_modal" value={formData.harga_modal} onChange={handleChange}
                required style={{ ...inputStyle, paddingLeft: '2.5rem' }} placeholder="0"
              />
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Harga Jual (Eceran)</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: '#16a34a' }}>Rp</span>
              <input 
                type="number" name="harga_jual" value={formData.harga_jual} onChange={handleChange}
                required style={{ ...inputStyle, paddingLeft: '2.5rem', borderColor: '#bbf7d0', backgroundColor: '#f0fdf4' }} placeholder="0"
              />
            </div>
          </div>
        </div>

        {!isEditing && (
          <div>
            <label style={labelStyle}>Stok Awal ({formData.satuan || 'pcs'})</label>
            <input 
              type="number" name="stok" value={formData.stok} onChange={handleChange}
              required style={inputStyle} placeholder="0"
            />
          </div>
        )}
      </div>

      {/* Satuan Area */}
      <div style={{ backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '1.5rem', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem 0' }}>Pengaturan Satuan</h3>
        
        <div>
          <label style={labelStyle}>Satuan Dasar / Eceran</label>
          <input 
            type="text" name="satuan" value={formData.satuan} onChange={handleChange}
            required style={inputStyle} placeholder="Contoh: pcs, renceng, botol"
          />
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', backgroundColor: '#fff', borderRadius: '1rem', border: '1px solid #e2e8f0', cursor: 'pointer' }}>
          {/* Custom toggle switch */}
          <div style={{ position: 'relative', width: '40px', height: '24px', backgroundColor: formData.has_multi_satuan ? '#1d4ed8' : '#cbd5e1', borderRadius: '12px', transition: 'background-color 0.2s', flexShrink: 0 }}>
            <div style={{ position: 'absolute', top: '2px', left: formData.has_multi_satuan ? '18px' : '2px', width: '20px', height: '20px', backgroundColor: '#fff', borderRadius: '50%', transition: 'left 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }} />
          </div>
          <input 
            type="checkbox" name="has_multi_satuan" checked={formData.has_multi_satuan} onChange={handleChange}
            style={{ display: 'none' }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>Multi Satuan (Grosir)</div>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Aktifkan jika produk bisa dijual per dus/pack</div>
          </div>
        </label>

        {formData.has_multi_satuan && (
          <div style={{ backgroundColor: '#fff', padding: '1rem', borderRadius: '1rem', border: '1px solid #93c5fd', display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
            <div>
              <label style={labelStyle}>Satuan Besar (Grosir)</label>
              <input 
                type="text" name="satuan_besar" value={formData.satuan_besar} onChange={handleChange}
                required={formData.has_multi_satuan} style={{ ...inputStyle, backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }} placeholder="Contoh: dus, slop, karton"
              />
            </div>
            <div>
              <label style={labelStyle}>Isi per 1 {formData.satuan_besar || 'Dus'} (Konversi)</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="number" name="konversi" value={formData.konversi} onChange={handleChange}
                  required={formData.has_multi_satuan} min="2" style={{ ...inputStyle, backgroundColor: '#eff6ff', borderColor: '#bfdbfe', paddingRight: '4rem' }} placeholder="Contoh: 24"
                />
                <span style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: '#1d4ed8' }}>
                  {formData.satuan || 'pcs'}
                </span>
              </div>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#0369a1', backgroundColor: '#e0f2fe', padding: '0.75rem', borderRadius: '0.75rem', textAlign: 'center', fontWeight: 600 }}>
              💡 1 {formData.satuan_besar || 'Dus'} = {formData.konversi || 'X'} {formData.satuan || 'pcs'}
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', marginBottom: '1rem' }}>
        <button 
          type="button" 
          onClick={onCancel} 
          disabled={loading}
          style={{ flex: 1, padding: '1rem', borderRadius: '1rem', backgroundColor: '#fff', border: '1px solid #cbd5e1', color: '#475569', fontWeight: 700, fontSize: '0.9375rem' }}
        >
          Batal
        </button>
        <button 
          type="submit" 
          disabled={loading}
          className="flutter-ripple"
          style={{ flex: 2, padding: '1rem', borderRadius: '1rem', backgroundColor: '#1d4ed8', border: 'none', color: '#fff', fontWeight: 700, fontSize: '0.9375rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
        >
          <Save size={18} /> {loading ? 'Menyimpan...' : 'Simpan Produk'}
        </button>
      </div>
    </form>
  );
};

export default ProductFormMobile;
