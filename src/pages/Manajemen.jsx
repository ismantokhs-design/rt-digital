import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Manajemen({ sidebarOpen, isDesktop }) {
  const navigate = useNavigate();

  // Daftar menu kartu manajemen yang disesuaikan untuk RT Digital
  const manajemenMenus = [
    { title: 'Manajemen Warga', icon: '👥', path: '/manajemen/warga' },
    { title: 'Galeri', icon: '🖼️', path: '/manajemen/galeri' },
    { title: 'Rapat', icon: '📢', path: '/manajemen/rapat' },
    { title: 'Banner', icon: '🖼️', path: '/manajemen/banner' },
    { title: 'Keuangan', icon: '💰', path: '/manajemen/keuangan' },
    { title: 'Running Text', icon: '≡', path: '/manajemen/running-text' },
    { title: 'Generate QR Absen', icon: 'q', path: '/manajemen/generate-qr' },
    { title: 'Lihat Pesan', icon: '💬', path: '/manajemen/lihat-pesan' }, // 👈 Diarahkan ke path khusus admin (LihatPesan.jsx)
  ];

  const currentLeft = isDesktop ? (sidebarOpen ? '260px' : '70px') : '0px';

  return (
    <div style={{
      backgroundColor: '#f8fafc',
      position: isDesktop ? 'fixed' : 'relative',
      top: isDesktop ? '110px' : '0px',
      left: currentLeft,
      right: 0,
      bottom: 0,
      transition: 'left 0.3s ease, top 0.3s ease',
      overflowY: 'auto',
      fontFamily: 'sans-serif',
      boxSizing: 'border-box',
      padding: '16px'
    }}>
      <style>{`
        ::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* KONTEN UTAMA HALAMAN MANAJEMEN */}
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        boxSizing: 'border-box',
        marginBottom: '90px'
      }}>
        <h1 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1e293b', margin: '0 0 16px 0' }}>
          Pengaturan & Manajemen
        </h1>

        {/* Grid Kartu Menu: Dipaksa selalu 2 kolom (kanan-kiri) di semua ukuran layar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px'
        }}>
          {manajemenMenus.map((menu, index) => (
            <div
              key={index}
              onClick={() => navigate(menu.path)}
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '20px 12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'center'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = '#0f766e';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(15, 118, 110, 0.08)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = '#e2e8f0';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.02)';
              }}
            >
              <span style={{ fontSize: '24px', marginBottom: '8px', color: '#0f766e' }}>
                {menu.icon}
              </span>
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#334155' }}>
                {menu.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}