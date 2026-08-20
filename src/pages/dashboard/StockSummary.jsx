import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import Card from '../../components/common/Card';
import styles from './StockSummary.module.css';

const StockSummary = ({ data = [] }) => {
  const totalProducts = data.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className={styles.tooltip}>
          <p className={styles.tooltipLabel} style={{ color: data.color }}>{data.name}</p>
          <p className={styles.tooltipValue}>{data.value} Produk</p>
          <p className={styles.tooltipPercentage}>{data.percentage}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card padding="lg">
      <h2 className={styles.title}>Ringkasan Stok</h2>
      <div className={styles.content}>
        <div className={styles.chartContainer}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={55}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className={styles.chartCenter}>
            <span className={styles.centerLabel}>Total Produk</span>
            <span className={styles.centerValue}>{totalProducts}</span>
          </div>
        </div>
        
        <div className={styles.legend}>
          {data.map((item, index) => (
            <div key={index} className={styles.legendItem}>
              <div className={styles.legendDot} style={{ backgroundColor: item.color }}></div>
              <span className={styles.legendName}>{item.name}</span>
              <div className={styles.legendValues}>
                <span className={styles.legendValue}>{item.value}</span>
                <span className={styles.legendPercentage}>({item.percentage})</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default StockSummary;
