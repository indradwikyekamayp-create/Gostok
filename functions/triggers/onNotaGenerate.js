const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

module.exports = onCall(async (request) => {
  const { auth } = request;
  
  if (!auth) {
    throw new HttpsError('unauthenticated', 'User must be logged in to generate nota number.');
  }

  const db = getFirestore();
  const counterRef = db.collection('counters').doc('nota_counter');

  try {
    const result = await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(counterRef);
      let currentNumber = 1;
      const todayStr = new Date().toISOString().split('T')[0].replace(/-/g, ''); // YYYYMMDD

      if (!doc.exists) {
        transaction.set(counterRef, { count: 1, date: todayStr });
      } else {
        const data = doc.data();
        if (data.date === todayStr) {
          currentNumber = data.count + 1;
          transaction.update(counterRef, { count: currentNumber });
        } else {
          transaction.set(counterRef, { count: 1, date: todayStr });
        }
      }

      const paddedNumber = String(currentNumber).padStart(4, '0');
      return `INV-${todayStr}-${paddedNumber}`;
    });

    return { nota_number: result };
  } catch (error) {
    console.error('Error generating nota number:', error);
    throw new HttpsError('internal', 'Error generating nota number');
  }
});
