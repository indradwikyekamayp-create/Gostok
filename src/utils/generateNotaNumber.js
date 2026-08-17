import { formatDateForId } from './formatDate';

/**
 * Generate nomor nota format: INV-YYYYMMDD-NNNN
 * @param {number} lastNumber - Nomor terakhir hari ini
 * @param {Date} [date] - Tanggal (default: hari ini)
 * @returns {string} Nomor nota, misal 'INV-20260817-0001'
 */
export function generateNotaNumber(lastNumber = 0, date = new Date()) {
  const dateStr = formatDateForId(date);
  const nextNumber = lastNumber + 1;
  const paddedNumber = String(nextNumber).padStart(4, '0');
  return `INV-${dateStr}-${paddedNumber}`;
}
