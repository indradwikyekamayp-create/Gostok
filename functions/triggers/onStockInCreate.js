const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

module.exports = onDocumentCreated('stock_in/{docId}', async (event) => {
  const snapshot = event.data;
  if (!snapshot) {
    console.log('No data associated with the event');
    return;
  }

  const data = snapshot.data();
  const productId = data.product_id;
  const qty = data.qty;

  if (!productId || typeof qty !== 'number') {
    console.error('Invalid stock_in document: missing product_id or qty');
    return;
  }

  const db = getFirestore();
  const productRef = db.collection('products').doc(productId);

  try {
    await productRef.update({
      stok_saat_ini: FieldValue.increment(qty)
    });
    console.log(`Successfully incremented stock for product ${productId} by ${qty}`);
  } catch (error) {
    console.error(`Error updating stock for product ${productId}:`, error);
  }
});
