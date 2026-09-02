import React from 'react';
import ProductCard from './ProductCard';

const ProductGrid = ({ products, onSelect, onEdit, selectedBarcode, viewMode = 'grid', threshold = 10, isKasir }) => {
  if (!products || products.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-secondary, #666)' }}>
        <h3>Tidak ada produk yang ditemukan</h3>
        <p>Coba sesuaikan kata kunci pencarian atau filter Anda.</p>
      </div>
    );
  }

  const containerStyle = viewMode === 'grid' 
    ? {
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '1rem'
      }
    : {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      };

  return (
    <div style={containerStyle}>
      {products.map(product => (
        <ProductCard 
          key={product.barcode} 
          product={product} 
          onClick={onSelect}
          onEdit={onEdit}
          isSelected={selectedBarcode === product.barcode}
          viewMode={viewMode}
          threshold={threshold}
          isKasir={isKasir}
        />
      ))}
    </div>
  );
};

export default ProductGrid;
