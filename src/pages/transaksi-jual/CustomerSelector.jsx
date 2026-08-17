import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, X } from 'lucide-react';
import styles from './CustomerSelector.module.css';

const MOCK_CUSTOMERS = [
  { id: 'c1', nama_perusahaan: 'CV Sumber Rejeki', nama_pic: 'Pak Budi', total_hutang_berjalan: 5000000 },
  { id: 'c2', nama_perusahaan: 'PT Maju Jaya', nama_pic: 'Bu Siti', total_hutang_berjalan: 0 },
  { id: 'c3', nama_perusahaan: 'UD Makmur Sentosa', nama_pic: 'Pak Ahmad', total_hutang_berjalan: 12500000 },
];

export default function CustomerSelector({ selectedCustomer, onSelectCustomer }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState(MOCK_CUSTOMERS);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCustomers = customers.filter(
    (c) =>
      c.nama_perusahaan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.nama_pic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.container} ref={containerRef}>
      {selectedCustomer ? (
        <div className={styles.selectedBadge}>
          <div className={styles.customerInfo}>
            <span className={styles.companyName}>{selectedCustomer.nama_perusahaan}</span>
            <span className={styles.picName}>({selectedCustomer.nama_pic})</span>
          </div>
          <button
            type="button"
            className={styles.clearBtn}
            onClick={() => onSelectCustomer(null)}
            title="Hapus pilihan"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div className={styles.searchWrapper}>
          <div className={styles.inputGroup} onClick={() => setIsOpen(true)}>
            <Search className={styles.searchIcon} size={20} />
            <input
              type="text"
              placeholder="Cari atau pilih pelanggan..."
              className={styles.searchInput}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
            />
          </div>
          {isOpen && (
            <div className={styles.dropdown}>
              <ul className={styles.customerList}>
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer) => (
                    <li
                      key={customer.id}
                      className={styles.customerItem}
                      onClick={() => {
                        onSelectCustomer(customer);
                        setIsOpen(false);
                        setSearchTerm('');
                      }}
                    >
                      <div className={styles.itemCompany}>{customer.nama_perusahaan}</div>
                      <div className={styles.itemPic}>{customer.nama_pic}</div>
                    </li>
                  ))
                ) : (
                  <li className={styles.emptyResult}>Pelanggan tidak ditemukan</li>
                )}
              </ul>
              <div className={styles.dropdownFooter}>
                <button
                  type="button"
                  className={styles.addBtn}
                  onClick={() => {
                    alert('Fitur tambah pelanggan baru belum diimplementasi');
                    setIsOpen(false);
                  }}
                >
                  <Plus size={16} /> Tambah Pelanggan Baru
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
