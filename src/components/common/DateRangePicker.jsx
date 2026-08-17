import React from 'react';
import PropTypes from 'prop-types';
import styles from './DateRangePicker.module.css';

const DateRangePicker = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  label = 'Filter Tanggal',
  className = '',
}) => {
  return (
    <div className={`${styles.container} ${className}`}>
      {label && <label className={styles.mainLabel}>{label}</label>}
      <div className={styles.inputsWrapper}>
        <div className={styles.inputGroup}>
          <label className={styles.subLabel} htmlFor="startDate">Dari</label>
          <input
            id="startDate"
            type="date"
            className={styles.dateInput}
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            max={endDate || undefined}
          />
        </div>
        <div className={styles.separator}>-</div>
        <div className={styles.inputGroup}>
          <label className={styles.subLabel} htmlFor="endDate">Sampai</label>
          <input
            id="endDate"
            type="date"
            className={styles.dateInput}
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            min={startDate || undefined}
          />
        </div>
      </div>
    </div>
  );
};

DateRangePicker.propTypes = {
  startDate: PropTypes.string.isRequired,
  endDate: PropTypes.string.isRequired,
  onStartDateChange: PropTypes.func.isRequired,
  onEndDateChange: PropTypes.func.isRequired,
  label: PropTypes.string,
  className: PropTypes.string,
};

export default DateRangePicker;
