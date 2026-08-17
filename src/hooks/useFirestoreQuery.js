import { useState, useEffect, useCallback } from 'react';
import { onSnapshot } from 'firebase/firestore';

export function useFirestoreQuery(queryFn, deps = []) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshCounter, setRefreshCounter] = useState(0);

  const refresh = useCallback(() => {
    setRefreshCounter((prev) => prev + 1);
  }, []);

  useEffect(() => {
    setLoading(true);
    let unsubscribe;

    try {
      const q = queryFn();
      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const result = [];
          snapshot.forEach((doc) => {
            result.push({ id: doc.id, ...doc.data() });
          });
          setData(result);
          setLoading(false);
          setError(null);
        },
        (err) => {
          console.error('Firestore query error:', err);
          setError(err);
          setLoading(false);
        }
      );
    } catch (err) {
      console.error('Error creating Firestore query:', err);
      setError(err);
      setLoading(false);
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, refreshCounter]);

  return { data, loading, error, refresh };
}
