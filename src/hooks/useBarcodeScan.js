import { useEffect, useRef, useCallback } from 'react';

export function useBarcodeScan({
  onScan,
  inputRef = null,
  enabled = true,
  minLength = 3,
}) {
  const buffer = useRef('');
  const lastKeyTime = useRef(Date.now());

  const handleKeyDown = useCallback((e) => {
    if (!enabled) return;
    
    // Abaikan tombol modifier
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    const currentTime = Date.now();
    const elapsedTime = currentTime - lastKeyTime.current;

    // Reset buffer jika jarak antar ketikan terlalu lama (kemungkinan ketikan manusia)
    // Scanner barcode umumnya mengetik karakter dengan jeda < 50ms
    if (elapsedTime > 80) {
      buffer.current = '';
    }

    if (e.key === 'Enter') {
      if (buffer.current.length >= minLength) {
        onScan(buffer.current);
        buffer.current = '';
        e.preventDefault();
      } else {
        buffer.current = '';
      }
    } else if (e.key.length === 1) { // Hanya karakter yang bisa dicetak
      buffer.current += e.key;
    }

    lastKeyTime.current = currentTime;
  }, [enabled, onScan, minLength]);

  useEffect(() => {
    if (!enabled) return;

    const target = inputRef?.current || document;
    target.addEventListener('keydown', handleKeyDown);

    return () => {
      target.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, handleKeyDown, inputRef]);
}
