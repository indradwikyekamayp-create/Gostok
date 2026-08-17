import { useState, useEffect } from 'react';
import { customerService } from '../services/customerService';

export function useCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = customerService.getCustomersRealtime(
      (data) => {
        setCustomers(data);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching customers:', err);
        setError(err);
        setLoading(false);
      }
    );

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return { customers, loading, error };
}
