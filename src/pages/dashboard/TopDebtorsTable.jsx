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

  // Mock data for initial development
  const defaultData = [
    { id: '1', nama_pelanggan: 'Toko Budi Maju', total_hutang: 4500000 },
    { id: '2', nama_pelanggan: 'Warung Bu Ani', total_hutang: 3200000 },
    { id: '3', nama_pelanggan: 'Koperasi Sejahtera', total_hutang: 2800000 },
    { id: '4', nama_pelanggan: 'Toko Kelontong Jaya', total_hutang: 1500000 },
    { id: '5', nama_pelanggan: 'Minimarket Barokah', total_hutang: 900000 },
  ];

  const tableData = data && data.length > 0 ? data : defaultData;

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
