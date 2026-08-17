import React, { useState, useEffect } from 'react';
import styles from './RiwayatPage.module.css';
import FilterBar from './FilterBar';
import TransactionTable from './TransactionTable';

const mockTransactions = [
  {
    id: 'TRX-001',
    no_nota: 'INV-20260817-001',
    tanggal: '2026-08-17T10:00:00Z',
    pelanggan: { nama: 'Budi Santoso' },
    total_bayar: 500000,
    status_bayar: 'lunas',
    items: [
      { id: 'ITM-1', nama_barang: 'Semen Tiga Roda', qty: 10, harga: 50000, subtotal: 500000 }
    ]
  },
  {
    id: 'TRX-002',
    no_nota: 'INV-20260817-002',
    tanggal: '2026-08-17T11:30:00Z',
    pelanggan: { nama: 'Toko Maju Jaya' },
    total_bayar: 1500000,
    status_bayar: 'belum_lunas',
    sisa_hutang: 1500000,
    items: [
      { id: 'ITM-2', nama_barang: 'Besi Beton 10mm', qty: 20, harga: 75000, subtotal: 1500000 }
    ]
  },
  {
    id: 'TRX-003',
    no_nota: 'INV-20260816-001',
    tanggal: '2026-08-16T14:15:00Z',
    pelanggan: { nama: 'Andi M.' },
    total_bayar: 800000,
    status_bayar: 'cicil',
    sisa_hutang: 300000,
    items: [
      { id: 'ITM-3', nama_barang: 'Cat Avian 5kg', qty: 4, harga: 200000, subtotal: 800000 }
    ]
  },
  {
    id: 'TRX-004',
    no_nota: 'INV-20260815-001',
    tanggal: '2026-08-15T09:20:00Z',
    pelanggan: { nama: 'Pak Joko' },
    total_bayar: 250000,
    status_bayar: 'lunas',
    items: [
      { id: 'ITM-4', nama_barang: 'Paku 5cm', qty: 10, harga: 25000, subtotal: 250000 }
    ]
  },
  {
    id: 'TRX-005',
    no_nota: 'INV-20260815-002',
    tanggal: '2026-08-15T15:45:00Z',
    pelanggan: { nama: 'Toko Sinar Makmur' },
    total_bayar: 3200000,
    status_bayar: 'belum_lunas',
    sisa_hutang: 3200000,
    items: [
      { id: 'ITM-5', nama_barang: 'Triplek 18mm', qty: 20, harga: 160000, subtotal: 3200000 }
    ]
  },
  {
    id: 'TRX-006',
    no_nota: 'INV-20260814-001',
    tanggal: '2026-08-14T10:10:00Z',
    pelanggan: { nama: 'H. Rahman' },
    total_bayar: 450000,
    status_bayar: 'lunas',
    items: [
      { id: 'ITM-6', nama_barang: 'Engsel Pintu', qty: 30, harga: 15000, subtotal: 450000 }
    ]
  },
  {
    id: 'TRX-007',
    no_nota: 'INV-20260814-002',
    tanggal: '2026-08-14T13:20:00Z',
    pelanggan: { nama: 'Budi Santoso' },
    total_bayar: 1200000,
    status_bayar: 'cicil',
    sisa_hutang: 500000,
    items: [
      { id: 'ITM-7', nama_barang: 'Seng Gelombang', qty: 40, harga: 30000, subtotal: 1200000 }
    ]
  },
  {
    id: 'TRX-008',
    no_nota: 'INV-20260813-001',
    tanggal: '2026-08-13T08:50:00Z',
    pelanggan: { nama: 'Toko Abadi' },
    total_bayar: 5500000,
    status_bayar: 'belum_lunas',
    sisa_hutang: 5500000,
    items: [
      { id: 'ITM-1', nama_barang: 'Semen Tiga Roda', qty: 110, harga: 50000, subtotal: 5500000 }
    ]
  },
  {
    id: 'TRX-009',
    no_nota: 'INV-20260813-002',
    tanggal: '2026-08-13T16:30:00Z',
    pelanggan: { nama: 'Ibu Siti' },
    total_bayar: 150000,
    status_bayar: 'lunas',
    items: [
      { id: 'ITM-8', nama_barang: 'Kuas Cat 3inch', qty: 10, harga: 15000, subtotal: 150000 }
    ]
  },
  {
    id: 'TRX-010',
    no_nota: 'INV-20260812-001',
    tanggal: '2026-08-12T11:00:00Z',
    pelanggan: { nama: 'Toko Maju Jaya' },
    total_bayar: 2100000,
    status_bayar: 'lunas',
    items: [
      { id: 'ITM-2', nama_barang: 'Besi Beton 10mm', qty: 28, harga: 75000, subtotal: 2100000 }
    ]
  }
];

const RiwayatPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    customer: '',
    product: '',
    status: 'Semua'
  });

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      let filtered = [...mockTransactions];
      
      if (filters.customer) {
        filtered = filtered.filter(t => t.pelanggan.nama.toLowerCase().includes(filters.customer.toLowerCase()));
      }
      if (filters.status !== 'Semua') {
        const statusMap = { 'Lunas': 'lunas', 'Belum Lunas': 'belum_lunas', 'Cicilan': 'cicil' };
        filtered = filtered.filter(t => t.status_bayar === statusMap[filters.status]);
      }
      if (filters.product) {
        filtered = filtered.filter(t => t.items.some(item => item.nama_barang.toLowerCase().includes(filters.product.toLowerCase())));
      }
      if (filters.startDate) {
        filtered = filtered.filter(t => new Date(t.tanggal) >= new Date(filters.startDate));
      }
      if (filters.endDate) {
        // add one day to include the whole end date
        const end = new Date(filters.endDate);
        end.setDate(end.getDate() + 1);
        filtered = filtered.filter(t => new Date(t.tanggal) < end);
      }

      setTransactions(filtered);
      setLoading(false);
    }, 500);
  }, [filters]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleViewDetail = (transaction) => {
    console.log('View detail', transaction);
  };

  const handleReprint = (transaction) => {
    console.log('Reprint nota', transaction);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Riwayat Transaksi</h1>
        <p className={styles.subtitle}>PT. WELINDO SUKSES BERSAMA</p>
      </header>

      <section className={styles.filterSection}>
        <FilterBar 
          filters={filters} 
          onFilterChange={handleFilterChange} 
        />
      </section>

      <section className={styles.tableSection}>
        <TransactionTable 
          transactions={transactions} 
          loading={loading}
          onViewDetail={handleViewDetail}
          onReprint={handleReprint}
        />
      </section>
    </div>
  );
};

export default RiwayatPage;
