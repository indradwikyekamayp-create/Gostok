import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Search, X } from 'lucide-react';
import styles from './SearchBar.module.css';

const SearchBar = ({
  value,
  onChange,
  placeholder = 'Cari...',
  onClear,
  autoFocus = false,
  size = 'md',
  className = '',
}) => {
  const [internalValue, setInternalValue] = useState(value || '');

  // Sync internal value with external prop if it changes
  useEffect(() => {
    setInternalValue(value || '');
  }, [value]);

  // Debounce effect
  useEffect(() => {
    const handler = setTimeout(() => {
      if (onChange) {
        onChange(internalValue);
      }
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [internalValue, onChange]);

  const handleChange = (e) => {
    setInternalValue(e.target.value);
  };

  const handleClear = () => {
    setInternalValue('');
    if (onClear) onClear();
    if (onChange) onChange('');
  };

  const containerClass = [
    styles.container,
    styles[`size-${size}`],
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClass}>
      <Search className={styles.searchIcon} size={size === 'md' ? 18 : 22} />
      <input
        type="text"
        className={styles.input}
        placeholder={placeholder}
        value={internalValue}
        onChange={handleChange}
        autoFocus={autoFocus}
      />
      {internalValue && (
        <button 
          className={styles.clearButton} 
          onClick={handleClear}
          type="button"
          aria-label="Bersihkan pencarian"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

SearchBar.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  onClear: PropTypes.func,
  autoFocus: PropTypes.bool,
  size: PropTypes.oneOf(['md', 'lg']),
  className: PropTypes.string,
};

export default SearchBar;
