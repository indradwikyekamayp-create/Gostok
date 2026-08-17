import { collection, getDocs, query, where, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase.js';
import { COLLECTIONS } from '../constants/collections.js';

/**
 * Menghasilkan laporan penjualan.
 * @param {Date} startDate - Tanggal mulai.
 * @param {Date} endDate - Tanggal akhir.
 * @returns {Promise<Object>}
 */
export const getSalesReport = async (startDate, endDate) => {
  try {
    const txRef = collection(db, COLLECTIONS.SALES_TRANSACTIONS);
    const q = query(txRef, where("tanggal", ">=", startDate), where("tanggal", "<=", endDate));
    const snapshot = await getDocs(q);
    
    const transactions = snapshot.docs.map(doc => doc.data());
    const totalPenjualan = transactions.reduce((sum, tx) => sum + (tx.total_bayar || 0), 0);
    const jumlahTransaksi = transactions.length;
    const rataRata = jumlahTransaksi > 0 ? totalPenjualan / jumlahTransaksi : 0;
    
    return {
      totalPenjualan,
      jumlahTransaksi,
      rataRata
    };
  } catch (error) {
    console.error("Error getSalesReport:", error);
    throw new Error("Gagal mengambil laporan penjualan");
  }
};

/**
 * Menghasilkan ringkasan penjualan harian.
 * @param {Date} startDate - Tanggal mulai.
 * @param {Date} endDate - Tanggal akhir.
 * @returns {Promise<Array>}
 */
export const getDailySales = async (startDate, endDate) => {
  try {
    const txRef = collection(db, COLLECTIONS.SALES_TRANSACTIONS);
    const q = query(txRef, where("tanggal", ">=", startDate), where("tanggal", "<=", endDate));
    const snapshot = await getDocs(q);
    
    const dailyMap = {};
    snapshot.docs.forEach(docSnap => {
      const data = docSnap.data();
      const dateStr = data.tanggal?.toDate().toISOString().split('T')[0];
      if (!dateStr) return;
      
      if (!dailyMap[dateStr]) {
        dailyMap[dateStr] = { date: dateStr, total: 0, count: 0 };
      }
      dailyMap[dateStr].total += (data.total_bayar || 0);
      dailyMap[dateStr].count += 1;
    });
    
    return Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error("Error getDailySales:", error);
    throw new Error("Gagal mengambil penjualan harian");
  }
};

/**
 * Menghasilkan laporan stok.
 * @returns {Promise<Array>}
 */
export const getStockReport = async () => {
  try {
    const productsRef = collection(db, COLLECTIONS.PRODUCTS);
    const snapshot = await getDocs(productsRef);
    let products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    products.sort((a, b) => (a.stok_saat_ini || 0) - (b.stok_saat_ini || 0));
    return products;
  } catch (error) {
    console.error("Error getStockReport:", error);
    throw new Error("Gagal mengambil laporan stok");
  }
};

/**
 * Menghasilkan laporan piutang pelanggan.
 * @returns {Promise<Array>}
 */
export const getPiutangReport = async () => {
  try {
    const customersRef = collection(db, COLLECTIONS.CUSTOMERS);
    const q = query(customersRef, where("total_hutang_berjalan", ">", 0));
    const snapshot = await getDocs(q);
    const debtors = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    const txRef = collection(db, COLLECTIONS.SALES_TRANSACTIONS);
    for (let debtor of debtors) {
      const txQ = query(
        txRef, 
        where("pelanggan_id", "==", debtor.id),
        where("status_bayar", "!=", "lunas")
      );
      const txSnap = await getDocs(txQ);
      debtor.unpaid_transactions = txSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    
    return debtors;
  } catch (error) {
    console.error("Error getPiutangReport:", error);
    throw new Error("Gagal mengambil laporan piutang");
  }
};

/**
 * Menghitung laporan keuntungan berdasarkan margin produk.
 * Catatan: Memerlukan akses baca ke produk untuk harga modal.
 * @param {Date} startDate - Tanggal mulai.
 * @param {Date} endDate - Tanggal akhir.
 * @returns {Promise<number>}
 */
export const getKeuntunganReport = async (startDate, endDate) => {
  try {
    const txRef = collection(db, COLLECTIONS.SALES_TRANSACTIONS);
    const q = query(txRef, where("tanggal", ">=", startDate), where("tanggal", "<=", endDate));
    const snapshot = await getDocs(q);
    
    let totalMargin = 0;
    const productsCache = {};
    
    for (let docSnap of snapshot.docs) {
      const txData = docSnap.data();
      if (!txData.items) continue;
      
      for (let item of txData.items) {
        if (!productsCache[item.product_id]) {
          const productDoc = await getDoc(doc(db, COLLECTIONS.PRODUCTS, item.product_id));
          productsCache[item.product_id] = productDoc.exists() ? productDoc.data() : null;
        }
        
        const product = productsCache[item.product_id];
        if (product && product.harga_modal) {
          totalMargin += (item.harga_jual - product.harga_modal) * item.qty;
        }
      }
    }
    return totalMargin;
  } catch (error) {
    console.error("Error getKeuntunganReport:", error);
    throw new Error("Gagal mengambil laporan keuntungan");
  }
};

/**
 * Mendapatkan produk terlaris.
 * @param {Date} startDate - Tanggal mulai.
 * @param {Date} endDate - Tanggal akhir.
 * @param {number} limitCount - Batas maksimal data.
 * @returns {Promise<Array>}
 */
export const getTopProducts = async (startDate, endDate, limitCount = 5) => {
  try {
    const txRef = collection(db, COLLECTIONS.SALES_TRANSACTIONS);
    const q = query(txRef, where("tanggal", ">=", startDate), where("tanggal", "<=", endDate));
    const snapshot = await getDocs(q);
    
    const productSales = {};
    snapshot.docs.forEach(docSnap => {
      const data = docSnap.data();
      if (data.items) {
        data.items.forEach(item => {
          if (!productSales[item.product_id]) {
            productSales[item.product_id] = { product_id: item.product_id, nama_barang: item.nama_barang, qty_sold: 0 };
          }
          productSales[item.product_id].qty_sold += item.qty;
        });
      }
    });
    
    return Object.values(productSales)
      .sort((a, b) => b.qty_sold - a.qty_sold)
      .slice(0, limitCount);
  } catch (error) {
    console.error("Error getTopProducts:", error);
    throw new Error("Gagal mengambil data produk terlaris");
  }
};

/**
 * Mendapatkan pelanggan dengan hutang terbanyak.
 * @param {number} limitCount - Batas maksimal data.
 * @returns {Promise<Array>}
 */
export const getTopDebtors = async (limitCount = 5) => {
  try {
    const customersRef = collection(db, COLLECTIONS.CUSTOMERS);
    const q = query(customersRef, where("total_hutang_berjalan", ">", 0));
    const snapshot = await getDocs(q);
    
    let debtors = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return debtors
      .sort((a, b) => (b.total_hutang_berjalan || 0) - (a.total_hutang_berjalan || 0))
      .slice(0, limitCount);
  } catch (error) {
    console.error("Error getTopDebtors:", error);
    throw new Error("Gagal mengambil data debitur teratas");
  }
};
