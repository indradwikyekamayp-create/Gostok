import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import styles from './DashboardPage.module.css';

const formatRupiah = (value) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

const CustomTooltip = ({ active, payload, label, metric }) => {
  if (active && payload && payload.length) {
    const isOmzet = metric === 'total';
    const val = payload[0].value;
    
    return (
      <div style={{
        backgroundColor: '#fff',
        padding: '10px',
        border: '1px solid #e2e8f0',
        borderRadius: '6px',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
      }}>
        <p style={{ margin: '0 0 5px 0', fontWeight: '600', color: '#334155' }}>{label}</p>
        <p style={{ margin: 0, color: 'hsl(215, 50%, 30%)', fontWeight: '500' }}>
          {isOmzet ? formatRupiah(val) : `${val} Transaksi`}
        </p>
      </div>
    );
  }
  return null;
};

const SalesChart = ({ data, metric = 'total' }) => {
  const chartData = data || [];

  const yAxisFormatter = (value) => {
    if (metric === 'total') return `Rp ${(value/1000000).toFixed(1)}Jt`;
    return value;
  };

  return (
    <div className={styles.chartWrapper}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <CartesianGrid vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="date" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 12 }}
            dy={10}
          />
          <YAxis 
            tickFormatter={yAxisFormatter}
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 12 }}
            dx={-10}
            width={80}
          />
          <Tooltip content={<CustomTooltip metric={metric} />} />
          <Area 
            type="monotone" 
            dataKey={metric}
            stroke="hsl(215, 50%, 30%)" 
            fill="hsl(215, 50%, 30%)" 
            fillOpacity={0.05}
            strokeWidth={2}
            dot={{ r: 4, fill: 'hsl(215, 50%, 30%)', stroke: '#fff', strokeWidth: 2 }}
            activeDot={{ r: 6, fill: 'hsl(215, 50%, 30%)', stroke: '#fff', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SalesChart;
