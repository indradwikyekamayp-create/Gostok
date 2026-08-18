import React from 'react';
import { HelpCircle, ArrowUp, ArrowDown } from 'lucide-react';
import Card from '../../components/common/Card';
import styles from './SummaryCard.module.css';

const SummaryCard = ({ title, value, icon: Icon, color = 'primary', subtitle, tooltip, trend, trendValue, trendText }) => {
  const iconClass = styles[color] || styles.primary;

  return (
    <Card padding="lg">
      <div className={styles.cardContent}>
        <div className={styles.info}>
          <div className={styles.titleContainer}>
            <h3 className={styles.title}>{title}</h3>
            {tooltip && (
              <div className={styles.tooltipContainer}>
                <HelpCircle size={14} className={styles.tooltipIcon} />
                <span className={styles.tooltipText}>{tooltip}</span>
              </div>
            )}
          </div>
          <p className={styles.value}>{value}</p>
          {(trend || subtitle) && (
            <div className={styles.subtitleContainer}>
              {trend && (
                <span className={`${styles.trend} ${trend === 'up' ? styles.trendUp : trend === 'down' ? styles.trendDown : styles.trendNeutral}`}>
                  {trend === 'up' && <ArrowUp size={12} />}
                  {trend === 'down' && <ArrowDown size={12} />}
                  {trendValue}
                </span>
              )}
              <span className={styles.subtitle}>{trendText || subtitle}</span>
            </div>
          )}
        </div>
        <div className={`${styles.iconWrapper} ${iconClass}`}>
          <Icon size={24} />
        </div>
      </div>
    </Card>
  );
};

export default SummaryCard;
