import React, { useState } from 'react';
import { X, Minus, Plus, Banknote, CreditCard, Receipt } from 'lucide-react';
import Card from '../../components/common/Card';
import styles from './CartPanel.module.css';

const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number || 0);
};

export default function CartPanel({ cart, setCart, onSave, isSaving }) {
  const [paymentMethod, setPaymentMethod] = useState('');
  const [catatan, setCatatan] = useState('');

  const handleQtyChange = (id, delta) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(1, item.qty + delta);
          return { ...item, qty: newQty, subtotal: newQty * item.harga_jual };
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

  const totalItem = cart.reduce((sum, item) => sum + item.qty, 0);
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
                  <div className={styles.itemName}>{item.nama_barang}</div>
                </div>
                <div className={styles.colPrice}>{formatRupiah(item.harga_jual)}</div>
                <div className={styles.colQty}>
                  <div className={styles.qtyControl}>
                    <button className={styles.qtyBtn} onClick={() => handleQtyChange(item.id, -1)}><Minus size={14} /></button>
                    <span className={styles.qtyValue}>{item.qty}</span>
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
            className={`${styles.paymentBtn} ${paymentMethod === 'bon' ? styles.activePayment : ''}`}
            onClick={() => setPaymentMethod('bon')}
          >
            <Receipt size={24} className={styles.paymentIcon} />
            <span>BON</span>
          </button>
        </div>
      </div>

      <div className={styles.actionSection}>
        <button 
          className={styles.saveBtn} 
          onClick={() => onSave(paymentMethod, catatan)}
          disabled={cart.length === 0 || !paymentMethod || isSaving}
        >
          <Receipt size={20} />
          {isSaving ? 'Menyimpan...' : 'Simpan & Cetak Nota'}
        </button>
      </div>
    </Card>
  );
}
