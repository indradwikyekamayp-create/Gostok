const { getFirestore } = require('firebase-admin/firestore');

const getDocument = async (collection, docId) => {
  const db = getFirestore();
  const doc = await db.collection(collection).doc(docId).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
};

const updateDocument = async (collection, docId, data) => {
  const db = getFirestore();
  await db.collection(collection).doc(docId).update(data);
};

const logOperation = (operation, details) => {
  console.log(`[${new Date().toISOString()}] ${operation}:`, details);
};

module.exports = {
  getDocument,
  updateDocument,
  logOperation
};
