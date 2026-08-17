import { useState, useEffect } from 'react';
import { productService } from '../services/productService';

export function useProducts(category = null) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = productService.getProductsRealtime((data) => {
      setProducts(data);
      setLoading(false);
      setError(null);
    }, (err) => {
      console.error('Error fetching products:', err);
      setError(err);
      setLoading(false);
    }, category);

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [category]);

  return { products, loading, error };
}
