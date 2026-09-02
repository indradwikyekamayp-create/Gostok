import React from 'react';
import { MoreVertical, Eye, Edit2, Image as ImageIcon } from 'lucide-react';
import styles from './ProductCard.module.css';

const ProductCard = ({ product, onClick, onEdit, isSelected, viewMode = 'grid', threshold = 10, isKasir }) => {
  // Determine stock color
  let stockColor = 'var(--color-success, hsl(145, 55%, 42%))'; // green
  if (product.stok === 0) stockColor = 'var(--color-danger, hsl(0, 70%, 50%))'; // red
  else if (product.stok <= threshold) stockColor = 'var(--color-warning, hsl(38, 92%, 50%))'; // orange

  // Calculate stock progress bar width (max 100%, assuming 100 is "full" for display purposes)
  const stockPercentage = Math.min(100, (product.stok / 100) * 100);

  const formattedPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(product.harga_jual);

  return (
    <div 
      className={`${styles.card} ${viewMode === 'list' ? styles.listView : ''}`}
    >
      {viewMode === 'grid' && (
        <button className={styles.optionsBtn}>
          <MoreVertical size={16} />
        </button>
      )}

      <div className={styles.imageArea}>
        {product.foto ? (
          <img src={product.foto} alt={product.nama_barang} className={styles.image} />
        ) : (
          <ImageIcon className={styles.imagePlaceholder} size={32} />
        )}
      </div>

      <div className={styles.info}>
        <div className={styles.nameGroup}>
          <h3 className={styles.name} title={product.nama_barang}>{product.nama_barang}</h3>
          <div className={styles.sku}>SKU: {product.barcode}</div>
        </div>

        <div className={styles.price}>{formattedPrice}</div>

        <div className={styles.stockInfo}>
          <span className={styles.stockText} style={{ color: stockColor }}>
            Stok: {product.stok} {product.satuan}
          </span>
          <div className={styles.stockBarContainer}>
            <div 
              className={styles.stockBar} 
              style={{ width: `${stockPercentage}%`, backgroundColor: stockColor }}
            />
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <button className={styles.actionBtn} onClick={() => onClick(product)}>
          <Eye size={14} /> Detail
        </button>
        {!isKasir && (
          <button 
            className={styles.actionBtn} 
            onClick={(e) => {
              e.stopPropagation();
              onEdit(product);
            }}
          >
            <Edit2 size={14} /> Edit
          </button>
        )}
      </div>

      {viewMode === 'list' && (
        <button className={styles.optionsBtn}>
          <MoreVertical size={16} />
        </button>
      )}
    </div>
  );
};

export default ProductCard;
