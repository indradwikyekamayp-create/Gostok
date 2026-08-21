import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Printer, X, Download } from 'lucide-react';
import styles from './NotaPreview.module.css';

const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number);
};

export default function NotaPreview({ transaction, onClose }) {
  const [settings, setSettings] = useState({
    namaToko: 'PT. WELINDO SUKSES BERSAMA',
    teleponToko: '0812-3456-7890'
  });

  // Prevent body scroll when modal is open and auto-print
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    
    // Auto-trigger print when nota is opened
    const printTimer = setTimeout(() => {
      window.print();
    }, 500);
    
    // Fetch store config
    import('firebase/firestore').then(({ doc, onSnapshot }) => {
      import('../../firebase').then(({ db }) => {
        const unsub = onSnapshot(doc(db, 'settings', 'store_config'), (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.namaToko === 'AyoStock!') {
              data.namaToko = 'PT. WELINDO SUKSES BERSAMA';
            }
            setSettings(prev => ({ ...prev, ...data }));
          }
        });
        return unsub;
      });
    });

    return () => {
      clearTimeout(printTimer);
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (!transaction) return null;

  const { id, tanggal, customer, cart, paymentMethod, grandTotal } = transaction;

  return createPortal(
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Preview Nota</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.notaWrapper}>
            <div className={styles.watermark}></div>
            <div className={styles.invoiceHeader}>
              <div className={styles.companyInfo}>
                <h1>{settings.namaToko}</h1>
                <p>No. Telp: {settings.teleponToko || '-'}</p>
                {/* No address as requested */}
              </div>
              <div className={styles.invoiceTitle}>
                <h2>INVOICE</h2>
                <p>#{transaction.noNota || id}</p>
              </div>
            </div>

            <div className={styles.customerInfo}>
              <div className={styles.customerBox}>
                <div className={styles.customerLabel}>Ditagihkan Kepada:</div>
                <h3 className={styles.customerName}>{customer?.nama_perusahaan || customer?.nama_pic || customer?.nama || 'Pelanggan Umum'}</h3>
                {customer?.alamat && <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem', color: '#475569' }}>{customer.alamat}</p>}
                {customer?.no_hp && <p style={{ margin: '0.25rem 0 0', fontSize: '0.9rem', color: '#475569' }}>Telp: {customer.no_hp}</p>}
              </div>
              <div className={styles.customerBox} style={{ textAlign: 'right' }}>
                <div className={styles.customerLabel}>Detail Transaksi:</div>
                <p style={{ margin: '0 0 0.25rem', fontSize: '0.95rem' }}>
                  <strong>Tanggal:</strong> {new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(new Date(tanggal))}
                </p>
                <p style={{ margin: '0 0 0.25rem', fontSize: '0.95rem' }}>
                  <strong>Metode:</strong> {paymentMethod}
                </p>
              </div>
            </div>

            <table className={styles.invoiceTable}>
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Deskripsi Produk</th>
                  <th className={styles.centerAlign}>Qty</th>
                  <th className={styles.rightAlign}>Harga Satuan</th>
                  <th className={styles.rightAlign}>Total</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{item.nama_barang}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Kode: {item.barcode || item.kode_barang || '-'}</div>
                    </td>
                    <td className={styles.centerAlign}>{item.qty}</td>
                    <td className={styles.rightAlign}>Rp {formatRupiah(item.harga_jual)}</td>
                    <td className={styles.rightAlign}>Rp {formatRupiah(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className={styles.summarySection}>
              <div className={styles.summaryBox}>
                <div className={styles.summaryRow}>
                  <span>Subtotal</span>
                  <span>Rp {formatRupiah(grandTotal)}</span>
                </div>
                <div className={styles.summaryTotal}>
                  <span>TOTAL BIAYA</span>
                  <span>Rp {formatRupiah(grandTotal)}</span>
                </div>
              </div>
            </div>

            <div className={styles.signatureSection}>
              <div className={styles.signatureBox}>
                <div className={styles.signatureTitle}>Penerima / Pembeli</div>
                <div className={styles.signatureLine}>( .......................................... )</div>
              </div>
            </div>
            
            <div className={styles.poweredBy}>
              <img src="/logo/AyoStock!.png" alt="AyoStock!" />
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.btnSecondary} onClick={onClose}>
            Tutup
          </button>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className={styles.btnSecondary} onClick={handlePrint} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderColor: '#1d4ed8', color: '#1d4ed8' }}>
              <Download size={20} />
              Simpan PDF
            </button>
            <button className={styles.btnPrimary} onClick={handlePrint}>
              <Printer size={20} />
              Cetak Nota
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
