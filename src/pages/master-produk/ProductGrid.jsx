import React from 'react';
import ProductCard from './ProductCard';

const ProductGrid = ({ products, onSelect, selectedBarcode }) => {
  if (!products || products.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
        <h3>Tidak ada produk yang ditemukan</h3>
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: '16px'
    }}>
      {products.map(product => (
        <ProductCard 
          key={product.barcode} 
          product={product} 
          onClick={() => onSelect(product)}
          isSelected={selectedBarcode === product.barcode}
        />
      ))}
    </div>
  );
};

export default ProductGrid;
