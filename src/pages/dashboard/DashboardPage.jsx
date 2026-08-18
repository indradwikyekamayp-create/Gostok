import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import OwnerDashboard from './OwnerDashboard';
import KasirDashboard from './KasirDashboard';
import styles from './DashboardPage.module.css';

const DashboardPage = () => {
  const { isOwner } = useAuth();

  return (
    <div className={styles.container}>
      {isOwner ? <OwnerDashboard /> : <KasirDashboard />}
    </div>
  );
};

export default DashboardPage;
