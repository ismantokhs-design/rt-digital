import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    navigate('/');
  };

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      backgroundColor: '#ffffff', // Latar belakang bawah putih
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      top: 0,
      left: 0,
      overflow: 'hidden', // 🔒 Terkunci rapat tidak bisa digeser
      fontFamily: 'sans-serif',
      boxSizing: 'border-box'
    }}>
      {/* 1. BAGIAN ATAS (Background Hijau Toska) */}
      <div style={{
        backgroundColor: '#0f766e',
        height: '35vh', // Mengambil sepertiga bagian atas
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: '24px',
        position: 'relative'
      }}>
        {/* Tombol Back Panah Kiri */}
        <div style={{ position: 'absolute', left: '16px', top: '20px', color: 'white', fontSize: '20px', cursor: 'pointer' }}>
          ←
        </div>

        {/* Logo Kotak Rumah */}
        <div style={{
          width: '52px',
          height: '52px',
          backgroundColor: '#0d9488',
          borderRadius: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 6px rgba(0,0,0,0.15)',
          fontSize: '26px',
          marginBottom: '8px',
          border: '2px solid rgba(255,255,255,0.3)'
        }}>
          🏠
        </div>

        {/* Judul Aplikasi */}
        <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white', margin: 0, letterSpacing: '0.5px' }}>
          RT.<span style={{ color: '#99f6e4' }}>Digital</span> INDONESIA
        </h1>
        <p style={{ fontSize: '0.75rem', color: '#ccfbf1', marginTop: '4px', letterSpacing: '0.3px' }}>
          Satu Aplikasi untuk Warga
        </p>
      </div>

      {/* 2. BAGIAN BAWAH & KOTAK FORM PUTIH MELENGKUNG */}
      <div style={{
        flex: 1,
        backgroundColor: '#f8fafc',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        position: 'relative'
      }}>
        {/* Kotak Putih Utama yang Menimpa ke Atas */}
        <div style={{
          backgroundColor: 'white',
          width: '90%',
          maxWidth: '380px',
          borderRadius: '24px 24px 0 0',
          padding: '20px 20px 12px 20px',
          boxShadow: '0 -10px 25px rgba(0,0,0,0.1)',
          position: 'absolute',
          top: '-40px', // Membuat kotak putihnya naik menimpa area hijau toska
          maxHeight: '82vh',
          boxSizing: 'border-box'
        }}>
          <h2 style={{ textAlign: 'center', fontSize: '1.05rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '12px' }}>
            Masuk ke Akun
          </h2>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Input No HP / NIK / Email */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#334155', marginBottom: '3px' }}>
                No. HP / NIK / Email <span style={{ color: 'red' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '10px', top: '8px', fontSize: '13px' }}>👤</span>
                <input
                  type="text"
                  placeholder="Masukkan No. HP, NIK, atau Email"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '7px 7px 7px 32px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '12px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* Input Password */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#334155', marginBottom: '3px' }}>
                Password <span style={{ color: 'red' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '10px', top: '8px', fontSize: '13px' }}>🔒</span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '7px 7px 7px 32px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '12px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              
              {/* Opsi Tampilkan Password & Lupa Password */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', fontSize: '11px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', color: '#64748b' }}>
                  <input
                    type="checkbox"
                    checked={showPassword}
                    onChange={() => setShowPassword(!showPassword)}
                  />
                  Tampilkan
                </label>
                <a href="#lupa-password" onClick={(e) => { e.preventDefault(); alert('Fitur Lupa Password'); }} style={{ color: '#0f766e', textDecoration: 'none', fontWeight: '600' }}>
                  Lupa Password?
                </a>
              </div>
            </div>

            {/* Tombol Masuk Utama */}
            <button
              type="submit"
              style={{
                backgroundColor: '#0f766e',
                color: 'white',
                border: 'none',
                padding: '9px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 'bold',
                cursor: 'pointer',
                marginTop: '2px',
                boxShadow: '0 4px 6px rgba(15, 118, 110, 0.2)'
              }}
            >
              Masuk
            </button>
          </form>

          {/* Tombol Daftarkan RT */}
          <div style={{
            marginTop: '10px',
            border: '1px solid #0f766e',
            borderRadius: '8px',
            padding: '8px',
            textAlign: 'center',
            backgroundColor: '#f0fdfa'
          }}>
            <a href="#daftar-rt" onClick={(e) => { e.preventDefault(); alert('Pendaftaran RT baru'); }} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: '#0f766e', fontWeight: 'bold', fontSize: '12px' }}>
              <span>🏢</span> Daftarkan RT
            </a>
            <p style={{ fontSize: '10px', color: '#64748b', margin: '2px 0 0 0' }}>
              Untuk Ketua RT yang wilayahnya belum terdaftar.
            </p>
          </div>

          {/* Keterangan Akun Warga via WhatsApp */}
          <div style={{
            marginTop: '8px',
            backgroundColor: '#f1f5f9',
            borderRadius: '8px',
            padding: '6px 8px',
            fontSize: '10px',
            color: '#475569',
            display: 'flex',
            gap: '6px',
            alignItems: 'flex-start'
          }}>
            <span style={{ fontSize: '12px' }}>👤</span>
            <span>Warga tidak daftar mandiri. Akun dibuat pengurus RT, lalu menerima link aktivasi via WhatsApp.</span>
          </div>

          {/* Footer Syarat & Ketentuan */}
          <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '9px', color: '#94a3b8' }}>
            Dengan masuk, Anda menyetujui<br />
            <a href="#syarat" style={{ color: '#0f766e', textDecoration: 'none' }}>Syarat & Ketentuan</a> dan <a href="#kebijakan" style={{ color: '#0f766e', textDecoration: 'none' }}>Kebijakan Privasi</a>
          </div>
        </div>
      </div>
    </div>
  );
}