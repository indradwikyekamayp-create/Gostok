import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn } from 'lucide-react';
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
      {/* Animated Background Blobs */}
      <div className={styles.blob} style={{ top: '-10%', left: '-10%', animationDelay: '0s' }}></div>
      <div className={styles.blob} style={{ top: '40%', right: '-10%', animationDelay: '2s', background: 'linear-gradient(to right, #3b82f6, #93c5fd)' }}></div>
      <div className={styles.blob} style={{ bottom: '-20%', left: '20%', animationDelay: '4s', background: 'linear-gradient(to right, #8b5cf6, #d8b4fe)' }}></div>
      
      <div className={styles.cardWrapper}>
        <div className={styles.card}>
          <div className={styles.header}>
            <div className={styles.logoWrapper}>
              <img src="/logo/AyoStock!.png" alt="AyoStock!" className={styles.logoImg} />
            </div>
            <p className={styles.subtitle}>Selamat Datang di Portal Manajemen<br/><strong>PT. WELINDO SUKSES BERSAMA</strong></p>
          </div>
          
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.label}>Email Akses</label>
              <div className={styles.inputWrapper}>
                <Mail className={styles.icon} size={18} />
                <input
                  id="email"
                  type="email"
                  ref={emailRef}
                  className={styles.input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@welindo.com"
                  disabled={loading}
                />
              </div>
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.label}>Kata Sandi</label>
              <div className={styles.inputWrapper}>
                <Lock className={styles.icon} size={18} />
                <input
                  id="password"
                  type="password"
                  className={styles.input}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  disabled={loading}
                />
              </div>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.submitWrapper}>
              <button 
                type="submit" 
                className={`${styles.submitBtn} ${loading ? styles.loading : ''}`}
                disabled={loading}
              >
                {loading ? 'Memverifikasi...' : (
                  <>
                    <span>Masuk ke Sistem</span>
                    <LogIn size={18} />
                  </>
                )}
              </button>
            </div>
          </form>
          
          <div className={styles.footer}>
            <p>&copy; {new Date().getFullYear()} GoStok. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
