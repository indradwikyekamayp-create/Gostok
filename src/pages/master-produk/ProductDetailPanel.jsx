import React from 'react';
import styles from './ProductDetailPanel.module.css';

const ProductDetailPanel = ({ product, onClose, onEdit, isOwner, isKasir }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  let stockColor = 'hsl(145, 55%, 42%)';
  if (product.stok < 5) stockColor = 'hsl(0, 70%, 50%)';
  else if (product.stok <= 10) stockColor = 'hsl(38, 92%, 50%)';

  return (
    <div className={styles.panel}>
      <button className={styles.closeBtn} onClick={onClose}>&times;</button>
      
      <div className={styles.imageArea}>
        {product.foto ? (
          <img src={product.foto} alt={product.nama_barang} />
        ) : (
          <div className={styles.noImage}>Tidak ada foto</div>
        )}
      </div>

      <div className={styles.content}>
        <h2 className={styles.name}>{product.nama_barang}</h2>
        <p className={styles.barcode}>{product.barcode}</p>
        
        <div className={styles.meta}>
          <span className={styles.tag}>{product.kategori}</span>
          <span className={styles.tag}>{product.asal}</span>
          <span className={styles.tag}>{product.satuan}</span>
        </div>

        <div className={styles.stockInfo}>
          <span className={styles.stockLabel}>Stok Saat Ini:</span>
          <span className={styles.stockNumber} style={{ color: stockColor }}>
            {product.stok} {product.satuan}
          </span>
        </div>

        <div className={styles.priceSection}>
          <div className={styles.priceRow}>
            <span>Harga Jual</span>
            <span className={styles.sellPrice}>{formatCurrency(product.harga_jual)}</span>
          </div>
          
          {isOwner && (
            <>
              <div className={styles.priceRow}>
                <span>Harga Modal</span>
                <span className={styles.modalPrice}>{formatCurrency(product.harga_modal)}</span>
              </div>
              <div className={styles.priceRow}>
                <span>Margin</span>
                <span className={styles.marginPrice}>{formatCurrency(product.harga_jual - product.harga_modal)}</span>
              </div>
            </>
          )}
        </div>

        {!isKasir && (
          <button className={styles.editBtn} onClick={() => onEdit(product)}>Edit Produk</button>
        )}
      </div>
    </div>
  );
};

export default ProductDetailPanel;
