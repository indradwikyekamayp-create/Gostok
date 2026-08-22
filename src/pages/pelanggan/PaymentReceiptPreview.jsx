import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import styles from '../transaksi-jual/NotaPreview.module.css'; // Reuse the receipt styles

const formatRp = (amount) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
};

const PaymentReceiptPreview = ({ payment, customer, notas, onClose, autoPrint = false }) => {
  const [settings, setSettings] = useState({ namaToko: 'PT. WELINDO SUKSES BERSAMA', teleponToko: '-' });

  useEffect(() => {
    // Fetch store config
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'store_config');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSettings(docSnap.data());
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      }
    };
    fetchSettings();

    // Only auto-print if explicitly requested
    if (autoPrint) {
      const timer = setTimeout(() => {
        window.print();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [autoPrint]);

  const dateStr = new Intl.DateTimeFormat('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }).format(new Date(payment.tanggal));

  return createPortal(
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Preview Bukti Pembayaran</h2>
          <button className={styles.closeBtn} onClick={onClose}>&times;</button>
        </div>

        <div className={styles.content}>
          <div className={styles.notaWrapper} id="printable-receipt">
            <div className={styles.watermark}></div>
            
            <div className={styles.invoiceHeader}>
              <div className={styles.companyInfo}>
                <h1>{settings.namaToko || 'PT. WELINDO SUKSES BERSAMA'}</h1>
                <p>No. Telp: {settings.teleponToko || '-'}</p>
              </div>
              <div className={styles.invoiceTitle}>
                <h2>BUKTI BAYAR</h2>
                <p style={{fontSize: '0.85rem', marginTop: '4px'}}>Ref: #{payment.id?.substring(0, 8).toUpperCase()}</p>
              </div>
            </div>

            <div className={styles.customerInfo}>
              <div className={styles.customerBox}>
                <div className={styles.customerLabel}>Diterima Dari:</div>
                <h3 className={styles.customerName}>{customer?.nama_perusahaan || 'Pelanggan Umum'}</h3>
                {customer?.nama_pic && <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem', color: '#475569' }}>PIC: {customer.nama_pic}</p>}
              </div>
              <div className={styles.customerBox} style={{ textAlign: 'right' }}>
                <div className={styles.customerLabel}>Detail Pembayaran:</div>
                <p style={{ margin: '0 0 0.25rem', fontSize: '0.95rem' }}>
                  <strong>Tanggal:</strong> {dateStr}
                </p>
                <p style={{ margin: '0 0 0.25rem', fontSize: '0.95rem' }}>
                  <strong>Metode:</strong> {payment.metode?.toUpperCase()}
                </p>
              </div>
            </div>

            <table className={styles.invoiceTable}>
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Alokasi Nota (Cicilan)</th>
                  <th className={styles.rightAlign}>Nominal Dibayar</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(payment.allocations || {}).filter(([_, amount]) => amount > 0).map(([notaId, amount], index) => {
                  const notaData = notas.find(n => n.id === notaId);
                  const notaLabel = notaData ? notaData.no_nota : notaId;
                  return (
                    <tr key={notaId}>
                      <td>{index + 1}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{notaLabel}</div>
                      </td>
                      <td className={styles.rightAlign}>Rp {new Intl.NumberFormat('id-ID').format(amount)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className={styles.summarySection}>
              <div className={styles.summaryBox}>
                <div className={styles.summaryTotal}>
                  <span>TOTAL DIBAYAR</span>
                  <span>{formatRp(payment.jumlahBayar)}</span>
                </div>
              </div>
            </div>

            <div className={styles.signatureSection}>
              <div className={styles.signatureBox}>
                <p>Penerima,</p>
                <div className={styles.signatureLine}></div>
                <p className={styles.signatureName}>{settings.namaToko || 'PT. Welindo Sukses Bersama'}</p>
              </div>
            </div>

          </div>
        </div>

        <div className={styles.footer}>
          <div className={styles.footerButtons}>
            <button className={styles.btnPrint} onClick={() => window.print()}>
              🖨️ Cetak Struk
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default PaymentReceiptPreview;
