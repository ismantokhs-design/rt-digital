import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { signOut, updatePassword, updateProfile } from 'firebase/auth';

export default function DesktopNavbar({ isOpen, setIsOpen }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const dropdownRef = useRef(null);

  const [profil, setProfil] = useState({
    rtNumber: '',
    rwNumber: '',
    ketuaRt: '',
    kelurahan: '',
    kecamatan: '',
    kota: ''
  });

  // State untuk form Edit Profil (Nama, Nomor HP, Password)
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Ambil profil wilayah
        const docRef = doc(db, 'settings', 'profilWilayah');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfil(docSnap.data());
        }

        // Ambil data user dari Firestore collection 'users'
        if (currentUser) {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setEditName(userData.name || currentUser.displayName || '');
            setEditPhone(userData.phone || '');
          } else {
            setEditName(currentUser.displayName || 'Ismanto');
          }
        }
      } catch (error) {
        console.error("Gagal memuat data desktop:", error);
      }
    };
    fetchData();

    // Event listener untuk menutup dropdown jika klik di luar area
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [currentUser]);

  // Handle Logout / Keluar
  const handleLogout = async () => {
    if (window.confirm('Apakah Anda yakin ingin keluar dari aplikasi?')) {
      try {
        await signOut(auth);
        navigate('/login');
      } catch (error) {
        console.error("Gagal keluar:", error);
      }
    }
  };

  // Handle Simpan Edit Profil
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (currentUser) {
        // 1. Update Display Name di Firebase Auth
        await updateProfile(currentUser, { displayName: editName });

        // 2. Update Password jika diisi
        if (editPassword.trim() !== '') {
          await updatePassword(currentUser, editPassword);
        }

        // 3. Update Firestore collection 'users' (name & phone)
        const userDocRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userDocRef, {
          name: editName,
          phone: editPhone,
          updatedAt: new Date()
        });

        alert('Profil berhasil diperbarui!');
        setShowEditModal(false);
        setEditPassword('');
      }
    } catch (error) {
      console.error("Gagal memperbarui profil:", error);
      alert('Terjadi kesalahan: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const menus = [
    { name: 'Beranda', path: '/', icon: '🏠' },
    { name: 'Profil', path: '/profil', icon: '👤' },
    { name: 'Galeri', path: '/galeri', icon: '🖼️' },
    { name: 'Pesan', path: '/pesan', icon: '💬' },
    { name: 'Manajemen', path: '/manajemen', icon: '📋' },
    { name: 'Setting User', path: '/setting-user', icon: '⚙️' },
    { name: 'Backup & Restore', path: '/backup-restore', icon: '💾' },
    { name: 'Pengaturan', path: '/pengaturan', icon: '🔧' },
  ];

  const currentSidebarWidth = isOpen ? '260px' : '70px';

  return (
    <>
      {/* HEADER ATAS DESKTOP */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: currentSidebarWidth,
        right: 0,
        height: '110px',
        backgroundColor: '#0f766e',
        color: 'white',
        padding: '16px 24px',
        boxSizing: 'border-box',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 999,
        transition: 'left 0.3s ease',
        fontFamily: 'sans-serif'
      }}>
        <div>
          <div style={{ marginBottom: '6px' }}>
            <span style={{ fontSize: '10px', backgroundColor: 'rgba(255,255,255,0.2)', padding: '3px 8px', borderRadius: '10px', fontWeight: '500' }}>
              Ketua RT ({profil.ketuaRt}) — ({profil.rtNumber} / {profil.rwNumber})
            </span>
          </div>
          <h1 style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: '0 0 2px 0' }}>
            Halo, {editName || 'Ismanto'}! 👋
          </h1>
          <p style={{ fontSize: '11px', color: '#ccfbf1', margin: 0 }}>
            Kel. {profil.kelurahan}, Kec. {profil.kecamatan}, Kab. {profil.kota}
          </p>
        </div>

        {/* Tombol Notifikasi & Dropdown Profil Desktop */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', position: 'relative' }} ref={dropdownRef}>
          <button 
            onClick={() => alert('Notifikasi')} 
            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Notifikasi"
          >
            🔔
          </button>
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)} 
            style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', color: 'white', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="Menu Pengguna"
          >
            {editName ? editName.charAt(0).toUpperCase() : 'I'}
          </button>

          {/* BOX DROPDOWN MENU PENGGUNA DESKTOP */}
          {dropdownOpen && (
            <div style={{
              position: 'absolute',
              top: '40px',
              right: 0,
              width: '220px',
              backgroundColor: '#ffffff',
              color: '#1e293b',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
              zIndex: 1005,
              overflow: 'hidden',
              border: '1px solid #cbd5e1'
            }}>
              <div style={{ padding: '12px 16px', backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                <p style={{ fontSize: '12px', fontWeight: 'bold', margin: '0 0 2px 0', color: '#0f766e' }}>
                  {editName || 'Ismanto'}
                </p>
                <p style={{ fontSize: '10px', color: '#475569', margin: 0, wordBreak: 'break-all' }}>
                  {currentUser?.email || 'ismanto@example.com'}
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', padding: '6px 0' }}>
                <button
                  onClick={() => { setDropdownOpen(false); setShowEditModal(true); }}
                  style={{ textAlign: 'left', background: 'none', border: 'none', padding: '10px 16px', fontSize: '12px', color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#f1f5f9'}
                  onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  ✏️ Edit Profil
                </button>
                <div style={{ height: '1px', backgroundColor: '#e2e8f0', margin: '4px 0' }}></div>
                <button
                  onClick={() => { setDropdownOpen(false); handleLogout(); }}
                  style={{ textAlign: 'left', background: 'none', border: 'none', padding: '10px 16px', fontSize: '12px', color: '#ef4444', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#fef2f2'}
                  onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  🚪 Keluar (Logout)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* POPUP / MODAL KECIL EDIT PROFIL (Nama, No HP, Password) */}
      {showEditModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '380px',
            padding: '24px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            boxSizing: 'border-box',
            fontFamily: 'sans-serif'
          }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#0f766e', margin: '0 0 16px 0' }}>
              Edit Profil Pengguna
            </h3>

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '4px' }}>Nama Lengkap</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '12px' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '4px' }}>Nomor HP</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="Contoh: 089602510491"
                  style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '12px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#64748b', marginBottom: '4px' }}>Password Baru (Opsional)</label>
                <input
                  type="password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="Kosongkan jika tidak diubah"
                  style={{ width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '12px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{ flex: 1, backgroundColor: '#0f766e', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}
                >
                  {loading ? 'Menyimpan...' : 'Simpan'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  style={{ flex: 1, backgroundColor: '#e2e8f0', color: '#334155', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SIDEBAR KIRI DESKTOP */}
      <aside style={{
        width: currentSidebarWidth,
        height: '100vh',
        backgroundColor: '#0f766e',
        color: 'white',
        position: 'fixed',
        top: 0,
        left: 0,
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 12px',
        boxSizing: 'border-box',
        boxShadow: '4px 0 10px rgba(0,0,0,0.1)',
        zIndex: 1000,
        transition: 'width 0.3s ease',
        fontFamily: 'sans-serif',
        borderRight: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ display: 'flex', justifyContent: isOpen ? 'space-between' : 'center', alignItems: 'center', marginBottom: '20px' }}>
          {isOpen && (
            <h2 style={{ fontSize: '1rem', fontWeight: 'bold', margin: 0, whiteSpace: 'nowrap' }}>
              RT.<span style={{ color: '#99f6e4' }}>Digital</span>
            </h2>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              borderRadius: '6px',
              width: '32px',
              height: '32px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px'
            }}
          >
            {isOpen ? '◀' : '▶'}
          </button>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          {menus.map((menu) => {
            const isActive = location.pathname === menu.path;
            return (
              <Link
                key={menu.path}
                to={menu.path}
                title={!isOpen ? menu.name : ''}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: isActive ? '#0f766e' : 'white',
                  backgroundColor: isActive ? 'white' : 'transparent',
                  fontWeight: isActive ? 'bold' : 'normal',
                  fontSize: '13px',
                  whiteSpace: 'nowrap'
                }}
              >
                <span style={{ fontSize: '18px', minWidth: '24px', textAlign: 'center' }}>{menu.icon}</span>
                {isOpen && <span>{menu.name}</span>}
              </Link>
            );
          })}
        </nav>

        {isOpen && (
          <div style={{ fontSize: '10px', color: '#99f6e4', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '10px' }}>
            RT Digital v1.0
          </div>
        )}
      </aside>
    </>
  );
}