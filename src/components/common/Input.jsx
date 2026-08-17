import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import styles from './Input.module.css';

const Input = forwardRef(({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  helperText,
  icon: Icon,
  size = 'md',
  disabled = false,
  required = false,
  className = '',
  ...rest
}, ref) => {
  const containerClass = styles.container;
  const inputWrapperClass = styles.inputWrapper;
  const inputClass = [
    styles.input,
    styles[`size-${size}`],
    Icon ? styles.hasIcon : '',
    error ? styles.hasError : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={`${containerClass} ${className}`}>
      {label && (
        <label className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <div className={inputWrapperClass}>
        {Icon && (
          <div className={styles.iconWrapper}>
            <Icon size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} className={styles.icon} />
          </div>
        )}
        <input
          ref={ref}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={inputClass}
          disabled={disabled}
          required={required}
          {...rest}
        />
      </div>
      {(error || helperText) && (
        <p className={`${styles.helperText} ${error ? styles.errorText : ''}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

Input.propTypes = {
  label: PropTypes.string,
  type: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  error: PropTypes.string,
  helperText: PropTypes.string,
  icon: PropTypes.elementType,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  className: PropTypes.string,
};

export default Input;
