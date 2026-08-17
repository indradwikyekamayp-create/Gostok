import React from 'react';
import { Banknote, CreditCard, FileText, Printer, AlertTriangle } from 'lucide-react';
import styles from './PaymentPanel.module.css';

const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number);
};

export default function PaymentPanel({
  customer,
  cart,
  paymentMethod,
  setPaymentMethod,
  onSave,
  isSaving
}) {
  const totalItems = cart.reduce((acc, item) => acc + item.qty, 0);
  const grandTotal = cart.reduce((acc, item) => acc + item.subtotal, 0);
  
  const canSave = customer && cart.length > 0 && paymentMethod && !isSaving;

  return (
    <div className={styles.paymentPanel}>
      <div className={styles.customerSection}>
        <div className={styles.label}>Pelanggan</div>
        {customer ? (
          <div className={styles.customerName}>
            {customer.nama_perusahaan} <span className={styles.picName}>({customer.nama_pic})</span>
          </div>
        ) : (
          <div className={styles.noCustomer}>Belum ada pelanggan dipilih</div>
        )}
      </div>

      <div className={styles.divider} />

      <div className={styles.summarySection}>
        <div className={styles.summaryRow}>
          <span>Total Item</span>
          <span className={styles.summaryValue}>{totalItems} barang</span>
        </div>
        
        <div className={styles.grandTotalWrapper}>
          <div className={styles.grandTotalLabel}>TOTAL BAYAR</div>
          <div className={styles.grandTotalValue}>
            {formatRupiah(grandTotal)}
          </div>
        </div>
      </div>

      <div className={styles.divider} />

      <div className={styles.paymentSection}>
        <div className={styles.label}>Metode Pembayaran</div>
        <div className={styles.methodGrid}>
          <button
            type="button"
            className={`${styles.methodBtn} ${styles.methodCash} ${paymentMethod === 'CASH' ? styles.active : ''}`}
            onClick={() => setPaymentMethod('CASH')}
          >
            <Banknote size={24} />
            <span>CASH</span>
          </button>
          <button
            type="button"
            className={`${styles.methodBtn} ${styles.methodTransfer} ${paymentMethod === 'TRANSFER' ? styles.active : ''}`}
            onClick={() => setPaymentMethod('TRANSFER')}
          >
            <CreditCard size={24} />
            <span>TRANSFER</span>
          </button>
          <button
            type="button"
            className={`${styles.methodBtn} ${styles.methodBon} ${paymentMethod === 'BON' ? styles.active : ''}`}
            onClick={() => setPaymentMethod('BON')}
          >
            <FileText size={24} />
            <span>BON</span>
          </button>
        </div>

        {paymentMethod === 'BON' && (
          <div className={styles.warningBox}>
            <AlertTriangle size={20} className={styles.warningIcon} />
            <span>Transaksi ini akan dicatat sebagai <strong>hutang pelanggan</strong>.</span>
          </div>
        )}
      </div>

      <div className={styles.spacer} />

      <div className={styles.actionSection}>
        <button
          type="button"
          className={styles.saveBtn}
          disabled={!canSave}
          onClick={onSave}
        >
          {isSaving ? (
            <span className={styles.loader}>Menyimpan...</span>
          ) : (
            <>
              <Printer size={24} />
              Simpan & Cetak Nota
            </>
          )}
        </button>
      </div>
    </div>
  );
}
