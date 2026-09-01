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
            <div className={styles.invoiceOutline}>
              {/* COMPANY NAME SECTION */}
              <div className={styles.companyNameSection} style={{ textAlign: 'center', paddingTop: '20px' }}>
                <h1>{settings.namaToko || 'PT. WELINDO SUKSES BERSAMA'}</h1>
                <p>Telp: {settings.teleponToko || '-'}</p>
              </div>

              {/* TOP SECTION: TITLE */}
              <div className={styles.invoiceHeaderTitle} style={{ paddingTop: '10px' }}>
                <div className={styles.titleLine}></div>
                <div className={styles.titleDot}>&bull;</div>
                <div className={styles.titleText}>BUKTI BAYAR</div>
                <div className={styles.titleDot}>&bull;</div>
                <div className={styles.titleLine}></div>
              </div>

              {/* TOP SECTION: DETAILS */}
              <div className={styles.topSection}>
                <div className={styles.topLeft}>
                  <table className={styles.detailsBox}>
                    <tbody>
                      <tr>
                        <td style={{ width: '100px', fontWeight: 'bold' }}>No. Ref</td>
                        <td>: #{payment.id?.substring(0, 8).toUpperCase()}</td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 'bold' }}>Tanggal</td>
                        <td>: {dateStr}</td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 'bold' }}>Metode Bayar</td>
                        <td>: {payment.metode?.toUpperCase()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className={styles.topRight}>
                  <div className={styles.kepadaBox}>
                    <div style={{ marginBottom: '8px' }}>Diterima Dari :</div>
                    <div style={{ fontWeight: 'bold', fontSize: '16px', textTransform: 'uppercase', marginBottom: '8px' }}>
                      {customer?.nama_perusahaan || customer?.nama_pic || customer?.nama || 'Pelanggan Umum'}
                    </div>
                    {customer?.nama_pic && <div>PIC. {customer.nama_pic}</div>}
                    <div>Telp. {customer?.no_hp || '-'}</div>
                  </div>
                </div>
              </div>

              {/* TABLE SECTION */}
              <table className={styles.itemsTable} style={{ flex: 1 }}>
                <thead>
                  <tr>
                    <th style={{ width: '10%' }}>NO.</th>
                    <th style={{ width: '60%', textAlign: 'left', paddingLeft: '15px' }}>ALOKASI NOTA (CICILAN)</th>
                    <th style={{ width: '30%', textAlign: 'right', paddingRight: '15px' }}>NOMINAL DIBAYAR</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(payment.allocations || {}).filter(([_, amount]) => amount > 0).map(([notaId, amount], index) => {
                    const notaData = notas.find(n => n.id === notaId);
                    const notaLabel = notaData ? notaData.no_nota : notaId;
                    return (
                      <tr key={notaId}>
                        <td className={styles.colCenter}>{index + 1}</td>
                        <td style={{ textAlign: 'left', paddingLeft: '15px', fontWeight: '600' }}>{notaLabel}</td>
                        <td className={styles.colRight} style={{ paddingRight: '15px' }}>{formatRp(amount)}</td>
                      </tr>
                    );
                  })}
                  
                  {/* Empty space filler if few items */}
                  {Array.from({ length: Math.max(0, 5 - Object.keys(payment.allocations || {}).length) }).map((_, idx) => (
                    <tr key={`empty-${idx}`} className={styles.emptyRow}>
                      <td>&nbsp;</td>
                      <td></td>
                      <td></td>
                    </tr>
                  ))}
                  
                  <tr className={styles.grandTotalRow}>
                    <td colSpan="2" className={styles.grandTotalLabel} style={{ paddingRight: '15px' }}>
                      TOTAL DIBAYAR :
                    </td>
                    <td className={styles.grandTotalValue} style={{ paddingRight: '15px', fontSize: '16px', color: '#16a34a' }}>
                      {formatRp(payment.jumlahBayar)}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* BOTTOM SECTION */}
              <div className={styles.bottomSection} style={{ marginTop: 'auto' }}>
                <div className={styles.bottomLeft}>
                  {/* Empty left side or can be used for notes */}
                </div>
                
                <div className={styles.bottomRight}>
                  <div className={styles.signatureBox}>
                    <div style={{ marginBottom: '5px' }}>Penerima,</div>
                    <div className={styles.ttdSpace}></div>
                    <div style={{ textDecoration: 'underline', fontWeight: 'bold' }}>
                      {settings.namaToko || 'PT. Welindo Sukses Bersama'}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className={styles.btnSecondary} onClick={onClose}>
              Tutup
            </button>
            <button className={styles.btnPrimary} onClick={() => window.print()}>
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
