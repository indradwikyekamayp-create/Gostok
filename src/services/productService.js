import { 
  collection, doc, getDoc, getDocs, query, where, 
  setDoc, updateDoc, deleteDoc, onSnapshot, serverTimestamp 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase.js';
import { COLLECTIONS } from '../constants/collections.js';

/**
 * Listener untuk produk secara realtime.
 * @param {Function} callback - Fungsi callback yang menerima array produk.
 * @returns {Function} Fungsi unsubscribe.
 */
export const getProductsRealtime = (callback) => {
  const productsRef = collection(db, COLLECTIONS.PRODUCTS);
  return onSnapshot(productsRef, (snapshot) => {
    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(products);
  }, (error) => {
    console.error("Error getProductsRealtime:", error);
    throw new Error("Gagal mengambil data produk secara realtime");
  });
};

/**
 * Mendapatkan data produk berdasarkan barcode.
 * @param {string} barcode - Barcode produk.
 * @returns {Promise<Object|null>} Data produk atau null jika tidak ditemukan.
 */
export const getProductByBarcode = async (barcode) => {
  try {
    const productRef = doc(db, COLLECTIONS.PRODUCTS, barcode);
    const productSnap = await getDoc(productRef);
    if (productSnap.exists()) {
      return { id: productSnap.id, ...productSnap.data() };
    }
    return null;
  } catch (error) {
    console.error("Error getProductByBarcode:", error);
    throw new Error("Gagal mengambil data produk");
  }
};

/**
 * Mencari produk berdasarkan nama (prefix search).
 * @param {string} searchTerm - Kata kunci pencarian.
 * @returns {Promise<Array>} Array produk yang cocok.
 */
export const searchProducts = async (searchTerm) => {
  try {
    const productsRef = collection(db, COLLECTIONS.PRODUCTS);
    const q = query(
      productsRef,
      where("nama_barang", ">=", searchTerm),
      where("nama_barang", "<=", searchTerm + '\uf8ff')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error searchProducts:", error);
    throw new Error("Gagal mencari produk");
  }
};

/**
 * Membuat produk baru dengan ID berupa barcode.
 * @param {Object} productData - Data produk.
 * @returns {Promise<void>}
 */
export const createProduct = async (productData) => {
  try {
    if (!productData.barcode) {
      throw new Error("Barcode tidak boleh kosong");
    }
    const productRef = doc(db, COLLECTIONS.PRODUCTS, productData.barcode);
    await setDoc(productRef, {
      ...productData,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error createProduct:", error);
    throw new Error("Gagal menambahkan produk baru: " + error.message);
  }
};

/**
 * Mengupdate data produk.
 * @param {string} barcode - Barcode produk.
 * @param {Object} updates - Data yang akan diupdate.
 * @returns {Promise<void>}
 */
export const updateProduct = async (barcode, updates) => {
  try {
    const productRef = doc(db, COLLECTIONS.PRODUCTS, barcode);
    await updateDoc(productRef, {
      ...updates,
      updated_at: serverTimestamp()
    });
  } catch (error) {
    console.error("Error updateProduct:", error);
    throw new Error("Gagal mengubah data produk");
  }
};

/**
 * Menghapus produk.
 * @param {string} barcode - Barcode produk.
 * @returns {Promise<void>}
 */
export const deleteProduct = async (barcode) => {
  try {
    const productRef = doc(db, COLLECTIONS.PRODUCTS, barcode);
    await deleteDoc(productRef);
  } catch (error) {
    console.error("Error deleteProduct:", error);
    throw new Error("Gagal menghapus produk");
  }
};

/**
 * Mengunggah foto produk ke Firebase Storage.
 * @param {string} barcode - Barcode produk.
 * @param {File} file - File gambar.
 * @returns {Promise<string>} URL download gambar.
 */
export const uploadProductPhoto = async (barcode, file) => {
  try {
    const storageRef = ref(storage, `products/${barcode}/${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error("Error uploadProductPhoto:", error);
    throw new Error("Gagal mengunggah foto produk");
  }
};

/**
 * Mendapatkan daftar produk berdasarkan kategori.
 * @param {string} category - Kategori produk.
 * @returns {Promise<Array>} Array produk.
 */
export const getProductsByCategory = async (category) => {
  try {
    const productsRef = collection(db, COLLECTIONS.PRODUCTS);
    const q = query(productsRef, where("kategori", "==", category));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getProductsByCategory:", error);
    throw new Error("Gagal mengambil produk berdasarkan kategori");
  }
};

/**
 * Mendapatkan produk yang stoknya menipis.
 * @param {number} threshold - Batas minimum stok.
 * @returns {Promise<Array>} Array produk dengan stok menipis.
 */
export const getLowStockProducts = async (threshold = 10) => {
  try {
    const productsRef = collection(db, COLLECTIONS.PRODUCTS);
    const q = query(productsRef, where("stok_saat_ini", "<=", threshold));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getLowStockProducts:", error);
    throw new Error("Gagal mengambil produk stok menipis");
  }
};
