import React, { useState, useEffect } from 'react';
import styles from './PaymentForm.module.css';

export default function PaymentForm({ selectedNotas, onClose, onSave }) {
  const [jumlahBayar, setJumlahBayar] = useState('');
  const [metode, setMetode] = useState('Cash');
  const [isManual, setIsManual] = useState(false);
  const [allocations, setAllocations] = useState({});

  useEffect(() => {
    // Auto-allocate based on FIFO when jumlahBayar changes and not in manual mode
    if (!isManual) {
      const amount = parseFloat(jumlahBayar) || 0;
      let remaining = amount;
      const newAllocations = {};
      
      // Sort oldest first (assuming ID or date format allows simple sorting, or they are already sorted)
      [...selectedNotas].sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal)).forEach(n => {
        if (remaining > 0) {
          const allocate = Math.min(n.sisa_hutang, remaining);
          newAllocations[n.id] = allocate;
          remaining -= allocate;
        } else {
          newAllocations[n.id] = 0;
        }
      });
      setAllocations(newAllocations);
    }
  }, [jumlahBayar, isManual, selectedNotas]);

  const handleManualAllocationChange = (notaId, value) => {
    const numValue = parseFloat(value) || 0;
    setAllocations(prev => ({
      ...prev,
      [notaId]: Math.min(numValue, selectedNotas.find(n => n.id === notaId).sisa_hutang)
    }));
  };

  const totalAllocated = Object.values(allocations).reduce((sum, val) => sum + (val || 0), 0);
  const amount = parseFloat(jumlahBayar) || 0;
  const isComplete = amount > 0 && Math.abs(totalAllocated - amount) < 1;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isComplete) {
      alert('Jumlah bayar tidak sama dengan total yang dialokasikan.');
      return;
    }
    onSave();
  };

  const formatRp = (val) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(val);

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>Catat Pembayaran</h2>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Jumlah Bayar (Rp)</label>
            <input 
              type="number" 
              required
              min="1"
              value={jumlahBayar}
              onChange={(e) => setJumlahBayar(e.target.value)}
              className={styles.largeInput}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Metode Pembayaran</label>
            <div className={styles.radioGroup}>
              <label>
                <input type="radio" value="Cash" checked={metode === 'Cash'} onChange={() => setMetode('Cash')} /> Cash
              </label>
              <label>
                <input type="radio" value="Transfer" checked={metode === 'Transfer'} onChange={() => setMetode('Transfer')} /> Transfer
              </label>
            </div>
          </div>

          <div className={styles.allocationSection}>
            <div className={styles.allocationHeader}>
              <h3>Alokasi Pembayaran</h3>
              <label className={styles.toggleManual}>
                <input type="checkbox" checked={isManual} onChange={(e) => setIsManual(e.target.checked)} />
                Input Manual
              </label>
            </div>

            <table className={styles.allocationTable}>
              <thead>
                <tr>
                  <th>No Nota</th>
                  <th>Sisa Hutang</th>
                  <th>Dialokasikan</th>
                  <th>Sisa Setelah Bayar</th>
                </tr>
              </thead>
              <tbody>
                {selectedNotas.map(n => {
                  const alloc = allocations[n.id] || 0;
                  return (
                    <tr key={n.id}>
                      <td>{n.no_nota}</td>
                      <td>{formatRp(n.sisa_hutang)}</td>
                      <td>
                        {isManual ? (
                          <input 
                            type="number" 
                            max={n.sisa_hutang}
                            value={alloc || ''}
                            onChange={(e) => handleManualAllocationChange(n.id, e.target.value)}
                            className={styles.allocInput}
                          />
                        ) : (
                          formatRp(alloc)
                        )}
                      </td>
                      <td>{formatRp(n.sisa_hutang - alloc)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className={styles.summaryBox}>
            <div className={styles.summaryRow}>
              <span>Total Bayar:</span>
              <span>{formatRp(amount)}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Total Dialokasikan:</span>
              <span style={{ color: Math.abs(totalAllocated - amount) > 1 ? 'hsl(0, 70%, 50%)' : 'hsl(145, 55%, 42%)' }}>
                {formatRp(totalAllocated)}
              </span>
            </div>
            {amount - totalAllocated > 1 && (
              <div className={styles.summaryRow}>
                <span style={{color: 'hsl(38, 92%, 50%)'}}>Sisa Belum Dialokasikan (Kembalian/Deposit):</span>
                <span>{formatRp(amount - totalAllocated)}</span>
              </div>
            )}
          </div>

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>Batal</button>
            <button type="submit" className={styles.saveBtn} disabled={!isComplete}>Simpan Pembayaran</button>
          </div>
        </form>
      </div>
    </div>
  );
}
