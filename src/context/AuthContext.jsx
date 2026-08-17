import React, { createContext, useState, useEffect } from 'react';
import { ROLES } from '../constants/roles';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Bypassed auth for testing UI
  const [user, setUser] = useState({ uid: 'dummy-uid', email: 'owner@example.com' });
  const [userData, setUserData] = useState({
    nama: 'Dummy Owner',
    role: ROLES.OWNER,
    aktif: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (email, password) => {
    // Mock login
    console.log("Mock login triggered for", email);
  };

  const logout = async () => {
    // Mock logout
    setUser(null);
    setUserData(null);
  };

  const role = userData?.role || null;
  const isOwner = role === ROLES.OWNER;
  const isKasir = role === ROLES.KASIR;

  const value = {
    user,
    userData,
    role,
    isOwner,
    isKasir,
    loading,
    error,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
