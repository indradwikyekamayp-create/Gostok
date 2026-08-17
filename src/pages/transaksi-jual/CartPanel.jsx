import React, { useRef, useEffect } from 'react';
import { Barcode, X, PackageOpen } from 'lucide-react';
import styles from './CartPanel.module.css';

const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number);
};

export default function CartPanel({ cart, setCart, onScanBarcode }) {
  const barcodeInputRef = useRef(null);

  // Auto focus barcode input on mount and keep refocusing when clicking outside cart items
  useEffect(() => {
    barcodeInputRef.current?.focus();
  }, []);

  const handleBarcodeSubmit = (e) => {
    e.preventDefault();
    const barcode = e.target.barcode.value;
    if (barcode.trim()) {
      onScanBarcode(barcode.trim());
      e.target.reset();
    }
    barcodeInputRef.current?.focus();
  };

  const handleQtyChange = (id, newQty) => {
    const qty = parseInt(newQty, 10);
    if (isNaN(qty) || qty < 1) return;
    
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, qty, subtotal: qty * item.harga_jual } : item
      )
    );
  };

  const handleRemoveItem = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className={styles.cartPanel}>
      <form onSubmit={handleBarcodeSubmit} className={styles.scanForm}>
        <div className={styles.barcodeInputWrapper}>
          <Barcode className={styles.barcodeIcon} size={24} />
          <input
            ref={barcodeInputRef}
            name="barcode"
            type="text"
            className={styles.barcodeInput}
            placeholder="Scan barcode atau ketik kode barang..."
            autoComplete="off"
            autoFocus
          />
        </div>
      </form>

      <div className={styles.cartContainer}>
        {cart.length > 0 ? (
          <div className={styles.cartTable}>
            <div className={styles.tableHeader}>
              <div className={styles.colName}>Nama Barang</div>
              <div className={styles.colPrice}>Harga</div>
              <div className={styles.colQty}>Qty</div>
              <div className={styles.colSubtotal}>Subtotal</div>
              <div className={styles.colAction}></div>
            </div>
            <div className={styles.tableBody}>
              {cart.map((item) => (
                <div key={item.id} className={styles.tableRow}>
                  <div className={styles.colName}>
                    <div className={styles.itemName}>{item.nama_barang}</div>
                    <div className={styles.itemCode}>{item.kode_barang}</div>
                  </div>
                  <div className={styles.colPrice}>{formatRupiah(item.harga_jual)}</div>
                  <div className={styles.colQty}>
                    <input
                      type="number"
                      min="1"
                      className={styles.qtyInput}
                      value={item.qty}
                      onChange={(e) => handleQtyChange(item.id, e.target.value)}
                    />
                  </div>
                  <div className={styles.colSubtotal}>
                    {formatRupiah(item.subtotal)}
                  </div>
                  <div className={styles.colAction}>
                    <button
                      type="button"
                      className={styles.deleteBtn}
                      onClick={() => handleRemoveItem(item.id)}
                      title="Hapus barang"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className={styles.emptyState}>
            <PackageOpen size={48} className={styles.emptyIcon} />
            <h3>Keranjang Kosong</h3>
            <p>Scan barcode untuk menambahkan barang ke keranjang</p>
          </div>
        )}
      </div>
    </div>
  );
}
