/** Validasi barcode: non-empty string */
export function validateBarcode(barcode) {
  if (!barcode || typeof barcode !== 'string' || barcode.trim().length === 0) {
    return 'Barcode tidak boleh kosong';
  }
  return null;
}

/** Validasi qty: bilangan positif */
export function validateQty(qty) {
  const n = Number(qty);
  if (isNaN(n) || n <= 0 || !Number.isInteger(n)) {
    return 'Jumlah harus bilangan bulat positif';
  }
  return null;
}

/** Validasi harga: non-negative number */
export function validatePrice(price) {
  const n = Number(price);
  if (isNaN(n) || n < 0) {
    return 'Harga tidak boleh negatif';
  }
  return null;
}

/** Validasi nomor HP */
export function validatePhone(phone) {
  if (!phone) return null; // opsional
  const cleaned = phone.replace(/[\s-]/g, '');
  if (!/^0[0-9]{8,13}$/.test(cleaned)) {
    return 'Format nomor HP tidak valid (contoh: 08123456789)';
  }
  return null;
}

/** Validasi field wajib */
export function validateRequired(value, fieldName) {
  if (value == null || String(value).trim().length === 0) {
    return `${fieldName} wajib diisi`;
  }
  return null;
}

/** Validasi email */
export function validateEmail(email) {
  if (!email) return 'Email wajib diisi';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return 'Format email tidak valid';
  }
  return null;
}
