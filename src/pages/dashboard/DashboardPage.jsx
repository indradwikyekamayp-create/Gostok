import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import OwnerDashboard from './OwnerDashboard';
import OwnerDashboardMobile from './OwnerDashboardMobile';
import KasirDashboard from './KasirDashboard';
import useIsMobile from '../../hooks/useIsMobile';
import styles from './DashboardPage.module.css';

const DashboardPage = () => {
  const { isOwner, isAdmin } = useAuth();
  const isMobile = useIsMobile();

  if (isMobile) {
    // For now we will render the mobile view for all, or later separate Kasir mobile view too
    return isOwner || isAdmin ? <OwnerDashboardMobile /> : <KasirDashboard />; 
  }

  return (
    <div className={styles.container}>
      {isOwner || isAdmin ? <OwnerDashboard /> : <KasirDashboard />}
    </div>
  );
};

export default DashboardPage;
