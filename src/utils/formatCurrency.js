/**
 * Format angka ke Rupiah Indonesia.
 * @param {number} amount - Angka yang akan diformat
 * @returns {string} String Rupiah, misal 'Rp 4.270.000'
 */
export function formatCurrency(amount) {
  if (amount == null || isNaN(amount)) return 'Rp 0';
  return 'Rp ' + Math.round(amount).toLocaleString('id-ID');
}

/**
 * Parse string Rupiah kembali ke number.
 * @param {string} str - String Rupiah, misal 'Rp 4.270.000'
 * @returns {number}
 */
export function parseCurrency(str) {
  if (!str) return 0;
  const cleaned = String(str).replace(/[^0-9-]/g, '');
  return parseInt(cleaned, 10) || 0;
}
