import React, { useState } from 'react';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import PaymentReceiptPreview from '../pages/pelanggan/PaymentReceiptPreview';
import { Search, X } from 'lucide-react';

const LacakStrukModal = ({ onClose }) => {
  const [refId, setRefId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // States to pass to PaymentReceiptPreview
  const [foundPayment, setFoundPayment] = useState(null);
  const [foundCustomer, setFoundCustomer] = useState(null);
  const [foundNotas, setFoundNotas] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!refId.trim()) return;

    // Clean up input (remove '#' and 'Ref:' if user copy-pasted)
    let cleanId = refId.replace('Ref: ', '').replace('#', '').trim();

    setLoading(true);
    setError('');
    
    try {
      // Find the payment document
      // Since they might only have the first 8 characters, we can't do a direct doc() lookup if we don't have the full ID.
      // But wait! Firestore doc IDs are 20 chars long. The receipt prints `payment.id.substring(0, 8)`.
      // We need to query all payments and find the one that starts with this ID.
      const paymentsRef = collection(db, 'payments');
      const snap = await getDocs(paymentsRef);
      
      let matchedPayment = null;
      snap.forEach(d => {
        if (d.id.toUpperCase().startsWith(cleanId.toUpperCase())) {
          matchedPayment = { id: d.id, ...d.data() };
        }
      });

      if (!matchedPayment) {
        setError('Struk dengan nomor referensi tersebut tidak ditemukan.');
        setLoading(false);
        return;
      }

      // Fetch customer
      let customerData = { nama_perusahaan: 'Pelanggan Umum' };
      if (matchedPayment.customer_id) {
        const custSnap = await getDoc(doc(db, 'customers', matchedPayment.customer_id));
        if (custSnap.exists()) {
          customerData = { id: custSnap.id, ...custSnap.data() };
        }
      }

      // Fetch related notas (transactions) for this customer
      let notasData = [];
      if (matchedPayment.customer_id) {
        const qTrx = query(collection(db, 'transactions'), where('customerId', '==', matchedPayment.customer_id));
        const trxSnap = await getDocs(qTrx);
        trxSnap.forEach(t => {
          notasData.push({ id: t.id, ...t.data(), no_nota: t.data().noNota || t.id, total_bayar: t.data().grandTotal, sisa_hutang: t.data().sisaHutang });
        });
      }

      setFoundPayment(matchedPayment);
      setFoundCustomer(customerData);
      setFoundNotas(notasData);
    } catch (err) {
      console.error(err);
      setError('Terjadi kesalahan saat mencari struk.');
    } finally {
      setLoading(false);
    }
  };

  // If receipt is found, render the receipt instead of the search box
  // We wrap it so it still has the onClose functionality
  if (foundPayment) {
    return (
      <PaymentReceiptPreview 
        payment={foundPayment}
        customer={foundCustomer}
        notas={foundNotas}
        onClose={onClose}
      />
    );
  }

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', width: '90%', maxWidth: '400px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0 }}>Lacak Struk Pembayaran</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
        </div>
        
        <form onSubmit={handleSearch}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#475569' }}>
              Masukkan Nomor Referensi (Contoh: RLJOLA3O)
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" 
                value={refId}
                onChange={(e) => setRefId(e.target.value)}
                placeholder="Ketikan Ref ID..."
                autoFocus
                style={{ flex: 1, padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '4px', textTransform: 'uppercase' }}
              />
              <button 
                type="submit"
                disabled={loading}
                style={{ padding: '0.5rem 1rem', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                {loading ? 'Mencari...' : <><Search size={16} /> Cari</>}
              </button>
            </div>
          </div>
          {error && <p style={{ color: 'red', fontSize: '0.875rem', margin: 0 }}>{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default LacakStrukModal;
