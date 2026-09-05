import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { MainLayout } from './components/layout';
import { ProtectedRoute } from './components/layout';
import { ROLES } from './constants/roles';
import OpeningAnimation from './components/OpeningAnimation';
import MobileOpeningAnimation from './components/MobileOpeningAnimation';
import useIsMobile from './hooks/useIsMobile';

// Pages
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import MasterProdukPage from './pages/master-produk/MasterProdukPage';
import BarangMasukPage from './pages/barang-masuk/BarangMasukPage';
import KerugianPage from './pages/kerugian/KerugianPage';
import TransaksiJualPage from './pages/transaksi-jual/TransaksiJualPage';
import PelangganPage from './pages/pelanggan/PelangganPage';
import PelangganDetail from './pages/pelanggan/PelangganDetail';
import RiwayatPage from './pages/riwayat/RiwayatPage';
import LaporanPage from './pages/laporan/LaporanPage';

import KaryawanPage from './pages/karyawan/KaryawanPage';
import SettingsPage from './pages/pengaturan/SettingsPage';

import { doc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

// Global styles
import './styles/reset.css';
import './styles/variables.css';
import './styles/typography.css';
import './styles/animations.css';
import './styles/print.css';

function App() {
  const [showAnimation, setShowAnimation] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Listener untuk pengaturan aplikasi global (seperti ukuran font)
    const docRef = doc(db, 'settings', 'store_config');
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const fontSize = data.ukuranFontAplikasi || 'normal';
        
        let rootFontSize = '16px'; // normal default
        if (fontSize === 'small') rootFontSize = '14px';
        if (fontSize === 'large') rootFontSize = '18px';
        
        // Menerapkan font size ke elemen root HTML
        // Ini akan membesarkan/mengecilkan seluruh UI yang memakai satuan 'rem' atau scaling
        document.documentElement.style.fontSize = rootFontSize;
      }
    });

    return () => unsubscribe();
  }, []);

  const handleAnimationComplete = () => {
    setShowAnimation(false);
  };

  return (
    <>
      {showAnimation && (
        isMobile ? 
          <MobileOpeningAnimation onComplete={handleAnimationComplete} /> : 
          <OpeningAnimation onComplete={handleAnimationComplete} />
      )}
      <div style={{ display: showAnimation ? 'none' : 'flex', flexDirection: 'column', height: '100%', flex: 1 }}>
        <BrowserRouter>
          <AuthProvider>
            <ToastProvider>
              <Routes>
                {/* Public route */}
                <Route path="/login" element={<LoginPage />} />

            {/* Protected routes — wrapped in MainLayout */}
            <Route
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/transaksi-jual" element={<TransaksiJualPage />} />
              <Route path="/pelanggan" element={<PelangganPage />} />
              <Route path="/pelanggan/:id" element={<PelangganDetail />} />
              <Route path="/riwayat" element={<RiwayatPage />} />
              {/* Admin & Owner only routes */}
              <Route
                path="/master-produk"
                element={<MasterProdukPage />}
              />
              <Route
                path="/barang-masuk"
                element={<BarangMasukPage />}
              />
              <Route
                path="/kerugian"
                element={
                  <ProtectedRoute requiredRole={ROLES.ADMIN}>
                    <KerugianPage />
                  </ProtectedRoute>
                }
              />

              {/* Owner-only routes */}
              <Route
                path="/laporan"
                element={
                  <ProtectedRoute requiredRole={ROLES.OWNER}>
                    <LaporanPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/karyawan"
                element={
                  <ProtectedRoute requiredRole={ROLES.OWNER}>
                    <KaryawanPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pengaturan"
                element={
                  <ProtectedRoute requiredRole={ROLES.OWNER}>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
    </div>
    </>
  );
}

export default App;
