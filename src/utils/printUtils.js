import { formatCurrency } from './formatCurrency';
import { formatDate } from './formatDate';

const COMPANY_NAME = 'PT. WELINDO SUKSES BERSAMA';
const COMPANY_ADDRESS = 'Alamat: [Akan dilengkapi]';
const COMPANY_PHONE = 'No. HP: [Akan dilengkapi]';

/**
 * Generate HTML string untuk nota.
 */
export function generateNotaHTML(transaction) {
  const separator = '============================================';
  const dash = '--------------------------------------------';

  let itemsText = '';
  if (transaction.items && transaction.items.length > 0) {
    transaction.items.forEach(item => {
      const line = `${(item.barcode || '').substring(0, 10).padEnd(11)}| ${(item.nama_barang || '').substring(0, 12).padEnd(13)}| ${String(item.qty).padStart(3)} | ${formatCurrency(item.harga_jual).padStart(9)} | ${formatCurrency(item.subtotal).padStart(11)}`;
      itemsText += line + '\n';
    });
  }

  return `
${separator}
        ${COMPANY_NAME}
        ${COMPANY_ADDRESS}
        ${COMPANY_PHONE}
${separator}
No. Nota   : ${transaction.no_nota || '-'}
Tanggal    : ${formatDate(transaction.tanggal || new Date())}
Pembeli    : ${transaction.nama_pelanggan || '-'}
${dash}
Kode Brg   | Nama Barang   | Qty |     Harga |      Jumlah
${dash}
${itemsText}${dash}
                          TOTAL: ${formatCurrency(transaction.total_bayar)}
                     Metode Bayar: ${(transaction.metode_bayar || '-').toUpperCase()}

                                   TTD Pembeli


                                   (___________)
${separator}
`.trim();
}

/**
 * Trigger print dialog.
 */
export function printNota() {
  window.print();
}
