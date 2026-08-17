import React from 'react';
import PropTypes from 'prop-types';
import styles from './Card.module.css';

const Card = ({
  children,
  className = '',
  padding = 'md',
  hover = false,
  onClick,
}) => {
  const classes = [
    styles.card,
    styles[`padding-${padding}`],
    hover ? styles.hoverable : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} onClick={onClick}>
      {children}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  padding: PropTypes.oneOf(['none', 'sm', 'md', 'lg']),
  hover: PropTypes.bool,
  onClick: PropTypes.func,
};

export default Card;
