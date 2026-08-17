import { 
  collection, getDocs, query, where, orderBy, 
  addDoc, serverTimestamp, limit as fbLimit
} from 'firebase/firestore';
import { db } from '../config/firebase.js';
import { COLLECTIONS } from '../constants/collections.js';

/**
 * Mencatat pembayaran baru.
 * @param {Object} paymentData - Data pembayaran.
 * @returns {Promise<string>} ID dokumen pembayaran.
 */
export const createPayment = async (paymentData) => {
  try {
    const paymentsRef = collection(db, COLLECTIONS.PAYMENTS);
    const transactionIds = paymentData.alokasi ? paymentData.alokasi.map(a => a.transaction_id) : [];
    
    const docRef = await addDoc(paymentsRef, {
      ...paymentData,
      transaction_ids: transactionIds,
      tanggal_bayar: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error createPayment:", error);
    throw new Error("Gagal mencatat pembayaran");
  }
};

/**
 * Mengambil histori pembayaran dari seorang pelanggan.
 * @param {string} customerId - ID pelanggan.
 * @returns {Promise<Array>}
 */
export const getPaymentsByCustomer = async (customerId) => {
  try {
    const paymentsRef = collection(db, COLLECTIONS.PAYMENTS);
    const q = query(
      paymentsRef, 
      where("customer_id", "==", customerId),
      orderBy("tanggal_bayar", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getPaymentsByCustomer:", error);
    throw new Error("Gagal mengambil histori pembayaran pelanggan");
  }
};

/**
 * Mengambil histori pembayaran berdasarkan rentang tanggal.
 * @param {Date} startDate - Tanggal mulai.
 * @param {Date} endDate - Tanggal akhir.
 * @returns {Promise<Array>}
 */
export const getPaymentsByDate = async (startDate, endDate) => {
  try {
    const paymentsRef = collection(db, COLLECTIONS.PAYMENTS);
    const q = query(
      paymentsRef,
      where("tanggal_bayar", ">=", startDate),
      where("tanggal_bayar", "<=", endDate),
      orderBy("tanggal_bayar", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getPaymentsByDate:", error);
    throw new Error("Gagal mengambil histori pembayaran berdasarkan tanggal");
  }
};

/**
 * Mengambil pembayaran yang terhubung dengan suatu transaksi.
 * @param {string} transactionId - ID transaksi.
 * @returns {Promise<Array>}
 */
export const getPaymentsByTransaction = async (transactionId) => {
  try {
    const paymentsRef = collection(db, COLLECTIONS.PAYMENTS);
    const q = query(
      paymentsRef,
      where("transaction_ids", "array-contains", transactionId)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getPaymentsByTransaction:", error);
    throw new Error("Gagal mengambil data pembayaran transaksi");
  }
};

/**
 * Mengambil pembayaran terakhir (recent payments).
 * @param {number} limitCount - Batas maksimal pembayaran yang diambil.
 * @returns {Promise<Array>}
 */
export const getRecentPayments = async (limitCount = 20) => {
  try {
    const paymentsRef = collection(db, COLLECTIONS.PAYMENTS);
    const q = query(
      paymentsRef,
      orderBy("tanggal_bayar", "desc"),
      fbLimit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getRecentPayments:", error);
    throw new Error("Gagal mengambil data pembayaran terbaru");
  }
};
