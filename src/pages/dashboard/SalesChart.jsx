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

const formatRupiah = (value) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
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
          {formatRupiah(payload[0].value)}
        </p>
        {payload[0].payload.count && (
          <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: '#64748b' }}>
            {payload[0].payload.count} Transaksi
          </p>
        )}
      </div>
    );
  }
  return null;
};

const SalesChart = ({ data }) => {
  // Mock data for initial rendering until Firebase is connected
  const defaultData = [
    { date: 'Senin', total: 1500000, count: 12 },
    { date: 'Selasa', total: 2300000, count: 18 },
    { date: 'Rabu', total: 1800000, count: 15 },
    { date: 'Kamis', total: 2900000, count: 24 },
    { date: 'Jumat', total: 2100000, count: 17 },
    { date: 'Sabtu', total: 3500000, count: 30 },
    { date: 'Minggu', total: 4200000, count: 35 }
  ];

  const chartData = data && data.length > 0 ? data : defaultData;

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="date" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 12 }}
            dy={10}
          />
          <YAxis 
            tickFormatter={(value) => `Rp ${(value/1000000).toFixed(1)}Jt`}
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 12 }}
            dx={-10}
            width={80}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="total" 
            stroke="hsl(215, 50%, 30%)" 
            fill="hsl(215, 50%, 30%)" 
            fillOpacity={0.1}
            strokeWidth={3}
            activeDot={{ r: 6, fill: 'hsl(215, 50%, 30%)', stroke: '#fff', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SalesChart;
