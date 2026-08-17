import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import styles from './Toast.module.css';

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const Toast = ({ id, message, type = 'info', onDismiss, duration = 3000 }) => {
  const Icon = icons[type];

  useEffect(() => {
    if (duration && onDismiss) {
      const timer = setTimeout(() => {
        onDismiss(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onDismiss]);

  return (
    <div className={`${styles.toast} ${styles[type]}`} role="alert">
      <div className={styles.iconWrapper}>
        <Icon size={20} className={styles.icon} />
      </div>
      <div className={styles.content}>
        <p className={styles.message}>{message}</p>
      </div>
      <button 
        className={styles.closeButton} 
        onClick={() => onDismiss(id)}
        aria-label="Tutup"
      >
        <X size={16} />
      </button>
    </div>
  );
};

Toast.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
  onDismiss: PropTypes.func.isRequired,
  duration: PropTypes.number,
};

export default Toast;
