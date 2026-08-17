import React from 'react';
import styles from './ProductCard.module.css';

const ProductCard = ({ product, onClick, isSelected }) => {
  let stockColor = 'hsl(145, 55%, 42%)'; // green
  if (product.stok < 5) stockColor = 'hsl(0, 70%, 50%)'; // red
  else if (product.stok <= 10) stockColor = 'hsl(38, 92%, 50%)'; // orange

  const formattedPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(product.harga_jual);

  return (
    <div 
      className={`${styles.card} ${isSelected ? styles.selected : ''}`}
      onClick={onClick}
    >
      <div className={styles.imagePlaceholder}>
        {product.foto ? (
          <img src={product.foto} alt={product.nama_barang} className={styles.image} />
        ) : (
          <span>Tanpa Foto</span>
        )}
      </div>
      <div className={styles.info}>
        <div className={styles.barcode}>{product.barcode}</div>
        <div className={styles.name}>{product.nama_barang}</div>
        <div className={styles.price}>{formattedPrice}</div>
        <div className={styles.stockBadge} style={{ backgroundColor: stockColor }}>
          Stok: {product.stok} {product.satuan}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
