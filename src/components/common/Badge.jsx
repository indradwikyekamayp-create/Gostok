import React from 'react';
import PropTypes from 'prop-types';
import styles from './Badge.module.css';

const Badge = ({
  variant = 'neutral',
  children,
  size = 'md',
  dot = false,
  className = '',
}) => {
  const classes = [
    styles.badge,
    styles[`variant-${variant}`],
    styles[`size-${size}`],
    className
  ].filter(Boolean).join(' ');

  return (
    <span className={classes}>
      {dot && <span className={styles.dot} aria-hidden="true" />}
      {children}
    </span>
  );
};

Badge.propTypes = {
  variant: PropTypes.oneOf(['success', 'warning', 'danger', 'info', 'neutral']),
  children: PropTypes.node.isRequired,
  size: PropTypes.oneOf(['sm', 'md']),
  dot: PropTypes.bool,
  className: PropTypes.string,
};

export default Badge;
