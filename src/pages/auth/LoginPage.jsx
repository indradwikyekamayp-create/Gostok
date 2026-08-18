import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/common/Button';
import styles from './LoginPage.module.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const emailRef = useRef(null);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (emailRef.current) {
      emailRef.current.focus();
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Email dan Password / PIN harus diisi');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Gagal masuk. Periksa kembali email dan password Anda.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <img src="/logo/AyoStock!.png" alt="AyoStock!" className={styles.logoImg} />
          <p className={styles.subtitle}>PT. WELINDO SUKSES BERSAMA</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>Email</label>
            <div className={styles.inputWrapper}>
              <Mail className={styles.icon} size={20} />
              <input
                id="email"
                type="email"
                ref={emailRef}
                className={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@contoh.com"
                disabled={loading}
              />
            </div>
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>Password / PIN</label>
            <div className={styles.inputWrapper}>
              <Lock className={styles.icon} size={20} />
              <input
                id="password"
                type="password"
                className={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password atau PIN"
                disabled={loading}
              />
            </div>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <Button 
              type="submit" 
              variant="primary" 
              fullWidth 
              loading={loading}
            >
              Masuk
            </Button>
          </div>

          {error && <div className={styles.error}>{error}</div>}
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
