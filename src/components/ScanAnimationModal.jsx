import React, { useEffect, useState } from 'react';
import { X, ScanBarcode } from 'lucide-react';
import styles from './ScanAnimationModal.module.css';

export default function ScanAnimationModal({ isOpen, onClose, onScan }) {
  const [scanning, setScanning] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setScanning(true);
      const timer = setTimeout(() => {
        setScanning(false);
        setTimeout(() => onClose(), 800);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Scan Barcode</h3>
          <button onClick={onClose} className={styles.closeBtn}><X size={20} /></button>
        </div>
        <div className={styles.scannerContainer}>
          <div className={styles.viewfinder}>
            <div className={styles.cornerTopLeft}></div>
            <div className={styles.cornerTopRight}></div>
            <div className={styles.cornerBottomLeft}></div>
            <div className={styles.cornerBottomRight}></div>
            
            {scanning ? (
              <div className={styles.laser}></div>
            ) : (
              <div className={styles.successIcon}>
                <ScanBarcode size={48} color="#22c55e" />
                <p style={{ margin: '0.5rem 0 0 0', color: '#22c55e', fontWeight: 600 }}>Berhasil!</p>
              </div>
            )}
          </div>
          <p className={styles.instruction}>
            {scanning ? "Arahkan kamera ke barcode produk..." : "Barcode terdeteksi"}
          </p>
        </div>
      </div>
    </div>
  );
}
