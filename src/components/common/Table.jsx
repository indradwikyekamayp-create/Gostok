import React from 'react';
import PropTypes from 'prop-types';
import styles from './Table.module.css';
import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';
import { Database } from 'lucide-react';

const Table = ({
  columns,
  data,
  onRowClick,
  emptyMessage = 'Tidak ada data',
  loading = false,
  stickyHeader = false,
}) => {
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner size="md" message="Memuat data..." />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState 
        icon={Database} 
        title="Data Kosong" 
        description={emptyMessage} 
      />
    );
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead className={stickyHeader ? styles.stickyHeader : ''}>
          <tr>
            {columns.map((col, index) => (
              <th 
                key={index}
                style={{ width: col.width, textAlign: col.align || 'left' }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr 
              key={rowIndex} 
              onClick={() => onRowClick && onRowClick(row)}
              className={onRowClick ? styles.clickableRow : ''}
            >
              {columns.map((col, colIndex) => (
                <td 
                  key={colIndex}
                  style={{ textAlign: col.align || 'left' }}
                >
                  {col.render ? col.render(row[col.key], row, rowIndex) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

Table.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string,
    label: PropTypes.string.isRequired,
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    align: PropTypes.oneOf(['left', 'center', 'right']),
    render: PropTypes.func,
  })).isRequired,
  data: PropTypes.array.isRequired,
  onRowClick: PropTypes.func,
  emptyMessage: PropTypes.string,
  loading: PropTypes.bool,
  stickyHeader: PropTypes.bool,
};

export default Table;
