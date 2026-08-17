import { 
  collection, doc, getDoc, getDocs, query, where, orderBy, 
  addDoc, updateDoc, serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase.js';
import { COLLECTIONS } from '../constants/collections.js';

/**
 * Membuat transaksi penjualan baru.
 * @param {Object} transactionData - Data transaksi.
 * @returns {Promise<string>} ID transaksi.
 */
export const createTransaction = async (transactionData) => {
  try {
    const transactionsRef = collection(db, COLLECTIONS.SALES_TRANSACTIONS);
    const docRef = await addDoc(transactionsRef, {
      ...transactionData,
      created_at: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error createTransaction:", error);
    throw new Error("Gagal mencatat transaksi penjualan");
  }
};

/**
 * Mendapatkan transaksi berdasarkan ID.
 * @param {string} transactionId - ID Transaksi.
 * @returns {Promise<Object|null>}
 */
export const getTransactionById = async (transactionId) => {
  try {
    const docRef = doc(db, COLLECTIONS.SALES_TRANSACTIONS, transactionId);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() };
    }
    return null;
  } catch (error) {
    console.error("Error getTransactionById:", error);
    throw new Error("Gagal mengambil data transaksi");
  }
};

/**
 * Mendapatkan transaksi berdasarkan rentang tanggal.
 * @param {Date} startDate - Tanggal mulai.
 * @param {Date} endDate - Tanggal akhir.
 * @returns {Promise<Array>}
 */
export const getTransactionsByDate = async (startDate, endDate) => {
  try {
    const transactionsRef = collection(db, COLLECTIONS.SALES_TRANSACTIONS);
    const q = query(
      transactionsRef,
      where("tanggal", ">=", startDate),
      where("tanggal", "<=", endDate),
      orderBy("tanggal", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getTransactionsByDate:", error);
    throw new Error("Gagal mengambil transaksi berdasarkan tanggal");
  }
};

/**
 * Mendapatkan transaksi berdasarkan pelanggan.
 * @param {string} customerId - ID Pelanggan.
 * @returns {Promise<Array>}
 */
export const getTransactionsByCustomer = async (customerId) => {
  try {
    const transactionsRef = collection(db, COLLECTIONS.SALES_TRANSACTIONS);
    const q = query(transactionsRef, where("pelanggan_id", "==", customerId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getTransactionsByCustomer:", error);
    throw new Error("Gagal mengambil transaksi pelanggan");
  }
};

/**
 * Mendapatkan transaksi berdasarkan status pembayaran.
 * @param {string} status - Status pembayaran.
 * @returns {Promise<Array>}
 */
export const getTransactionsByStatus = async (status) => {
  try {
    const transactionsRef = collection(db, COLLECTIONS.SALES_TRANSACTIONS);
    const q = query(transactionsRef, where("status_bayar", "==", status));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getTransactionsByStatus:", error);
    throw new Error("Gagal mengambil transaksi berdasarkan status");
  }
};

/**
 * Mendapatkan transaksi dengan filter gabungan.
 * @param {Object} filters - Objek filter (dateRange, customerId, status).
 * @returns {Promise<Array>}
 */
export const getTransactionsFiltered = async (filters) => {
  try {
    const transactionsRef = collection(db, COLLECTIONS.SALES_TRANSACTIONS);
    let conditions = [];
    
    if (filters.dateRange) {
      conditions.push(where("tanggal", ">=", filters.dateRange.start));
      conditions.push(where("tanggal", "<=", filters.dateRange.end));
    }
    if (filters.customerId) {
      conditions.push(where("pelanggan_id", "==", filters.customerId));
    }
    if (filters.status) {
      conditions.push(where("status_bayar", "==", filters.status));
    }
    
    // Warning: Complex queries might require composite indexes in Firestore
    const q = query(transactionsRef, ...conditions);
    const snapshot = await getDocs(q);
    let results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    if (filters.productBarcode) {
      results = results.filter(tx => 
        tx.items && tx.items.some(item => item.product_id === filters.productBarcode)
      );
    }
    
    return results;
  } catch (error) {
    console.error("Error getTransactionsFiltered:", error);
    throw new Error("Gagal mengambil transaksi yang difilter");
  }
};

/**
 * Mendapatkan transaksi belum lunas milik seorang pelanggan.
 * @param {string} customerId - ID Pelanggan.
 * @returns {Promise<Array>}
 */
export const getUnpaidTransactionsByCustomer = async (customerId) => {
  try {
    const transactionsRef = collection(db, COLLECTIONS.SALES_TRANSACTIONS);
    const q = query(
      transactionsRef,
      where("pelanggan_id", "==", customerId),
      where("status_bayar", "!=", "lunas"),
      orderBy("status_bayar"),
      orderBy("tanggal", "asc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getUnpaidTransactionsByCustomer:", error);
    throw new Error("Gagal mengambil transaksi belum lunas pelanggan");
  }
};

/**
 * Memperbarui status pembayaran transaksi.
 * @param {string} transactionId - ID Transaksi.
 * @param {number} newSisaHutang - Sisa hutang baru.
 * @param {string} newStatus - Status pembayaran baru.
 * @returns {Promise<void>}
 */
export const updateTransactionPayment = async (transactionId, newSisaHutang, newStatus) => {
  try {
    const docRef = doc(db, COLLECTIONS.SALES_TRANSACTIONS, transactionId);
    await updateDoc(docRef, {
      sisa_hutang: newSisaHutang,
      status_bayar: newStatus
    });
  } catch (error) {
    console.error("Error updateTransactionPayment:", error);
    throw new Error("Gagal memperbarui status pembayaran transaksi");
  }
};

/**
 * Mengambil daftar transaksi hari ini.
 * @returns {Promise<Array>}
 */
export const getTodayTransactions = async () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return await getTransactionsByDate(start, end);
};

/**
 * Menghitung total penjualan hari ini.
 * @returns {Promise<number>}
 */
export const getTodaySalesTotal = async () => {
  try {
    const todayTransactions = await getTodayTransactions();
    return todayTransactions.reduce((total, tx) => total + (tx.total_bayar || 0), 0);
  } catch (error) {
    console.error("Error getTodaySalesTotal:", error);
    throw new Error("Gagal menghitung total penjualan hari ini");
  }
};
