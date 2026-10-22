import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function MobileNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showMorePopup, setShowMorePopup] = useState(false);
  const popupRef = useRef(null);

  // 4 Menu Utama + 1 Tombol More
  const mainMenus = [
    { name: 'Beranda', path: '/', icon: '🏠' },
    { name: 'Profil', path: '/profil', icon: '👤' },
    { name: 'Galeri', path: '/galeri', icon: '🖼️' },
    { name: 'Pesan', path: '/pesan', icon: '💬' },
  ];

  // Menu yang tampil di dalam Pop-up "More"
  const moreMenus = [
    { name: 'Manajemen', path: '/manajemen', icon: '📋' },
    { name: 'Setting User', path: '/setting-user', icon: '⚙️' },
    { name: 'Backup & Restore', path: '/backup-restore', icon: '💾' },
    { name: 'Pengaturan', path: '/pengaturan', icon: '🔧' },
  ];

  // Cek apakah halaman aktif saat ini ada di dalam daftar More menus
  const isMoreActive = moreMenus.some(menu => location.pathname === menu.path);

  // Tutup popup jika klik di luar area
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowMorePopup(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      {/* POPUP MELAYANG MENU MORE */}
      {showMorePopup && (
        <div style={{
          position: 'fixed',
          bottom: '70px',
          right: '16px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          border: '1px solid #cbd5e1',
          zIndex: 1005,
          width: '200px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          padding: '6px 0',
          fontFamily: 'sans-serif',
          animation: 'fadeIn 0.2s ease'
        }} ref={popupRef}>
          <div style={{ padding: '8px 16px', fontSize: '10px', fontWeight: 'bold', color: '#64748b', borderBottom: '1px solid #f1f5f9', textTransform: 'uppercase' }}>
            Menu Lainnya
          </div>
          {moreMenus.map((menu) => {
            const isActive = location.pathname === menu.path;
            return (
              <button
                key={menu.path}
                onClick={() => {
                  setShowMorePopup(false);
                  navigate(menu.path);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 16px',
                  backgroundColor: isActive ? '#f0fdfa' : 'transparent',
                  color: isActive ? '#0f766e' : '#334155',
                  border: 'none',
                  textAlign: 'left',
                  fontSize: '12px',
                  fontWeight: isActive ? 'bold' : 'normal',
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                <span style={{ fontSize: '16px' }}>{menu.icon}</span>
                <span>{menu.name}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* NAVBAR BAWAH HP */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '60px',
        backgroundColor: 'white',
        borderTop: '1px solid #cbd5e1',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        zIndex: 1000,
        fontFamily: 'sans-serif',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.05)'
      }}>
        {mainMenus.map((menu) => {
          const isActive = location.pathname === menu.path;
          return (
            <Link
              key={menu.path}
              to={menu.path}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
                color: isActive ? '#0f766e' : '#64748b',
                fontSize: '10px',
                fontWeight: isActive ? 'bold' : 'normal',
                flex: 1,
                height: '100%',
                transition: 'color 0.2s'
              }}
            >
              <span style={{ fontSize: '18px', marginBottom: '2px' }}>{menu.icon}</span>
              <span>{menu.name}</span>
            </Link>
          );
        })}

        {/* TOMBOL MORE */}
        <button
          onClick={() => setShowMorePopup(!showMorePopup)}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'none',
            border: 'none',
            color: isMoreActive || showMorePopup ? '#0f766e' : '#64748b',
            fontSize: '10px',
            fontWeight: isMoreActive || showMorePopup ? 'bold' : 'normal',
            flex: 1,
            height: '100%',
            cursor: 'pointer',
            transition: 'color 0.2s'
          }}
        >
          <span style={{ fontSize: '18px', marginBottom: '2px' }}>⋯</span>
          <span>More</span>
        </button>
      </nav>
    </>
  );
}