import React from 'react';
import ProductCard from './ProductCard';

const ProductGrid = ({ products, onSelect, onEdit, selectedBarcode, viewMode = 'grid' }) => {
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
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: '1.25rem'
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
        />
      ))}
    </div>
  );
};

export default ProductGrid;
