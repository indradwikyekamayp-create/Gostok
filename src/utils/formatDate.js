const BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

/**
 * Konversi Firestore Timestamp atau Date ke Date object.
 */
function toDate(value) {
  if (!value) return new Date();
  if (value.toDate) return value.toDate(); // Firestore Timestamp
  if (value instanceof Date) return value;
  return new Date(value);
}

/** Format: '17 Agustus 2026' */
export function formatDate(date) {
  const d = toDate(date);
  return `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
}

/** Format: '17 Agustus 2026, 14:30' */
export function formatDateTime(date) {
  const d = toDate(date);
  const hours = String(d.getHours()).padStart(2, '0');
  const mins = String(d.getMinutes()).padStart(2, '0');
  return `${formatDate(d)}, ${hours}:${mins}`;
}

/** Format: '17/08/2026' */
export function formatDateShort(date) {
  const d = toDate(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${d.getFullYear()}`;
}

/** Format: '20260817' (for nota number) */
export function formatDateForId(date) {
  const d = toDate(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

/** Get month name in Indonesian */
export function getMonthName(month) {
  return BULAN[month] || '';
}

/** Relative date: 'Hari ini', 'Kemarin', '3 hari lalu' */
export function formatRelativeDate(date) {
  const d = toDate(date);
  const now = new Date();
  const diffTime = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hari ini';
  if (diffDays === 1) return 'Kemarin';
  if (diffDays < 7) return `${diffDays} hari lalu`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} minggu lalu`;
  return formatDate(d);
}
