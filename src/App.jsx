import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { MainLayout } from './components/layout';
import { ProtectedRoute } from './components/layout';
import { ROLES } from './constants/roles';

// Pages
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import MasterProdukPage from './pages/master-produk/MasterProdukPage';
import BarangMasukPage from './pages/barang-masuk/BarangMasukPage';
import TransaksiJualPage from './pages/transaksi-jual/TransaksiJualPage';
import PelangganPage from './pages/pelanggan/PelangganPage';
import PelangganDetail from './pages/pelanggan/PelangganDetail';
import RiwayatPage from './pages/riwayat/RiwayatPage';
import LaporanPage from './pages/laporan/LaporanPage';

import KaryawanPage from './pages/karyawan/KaryawanPage';

// Global styles
import './styles/reset.css';
import './styles/variables.css';
import './styles/typography.css';
import './styles/animations.css';
import './styles/print.css';

function App() {
  return (
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
                element={
                  <ProtectedRoute requiredRole={ROLES.ADMIN}>
                    <MasterProdukPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/barang-masuk"
                element={
                  <ProtectedRoute requiredRole={ROLES.ADMIN}>
                    <BarangMasukPage />
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
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
