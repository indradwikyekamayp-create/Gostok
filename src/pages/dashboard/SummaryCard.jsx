import React from 'react';
import Card from '../../components/common/Card';
import styles from './SummaryCard.module.css';

const SummaryCard = ({ title, value, icon: Icon, color = 'primary', subtitle }) => {
  const iconClass = styles[color] || styles.primary;

  return (
    <Card padding="lg">
      <div className={styles.cardContent}>
        <div className={styles.info}>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.value}>{value}</p>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
        <div className={`${styles.iconWrapper} ${iconClass}`}>
          <Icon size={24} />
        </div>
      </div>
    </Card>
  );
};

export default SummaryCard;
