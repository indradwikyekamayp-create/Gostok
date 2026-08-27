import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Search, Plus, Filter, Package, AlertCircle, X, ChevronRight, Edit, LayoutGrid, List as ListIcon } from 'lucide-react';
import ProductFormMobile from './ProductFormMobile';

const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'decimal',
    minimumFractionDigits: 0,
  }).format(number);
};

export default function MasterProdukMobile({ 
  products, 
  filteredProducts,
  searchQuery, 
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
  viewMode,
  setViewMode,
  handleAddProduct,
  handleEditProduct,
  handleSaveProduct,
  isFormOpen,
  setIsFormOpen,
  editingProduct,
  isOwner,
  threshold
}) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showFilterSheet, setShowFilterSheet] = useState(false);

  const tabs = ['Semua', 'Stok Aman', 'Stok Menipis', 'Stok Habis'];
  const categories = ['Semua Kategori', 'Makanan & Minuman', 'Kesehatan', 'Kebutuhan Rumah Tangga', 'Lainnya'];

  return (
    <>
      <div className="flutter-page" style={{ backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '90px', fontFamily: '"Inter", sans-serif' }}>
        
        {/* Sticky Header */}
        <div style={{ position: 'sticky', top: 0, zIndex: 30, backgroundColor: '#fff', padding: '1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.125rem 0' }}>Master Produk</h1>
              <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: 0 }}>Kelola data produk Anda</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '0.25rem 0.5rem', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 800 }}>
                {products.length} Item
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div style={{ position: 'relative', marginBottom: '1rem' }}>
            <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text"
              placeholder="Cari nama produk, barcode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '0.875rem 1rem 0.875rem 2.75rem', borderRadius: '1rem', border: '1px solid #cbd5e1', fontSize: '0.9375rem', outline: 'none', backgroundColor: '#f8fafc' }}
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery('')} style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', padding: '0.5rem' }}>
                <X size={16} />
              </button>
            )}
          </div>

          {/* Quick Filter Tabs & View Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', paddingTop: '0.25rem', scrollbarWidth: 'none' }}>
            <button 
              className="flutter-ripple"
              onClick={() => setShowFilterSheet(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.5rem 0.75rem', borderRadius: '2rem', border: '1px solid #cbd5e1', backgroundColor: categoryFilter !== 'Semua Kategori' ? '#e0f2fe' : '#fff', color: categoryFilter !== 'Semua Kategori' ? '#0369a1' : '#475569', fontSize: '0.875rem', fontWeight: 600, flexShrink: 0 }}
            >
              <Filter size={14} /> Kategori
              {categoryFilter !== 'Semua Kategori' && <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#0ea5e9', marginLeft: '2px' }} />}
            </button>
            
            <button 
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="flutter-ripple"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem 0.75rem', borderRadius: '2rem', border: '1px solid #cbd5e1', backgroundColor: '#fff', color: '#475569', flexShrink: 0, gap: '0.25rem', fontSize: '0.875rem', fontWeight: 600 }}
            >
              {viewMode === 'grid' ? <><ListIcon size={14} /> List</> : <><LayoutGrid size={14} /> Grid</>}
            </button>

            <div style={{ width: '1px', height: '24px', backgroundColor: '#e2e8f0', margin: '0 0.25rem', flexShrink: 0 }} />

            {tabs.map(tab => (
              <button 
                key={tab}
                className="flutter-ripple"
                onClick={() => setStatusFilter(tab)}
                style={{ 
                  padding: '0.5rem 1rem', 
                  borderRadius: '2rem', 
                  border: statusFilter === tab ? 'none' : '1px solid #cbd5e1', 
                  backgroundColor: statusFilter === tab ? '#1d4ed8' : '#f8fafc', 
                  color: statusFilter === tab ? '#fff' : '#64748b', 
                  fontSize: '0.875rem', 
                  fontWeight: statusFilter === tab ? 700 : 600,
                  flexShrink: 0,
                  transition: 'all 0.2s'
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Product List/Grid */}
        <div style={{ padding: '1rem' }}>
          {filteredProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#94a3b8' }}>
              <Package size={48} opacity={0.2} style={{ margin: '0 auto 1rem auto' }} />
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#475569' }}>Tidak ada produk</div>
              <div style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>Pencarian tidak ditemukan atau stok kosong.</div>
            </div>
          ) : (
            viewMode === 'list' ? (
              // LIST VIEW
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {filteredProducts.map(product => {
                  const stock = Number(product.stok_tersedia || product.stok || 0);
                  const minStock = Number(product.stok_minimum || threshold || 10);
                  const isWarning = stock > 0 && stock <= minStock;
                  const isOutOfStock = stock <= 0;

                  return (
                    <div 
                      key={product.id || product.barcode} 
                      className="flutter-ripple"
                      onClick={() => setSelectedProduct(product)}
                      style={{ backgroundColor: '#fff', borderRadius: '1rem', padding: '1rem', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem' }}
                    >
                      <div style={{ width: '64px', height: '64px', borderRadius: '0.75rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        {product.foto ? (
                          <img src={product.foto} alt={product.nama_barang} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }} />
                        ) : (
                          <Package size={24} color="#94a3b8" />
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {product.nama_barang}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.125rem' }}>
                          Kode: {product.kode_barang || product.barcode || '-'}
                        </div>
                        <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#16a34a', marginTop: '0.375rem' }}>
                          Rp {formatRupiah(product.harga_jual)}
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem', flexShrink: 0 }}>
                        <div style={{ 
                          padding: '0.25rem 0.5rem', 
                          borderRadius: '0.5rem', 
                          fontSize: '0.75rem', 
                          fontWeight: 700,
                          backgroundColor: isOutOfStock ? '#fee2e2' : isWarning ? '#fef08a' : '#dcfce7',
                          color: isOutOfStock ? '#ef4444' : isWarning ? '#ca8a04' : '#16a34a'
                        }}>
                          Stok: {stock}
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleEditProduct(product); }}
                          style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: '0.5rem', padding: '0.25rem', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <Edit size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // GRID VIEW (4 COLUMNS)
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                {filteredProducts.map(product => {
                  const stock = Number(product.stok_tersedia || product.stok || 0);
                  const minStock = Number(product.stok_minimum || threshold || 10);
                  const isWarning = stock > 0 && stock <= minStock;
                  const isOutOfStock = stock <= 0;

                  return (
                    <div 
                      key={product.id || product.barcode} 
                      className="flutter-ripple"
                      onClick={() => setSelectedProduct(product)}
                      style={{ backgroundColor: '#fff', borderRadius: '0.5rem', border: '1px solid #e2e8f0', overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column' }}
                    >
                      <div style={{ aspectRatio: '1/1', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #f1f5f9' }}>
                        {product.foto ? (
                          <img src={product.foto} alt={product.nama_barang} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '2px' }} />
                        ) : (
                          <Package size={16} color="#94a3b8" />
                        )}
                      </div>
                      <div style={{ padding: '0.375rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '0.25rem' }}>
                          {product.nama_barang}
                        </div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#16a34a' }}>
                          Rp {formatRupiah(product.harga_jual)}
                        </div>
                      </div>
                      
                      {/* Floating Edit Icon */}
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleEditProduct(product); }}
                        style={{ position: 'absolute', top: 4, right: 4, width: 20, height: 20, backgroundColor: 'rgba(255,255,255,0.9)', border: '1px solid #e2e8f0', borderRadius: '50%', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5 }}
                      >
                        <Edit size={10} />
                      </button>

                      {/* Stock Badge Overlay */}
                      <div style={{ position: 'absolute', top: 4, left: 4, fontSize: '0.55rem', fontWeight: 800, padding: '2px 4px', borderRadius: '4px', zIndex: 5, backgroundColor: isOutOfStock ? '#fee2e2' : isWarning ? '#fef08a' : '#dcfce7', color: isOutOfStock ? '#ef4444' : isWarning ? '#ca8a04' : '#16a34a', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                        {stock}
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>
      </div>

      {/* Floating Action Button (FAB) */}
      <button 
        className="flutter-fab flutter-ripple"
        onClick={handleAddProduct}
        style={{ position: 'fixed', bottom: '90px', right: '1.5rem', width: '56px', height: '56px', borderRadius: '28px', backgroundColor: '#1d4ed8', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 15px -3px rgba(29, 78, 216, 0.4)', zIndex: 40 }}
      >
        <Plus size={24} strokeWidth={3} />
      </button>

      {/* Category Filter Bottom Sheet */}
      {showFilterSheet && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 70, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <div className="flutter-fade" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)' }} onClick={() => setShowFilterSheet(false)} />
          <div className="flutter-sheet" style={{ backgroundColor: '#fff', borderTopLeftRadius: '1.5rem', borderTopRightRadius: '1.5rem', padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 71 }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>Filter Kategori</h2>
              <button onClick={() => setShowFilterSheet(false)} style={{ background: 'none', border: 'none', color: '#64748b' }}><X size={24} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {categories.map(c => (
                <button
                  key={c}
                  onClick={() => { setCategoryFilter(c); setShowFilterSheet(false); }}
                  style={{ padding: '1rem', borderRadius: '1rem', backgroundColor: categoryFilter === c ? '#eff6ff' : '#f8fafc', border: categoryFilter === c ? '1px solid #93c5fd' : '1px solid #e2e8f0', color: categoryFilter === c ? '#1d4ed8' : '#0f172a', fontWeight: categoryFilter === c ? 800 : 600, fontSize: '0.9375rem', textAlign: 'left' }}
                >
                  {c}
                </button>
              ))}
            </div>

          </div>
        </div>
      )}

      {/* Product Detail Bottom Sheet */}
      {selectedProduct && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99998, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <div className="flutter-fade" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)' }} onClick={() => setSelectedProduct(null)} />
          <div className="flutter-sheet" style={{ backgroundColor: '#fff', borderTopLeftRadius: '1.5rem', borderTopRightRadius: '1.5rem', padding: '1.5rem 1rem', maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 99998 }}>
            
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <div style={{ width: '40px', height: '6px', backgroundColor: '#cbd5e1', borderRadius: '3px' }} />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ width: '90px', height: '90px', borderRadius: '1rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                {selectedProduct.foto ? (
                  <img src={selectedProduct.foto} alt={selectedProduct.nama_barang} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }} />
                ) : (
                  <Package size={32} color="#94a3b8" />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem 0', lineHeight: 1.2 }}>{selectedProduct.nama_barang}</h2>
                <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>Kategori: {selectedProduct.kategori || 'Tanpa Kategori'}</div>
                <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#16a34a' }}>Rp {formatRupiah(selectedProduct.harga_jual)}</div>
              </div>
            </div>

            <div style={{ backgroundColor: '#f8fafc', borderRadius: '1rem', padding: '1rem', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Stok Tersedia</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>{selectedProduct.stok_tersedia || selectedProduct.stok || 0} {selectedProduct.satuan_terkecil || selectedProduct.satuan || 'pcs'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Stok Minimum</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>{selectedProduct.stok_minimum || threshold || 10} {selectedProduct.satuan_terkecil || selectedProduct.satuan || 'pcs'}</span>
              </div>
              
              <div style={{ borderBottom: '1px dashed #cbd5e1', margin: '0.75rem 0' }} />
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Harga Jual</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#16a34a' }}>Rp {formatRupiah(selectedProduct.harga_jual)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Harga Modal (Beli)</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#ea580c' }}>Rp {formatRupiah(selectedProduct.harga_modal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Margin (Untung)</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0ea5e9' }}>Rp {formatRupiah((selectedProduct.harga_jual || 0) - (selectedProduct.harga_modal || 0))}</span>
              </div>

              <div style={{ borderBottom: '1px dashed #cbd5e1', margin: '0.75rem 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Tipe Satuan</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>{selectedProduct.has_multi_satuan ? 'Multi Satuan (Dus/Pcs)' : 'Satuan Tunggal'}</span>
              </div>

              {selectedProduct.has_multi_satuan ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Satuan Besar</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>{selectedProduct.satuan_besar}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Isi per {selectedProduct.satuan_besar}</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>{selectedProduct.konversi} {selectedProduct.satuan_terkecil || selectedProduct.satuan || 'pcs'}</span>
                  </div>
                </>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Satuan</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>{selectedProduct.satuan || 'pcs'}</span>
                </div>
              )}

              <div style={{ borderBottom: '1px dashed #cbd5e1', margin: '0.75rem 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Asal Barang</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>{selectedProduct.asal || 'Lokal'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Barcode / Kode</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>{selectedProduct.barcode || selectedProduct.kode_barang || '-'}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
              <button 
                 onClick={() => setSelectedProduct(null)}
                 style={{ flex: 1, padding: '1rem', borderRadius: '1rem', backgroundColor: '#fff', border: '1px solid #cbd5e1', color: '#475569', fontWeight: 700, fontSize: '0.9375rem' }}
              >
                Tutup
              </button>
              <button 
                 onClick={() => {
                   const p = selectedProduct;
                   setSelectedProduct(null);
                   handleEditProduct(p);
                 }}
                 className="flutter-ripple"
                 style={{ flex: 1, padding: '1rem', borderRadius: '1rem', backgroundColor: '#1d4ed8', border: 'none', color: '#fff', fontWeight: 700, fontSize: '0.9375rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
              >
                <Edit size={16} /> Edit Produk
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}

      {/* Add/Edit Product Modal */}
      {isFormOpen && createPortal(
        <div className="flutter-fade" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100000, backgroundColor: '#f8fafc', overflowY: 'auto' }}>
           <div style={{ position: 'sticky', top: 0, zIndex: 100001, backgroundColor: '#fff', padding: '1rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
             <button onClick={() => setIsFormOpen(false)} style={{ background: 'none', border: 'none', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: '50%', backgroundColor: '#f1f5f9' }}><X size={20} /></button>
             <h2 style={{ fontSize: '1.125rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
               {editingProduct ? 'Edit Produk' : 'Tambah Produk'}
             </h2>
           </div>
           
           <div style={{ padding: '1rem', paddingBottom: '3rem' }}>
             <ProductFormMobile 
               product={editingProduct} 
               onSave={handleSaveProduct} 
               onCancel={() => setIsFormOpen(false)}
               isOwner={isOwner}
             />
           </div>
        </div>,
        document.body
      )}
    </>
  );
}
