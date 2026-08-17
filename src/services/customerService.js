import { 
  collection, doc, getDoc, getDocs, query, where, 
  addDoc, updateDoc, deleteDoc, onSnapshot, serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase.js';
import { COLLECTIONS } from '../constants/collections.js';

/**
 * Listener untuk data pelanggan secara realtime.
 * @param {Function} callback - Callback yang menerima array pelanggan.
 * @returns {Function} Unsubscribe function.
 */
export const getCustomersRealtime = (callback) => {
  const customersRef = collection(db, COLLECTIONS.CUSTOMERS);
  return onSnapshot(customersRef, (snapshot) => {
    const customers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(customers);
  }, (error) => {
    console.error("Error getCustomersRealtime:", error);
    throw new Error("Gagal mengambil data pelanggan secara realtime");
  });
};

/**
 * Mendapatkan pelanggan berdasarkan ID.
 * @param {string} customerId - ID Pelanggan.
 * @returns {Promise<Object|null>}
 */
export const getCustomerById = async (customerId) => {
  try {
    const docRef = doc(db, COLLECTIONS.CUSTOMERS, customerId);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() };
    }
    return null;
  } catch (error) {
    console.error("Error getCustomerById:", error);
    throw new Error("Gagal mengambil data pelanggan");
  }
};

/**
 * Membuat data pelanggan baru.
 * @param {Object} customerData - Data pelanggan.
 * @returns {Promise<string>} ID pelanggan baru.
 */
export const createCustomer = async (customerData) => {
  try {
    const customersRef = collection(db, COLLECTIONS.CUSTOMERS);
    const docRef = await addDoc(customersRef, {
      ...customerData,
      created_at: serverTimestamp(),
      total_hutang_berjalan: 0
    });
    return docRef.id;
  } catch (error) {
    console.error("Error createCustomer:", error);
    throw new Error("Gagal menambahkan pelanggan baru");
  }
};

/**
 * Memperbarui data pelanggan.
 * @param {string} customerId - ID pelanggan.
 * @param {Object} updates - Data yang akan diperbarui.
 * @returns {Promise<void>}
 */
export const updateCustomer = async (customerId, updates) => {
  try {
    const docRef = doc(db, COLLECTIONS.CUSTOMERS, customerId);
    await updateDoc(docRef, updates);
  } catch (error) {
    console.error("Error updateCustomer:", error);
    throw new Error("Gagal memperbarui data pelanggan");
  }
};

/**
 * Menghapus data pelanggan (Peringatan: pastikan tidak ada transaksi terkait).
 * @param {string} customerId - ID pelanggan.
 * @returns {Promise<void>}
 */
export const deleteCustomer = async (customerId) => {
  try {
    const docRef = doc(db, COLLECTIONS.CUSTOMERS, customerId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleteCustomer:", error);
    throw new Error("Gagal menghapus data pelanggan");
  }
};

/**
 * Mencari pelanggan berdasarkan nama perusahaan.
 * @param {string} searchTerm - Kata kunci pencarian.
 * @returns {Promise<Array>}
 */
export const searchCustomers = async (searchTerm) => {
  try {
    const customersRef = collection(db, COLLECTIONS.CUSTOMERS);
    const q = query(
      customersRef,
      where("nama_perusahaan", ">=", searchTerm),
      where("nama_perusahaan", "<=", searchTerm + '\uf8ff')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error searchCustomers:", error);
    throw new Error("Gagal mencari pelanggan");
  }
};

/**
 * Mendapatkan daftar pelanggan yang memiliki hutang.
 * @returns {Promise<Array>}
 */
export const getCustomersWithDebt = async () => {
  try {
    const customersRef = collection(db, COLLECTIONS.CUSTOMERS);
    const q = query(customersRef, where("total_hutang_berjalan", ">", 0));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getCustomersWithDebt:", error);
    throw new Error("Gagal mengambil data pelanggan berhutang");
  }
};

/**
 * Memperbarui total hutang pelanggan.
 * @param {string} customerId - ID pelanggan.
 * @param {number} newTotalHutang - Total hutang baru.
 * @returns {Promise<void>}
 */
export const updateCustomerDebt = async (customerId, newTotalHutang) => {
  try {
    const docRef = doc(db, COLLECTIONS.CUSTOMERS, customerId);
    await updateDoc(docRef, { total_hutang_berjalan: newTotalHutang });
  } catch (error) {
    console.error("Error updateCustomerDebt:", error);
    throw new Error("Gagal memperbarui total hutang pelanggan");
  }
};
