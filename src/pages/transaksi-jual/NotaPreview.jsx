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
    try {
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      const numPages = Math.ceil((cart.length || 1) / 7);

      for (let i = 0; i < numPages; i++) {
        const pageId = `nota-page-${i}`;
        const element = document.getElementById(pageId);
        if (!element) continue;

        const canvas = await html2canvas(element, {
          scale: 2,
          onclone: (document, clonedElement) => {
            const el = document.getElementById(pageId);
            if (el) {
              el.style.zoom = '1';
              el.style.transform = 'none';
              el.style.width = '297mm';
              el.style.maxWidth = 'none';
            }
          }
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        if (i > 0) {
          pdf.addPage();
        }
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      }
      
      const namaPelanggan = customer?.nama_perusahaan || customer?.nama_pic || customer?.nama || 'Umum';
      const noInvoice = transaction.noNota || `INV-${id.substring(0,8)}`;
      const tglInvoice = dateObj.toLocaleDateString('id-ID').replace(/\//g, '-');
      const jenisInvoice = (paymentMethod?.toLowerCase() === 'cash' || paymentMethod?.toLowerCase() === 'transfer') ? 'Lunas' : 'Hutang';
      
      const rawFilename = `${namaPelanggan}-${noInvoice}-${tglInvoice}-${jenisInvoice}`;
      const safeFilename = rawFilename.replace(/[^a-zA-Z0-9-_]/g, '_');
      
      pdf.save(`${safeFilename}.pdf`);
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

  const MAX_ITEMS_PER_PAGE = 7;
  const pages = [];
  if (cart && cart.length > 0) {
    for (let i = 0; i < cart.length; i += MAX_ITEMS_PER_PAGE) {
      pages.push(cart.slice(i, i + MAX_ITEMS_PER_PAGE));
    }
  } else {
    pages.push([]);
  }

  const salesName = transaction.kasir?.nama || transaction.sales || 'Admin';
  const printedByName = userData?.nama || user?.displayName || user?.email || 'Admin';
  const isHutang = paymentMethod?.toLowerCase() === 'hutang' || paymentMethod?.toLowerCase() === 'kredit' || paymentMethod?.toLowerCase() === 'bon';
  const isLunas = paymentMethod?.toLowerCase() === 'cash' || paymentMethod?.toLowerCase() === 'transfer';

  return createPortal(
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Preview Nota A4</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button className={styles.closeBtn} onClick={onClose}>
              <X size={24} />
            </button>
          </div>
        </div>

        <div className={styles.content}>
          <div id="nota-content-to-pdf" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {pages.map((pageCart, pageIndex) => {
              const pageEmptyRows = Math.max(0, 7 - pageCart.length);
              const isLastPage = pageIndex === pages.length - 1;
              
              return (
                <div key={pageIndex} id={`nota-page-${pageIndex}`} className={styles.notaWrapper} style={{ pageBreakAfter: isLastPage ? 'auto' : 'always' }}>
                  <div className={styles.invoiceOutline}>
                    {isLunas && <div className={styles.lunasStamp}>LUNAS</div>}
                    
                    {/* TOP SECTION: TITLE */}
                    <div className={styles.invoiceHeaderTitle}>
                      <div className={styles.titleLine}></div>
                      <div className={styles.titleDot}>&bull;</div>
                      <div className={styles.titleText}>INVOICE</div>
                      <div className={styles.titleDot}>&bull;</div>
                      <div className={styles.titleLine}></div>
                    </div>

                    {/* TOP SECTION: DETAILS */}
                    <div className={styles.topSection}>
                      <div className={styles.topLeft}>
                        <table className={styles.detailsBox}>
                          <tbody>
                            <tr>
                              <td style={{ width: '100px', fontWeight: 'bold' }}>No. Invoice</td>
                              <td>: {transaction.noNota || `INV/${id.substring(0,8)}`}</td>
                            </tr>
                            <tr>
                              <td style={{ fontWeight: 'bold' }}>Tanggal</td>
                              <td>: {tanggalStr}</td>
                            </tr>
                            {isHutang && (
                              <tr>
                                <td style={{ fontWeight: 'bold' }}>Jatuh Tempo</td>
                                <td>: {jatuhTempoStr}</td>
                              </tr>
                            )}
                            <tr>
                              <td style={{ fontWeight: 'bold' }}>Lembar</td>
                              <td>: Page {pageIndex + 1} of {pages.length}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <div className={styles.topRight}>
                        <div className={styles.kepadaBox}>
                          <div style={{ marginBottom: '8px' }}>Kepada :</div>
                          <div style={{ fontWeight: 'bold', fontSize: '16px', textTransform: 'uppercase', marginBottom: '8px' }}>
                            {customer?.nama_perusahaan || customer?.nama_pic || customer?.nama || 'Pelanggan Umum'}
                          </div>
                          <div>Telp. {customer?.no_hp || '-'}</div>
                        </div>
                      </div>
                    </div>

                    {/* TABLE SECTION */}
                    <table className={styles.itemsTable}>
                      <thead>
                        <tr>
                          <th style={{ width: '5%' }}>NO.</th>
                          <th style={{ width: '14%' }}>NO KODE</th>
                          <th style={{ width: '24%' }}>NAMA BARANG</th>
                          <th style={{ width: '8%' }}>QTY</th>
                          <th style={{ width: '11%' }}>@HARGA</th>
                          <th style={{ width: '11%' }}>HARGA</th>
                          <th style={{ width: '7%' }}>POTONGAN</th>
                          <th style={{ width: '7%' }}>DISCOUNT</th>
                          <th style={{ width: '13%' }}>TOTAL</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pageCart.map((item, idx) => (
                          <tr key={item.id}>
                            <td className={styles.colCenter}>{pageIndex * 7 + idx + 1}</td>
                            <td className={styles.colCenter}>{item.barcode || item.kode_barang || '-'}</td>
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
                        {Array.from({ length: pageEmptyRows }).map((_, idx) => (
                          <tr key={`empty-${idx}`} className={styles.emptyRow}>
                            <td>&nbsp;</td>
                            <td></td>
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
                          <td colSpan="8" className={styles.grandTotalLabel}>
                            {isLastPage ? 'GRAND TOTAL : IDR' : 'BERSAMBUNG...'}
                          </td>
                          <td className={styles.grandTotalValue}>
                            {isLastPage ? formatRupiah(grandTotal) : '-'}
                          </td>
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
              );
            })}
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
