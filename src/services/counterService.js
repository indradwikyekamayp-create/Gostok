import { doc, runTransaction } from 'firebase/firestore';
import { db } from '../config/firebase.js';
import { COLLECTIONS } from '../constants/collections.js';

/**
 * Menghasilkan nomor nota berikutnya secara aman dengan Transaction Firestore.
 * @returns {Promise<string>} Nomor nota yang dihasilkan (misal: INV-20260817-0001).
 */
export const getNextNotaNumber = async () => {
  try {
    const counterRef = doc(db, COLLECTIONS.COUNTERS, 'nota_counter');
    
    return await runTransaction(db, async (transaction) => {
      const counterDoc = await transaction.get(counterRef);
      
      const today = new Date();
      // Format tanggal YYYYMMDD
      const dateString = today.getFullYear().toString() + 
                         (today.getMonth() + 1).toString().padStart(2, '0') + 
                         today.getDate().toString().padStart(2, '0');
                         
      let nextNumber = 1;

      if (!counterDoc.exists()) {
        transaction.set(counterRef, {
          last_reset_date: dateString,
          last_number: nextNumber
        });
      } else {
        const data = counterDoc.data();
        if (data.last_reset_date === dateString) {
          nextNumber = data.last_number + 1;
        }
        transaction.update(counterRef, {
          last_reset_date: dateString,
          last_number: nextNumber
        });
      }

      const formattedNumber = nextNumber.toString().padStart(4, '0');
      return `INV-${dateString}-${formattedNumber}`;
    });
  } catch (error) {
    console.error("Error getNextNotaNumber:", error);
    throw new Error("Gagal menghasilkan nomor nota");
  }
};
