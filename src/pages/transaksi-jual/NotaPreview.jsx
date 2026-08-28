import React, { useEffect, useState, useContext } from 'react';
import { createPortal } from 'react-dom';
import { Printer, X, Download } from 'lucide-react';
import styles from './NotaPreview.module.css';
import { AuthContext } from '../../context/AuthContext';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number);
};

// Simple terbilang function
const terbilang = (angka) => {
  const bilangan = [
    '', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'
  ];
  if (angka < 12) return bilangan[angka];
  if (angka < 20) return bilangan[angka - 10] + ' Belas';
  if (angka < 100) return bilangan[Math.floor(angka / 10)] + ' Puluh ' + bilangan[angka % 10];
  if (angka < 200) return 'Seratus ' + terbilang(angka - 100);
  if (angka < 1000) return bilangan[Math.floor(angka / 100)] + ' Ratus ' + terbilang(angka % 100);
  if (angka < 2000) return 'Seribu ' + terbilang(angka - 1000);
  if (angka < 1000000) return terbilang(Math.floor(angka / 1000)) + ' Ribu ' + terbilang(angka % 1000);
  if (angka < 1000000000) return terbilang(Math.floor(angka / 1000000)) + ' Juta ' + terbilang(angka % 1000000);
  if (angka < 1000000000000) return terbilang(Math.floor(angka / 1000000000)) + ' Miliar ' + terbilang(angka % 1000000000);
  return 'Angka terlalu besar';
};

export default function NotaPreview({ transaction, onClose, autoPrint = false }) {
  const { user, userData } = useContext(AuthContext);
  const [settings, setSettings] = useState({
    namaToko: 'PT. TRIKARSA RAYA MANDIRI',
    alamatToko: 'INDUSTRI BCI BLOK B NO. 5, BATU AMPAR',
    teleponToko: '0812-6558-5710',
    emailToko: 'trikarsa.trm.batam@gmail.com'
  });

  const { id, tanggal, customer, cart, grandTotal, jatuhTempo: trkJatuhTempo, paymentMethod } = transaction;
  const dateObj = tanggal?.toDate ? tanggal.toDate() : new Date(tanggal);

  // Initialize jatuh tempo state
  const [customJatuhTempo, setCustomJatuhTempo] = useState(() => {
    if (trkJatuhTempo) {
      return trkJatuhTempo?.toDate ? trkJatuhTempo.toDate() : new Date(trkJatuhTempo);
    } else if (paymentMethod?.toLowerCase() === 'hutang' || paymentMethod?.toLowerCase() === 'kredit' || paymentMethod?.toLowerCase() === 'bon') {
      const jtObj = new Date(dateObj);
      jtObj.setDate(jtObj.getDate() + 14);
      return jtObj;
    }
    return null;
  });

  // Prevent body scroll when modal is open and auto-print
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    
    let printTimer;
    if (autoPrint) {
      printTimer = setTimeout(() => {
        window.print();
      }, 500);
    }
    
    import('firebase/firestore').then(({ doc, onSnapshot }) => {
      import('../../firebase').then(({ db }) => {
        const unsub = onSnapshot(doc(db, 'settings', 'store_config'), (docSnap) => {
          if (docSnap.exists()) {
            // Immutability logic: if transaction has a saved snapshot, use it! Otherwise use live.
            if (transaction.store_config) {
               setSettings(prev => ({ ...prev, ...transaction.store_config }));
            } else {
               setSettings(prev => ({ ...prev, ...docSnap.data() }));
            }
          }
        });
        return unsub;
      });
    });

    return () => {
      clearTimeout(printTimer);
      document.body.style.overflow = 'auto';
    };
  }, [transaction]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('nota-content-to-pdf');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Invoice_${transaction.no_invoice || 'baru'}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Gagal membuat PDF.');
    }
  };

  if (!transaction) return null;
  
  const tanggalStr = dateObj.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
  const timeStr = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  let jatuhTempoStr = '-';
  if (customJatuhTempo) {
     jatuhTempoStr = customJatuhTempo.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  const emptyRows = Math.max(0, 7 - cart.length);
  const salesName = transaction.kasir?.nama || transaction.sales || 'Admin';
  const printedByName = userData?.nama || user?.displayName || user?.email || 'Admin';
  const isHutang = paymentMethod?.toLowerCase() === 'hutang' || paymentMethod?.toLowerCase() === 'kredit' || paymentMethod?.toLowerCase() === 'bon';
  const isLunas = paymentMethod?.toLowerCase() === 'cash' || paymentMethod?.toLowerCase() === 'transfer';

  const handleDateChange = (e) => {
    if (e.target.value) {
      setCustomJatuhTempo(new Date(e.target.value));
    } else {
      setCustomJatuhTempo(null);
    }
  };

  return createPortal(
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Preview Nota A4</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {isHutang && (
              <div className={styles.noPrint} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px' }}>
                 <label>Atur Jatuh Tempo:</label>
                 <input 
                   type="date" 
                   onChange={handleDateChange} 
                   value={customJatuhTempo ? customJatuhTempo.toISOString().split('T')[0] : ''}
                   style={{ padding: '4px', borderRadius: '4px', border: '1px solid #ccc' }}
                 />
              </div>
            )}
            <button className={styles.closeBtn} onClick={onClose}>
              <X size={24} />
            </button>
          </div>
        </div>

        <div className={styles.content}>
          <div id="nota-content-to-pdf" className={styles.notaWrapper}>
            <div className={styles.invoiceOutline}>
              {isLunas && <div className={styles.lunasStamp}>LUNAS</div>}
              
              {/* TOP SECTION */}
              <div className={styles.topSection}>
                <div className={styles.topLeft}>
                  <div className={styles.logoCircle}>TRM</div>
                  <div className={styles.companyNameSection}>
                    <h1>{settings.namaToko}</h1>
                    <p>Commerce . Export . Import . Distributor</p>
                    <p>Email: {settings.emailToko || '-'}</p>
                    <p>Phone: {settings.teleponToko || '-'}</p>
                  </div>
                </div>
                <div className={styles.topRight}>
                  <table className={styles.detailsBox}>
                    <tbody>
                      <tr><td>No. Invoice</td><td>: {transaction.noNota || `#INV-${id.substring(0,8)}`}</td></tr>
                      <tr><td>Tanggal</td><td>: {tanggalStr}</td></tr>
                      {isHutang && (
                        <tr><td>Jatuh Tempo</td><td>: {jatuhTempoStr}</td></tr>
                      )}
                      <tr><td>Sales</td><td>: {salesName}</td></tr>
                      <tr><td>Lembaran</td><td>: Page 1 of 1</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* CUSTOMER SECTION */}
              <div className={styles.customerSection}>
                <div className={styles.kepadaBox}>
                  <table>
                    <tbody>
                      <tr>
                        <td style={{ verticalAlign: 'top', width: '50px' }}>Kepada</td>
                        <td style={{ verticalAlign: 'top', width: '10px' }}>:</td>
                        <td>
                          <strong style={{ fontSize: '14px', textTransform: 'uppercase' }}>
                            {customer?.nama_perusahaan || customer?.nama_pic || customer?.nama || 'Pelanggan Umum'}
                          </strong>
                        </td>
                      </tr>
                      <tr>
                        <td>Telp.</td>
                        <td>:</td>
                        <td>{customer?.no_hp || '-'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className={styles.invoiceBigTitle}>INVOICE</div>
              </div>

              {/* TABLE SECTION */}
              <table className={styles.itemsTable}>
                <thead>
                  <tr>
                    <th>NO KODE</th>
                    <th>NAMA BARANG</th>
                    <th>QTY</th>
                    <th>@HARGA</th>
                    <th>HARGA</th>
                    <th>POTONGAN</th>
                    <th>DISCOUNT</th>
                    <th>TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item, idx) => (
                    <tr key={item.id}>
                      <td>
                        {idx + 1}. {item.barcode || item.kode_barang || '-'}
                      </td>
                      <td>{item.nama_barang}</td>
                      <td className={styles.colCenter}>{item.qty} {item.satuan || 'pcs'}</td>
                      <td className={styles.colRight}>{formatRupiah(item.harga_jual)}</td>
                      <td className={styles.colRight}>{formatRupiah(item.harga_jual * item.qty)}</td>
                      <td className={styles.colRight}>0</td>
                      <td className={styles.colRight}>0.00%</td>
                      <td className={styles.colRight}>{formatRupiah(item.subtotal)}</td>
                    </tr>
                  ))}
                  
                  {/* Empty rows to ensure min height */}
                  {Array.from({ length: emptyRows }).map((_, idx) => (
                    <tr key={`empty-${idx}`}>
                      <td>&nbsp;</td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                  ))}
                  
                  <tr className={styles.grandTotalRow}>
                    <td colSpan="7" className={styles.grandTotalLabel}>GRAND TOTAL : IDR</td>
                    <td className={styles.grandTotalValue}>{formatRupiah(grandTotal)}</td>
                  </tr>
                </tbody>
              </table>

              {/* BOTTOM SECTION */}
              <div className={styles.bottomSection}>
                <div className={styles.bottomLeft}>
                  <table>
                    <tbody>
                      <tr>
                        <td style={{ verticalAlign: 'top', width: '60px' }}>Catatan</td>
                        <td style={{ verticalAlign: 'top' }}>:</td>
                        <td>{transaction.catatan || '-'}</td>
                      </tr>
                      <tr>
                        <td style={{ verticalAlign: 'top' }}>Terbilang</td>
                        <td style={{ verticalAlign: 'top' }}>:</td>
                        <td style={{ textTransform: 'capitalize', fontStyle: 'italic' }}>
                          {terbilang(grandTotal)} Rupiah
                        </td>
                      </tr>
                      <tr>
                        <td style={{ verticalAlign: 'top' }}>Printed By</td>
                        <td style={{ verticalAlign: 'top' }}>:</td>
                        <td>
                          {printedByName}, {timeStr}, {tanggalStr}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div style={{ marginTop: '20px', fontSize: '10px' }}>
                    Barang diterima dalam keadaan cukup & baik
                  </div>
                </div>

                <div className={styles.bottomMiddle}>
                  <div className={styles.perhatikanBox}>
                    <strong>PERHATIKAN!!!</strong>
                    <br /><br />
                    1. Pembayaran via transfer/cek/giro diwajibkan ke rekening:
                    <br />
                    <div style={{ textAlign: 'left', marginTop: '4px', display: 'inline-block' }}>
                      <table>
                        <tbody>
                          <tr>
                            <td style={{ padding: '0 4px', fontWeight: 'bold' }}>Nama Bank</td>
                            <td style={{ padding: '0 4px', fontWeight: 'bold' }}>: {settings.bankNama || '-'}</td>
                          </tr>
                          <tr>
                            <td style={{ padding: '0 4px', fontWeight: 'bold' }}>No Rek</td>
                            <td style={{ padding: '0 4px', fontWeight: 'bold' }}>: {settings.bankRekening || '-'}</td>
                          </tr>
                          <tr>
                            <td style={{ padding: '0 4px', fontWeight: 'bold' }}>A/n</td>
                            <td style={{ padding: '0 4px', fontWeight: 'bold' }}>: {settings.bankAtasNama || settings.namaToko}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className={styles.bottomRight}>
                  <div className={styles.signatureBox}>
                    <p style={{ margin: '0 0 50px 0' }}>Hormat kami,</p>
                    <div style={{ borderTop: '1px dotted #000', width: '100%' }}></div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.btnSecondary} onClick={onClose}>
            Tutup
          </button>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className={styles.btnSecondary} onClick={handleDownloadPDF} style={{ color: '#1d4ed8' }}>
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
