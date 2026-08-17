import React, { useEffect } from 'react';
import { Printer, X } from 'lucide-react';
import styles from './NotaPreview.module.css';

const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number);
};

const padString = (str, length, align = 'left') => {
  const s = String(str);
  if (s.length >= length) return s.substring(0, length);
  if (align === 'right') return s.padStart(length, ' ');
  return s.padEnd(length, ' ');
};

export default function NotaPreview({ transaction, onClose }) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (!transaction) return null;

  const { id, tanggal, customer, cart, paymentMethod, grandTotal } = transaction;

  return (
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
            <pre className={styles.notaPre}>
{`============================================
        PT. WELINDO SUKSES BERSAMA
        Jl. Contoh Alamat Toko No. 123
        No. HP: 0812-3456-7890
============================================
No. Nota   : ${id}
Tanggal    : ${tanggal}
Pembeli    : ${customer.nama_perusahaan}
--------------------------------------------
Kode Brg | Nama Barang | Qty | Harga | Jumlah
`}
{cart.map(item => {
  const kode = padString(item.kode_barang, 8);
  const nama = padString(item.nama_barang, 11);
  const qty = padString(item.qty, 3, 'right');
  const harga = padString(formatRupiah(item.harga_jual), 5, 'right');
  const jumlah = padString(formatRupiah(item.subtotal), 6, 'right');
  return `${kode} | ${nama} | ${qty} | ${harga} | ${jumlah}\n`;
}).join('')}
{`--------------------------------------------
                          TOTAL: Rp ${formatRupiah(grandTotal)}
                     Metode Bayar: ${paymentMethod}

                                   TTD Pembeli


                                   (___________)
============================================`}
            </pre>
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.btnSecondary} onClick={onClose}>
            Tutup
          </button>
          <button className={styles.btnPrimary} onClick={handlePrint}>
            <Printer size={20} />
            Cetak Nota
          </button>
        </div>
      </div>
    </div>
  );
}
