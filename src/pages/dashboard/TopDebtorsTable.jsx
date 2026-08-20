import React from 'react';
import { useNavigate } from 'react-router-dom';
import Table from '../../components/common/Table';

const formatRupiah = (value) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

const TopDebtorsTable = ({ data }) => {
  const navigate = useNavigate();

  const tableData = data || [];

  const columns = [
    {
      key: 'nama_pelanggan',
      label: 'Nama Pelanggan',
    },
    {
      key: 'total_hutang',
      label: 'Total Hutang',
      align: 'right',
      render: (value) => (
        <span style={{ color: 'var(--color-danger, hsl(0, 70%, 50%))', fontWeight: '600' }}>
          {formatRupiah(value)}
        </span>
      )
    }
  ];

  const handleRowClick = (row) => {
    navigate(`/pelanggan/${row.id}`);
  };

  return (
    <Table 
      columns={columns} 
      data={tableData} 
      onRowClick={handleRowClick}
      emptyMessage="Tidak ada pelanggan dengan hutang"
    />
  );
};

export default TopDebtorsTable;
