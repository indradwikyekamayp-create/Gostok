import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import OwnerDashboard from './OwnerDashboard';
import KasirDashboard from './KasirDashboard';
import styles from './DashboardPage.module.css';

const DashboardPage = () => {
  const { user } = useAuth();
  
  // For now, if role is owner, show OwnerDashboard, else KasirDashboard
  const isOwner = user?.role === 'owner';

  return (
    <div className={styles.container}>
      {isOwner ? <OwnerDashboard /> : <KasirDashboard />}
    </div>
  );
};

export default DashboardPage;
