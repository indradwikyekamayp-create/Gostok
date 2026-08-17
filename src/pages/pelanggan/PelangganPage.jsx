import React, { useState } from 'react';
import styles from './PelangganPage.module.css';
import PelangganList from './PelangganList';
import PelangganForm from './PelangganForm';
import { useNavigate } from 'react-router-dom';

const mockCustomers = [
  { id: 'c1', nama_perusahaan: 'CV Sumber Rejeki', nama_pic: 'Pak Budi', jenis_pelanggan: 'CV', alamat: 'Jl. Raya No. 123, Surabaya', no_hp: '08123456789', total_hutang_berjalan: 5000000 },
  { id: 'c2', nama_perusahaan: 'PT Maju Jaya', nama_pic: 'Bu Siti', jenis_pelanggan: 'PT', alamat: 'Jl. Industri No. 45, Jakarta', no_hp: '08234567890', total_hutang_berjalan: 0 },
  { id: 'c3', nama_perusahaan: 'UD Makmur Sentosa', nama_pic: 'Pak Ahmad', jenis_pelanggan: 'Perorangan', alamat: 'Jl. Pasar No. 7, Bandung', no_hp: '08345678901', total_hutang_berjalan: 12500000 },
  { id: 'c4', nama_perusahaan: 'CV Berkah Abadi', nama_pic: 'Pak Dedi', jenis_pelanggan: 'CV', alamat: 'Jl. Merdeka No. 88, Semarang', no_hp: '08456789012', total_hutang_berjalan: 3200000 },
];

export default function PelangganPage() {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  const filteredCustomers = mockCustomers.filter(c => 
    c.nama_perusahaan.toLowerCase().includes(search.toLowerCase()) || 
    c.nama_pic.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (customer) => {
    navigate(`/pelanggan/${customer.id}`);
  };

  const handleSave = (data) => {
    console.log('Save customer', data);
    setShowForm(false);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <h1>Daftar Pelanggan</h1>
          <p>Kelola data pelanggan dan pantau hutang piutang.</p>
        </div>
        <button className={styles.addButton} onClick={() => setShowForm(true)}>
          + Tambah Pelanggan
        </button>
      </header>

      <div className={styles.searchContainer}>
        <input 
          type="text" 
          placeholder="Cari pelanggan atau PIC..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      <main className={styles.content}>
        <PelangganList 
          customers={filteredCustomers} 
          onSelect={handleSelect} 
          loading={false}
        />
      </main>

      {showForm && (
        <PelangganForm 
          customer={null} 
          onSave={handleSave} 
          onCancel={() => setShowForm(false)} 
        />
      )}
    </div>
  );
}
