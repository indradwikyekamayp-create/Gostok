import React from 'react';
import PropTypes from 'prop-types';

const LoadingSpinner = ({ size = 'md', message }) => {
  const sizeMap = {
    sm: 16,
    md: 24,
    lg: 40
  };

  const spinnerSize = sizeMap[size] || sizeMap.md;

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--space-3)',
    padding: 'var(--space-4)',
  };

  const spinnerStyle = {
    width: spinnerSize,
    height: spinnerSize,
    border: '3px solid var(--color-border)',
    borderBottomColor: 'var(--color-primary)',
    borderRadius: '50%',
    display: 'inline-block',
    boxSizing: 'border-box',
    animation: 'spin 1s linear infinite',
  };

  const messageStyle = {
    color: 'var(--color-text-secondary)',
    fontSize: 'var(--text-sm)',
    margin: 0,
  };

  return (
    <div style={containerStyle}>
      <span style={spinnerStyle} aria-label="Loading..." />
      {message && <p style={messageStyle}>{message}</p>}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  message: PropTypes.string,
};

export default LoadingSpinner;
