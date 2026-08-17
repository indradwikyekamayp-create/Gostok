import { 
  collection, doc, getDoc, getDocs, query, where, 
  addDoc, deleteDoc, serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase.js';
import { COLLECTIONS } from '../constants/collections.js';

/**
 * Mencatat stok masuk baru.
 * @param {Object} stockInData - Data stok masuk.
 * @returns {Promise<string>} ID dokumen stok masuk.
 */
export const createStockIn = async (stockInData) => {
  try {
    const stockInRef = collection(db, COLLECTIONS.STOCK_IN);
    const docRef = await addDoc(stockInRef, {
      ...stockInData,
      tanggal: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error createStockIn:", error);
    throw new Error("Gagal mencatat stok masuk");
  }
};

/**
 * Mengambil histori stok masuk berdasarkan rentang waktu.
 * @param {Date} startDate - Tanggal mulai.
 * @param {Date} endDate - Tanggal akhir.
 * @returns {Promise<Array>}
 */
export const getStockInByDate = async (startDate, endDate) => {
  try {
    const stockInRef = collection(db, COLLECTIONS.STOCK_IN);
    const q = query(
      stockInRef, 
      where("tanggal", ">=", startDate),
      where("tanggal", "<=", endDate)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getStockInByDate:", error);
    throw new Error("Gagal mengambil histori stok masuk");
  }
};

/**
 * Mengambil histori stok masuk untuk suatu produk.
 * @param {string} productId - ID/Barcode produk.
 * @returns {Promise<Array>}
 */
export const getStockInByProduct = async (productId) => {
  try {
    const stockInRef = collection(db, COLLECTIONS.STOCK_IN);
    const q = query(stockInRef, where("product_id", "==", productId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getStockInByProduct:", error);
    throw new Error("Gagal mengambil histori stok masuk produk");
  }
};

/**
 * Mengambil stok masuk hari ini.
 * @returns {Promise<Array>}
 */
export const getStockInToday = async () => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    
    return await getStockInByDate(start, end);
  } catch (error) {
    console.error("Error getStockInToday:", error);
    throw new Error("Gagal mengambil stok masuk hari ini");
  }
};

/**
 * Menghapus data stok masuk (jarang digunakan).
 * @param {string} docId - ID dokumen stok masuk.
 * @returns {Promise<void>}
 */
export const deleteStockIn = async (docId) => {
  try {
    const docRef = doc(db, COLLECTIONS.STOCK_IN, docId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleteStockIn:", error);
    throw new Error("Gagal menghapus data stok masuk");
  }
};
