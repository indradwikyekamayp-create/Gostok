const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

module.exports = onDocumentCreated('sales_transactions/{docId}', async (event) => {
  const snapshot = event.data;
  if (!snapshot) {
    console.log('No data associated with the event');
    return;
  }

  const data = snapshot.data();
  const items = data.items || [];
  const metodeBayar = data.metode_bayar;
  const totalBayar = data.total_bayar;
  const customerId = data.pelanggan_id;

  const db = getFirestore();
  const batch = db.batch();

  // 1. Decrement product stock
  for (const item of items) {
    if (item.product_id && item.qty) {
      const productRef = db.collection('products').doc(item.product_id);
      batch.update(productRef, {
        stok_saat_ini: FieldValue.increment(-item.qty)
      });
    }
  }

  // 2. Increment customer debt if 'bon'
  if (metodeBayar === 'bon' && customerId && totalBayar) {
    const customerRef = db.collection('customers').doc(customerId);
    batch.update(customerRef, {
      total_hutang_berjalan: FieldValue.increment(totalBayar)
    });
  }

  try {
    await batch.commit();
    console.log(`Successfully processed sale ${event.params.docId}`);
  } catch (error) {
    console.error(`Error processing sale ${event.params.docId}:`, error);
  }
});
