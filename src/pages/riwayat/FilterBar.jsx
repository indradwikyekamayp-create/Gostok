import React, { useState } from 'react';
import styles from './FilterBar.module.css';

const FilterBar = ({ filters, onFilterChange }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleChange = (field, value) => {
    setLocalFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleApply = () => {
    onFilterChange(localFilters);
  };

  const handleReset = () => {
    const resetState = {
      startDate: '',
      endDate: '',
      customer: '',
      product: '',
      status: 'Semua'
    };
    setLocalFilters(resetState);
    onFilterChange(resetState);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (localFilters.startDate || localFilters.endDate) count++;
    if (localFilters.customer) count++;
    if (localFilters.product) count++;
    if (localFilters.status !== 'Semua') count++;
    return count;
  };

  return (
    <div className={styles.filterBar}>
      <div className={styles.filterInputs}>
        <div className={styles.formGroup}>
          <label>Tanggal Mulai</label>
          <input 
            type="date" 
            value={localFilters.startDate} 
            onChange={(e) => handleChange('startDate', e.target.value)} 
            className={styles.input}
          />
        </div>
        <div className={styles.formGroup}>
          <label>Tanggal Akhir</label>
          <input 
            type="date" 
            value={localFilters.endDate} 
            onChange={(e) => handleChange('endDate', e.target.value)} 
            className={styles.input}
          />
        </div>
        
        <div className={styles.formGroup}>
          <label>Pelanggan</label>
          <input 
            type="text" 
            placeholder="Cari nama pelanggan..." 
            value={localFilters.customer} 
            onChange={(e) => handleChange('customer', e.target.value)} 
            className={styles.input}
          />
        </div>
        
        <div className={styles.formGroup}>
          <label>Produk</label>
          <input 
            type="text" 
            placeholder="Cari produk/barcode..." 
            value={localFilters.product} 
            onChange={(e) => handleChange('product', e.target.value)} 
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Status</label>
          <select 
            value={localFilters.status} 
            onChange={(e) => handleChange('status', e.target.value)} 
            className={styles.input}
          >
            <option value="Semua">Semua Status</option>
            <option value="Lunas">Lunas</option>
            <option value="Belum Lunas">Belum Lunas / BON</option>
            <option value="Cicilan">Cicilan</option>
          </select>
        </div>
      </div>

      <div className={styles.actions}>
        <button className={styles.btnReset} onClick={handleReset}>
          Reset
        </button>
        <button className={styles.btnApply} onClick={handleApply}>
          Cari {getActiveFilterCount() > 0 && <span className={styles.badge}>{getActiveFilterCount()}</span>}
        </button>
      </div>
    </div>
  );
};

export default FilterBar;
