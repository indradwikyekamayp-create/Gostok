import React, { useState } from 'react';
import { X, Minus, Plus, Banknote, CreditCard, Receipt } from 'lucide-react';
import Card from '../../components/common/Card';
import { useToast } from '../../context/ToastContext';
import styles from './CartPanel.module.css';

const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number || 0);
};

export default function CartPanel({ cart, setCart, onSave, isSaving, hasCustomer }) {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [catatan, setCatatan] = useState('');
  const [jatuhTempo, setJatuhTempo] = useState('');
  const { showToast } = useToast();

  const handleQtyChange = (id, delta) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          let newQty = Math.max(1, item.qty + delta);
          if (newQty > (item.stok || 0)) {
            showToast(`Stok tidak cukup (Sisa: ${item.stok || 0})`, 'error');
            newQty = item.stok || 0;
          }
          return { ...item, qty: newQty, subtotal: newQty * item.harga_jual };
        }
        return item;
      })
    );
  };

  const handleQtyInput = (id, value) => {
    let newQty = parseInt(value);
    if (isNaN(newQty)) {
      newQty = ''; // Allow empty string while typing
    }
    
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          let finalQty = newQty;
          if (typeof newQty === 'number' && newQty > (item.stok || 0)) {
            showToast(`Stok tidak cukup (Sisa: ${item.stok || 0})`, 'error');
            finalQty = item.stok || 0;
          }
          return { ...item, qty: finalQty, subtotal: (finalQty || 0) * item.harga_jual };
        }
        return item;
      })
    );
  };

  const handleQtyBlur = (id) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          // If empty or less than 1, fallback to 1
          let finalQty = Math.max(1, item.qty || 1);
          if (finalQty > (item.stok || 0)) {
            finalQty = item.stok || 0;
          }
          return { ...item, qty: finalQty, subtotal: finalQty * item.harga_jual };
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearCart = () => {
    if (window.confirm('Kosongkan keranjang?')) {
      setCart([]);
    }
  };

  const totalItem = cart.reduce((sum, item) => sum + (Number(item.qty) || 0), 0);
  const totalHarga = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const diskon = 0; // Placeholder for now
  const grandTotal = totalHarga - diskon;

  return (
    <Card className={styles.container} padding="none">
      <div className={styles.header}>
        <h2 className={styles.title}>Keranjang ({cart.length})</h2>
        {cart.length > 0 && (
          <button className={styles.clearBtn} onClick={handleClearCart}>
            Kosongkan
          </button>
        )}
      </div>

      <div className={styles.cartList}>
        <div className={styles.listHeader}>
          <div className={styles.colProduct}>Produk</div>
          <div className={styles.colPrice}>Harga</div>
          <div className={styles.colQty}>Qty</div>
          <div className={styles.colSubtotal}>Subtotal</div>
          <div className={styles.colAction}></div>
        </div>
        
        <div className={styles.listBody}>
          {cart.length === 0 ? (
            <div className={styles.emptyState}>Keranjang masih kosong</div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className={styles.cartItem}>
                <div className={styles.colProduct}>
                  {item.foto ? (
                    <img 
                      src={item.foto} 
                      alt={item.nama_barang} 
                      className={styles.productThumbnail}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className={styles.thumbnailPlaceholder}
                    style={{ display: item.foto ? 'none' : 'flex' }}
                  >
                    <span style={{ fontSize: '10px', color: '#94a3b8' }}>-</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className={styles.itemName}>{item.nama_barang}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>Kode: {item.kode_barang || item.barcode || '-'}</div>
                  </div>
                </div>
                <div className={styles.colPrice}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <span style={{ color: (!item.harga_jual || item.harga_jual === 0) ? '#ef4444' : undefined }}>{formatRupiah(item.harga_jual)}</span>
                    {(!item.harga_jual || item.harga_jual === 0) && (
                      <span style={{ fontSize: '0.6rem', backgroundColor: '#fee2e2', color: '#ef4444', padding: '0.1rem 0.25rem', borderRadius: '0.25rem', fontWeight: 700, alignSelf: 'flex-start' }}>BELUM DISET</span>
                    )}
                  </div>
                </div>
                <div className={styles.colQty}>
                  <div className={styles.qtyControl}>
                    <button className={styles.qtyBtn} onClick={() => handleQtyChange(item.id, -1)}><Minus size={14} /></button>
                    <input 
                      type="number"
                      className={styles.qtyValue} 
                      value={item.qty}
                      onChange={(e) => handleQtyInput(item.id, e.target.value)}
                      onBlur={() => handleQtyBlur(item.id)}
                      min="1"
                    />
                    <button className={styles.qtyBtn} onClick={() => handleQtyChange(item.id, 1)}><Plus size={14} /></button>
                  </div>
                </div>
                <div className={styles.colSubtotal}>{formatRupiah(item.subtotal)}</div>
                <div className={styles.colAction}>
                  <button className={styles.removeBtn} onClick={() => handleRemoveItem(item.id)}><X size={16} /></button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className={styles.summarySection}>
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>Total Item</span>
          <span className={styles.summaryValue}>{totalItem} barang</span>
        </div>
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>Total Harga</span>
          <span className={styles.summaryValue}>{formatRupiah(totalHarga)}</span>
        </div>
        <div className={styles.summaryRow}>
          <span className={styles.summaryLabel}>Diskon <span className={styles.infoIcon}>ⓘ</span></span>
          <span className={styles.summaryValueDiscount}>{formatRupiah(diskon)}</span>
        </div>
        
        <div className={styles.grandTotalRow}>
          <span className={styles.grandTotalLabel}>TOTAL BAYAR</span>
          <span className={styles.grandTotalValue}>{formatRupiah(grandTotal)}</span>
        </div>
      </div>

      <div className={styles.notesSection}>
        <label className={styles.sectionLabel}>Catatan (Opsional)</label>
        <input 
          type="text" 
          className={styles.notesInput} 
          placeholder="Tambah catatan transaksi..." 
          value={catatan}
          onChange={(e) => setCatatan(e.target.value)}
        />
      </div>

      <div className={styles.paymentSection}>
        <label className={styles.sectionLabel}>Metode Pembayaran</label>
        <div className={styles.paymentMethods}>
          <button 
            className={`${styles.paymentBtn} ${paymentMethod === 'cash' ? styles.activePayment : ''}`}
            onClick={() => setPaymentMethod('cash')}
          >
            <Banknote size={24} className={styles.paymentIcon} />
            <span>CASH</span>
          </button>
          <button 
            className={`${styles.paymentBtn} ${paymentMethod === 'transfer' ? styles.activePayment : ''}`}
            onClick={() => setPaymentMethod('transfer')}
          >
            <CreditCard size={24} className={styles.paymentIcon} />
            <span>TRANSFER</span>
          </button>
          <button 
            className={`${styles.paymentBtn} ${paymentMethod === 'hutang' ? styles.activePayment : ''}`}
            onClick={() => {
              setPaymentMethod('hutang');
              if (!jatuhTempo) {
                const jt = new Date();
                jt.setDate(jt.getDate() + 14);
                setJatuhTempo(jt.toISOString().split('T')[0]);
              }
            }}
          >
            <Receipt size={24} className={styles.paymentIcon} />
            <span>HUTANG</span>
          </button>
        </div>
        
        {paymentMethod === 'hutang' && (
          <div style={{ marginTop: '1rem' }}>
            <label className={styles.sectionLabel}>Tanggal Jatuh Tempo</label>
            <input 
              type="date" 
              className={styles.notesInput} 
              value={jatuhTempo}
              onChange={(e) => setJatuhTempo(e.target.value)}
            />
          </div>
        )}
      </div>

      <div className={styles.actionSection}>
        <button 
          className={styles.saveBtn} 
          disabled={cart.length === 0 || !hasCustomer || !paymentMethod || isSaving}
          onClick={() => onSave(paymentMethod, catatan, jatuhTempo ? new Date(jatuhTempo).toISOString() : null)}
        >
          <Receipt size={20} />
          {isSaving ? 'Menyimpan...' 
            : cart.length === 0 ? 'Keranjang Kosong' 
            : !hasCustomer ? 'Pilih Pelanggan Dulu'
            : !paymentMethod ? 'Pilih Pembayaran' 
            : 'Simpan & Cetak Nota'}
        </button>
      </div>
    </Card>
  );
}
