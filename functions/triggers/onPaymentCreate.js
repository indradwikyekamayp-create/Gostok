const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

module.exports = onDocumentCreated('payments/{docId}', async (event) => {
  const snapshot = event.data;
  if (!snapshot) {
    console.log('No data associated with the event');
    return;
  }

  const data = snapshot.data();
  const alokasi = data.alokasi || [];
  const jumlahBayar = data.jumlah_bayar;
  const customerId = data.pelanggan_id;

  const db = getFirestore();
  const batch = db.batch();

  // 1. Update each referenced sales_transaction
  for (const alloc of alokasi) {
    if (alloc.nota_id && alloc.sisa_hutang_nota_setelah_ini !== undefined) {
      const notaRef = db.collection('sales_transactions').doc(alloc.nota_id);
      const sisa = alloc.sisa_hutang_nota_setelah_ini;
      
      let statusBayar = 'cicil';
      if (sisa <= 0) {
        statusBayar = 'lunas';
      }

      batch.update(notaRef, {
        sisa_hutang: sisa,
        status_bayar: statusBayar
      });
    }
  }

  // 2. Decrement customer total debt
  if (customerId && jumlahBayar) {
    const customerRef = db.collection('customers').doc(customerId);
    batch.update(customerRef, {
      total_hutang_berjalan: FieldValue.increment(-jumlahBayar)
    });
  }

  try {
    await batch.commit();
    console.log(`Successfully processed payment ${event.params.docId}`);
  } catch (error) {
    console.error(`Error processing payment ${event.params.docId}:`, error);
  }
});
